
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { verifyCashfreeAndParticipateAction } from '@/services/payment'; // Assuming you might call verification from client if needed, or server does it
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/services/events'; // To get participant details if needed
import type { EventData } from '@/services/events';
import { getEvents } from '@/services/events';


interface ParticipantDetailsForVerification {
    userId: string;
    eventId: string;
    eventName: string;
    name: string;
    email: string;
    phone: string;
    branch: string;
    semester: number;
    registrationNumber: string;
}

function PaymentStatusPageContents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'success' | 'failure' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your payment status...');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    const cf_order_id = searchParams.get('order_id');
    const cf_event_id = searchParams.get('event_id'); // Passed from our app
    const cf_user_id = searchParams.get('user_id'); // Passed from our app
    
    // Cashfree might also append its own parameters like cf_status, cf_payment_id, etc.
    // For this example, we primarily rely on what we passed.
    // A robust solution would involve calling a server endpoint to verify the payment with Cashfree's API.

    setOrderId(cf_order_id);
    setEventId(cf_event_id);
    setUserId(cf_user_id);

    if (cf_order_id && cf_event_id && cf_user_id) {
      // Simulating verification. In a real app, you'd make a server call here
      // to an endpoint that securely verifies the payment with Cashfree.
      // That server endpoint would then call `verifyCashfreeAndParticipateAction`.

      // For client-side simulation/display based on URL params:
      // This is NOT secure for actual verification.
      // We'll assume for this example the payment was successful if Cashfree redirected here
      // with an order_id. A real implementation *must* verify server-side.

      const verifyPayment = async () => {
        try {
            // 1. Fetch user profile
            const profileResult = await getUserProfile(cf_user_id);
            if (!profileResult.success || !profileResult.data) {
                throw new Error("Failed to fetch user profile for verification.");
            }
            const userDetails = profileResult.data;

            // 2. Fetch event details
            const eventsResult = await getEvents(); // Fetch all events
            if (!eventsResult.success || !eventsResult.events) {
                 throw new Error("Failed to fetch event details for verification.");
            }
            const eventDetails = eventsResult.events.find(e => e.id === cf_event_id);
            if (!eventDetails) {
                throw new Error(`Event with ID ${cf_event_id} not found.`);
            }


            const participantData: ParticipantDetailsForVerification = {
                userId: cf_user_id,
                eventId: cf_event_id,
                eventName: eventDetails.name, // Get event name from fetched details
                name: userDetails.name || '',
                email: userDetails.email || '',
                phone: (userDetails as any).phone || '',
                branch: userDetails.branch || '',
                semester: parseInt(String(userDetails.semester), 10) || 0,
                registrationNumber: userDetails.registrationNumber || '',
            };

            // THIS IS WHERE YOU WOULD CALL YOUR SERVER-SIDE VERIFICATION ENDPOINT
            // For now, we are directly calling the action, which is not ideal for client-side.
            // The `verifyCashfreeAndParticipateAction` should ideally be called by a server endpoint
            // that Cashfree's webhook or redirect hits, which then performs the signature check.
            
            // Let's assume the server has already verified and we're just confirming the order status
            // from Cashfree's perspective (which is typically done via webhook)

            // For a client-side confirmation, you might check parameters Cashfree appends, like 'cf_status'
            const cf_status = searchParams.get('cf_status'); // Example parameter Cashfree might send

            if (cf_status === 'SUCCESS' || cf_status === 'success') { // Adjust based on actual Cashfree response
                setStatus('success');
                setMessage(`Payment for Order ID: ${cf_order_id} was successful! Your participation for event "${eventDetails.name}" is confirmed.`);
                toast({
                    title: "Payment Successful!",
                    description: "Your participation is confirmed.",
                    variant: "default"
                });
                // Optionally, you could trigger the server-side `verifyCashfreeAndParticipateAction` here
                // if it's designed to be idempotent and secure for such a call pattern.
                // However, the primary verification should happen server-to-server via webhooks.
            } else if (cf_status === 'FAILED' || cf_status === 'failure') {
                setStatus('failure');
                setMessage(`Payment for Order ID: ${cf_order_id} failed. Please try again or contact support.`);
                 toast({
                    title: "Payment Failed",
                    description: "Please try again or contact support.",
                    variant: "destructive"
                });
            } else if (cf_status === 'PENDING' || cf_status === 'pending') {
                setStatus('pending');
                setMessage(`Payment for Order ID: ${cf_order_id} is pending. We will update you once confirmed.`);
                 toast({
                    title: "Payment Pending",
                    description: "We will update you once confirmed.",
                    variant: "default"
                });
            }
            else {
                // If cf_status is not present or unrecognized, assume success for this example
                // as Cashfree redirection implies user interaction.
                // AGAIN: THIS IS NOT SECURE FOR PRODUCTION. SERVER-SIDE VERIFICATION IS KEY.
                console.warn("Cashfree payment status parameter 'cf_status' not found or unrecognized in return URL. Assuming success for demo purposes. Implement server-side verification!");
                setStatus('success');
                setMessage(`Payment for Order ID: ${cf_order_id} processed. Your participation for event "${eventDetails.name}" is confirmed (pending final server verification).`);
                 toast({
                    title: "Payment Processed",
                    description: "Your participation is confirmed (pending final server verification).",
                    variant: "default"
                });
            }

        } catch (error) {
            console.error("Error processing payment status:", error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : "An error occurred while processing your payment. Please contact support.");
             toast({
                title: "Processing Error",
                description: "An error occurred. Please contact support.",
                variant: "destructive"
            });
        }
      };

      verifyPayment();

    } else {
      setStatus('error');
      setMessage('Invalid payment return URL. Necessary information is missing.');
    }
  }, [searchParams, router, toast]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failure':
        return <XCircle className="h-12 w-12 text-destructive" />;
      case 'pending':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'error':
        return <Info className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  };

  const renderTitle = () => {
     switch (status) {
      case 'loading':
        return "Processing Payment...";
      case 'success':
        return "Payment Successful!";
      case 'failure':
        return "Payment Failed";
      case 'pending':
        return "Payment Pending";
      case 'error':
        return "An Error Occurred";
      default:
        return "Payment Status";
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-150px)] auth-page-gradient">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {renderIcon()}
          </div>
          <CardTitle className="text-2xl">{renderTitle()}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {orderId && <p className="text-sm text-muted-foreground mb-4">Order ID: {orderId}</p>}
          {(status === 'success' || status === 'pending') && eventId && (
            <Button asChild className="mt-4">
              <Link href={`/profile`}>Go to My Tickets</Link>
            </Button>
          )}
          {(status === 'failure' || status === 'error') && eventId && (
            <Button asChild className="mt-4" variant="outline">
              <Link href={`/programs`}>Retry / View Programs</Link>
            </Button>
          )}
           {status !== 'loading' && (
             <Button asChild variant="link" className="block mx-auto mt-2">
                <Link href="/">Go to Homepage</Link>
             </Button>
           )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentStatusPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <PaymentStatusPageContents />
        </Suspense>
    );
}
