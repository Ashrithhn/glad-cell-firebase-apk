'use server';

import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent, getUserProfile, getEvents } from './events'; // Import getUserProfile and getEvents
import type { EventData } from './events';
import axios from 'axios';

// Load environment variables
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; // default to TEST
const NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:9002'; // Fallback for local dev

const CASHFREE_API_VERSION = '2023-08-01'; // Use a recent, stable API version

const CASHFREE_BASE_URL =
  CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

/**
 * Creates a Cashfree payment order.
 */
export async function createCashfreeOrderAction(orderData: {
  orderId: string; // Should be unique from our system
  orderAmount: number; // Amount in base currency (e.g., Rupees)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: string; 
  userId: string; 
}): Promise<{
  success: boolean;
  paymentLink?: string;
  message?: string;
  order_id?: string; // Return Cashfree's order_id if different or for confirmation
}> {
  console.log('[Cashfree] Attempting to create order. Internal Order ID:', orderData.orderId);
  console.log('[Cashfree] Environment:', CASHFREE_ENV);
  console.log('[Cashfree] App ID Loaded:', !!CASHFREE_APP_ID ? 'Yes' : 'NO - MISSING!');
  // Do not log secret key value

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
    'x-secret-key': CASHFREE_SECRET_KEY, // Correct header for secret key
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
  };

  // Construct the return URL. Cashfree will append parameters to this.
  // Parameters like cf_order_id, cf_payment_id, cf_status will be appended by Cashfree.
  const returnUrl = `${NEXT_PUBLIC_APP_BASE_URL}/payment/status?app_order_id=${orderData.orderId}&event_id=${orderData.eventId}&user_id=${orderData.userId}`;
  console.log('[Cashfree] Return URL to be used:', returnUrl);

  // Customer ID must be unique for each customer.
  // Max length 50. Using combination of phone and userId.
  const customerId = `cust_${orderData.userId}_${orderData.customerPhone}`.slice(0,50);


  const payload = {
    order_id: orderData.orderId, // Your unique order ID
    order_amount: orderData.orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId, 
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
    },
    order_meta: {
      return_url: returnUrl,
      // notify_url: `${NEXT_PUBLIC_APP_BASE_URL}/api/payment/cashfree-webhook`, // Recommended for production
    },
    order_note: `Payment for GLAD CELL Event: ${orderData.eventId}`, 
  };
  console.log('[Cashfree] Order Payload being sent:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, {
      headers: HEADERS,
    });

    console.log('[Cashfree] API Response Status:', response.status);
    console.log('[Cashfree] API Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.payment_session_id && response.data.order_status === "ACTIVE") {
      // For standard checkout, use payment_session_id to redirect
      // The payment_link might be for seamless integration.
      // Let's construct the standard checkout URL:
      const paymentCheckoutUrl = `${CASHFREE_ENV === 'PROD' ? 'https://checkout.cashfree.com' : 'https://sandbox.cashfree.com/checkout'}/guest/checkout?payment_session_id=${response.data.payment_session_id}`;

      return {
        success: true,
        paymentLink: paymentCheckoutUrl, // Use this link for redirection
        order_id: response.data.cf_order_id, // Cashfree's order ID
      };
    } else if (response.data && response.data.payment_link) { // Fallback for older API or specific link types
       return {
        success: true,
        paymentLink: response.data.payment_link,
        order_id: response.data.cf_order_id || orderData.orderId,
      };
    } else {
      console.error('[Cashfree Order Error] Unexpected response structure from Cashfree:', response.data);
      return {
        success: false,
        message: response.data?.message || 'Failed to create Cashfree payment session. Unexpected response.',
      };
    }
  } catch (error: any) {
    console.error('[Cashfree Order Error] Axios request failed.');
    if (error.response) {
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', JSON.stringify(error.response.headers, null, 2));
      let detailedMessage = `Error (${error.response.status}): `;
      if (error.response.data && error.response.data.message) {
        detailedMessage += error.response.data.message;
        if (error.response.data.type) {
             detailedMessage += ` (Type: ${error.response.data.type}, Code: ${error.response.data.code})`;
        }
         if (error.response.status === 401) {
            detailedMessage += " This often indicates an issue with your App ID or Secret Key. Please verify them in your .env.local file and ensure they match your Cashfree dashboard for the selected environment (PROD/TEST). Remember to restart your server after any .env.local changes.";
        }
      } else {
        detailedMessage += 'Error while creating payment order with Cashfree.';
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
 * Processes a successful Cashfree payment.
 * This should be called from the payment status page after Cashfree redirects back.
 * It fetches necessary details, generates QR, and records participation.
 */
export async function processSuccessfulCashfreePayment(details: {
  appOrderId: string; // Your internal order ID
  cfOrderId: string; // Cashfree's order ID (from URL query params)
  eventId: string;
  userId: string;
  cfPaymentId?: string; // Cashfree's payment ID (from URL query params)
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Process Cashfree Payment] Received details:', details);

  const { appOrderId, cfOrderId, eventId, userId, cfPaymentId } = details;

  try {
    // 1. Fetch user profile
    const profileResult = await getUserProfile(userId);
    if (!profileResult.success || !profileResult.data) {
      throw new Error("Failed to fetch user profile for participation.");
    }
    const userDetails = profileResult.data;

    // 2. Fetch event details (ensure it's the correct event)
    const eventsResult = await getEvents();
    if (!eventsResult.success || !eventsResult.events) {
      throw new Error("Failed to fetch event details for participation.");
    }
    const eventDetails = eventsResult.events.find((e: EventData) => e.id === eventId);
    if (!eventDetails) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }

    // 3. Generate QR Code
    const qrDataString = JSON.stringify({
      orderId: appOrderId, // Using our internal orderId for QR
      eventId: eventId,
      userId: userId,
      timestamp: Date.now(),
    });

    let qrCodeDataUri = '';
    try {
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
    } catch (qrError: any) {
      console.warn('[Process Cashfree Payment] QR Code generation failed:', qrError.message);
      // Continue without QR code if generation fails, log it.
    }

    // 4. Record participation in Firestore
    const participationResult = await participateInEvent({
      userId: userId,
      eventId: eventId,
      eventName: eventDetails.name,
      name: userDetails.name || '',
      email: userDetails.email || '',
      phone: (userDetails as any).phone || '', // Assuming phone is available
      branch: userDetails.branch || '',
      semester: parseInt(String(userDetails.semester), 10) || 0,
      registrationNumber: userDetails.registrationNumber || '',
      paymentDetails: {
        orderId: appOrderId, // Your internal order ID
        paymentId: cfPaymentId || cfOrderId, // Use cfPaymentId if available, else cfOrderId
        method: 'Cashfree',
      },
      qrCodeDataUri: qrCodeDataUri || undefined,
    });

    if (participationResult.success) {
      console.log('[Process Cashfree Payment] Participation recorded successfully for order:', appOrderId);
      return { success: true, message: 'Payment successful and participation recorded.' };
    } else {
      console.error('[Process Cashfree Payment] Failed to record participation after successful payment for order:', appOrderId, 'Reason:', participationResult.message);
      // This is a critical situation: payment was made, but participation recording failed.
      // Implement retry logic or manual alert for admin.
      return { 
        success: false, 
        message: `Payment was successful, but there was an issue recording your participation: ${participationResult.message}. Please contact support with Order ID: ${appOrderId}.`
      };
    }
  } catch (error: any) {
    console.error('[Process Cashfree Payment] Error:', error.message);
    return {
      success: false,
      message: `An error occurred while processing your payment confirmation: ${error.message}. Please contact support with Order ID: ${appOrderId}.`,
    };
  }
}
