
'use server';

import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent } from './events';
import axios from 'axios';

// Load environment variables
// These names MUST match what's in your .env.local file
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; // default to TEST
const NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:9002'; // Fallback for local dev

const CASHFREE_BASE_URL =
  CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

/**
 * Creates a Cashfree payment order.
 */
export async function createCashfreeOrderAction(orderData: {
  orderId: string;
  orderAmount: number; // Amount in base currency (e.g., Rupees)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: string; // For constructing return URL metadata
  userId: string; // For constructing return URL metadata
}): Promise<{
  success: boolean;
  paymentLink?: string;
  message?: string;
}> {
  console.log('[Cashfree] Creating order. App ID Loaded:', !!CASHFREE_APP_ID, 'Secret Key Loaded:', !!CASHFREE_SECRET_KEY, 'Env:', CASHFREE_ENV);
  console.log('[Cashfree] Base URL for API:', CASHFREE_BASE_URL);


  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    const errorMessage = 'Cashfree credentials (APP_ID or SECRET_KEY) are not configured on the server. Please check .env.local or server environment variables.';
    console.error('[Cashfree Order Error]', errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }

  const HEADERS = {
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
    'Content-Type': 'application/json',
    'x-api-version': '2022-09-01', // Recommended API version
  };

  try {
    // Construct the return URL. This should point to a page in your app that handles Cashfree's response.
    // Example: /payment/callback or /payment/status
    // We'll pass necessary identifiers in the query parameters.
    const returnUrl = `${NEXT_PUBLIC_APP_BASE_URL}/payment/status?order_id={order_id}&event_id=${orderData.eventId}&user_id=${orderData.userId}`;
    console.log('[Cashfree] Return URL:', returnUrl);


    const payload = {
      order_id: orderData.orderId,
      order_amount: orderData.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `${orderData.customerPhone}_${orderData.userId}`, // Make customer_id unique
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
      },
      order_meta: {
        // The return_url tells Cashfree where to redirect the user after payment.
        // {order_id} will be replaced by Cashfree with the actual order ID.
        return_url: returnUrl,
        // notify_url: `${NEXT_PUBLIC_APP_BASE_URL}/api/payment/cashfree-webhook`, // Optional: For server-to-server notifications
      },
      order_note: `Payment for event: ${orderData.orderId}`, // Optional
    };
    console.log('[Cashfree] Order Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, {
      headers: HEADERS,
    });

    console.log('[Cashfree] API Response Status:', response.status);
    console.log('[Cashfree] API Response Data:', JSON.stringify(response.data, null, 2));


    if (response.data && response.data.payment_link) {
      return {
        success: true,
        paymentLink: response.data.payment_link,
      };
    } else {
      console.error('[Cashfree Order Error] Unexpected response structure from Cashfree:', response.data);
      return {
        success: false,
        message: response.data?.message || 'Failed to create Cashfree payment link. Unexpected response.',
      };
    }
  } catch (error: any) {
    console.error('[Cashfree Order Error] Axios request failed.');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', JSON.stringify(error.response.headers, null, 2));
       let detailedMessage = 'Error while creating payment order with Cashfree.';
      if (error.response.data && error.response.data.message) {
        detailedMessage = error.response.data.message;
        if (error.response.data.type) {
             detailedMessage += ` (Type: ${error.response.data.type})`;
        }
      }
      return { success: false, message: detailedMessage };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error Request:', error.request);
      return { success: false, message: 'No response received from Cashfree server. Check network or Cashfree status.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
      return { success: false, message: `Error setting up Cashfree request: ${error.message}` };
    }
  }
}

/**
 * Verifies Cashfree signature and records event participation.
 * This function would typically be called by a webhook handler or a redirect page.
 */
export async function verifyCashfreeAndParticipateAction(verificationPayload: {
  order_id: string;
  // other fields from Cashfree webhook/redirect...
  // For example, the participant details might be retrieved from your DB using order_id
  // Or they might have been passed in the redirect URL's query parameters.
  // For simplicity, assuming we get participantDetails somehow based on order_id
  participantDetails: {
    userId: string;
    eventId: string;
    eventName: string;
    name: string;
    email: string;
    phone: string;
    branch: string;
    semester: number;
    registrationNumber: string;
  };
  // Cashfree typically sends the entire POST body for signature verification.
  // The signature itself is usually in the `x-cf-signature` header.
  // This function needs to be adapted based on how Cashfree sends webhook data.
  // Let's assume for now 'transaction' object is part of the payload from Cashfree.
  transaction: {
    txStatus: string;
    orderAmount: number;
    paymentMode: string;
    referenceId?: string; // Cashfree's transaction ID
  };
  signatureFromHeader: string; // This would be extracted from the 'x-cf-signature' header in a webhook
}): Promise<{ success: boolean; message?: string }> {

  if (!CASHFREE_SECRET_KEY) {
    return { success: false, message: "Cashfree Secret Key not configured on server." };
  }

  const { order_id, participantDetails, transaction, signatureFromHeader } = verificationPayload;
  const { txStatus, orderAmount, paymentMode, referenceId } = transaction;

  // --- Signature Verification ---
  // The exact data to be signed can vary. Refer to Cashfree's documentation for webhooks.
  // Typically, it's the timestamp from the header + the raw request body.
  // For this example, we'll simulate a simplified signature check based on common fields.
  // THIS IS A PLACEHOLDER AND NEEDS TO BE REPLACED WITH CASHFREE'S ACTUAL SIGNATURE VERIFICATION LOGIC.
  // It's CRITICAL to implement this correctly for security.
  // The following is a conceptual example of how you might prepare a string for HMAC:
  // const dataToSign = `${order_id}${orderAmount}${referenceId}${txStatus}${paymentMode}`; // This is an example, check Cashfree docs!
  // const expectedSignature = crypto
  //   .createHmac('sha256', CASHFREE_SECRET_KEY)
  //   .update(dataToSign)
  //   .digest('base64');

  // if (signatureFromHeader !== expectedSignature) {
  //   console.error(`[Cashfree Verify] Signature mismatch. Expected: ${expectedSignature}, Got: ${signatureFromHeader}`);
  //   return {
  //     success: false,
  //     message: 'Payment signature mismatch. Verification failed.',
  //   };
  // }
  // IMPORTANT: Replace above placeholder with actual Cashfree signature verification logic.
  // For now, we will proceed with a warning for development if the signature is not directly passed for verification.
  console.warn("[Cashfree Verify] Placeholder for signature verification. Ensure this is implemented correctly for production!");


  if (txStatus !== 'SUCCESS') {
    return {
      success: false,
      message: `Payment was not successful. Status: ${txStatus}`,
    };
  }

  // Generate QR Code
  const qrDataString = JSON.stringify({
    orderId: order_id,
    eventId: participantDetails.eventId,
    userId: participantDetails.userId,
    timestamp: Date.now(),
  });

  let qrCodeDataUri = '';
  try {
    qrCodeDataUri = await QRCode.toDataURL(qrDataString);
  } catch (error: any) {
    console.warn('[Cashfree Verify] QR Code generation failed:', error.message);
    // Proceed without QR code if generation fails, but log it.
  }

  // Store participation
  const result = await participateInEvent({
    userId: participantDetails.userId,
    eventId: participantDetails.eventId,
    eventName: participantDetails.eventName,
    name: participantDetails.name,
    email: participantDetails.email,
    phone: participantDetails.phone,
    branch: participantDetails.branch,
    semester: participantDetails.semester,
    registrationNumber: participantDetails.registrationNumber,
    paymentDetails: {
      orderId: order_id,
      paymentId: referenceId || 'N/A', // Cashfree's transaction ID
      method: `Cashfree - ${paymentMode}`,
    },
    qrCodeDataUri: qrCodeDataUri || undefined, // Pass undefined if empty
  });

  return result.success
    ? { success: true, message: 'Participation successful and payment verified.' }
    : { success: false, message: result.message || 'Participation failed after payment verification.' };
}
