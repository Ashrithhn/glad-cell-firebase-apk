
'use server';

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

    try {
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
    }
}
