
'use server';

/**
 * @fileOverview Service functions for handling Cashfree payment integration.
 */

import crypto from 'crypto';
import { participateInEvent } from './events';
import QRCode from 'qrcode';
import type { Timestamp } from 'firebase/firestore';

// Ensure environment variables are set for Cashfree
const cashfreeAppId = process.env.CASHFREE_APP_ID;
const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
const cashfreeApiBaseUrl = process.env.CASHFREE_API_BASE_URL || 'https://api.cashfree.com/pg'; // Or 'https://sandbox.cashfree.com/pg' for sandbox
const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:9002';


let cashfreeInitError: string | null = null;

if (!cashfreeAppId || !cashfreeSecretKey) {
  cashfreeInitError = "Cashfree App ID or Secret Key is not configured in environment variables.";
  console.error(`[Server Action Init Error] payment.ts: ${cashfreeInitError}`);
} else {
  console.log('[Server Action Init] payment.ts: Cashfree credentials seem to be present.');
}

interface CreateOrderResponse {
  cf_order_id: number;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  order_expiry_time: string;
  customer_details: {
    customer_id: string;
    customer_phone: string;
    customer_email?: string;
    customer_name?: string;
  };
  order_meta: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: string;
  };
  payment_link?: string; // This is what we'll use for redirection
  payments?: { url: string };
  refunds?: { url: string };
  settlements?: { url: string };
  order_splits?: any[];
  order_tags?: Record<string, string>;
  order_notes?: Record<string, string>;
  order_token?: string; // This is often used for SDK integrations
}


/**
 * Creates a Cashfree order and returns a payment link.
 * @param orderData - Data required to create the order.
 * @returns {Promise<{success: boolean, paymentLink?: string, orderId?: string, message?: string}>}
 */
export async function createCashfreeOrderAction(orderData: {
  amount: number; // Amount in the currency's main unit (e.g., INR)
  currency: string; // e.g., "INR"
  receipt: string; // Your internal order/receipt ID
  customer_id: string;
  customer_phone: string;
  customer_email: string;
  customer_name?: string;
  eventId: string;
}): Promise<{ success: boolean; paymentLink?: string; orderId?: string; cashfreeOrderId?: string; message?: string }> {
  console.log('[Server Action] createCashfreeOrderAction invoked.');

  if (cashfreeInitError) {
    console.error(`[Server Action Error] createCashfreeOrderAction: ${cashfreeInitError}`);
    return { success: false, message: cashfreeInitError };
  }
  if (!cashfreeAppId || !cashfreeSecretKey) {
     // This check is redundant due to cashfreeInitError but good for explicit check
    return { success: false, message: "Cashfree credentials missing." };
  }

  const order_id = `GLAD-${orderData.receipt}-${Date.now()}`; // Unique order ID for Cashfree
  const returnUrl = `${appBaseUrl}/api/payment/cashfree_webhook?order_id={order_id}&event_id=${orderData.eventId}&user_id=${orderData.customer_id}`;

  const requestBody = {
    customer_details: {
      customer_id: orderData.customer_id,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      customer_name: orderData.customer_name || orderData.customer_email,
    },
    order_id: order_id,
    order_amount: orderData.amount,
    order_currency: orderData.currency,
    order_note: `Participation fee for event: ${orderData.receipt}`,
    order_meta: {
      return_url: returnUrl, // Cashfree will append order_id and payment_id
      notify_url: `${appBaseUrl}/api/payment/cashfree_webhook`, // For server-to-server notifications
    },
    order_tags: {
        eventId: orderData.eventId,
        userId: orderData.customer_id,
    }
  };

  console.log('[Server Action] Creating Cashfree order with body:', JSON.stringify(requestBody));
  console.log('[Server Action] Using return_url:', requestBody.order_meta.return_url);


  try {
    const response = await fetch(`${cashfreeApiBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01', // Use a recent, stable API version
      },
      body: JSON.stringify(requestBody),
    });

    const responseData: CreateOrderResponse | any = await response.json(); // Type more strictly if possible

    if (!response.ok) {
      console.error('[Server Action Error] Cashfree API Error:', responseData);
      throw new Error(responseData.message || `Cashfree API request failed with status ${response.status}`);
    }

    console.log('[Server Action] Cashfree Order Created:', responseData);

    if (!responseData.order_id || !responseData.payment_session_id) { // payment_session_id is key for checkout
      throw new Error('Failed to create Cashfree order (Invalid response - missing order_id or payment_session_id).');
    }

    // Construct payment link using payment_session_id and order_token (order_id from response)
    // The standard way is to use Cashfree's SDK or a redirect to a page they provide.
    // For a direct link, you might need to check Cashfree's documentation for "seamless" or redirection methods.
    // Often, the `order_token` or `payment_session_id` is used with their JS SDK.
    // If a direct payment_link is provided in the response, use that. Otherwise, construct from payment_session_id.
    // The `payment_link` might not be directly for redirection but for SDK.
    // Cashfree often uses a redirect to `https://checkout.cashfree.com/pg/orders/sessions/{payment_session_id}`

    const paymentLink = responseData.payments?.url || `https://checkout.cashfree.com/pg/orders/sessions/${responseData.payment_session_id}`;


    return {
      success: true,
      paymentLink: paymentLink, // This is the URL to redirect the user to for payment
      orderId: responseData.order_id, // Cashfree's order ID
      cashfreeOrderId: responseData.cf_order_id?.toString(), // cf_order_id if available
    };
  } catch (error: any) {
    console.error('[Server Action Error] Error creating Cashfree order:', error.message, error.stack);
    return { success: false, message: `Failed to create payment order: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Verifies the Cashfree payment signature (typically handled by webhook or return URL parameters)
 * and records event participation if successful. Generates a QR code for the ticket.
 * This function would be called by your webhook/return URL handler.
 * @param verificationData - Data from Cashfree (e.g., order_id, transaction status from webhook).
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function verifyCashfreePaymentAndParticipateAction(verificationData: {
  order_id: string; // Cashfree's order_id
  // Participant details should be retrieved based on order_id or passed through webhook state
  userId: string;
  eventId: string;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  semester: number;
  registrationNumber: string;
  paymentStatus?: string; // From Cashfree, e.g., "SUCCESS", "FAILED"
  transactionId?: string; // Cashfree's transaction ID
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] verifyCashfreePaymentAndParticipateAction invoked.');

  const {
    order_id,
    userId,
    eventId,
    paymentStatus,
    transactionId,
    ...participantDetails // name, email, etc.
  } = verificationData;

  if (!order_id || !userId || !eventId) {
    return { success: false, message: 'Missing required data for verification (order_id, userId, eventId).' };
  }

  console.log('[Server Action] Verifying Cashfree payment details for order:', order_id, 'User:', userId);

  // In a real scenario, you'd fetch the order status from Cashfree API using order_id to confirm.
  // For this example, we'll assume `paymentStatus` is passed correctly from the webhook/return handler.
  // Webhook verification (checking signature) should happen in the API route itself before calling this.

  if (paymentStatus !== 'SUCCESS' && paymentStatus !== 'PAID') { // Cashfree might use 'PAID' for successful transactions
    console.warn(`[Server Action Warning] Payment for order ${order_id} was not successful. Status: ${paymentStatus}`);
    return { success: false, message: `Payment not successful. Status: ${paymentStatus}` };
  }

  console.log(`[Server Action] Payment for order ${order_id} confirmed as successful.`);

  try {
    const qrDataString = JSON.stringify({
      orderId: order_id, // Use Cashfree order_id
      eventId: eventId,
      userId: userId,
      timestamp: Date.now(),
    });
    let qrCodeDataUri = '';
    try {
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
      console.log('[Server Action] QR Code generated for order:', order_id);
    } catch (qrError: any) {
      console.error('[Server Action Error] Failed to generate QR Code:', qrError.message);
      // Proceed without QR code, but log.
    }

    const participationResult = await participateInEvent({
      userId: userId,
      eventId: eventId,
      eventName: participantDetails.eventName,
      name: participantDetails.name,
      email: participantDetails.email,
      phone: participantDetails.phone,
      branch: participantDetails.branch,
      semester: participantDetails.semester,
      registrationNumber: participantDetails.registrationNumber,
      paymentDetails: {
        orderId: order_id, // Cashfree order_id
        paymentId: transactionId || 'N/A', // Cashfree transaction_id
        method: 'Cashfree',
      },
      qrCodeDataUri: qrCodeDataUri,
    });

    if (participationResult.success) {
      console.log('[Server Action] Participation recorded successfully for Cashfree order:', order_id);
      return { success: true, message: 'Payment verified and participation recorded.' };
    } else {
      const dbErrorMessage = `Payment verified BUT failed to record participation for Cashfree order: ${order_id}. Reason: ${participationResult.message || 'Unknown database error'}`;
      console.error(`[Server Action Error] verifyCashfreePaymentAndParticipateAction: ${dbErrorMessage}`);
      return { success: false, message: `Payment successful, but failed to save participation. Contact support with Order ID: ${order_id}.` };
    }
  } catch (error: any) {
    console.error('[Server Action Error] Error during Cashfree payment verification or participation recording:', error.message, error.stack);
    return { success: false, message: `Verification/Participation failed: ${error.message || 'Unknown error'}` };
  }
}
