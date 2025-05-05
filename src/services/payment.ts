
'use server';

/**
 * @fileOverview Service functions for handling Razorpay payment integration.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { participateInEvent } from './events'; // Import the existing participation function

// Ensure environment variables are set
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error("Razorpay API keys are not configured in environment variables.");
  // Consider throwing an error in production or handling this case appropriately
}

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: razorpayKeyId!,
  key_secret: razorpayKeySecret!,
});

/**
 * Creates a Razorpay order.
 * @param orderData - Data required to create the order.
 * @returns {Promise<{success: boolean, orderId?: string, amount?: number, currency?: string, message?: string}>}
 */
export async function createRazorpayOrderAction(orderData: {
  amount: number; // Amount in the smallest currency unit (e.g., paisa for INR)
  currency: string;
  receipt: string;
}): Promise<{ success: boolean; orderId?: string; amount?: number; currency?: string; message?: string }> {
  if (!razorpay) {
       return { success: false, message: 'Razorpay not initialized.' };
  }

  const options = {
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt,
  };

  console.log('Creating Razorpay order with options:', options);

  try {
    const order = await razorpay.orders.create(options);
    console.log('Razorpay Order Created:', order);
    if (!order || !order.id) {
        throw new Error('Failed to create Razorpay order (Invalid response).')
    }
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during order creation.';
    return { success: false, message: `Failed to create payment order: ${errorMessage}` };
  }
}

/**
 * Verifies the Razorpay payment signature and records event participation if successful.
 * @param verificationData - Data received from Razorpay handler and participant details.
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function verifyPaymentAndParticipateAction(verificationData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  // Participant details to pass to participateInEvent
  userId: string; // Ensure userId is passed explicitly
  eventId: string;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  semester: number;
  registrationNumber: string;
}): Promise<{ success: boolean; message?: string }> {
    if (!razorpayKeySecret) {
      return { success: false, message: 'Razorpay key secret not configured for verification.' };
    }
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId, // Destructure userId
        ...participantDetails // Rest of the data is participant info
    } = verificationData;

    // Basic validation
    if (!userId) {
        return { success: false, message: 'User ID is missing for verification.' };
    }

    console.log('Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id, userId });

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    try {
        const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            console.log('Payment Signature Verified Successfully.');

            // Payment is verified, now record participation
            const participationResult = await participateInEvent({
                userId: userId, // Pass the verified userId
                ...participantDetails,
                paymentDetails: { // Optional: Store payment info
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    method: 'Razorpay'
                }
            });

            if (participationResult.success) {
                console.log('Participation recorded successfully for order:', razorpay_order_id);
                return { success: true, message: 'Payment verified and participation recorded.' };
            } else {
                console.error('Payment verified but failed to record participation for order:', razorpay_order_id, participationResult.message);
                return { success: false, message: `Payment verified, but failed to record participation: ${participationResult.message || 'Unknown error'}` };
            }
        } else {
            console.warn('Payment Signature Verification Failed for order:', razorpay_order_id);
            return { success: false, message: 'Payment verification failed: Invalid signature.' };
        }
    } catch (error) {
        console.error('Error during payment verification or participation recording:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Verification/Participation failed: ${errorMessage}` };
    }
}
