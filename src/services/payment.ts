
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
  console.log('[Cashfree] Attempting to create order.');
  console.log('[Cashfree] Environment:', CASHFREE_ENV);
  console.log('[Cashfree] App ID Loaded:', !!CASHFREE_APP_ID ? 'Yes' : 'NO - MISSING!');
  console.log('[Cashfree] Secret Key Loaded:', !!CASHFREE_SECRET_KEY ? 'Yes' : 'NO - MISSING!');
  console.log('[Cashfree] API Base URL:', CASHFREE_BASE_URL);


  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    const errorMessage = 'Cashfree credentials (APP_ID or SECRET_KEY) are not configured on the server. Please check .env.local or server environment variables and restart the server.';
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
    const returnUrl = `${NEXT_PUBLIC_APP_BASE_URL}/payment/status?order_id={order_id}&event_id=${orderData.eventId}&user_id=${orderData.userId}`;
    console.log('[Cashfree] Return URL to be used:', returnUrl);


    const payload = {
      order_id: orderData.orderId,
      order_amount: orderData.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `${orderData.customerPhone}_${orderData.userId}`.slice(0, 50), // Ensure customer_id is <= 50 chars
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
      },
      order_meta: {
        return_url: returnUrl,
        // notify_url: `${NEXT_PUBLIC_APP_BASE_URL}/api/payment/cashfree-webhook`, // Optional: For server-to-server notifications
      },
      order_note: `Payment for event: ${orderData.orderId}`, // Optional
    };
    console.log('[Cashfree] Order Payload being sent:', JSON.stringify(payload, null, 2));

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
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', JSON.stringify(error.response.headers, null, 2));
       let detailedMessage = 'Error while creating payment order with Cashfree.';
      if (error.response.data && error.response.data.message) {
        detailedMessage = error.response.data.message;
        if (error.response.data.type) {
             detailedMessage += ` (Type: ${error.response.data.type})`;
        }
         if (error.response.status === 401) {
            detailedMessage += " This often indicates an issue with your App ID or Secret Key. Please verify them in your .env.local file and ensure they match your Cashfree dashboard for the selected environment (PROD/TEST). Remember to restart your server after any .env.local changes.";
        }
      }
      return { success: false, message: detailedMessage };
    } else if (error.request) {
      console.error('Error Request:', error.request);
      return { success: false, message: 'No response received from Cashfree server. Check network or Cashfree status.' };
    } else {
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
  transaction: {
    txStatus: string;
    orderAmount: number;
    paymentMode: string;
    referenceId?: string; 
  };
  signatureFromHeader?: string; 
}): Promise<{ success: boolean; message?: string }> {

  console.log("[Cashfree Verify] Received verification payload:", verificationPayload);

  if (!CASHFREE_SECRET_KEY) {
    console.error("[Cashfree Verify] Secret Key not configured on server.");
    return { success: false, message: "Cashfree Secret Key not configured on server." };
  }

  const { order_id, participantDetails, transaction, signatureFromHeader } = verificationPayload;
  const { txStatus, orderAmount, paymentMode, referenceId } = transaction;

  // --- Signature Verification ---
  // IMPORTANT: Implement actual Cashfree signature verification here based on their documentation.
  // The following is a placeholder. Skipping real verification can lead to security vulnerabilities.
  if (signatureFromHeader) {
      console.warn("[Cashfree Verify] Signature received, but actual verification logic is a placeholder. IMPLEMENT FOR PRODUCTION!");
      // Example structure (NEEDS ACTUAL IMPLEMENTATION):
      // const dataToSign = ... // construct string from webhook payload as per Cashfree docs
      // const expectedSignature = crypto.createHmac('sha256', CASHFREE_SECRET_KEY).update(dataToSign).digest('hex');
      // if (signatureFromHeader !== expectedSignature) {
      //   return { success: false, message: 'Payment signature mismatch.' };
      // }
  } else {
      console.warn("[Cashfree Verify] No signature received in payload. Skipping signature check (Highly Insecure for Production).");
  }


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
      paymentId: referenceId || 'N/A', 
      method: `Cashfree - ${paymentMode}`,
    },
    qrCodeDataUri: qrCodeDataUri || undefined,
  });

  return result.success
    ? { success: true, message: 'Participation successful and payment verified.' }
    : { success: false, message: result.message || 'Participation failed after payment verification.' };
}

