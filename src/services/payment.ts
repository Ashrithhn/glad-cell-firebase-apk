'use server';

import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent } from './events';
import axios from 'axios';

// Load environment variables
const CASHFREE_APP_ID = process.env.7070781bcbbe4d863f3adaa83f870707;
const CASHFREE_SECRET_KEY = process.env.cfsk_ma_prod_70121966eaebdc8a9aa1a29bad688926_91b0de98;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST'; // default to TEST

const CASHFREE_BASE_URL =
  CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

const HEADERS = {
  'x-client-id': CASHFREE_APP_ID,
  'x-client-secret': CASHFREE_SECRET_KEY,
  'Content-Type': 'application/json',
};

/**
 * Creates a Cashfree payment order.
 */
export async function createCashfreeOrderAction(orderData: {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<{
  success: boolean;
  paymentLink?: string;
  message?: string;
}> {
  try {
    const payload = {
      order_id: orderData.orderId,
      order_amount: orderData.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: orderData.customerPhone,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
      },
      order_meta: {
        return_url: `https://yourapp.com/payment/success?order_id=${orderData.orderId}`,
      },
    };

    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, {
      headers: HEADERS,
    });

    if (response.data && response.data.payment_link) {
      return {
        success: true,
        paymentLink: response.data.payment_link,
      };
    } else {
      return {
        success: false,
        message: 'Failed to create Cashfree payment link.',
      };
    }
  } catch (error: any) {
    console.error('Cashfree order creation error:', error.response?.data || error.message);
    return { success: false, message: 'Error while creating payment order.' };
  }
}

/**
 * Verifies Cashfree signature and records event participation.
 */
export async function verifyCashfreeAndParticipateAction(verificationData: {
  orderId: string;
  orderAmount: number;
  referenceId: string;
  txStatus: string;
  paymentMode: string;
  signature: string;
  // Participant info
  userId: string;
  eventId: string;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  semester: number;
  registrationNumber: string;
}): Promise<{ success: boolean; message?: string }> {
  const {
    orderId,
    orderAmount,
    referenceId,
    txStatus,
    paymentMode,
    signature,
    userId,
    ...participantDetails
  } = verificationData;

  // Validate signature
  const data = `${orderId}${orderAmount}${referenceId}${txStatus}${paymentMode}`;
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(data)
    .digest('base64');

  if (signature !== expectedSignature) {
    return {
      success: false,
      message: 'Payment signature mismatch. Verification failed.',
    };
  }

  if (txStatus !== 'SUCCESS') {
    return {
      success: false,
      message: 'Payment was not successful.',
    };
  }

  // Generate QR Code
  const qrDataString = JSON.stringify({
    orderId,
    eventId: participantDetails.eventId,
    userId,
    timestamp: Date.now(),
  });

  let qrCodeDataUri = '';
  try {
    qrCodeDataUri = await QRCode.toDataURL(qrDataString);
  } catch (error: any) {
    console.warn('QR Code generation failed:', error.message);
  }

  // Store participation
  const result = await participateInEvent({
    userId,
    ...participantDetails,
    paymentDetails: {
      orderId,
      paymentId: referenceId,
      method: 'Cashfree',
    },
    qrCodeDataUri,
  });

  return result.success
    ? { success: true, message: 'Participation successful.' }
    : { success: false, message: result.message || 'Participation failed.' };
}
