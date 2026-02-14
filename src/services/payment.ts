
'use server';

/**
 * @fileOverview Service functions for handling Cashfree payment integration.
 */

import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent, getUserProfile, getEventById } from './events'; 
import type { EventData, ParticipationData } from './events'; // Using Supabase-compatible types
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

// Load environment variables
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; 
const NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:9002'; 

const CASHFREE_API_VERSION = '2023-08-01';
const CASHFREE_BASE_URL = CASHFREE_ENV === 'PROD' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

const generateTicketId = () => `GECM${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}A`;

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
      customer_id: customerId, // Use the generated customerId
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_name: orderData.customerName || orderData.customerEmail,
    },
    order_meta: { return_url: returnUrl },
    order_note: `Payment for GLAD CELL Event: ${orderData.eventId}`, 
  };

  try {
    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, { headers: HEADERS });
    if (response.data && response.data.payment_session_id && response.data.order_status === "ACTIVE") {
      const paymentCheckoutUrl = `${CASHFREE_ENV === 'PROD' ? 'https://checkout.cashfree.com' : 'https://sandbox.cashfree.com/checkout'}/guest/checkout?payment_session_id=${response.data.payment_session_id}`;
      return { success: true, paymentLink: paymentCheckoutUrl, order_id: response.data.cf_order_id };
    } else if (response.data && response.data.payment_link) { // Fallback for older or different API responses
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
    const userDetails = profileResult.data;

    const eventResult = await getEventById(eventId);
    if (!eventResult.success || !eventResult.event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }
    const eventDetailsItem = eventResult.event;

    const qrDataString = JSON.stringify({ orderId: appOrderId, eventId, userId, timestamp: Date.now() });
    let qrCodeDataUri = '';
    try {
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
      console.log('[Process Cashfree Payment] QR Code generated for order:', appOrderId);
    } catch (qrError: any) {
      console.warn('[Process Cashfree Payment] QR Code generation failed:', qrError.message);
    }

    const participationPayload: ParticipationData = {
      id: appOrderId, // Use the app-generated order ID as the primary key for the participation record
      ticket_id: generateTicketId(),
      user_id: userId,
      event_id: eventId,
      event_name: eventDetailsItem.name,
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
      // Create a notification for the user
      await createNotification({
          user_id: userId,
          title: "Registration Confirmed!",
          message: `You have successfully registered for the event: ${eventDetailsItem.name}.`,
          link: '/profile'
      });
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


/**
 * Directly registers a user for a free event, bypassing the payment gateway.
 */
export async function processFreeRegistration(details: {
  eventId: string;
  userId: string;
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Process Free Registration] Received details:', details);
  const { eventId, userId } = details;

  try {
    const profileResult = await getUserProfile(userId);
    if (!profileResult.success || !profileResult.data) {
      throw new Error("Could not fetch your user profile to complete registration.");
    }
    const userDetails = profileResult.data;

    const eventResult = await getEventById(eventId);
    if (!eventResult.success || !eventResult.event) {
        throw new Error(`The selected event (ID: ${eventId}) could not be found.`);
    }
    const eventDetailsItem = eventResult.event;

    // Generate a unique ID for this participation record
    const participationId = crypto.randomUUID();

    const qrDataString = JSON.stringify({ orderId: participationId, eventId, userId, timestamp: Date.now() });
    let qrCodeDataUri = '';
    try {
      qrCodeDataUri = await QRCode.toDataURL(qrDataString);
      console.log('[Process Free Registration] QR Code generated for participation ID:', participationId);
    } catch (qrError: any) {
      console.warn('[Process Free Registration] QR Code generation failed:', qrError.message);
      // Non-fatal, we can proceed without a QR code if necessary
    }

    const participationPayload: ParticipationData = {
      id: participationId,
      ticket_id: generateTicketId(),
      user_id: userId,
      event_id: eventId,
      event_name: eventDetailsItem.name,
      user_name: userDetails.name || '',
      user_email: userDetails.email || '',
      user_phone: (userDetails as any).phone || '',
      user_branch: userDetails.branch || '',
      user_semester: parseInt(String(userDetails.semester), 10) || 0,
      user_registration_number: userDetails.registration_number || '',
      payment_details: null, // No payment details for free events
      qr_code_data_uri: qrCodeDataUri || null,
    };

    const participationResult = await participateInEvent(participationPayload);

    if (participationResult.success) {
      // Create a notification for the user
      await createNotification({
          user_id: userId,
          title: "Registration Confirmed!",
          message: `You have successfully registered for the free event: ${eventDetailsItem.name}.`,
          link: '/profile'
      });
      revalidatePath('/profile');
      return { success: true, message: 'Registration successful! Your ticket is now in your profile.' };
    } else {
      return {
        success: false,
        message: `Registration failed: ${participationResult.message}.`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error processing free registration: ${error.message}.`,
    };
  }
}
