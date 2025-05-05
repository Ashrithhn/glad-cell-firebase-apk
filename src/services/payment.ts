
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

let razorpay: Razorpay | null = null;
let razorpayInitError: string | null = null;

if (!razorpayKeyId || !razorpayKeySecret) {
  razorpayInitError = "Razorpay API keys are not configured in environment variables.";
  console.error(`[Server Action Init Error] payment.ts: ${razorpayInitError}`);
} else {
  try {
    // Initialize Razorpay instance
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    console.log('[Server Action Init] payment.ts: Razorpay initialized successfully.');
  } catch (error: any) {
    razorpayInitError = `Failed to initialize Razorpay: ${error.message}`;
    console.error(`[Server Action Init Error] payment.ts: ${razorpayInitError}`);
    razorpay = null; // Ensure instance is null on error
  }
}

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
  console.log('[Server Action] createRazorpayOrderAction invoked.');

  if (!razorpay) {
       const errorMessage = `Razorpay not initialized. ${razorpayInitError || ''}`;
       console.error(`[Server Action Error] createRazorpayOrderAction: ${errorMessage}`);
       return { success: false, message: errorMessage };
  }

  const options = {
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt,
  };

  console.log('[Server Action] Creating Razorpay order with options:', options);

  try {
    const order = await razorpay.orders.create(options);
    console.log('[Server Action] Razorpay Order Created:', order);
    if (!order || !order.id) {
        throw new Error('Failed to create Razorpay order (Invalid response).');
    }
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error('[Server Action Error] Error creating Razorpay order:', error.message, error.stack); // Log stack too
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
    console.log('[Server Action] verifyPaymentAndParticipateAction invoked.');

    // Check razorpayKeySecret specifically needed for verification
    if (!razorpayKeySecret) {
      const errorMessage = 'Razorpay key secret not configured for verification.';
      console.error(`[Server Action Error] verifyPaymentAndParticipateAction: ${errorMessage}`);
      return { success: false, message: errorMessage };
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
        const errorMessage = 'User ID is missing for verification.';
        console.error(`[Server Action Error] verifyPaymentAndParticipateAction: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    console.log('[Server Action] Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id, userId });

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    try {
        const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

        console.log(`[Server Action] Generated Signature: ${expectedSignature}`);
        console.log(`[Server Action] Received Signature: ${razorpay_signature}`);

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            console.log('[Server Action] Payment Signature Verified Successfully for order:', razorpay_order_id);

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
                console.log('[Server Action] Participation recorded successfully for order:', razorpay_order_id);
                return { success: true, message: 'Payment verified and participation recorded.' };
            } else {
                // Critical: Payment succeeded but DB write failed. Log this clearly.
                const dbErrorMessage = `Payment verified BUT failed to record participation for order: ${razorpay_order_id}. Reason: ${participationResult.message || 'Unknown database error'}`;
                console.error(`[Server Action Error] verifyPaymentAndParticipateAction: ${dbErrorMessage}`);
                // Return specific error about DB failure after successful payment
                return { success: false, message: `Payment successful, but failed to save participation record. Please contact support with Order ID: ${razorpay_order_id}.` };
            }
        } else {
            const verificationFailMessage = `Payment Signature Verification Failed for order: ${razorpay_order_id}`;
            console.warn(`[Server Action Warning] verifyPaymentAndParticipateAction: ${verificationFailMessage}`);
            return { success: false, message: 'Payment verification failed: Invalid signature.' };
        }
    } catch (error: any) {
        console.error('[Server Action Error] Error during payment verification or participation recording:', error.message, error.stack);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Verification/Participation failed: ${errorMessage}` };
    }
}
