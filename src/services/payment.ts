
'use server';

<<<<<<< HEAD
import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent, getUserProfile, getEventById } from './events'; 
import type { EventData, ParticipationData } from './events'; 
import type { UserProfileSupabase } from './auth'; // Ensure this is the correct profile type
import axios from 'axios';

// Load environment variables
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; 
const NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:9002'; 

const CASHFREE_API_VERSION = '2023-08-01';
const CASHFREE_BASE_URL = CASHFREE_ENV === 'PROD' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

export async function createCashfreeOrderAction(orderData: {
  orderId: string; 
  orderAmount: number; 
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: string; 
  userId: string; 
}): Promise<{
  success: boolean;
  paymentLink?: string;
  message?: string;
  order_id?: string; 
}> {
  console.log('[Cashfree] Attempting to create order. Internal Order ID:', orderData.orderId);
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    const errorMessage = 'Cashfree credentials (APP_ID or SECRET_KEY) are not configured on the server.';
    console.error('[Cashfree Order Error]', errorMessage);
    return { success: false, message: errorMessage };
  }

  const HEADERS = {
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY, 
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
  };

  const returnUrl = `${NEXT_PUBLIC_APP_BASE_URL}/payment/status?app_order_id=${orderData.orderId}&event_id=${orderData.eventId}&user_id=${orderData.userId}`;
  const customerId = `cust_${orderData.userId}_${orderData.customerPhone}`.slice(0,50);

  const payload = {
    order_id: orderData.orderId,
    order_amount: orderData.orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId, 
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
    },
    order_meta: { return_url: returnUrl },
    order_note: `Payment for GLAD CELL Event: ${orderData.eventId}`, 
  };

  try {
    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, { headers: HEADERS });
    if (response.data && response.data.payment_session_id && response.data.order_status === "ACTIVE") {
      const paymentCheckoutUrl = `${CASHFREE_ENV === 'PROD' ? 'https://checkout.cashfree.com' : 'https://sandbox.cashfree.com/checkout'}/guest/checkout?payment_session_id=${response.data.payment_session_id}`;
      return { success: true, paymentLink: paymentCheckoutUrl, order_id: response.data.cf_order_id };
    } else if (response.data && response.data.payment_link) {
       return { success: true, paymentLink: response.data.payment_link, order_id: response.data.cf_order_id || orderData.orderId };
    } else {
      console.error('[Cashfree Order Error] Unexpected response structure from Cashfree:', response.data);
      return { success: false, message: response.data?.message || 'Failed to create Cashfree payment session.' };
    }
  } catch (error: any) {
    console.error('[Cashfree Order Error] Axios request failed.');
    if (error.response) {
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      let detailedMessage = `Error (${error.response.status}): ${error.response.data?.message || 'Error with Cashfree.'}`;
      if (error.response.status === 401) detailedMessage += " Check App ID/Secret Key.";
      return { success: false, message: detailedMessage };
    } else if (error.request) {
      return { success: false, message: 'No response from Cashfree server.' };
    } else {
      return { success: false, message: `Error setting up Cashfree request: ${error.message}` };
    }
  }
}

export async function processSuccessfulCashfreePayment(details: {
  appOrderId: string; 
  cfOrderId: string; 
  eventId: string;
  userId: string;
  cfPaymentId?: string; 
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Process Cashfree Payment] Received details:', details);
  const { appOrderId, cfOrderId, eventId, userId, cfPaymentId } = details;

  try {
    const profileResult = await getUserProfile(userId); 
    if (!profileResult.success || !profileResult.data) {
      throw new Error("Failed to fetch user profile for participation.");
    }
    const userDetails: UserProfileSupabase = profileResult.data;

    const eventResult = await getEventById(eventId); 
    if (!eventResult.success || !eventResult.event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }
    const eventDetails: EventData = eventResult.event;

    const qrDataString = JSON.stringify({ orderId: appOrderId, eventId, userId, timestamp: Date.now() });
    let qrCodeDataUri = '';
    try {
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
    } catch (qrError: any) {
      console.warn('[Process Cashfree Payment] QR Code generation failed:', qrError.message);
    }

    const participationPayload: Omit<ParticipationData, 'id' | 'participated_at' | 'attended_at'> = {
      user_id: userId,
      event_id: eventId,
      event_name: eventDetails.name,
      user_name: userDetails.name || '',
      user_email: userDetails.email || '',
      user_phone: (userDetails as any).phone || '', 
      user_branch: userDetails.branch || '',
      user_semester: parseInt(String(userDetails.semester), 10) || 0,
      user_registration_number: userDetails.registration_number || '',
      payment_details: {
        order_id: appOrderId, 
        payment_id: cfPaymentId || cfOrderId, 
        method: 'Cashfree',
      },
      qr_code_data_uri: qrCodeDataUri || null,
    };

    const participationResult = await participateInEvent(participationPayload); 

    if (participationResult.success) {
      return { success: true, message: 'Payment successful and participation recorded.' };
    } else {
      return { 
        success: false, 
        message: `Payment successful, but participation recording failed: ${participationResult.message}. Contact support with Order ID: ${appOrderId}.`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error processing payment confirmation: ${error.message}. Contact support with Order ID: ${appOrderId}.`,
    };
  }
}


export async function registerFreeParticipationAction(details: {
    appOrderId: string;
    eventId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userBranch: string;
    userSemester: number;
    userRegistrationNumber: string;
    eventName: string;
}): Promise<{ success: boolean; message?: string }> {
    console.log('[Register Free Participation] Received details:', details);
    const { appOrderId, eventId, userId, userName, userEmail, userPhone, userBranch, userSemester, userRegistrationNumber, eventName } = details;
=======
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
>>>>>>> 726738b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)

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
<<<<<<< HEAD
        const qrDataString = JSON.stringify({ orderId: appOrderId, eventId, userId, timestamp: Date.now() });
        let qrCodeDataUri = '';
        try {
            qrCodeDataUri = await QRCode.toDataURL(qrDataString);
        } catch (qrError: any) {
            console.warn('[Register Free Participation] QR Code generation failed:', qrError.message);
            // Proceed without QR if generation fails, but log it
        }

        const participationPayload: Omit<ParticipationData, 'id' | 'participated_at' | 'attended_at'> = {
            user_id: userId,
            event_id: eventId,
            event_name: eventName,
            user_name: userName,
            user_email: userEmail,
            user_phone: userPhone,
            user_branch: userBranch,
            user_semester: userSemester,
            user_registration_number: userRegistrationNumber,
            payment_details: { // For free events
                order_id: appOrderId,
                method: 'Free Registration',
                payment_id: null,
            },
            qr_code_data_uri: qrCodeDataUri || null,
        };

        const participationResult = await participateInEvent(participationPayload);

        if (participationResult.success) {
            return { success: true, message: 'Successfully registered for the free event.' };
        } else {
            return {
                success: false,
                message: `Registration failed: ${participationResult.message}. Please try again or contact support.`,
            };
        }
    } catch (error: any) {
        console.error('[Register Free Participation] Error:', error.message, error.stack);
        return {
            success: false,
            message: `Error processing free registration: ${error.message}. Please try again or contact support.`,
        };
=======
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
      console.log('[Server Action] QR Code generated for order:', order_id);
    } catch (qrError: any) {
      console.error('[Server Action Error] Failed to generate QR Code:', qrError.message);
      // Proceed without QR code, but log.
>>>>>>> 726738b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
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
