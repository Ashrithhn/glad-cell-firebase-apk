'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { processSuccessfulCashfreePayment } from '@/services/payment'; // Updated import
import { useToast } from '@/hooks/use-toast';


function PaymentStatusPageContents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'success' | 'failure' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your payment status...');
  
  // Store our app's order ID and event ID, and Cashfree's order ID
  const [appOrderId, setAppOrderId] = useState<string | null>(null);
  const [cfOrderId, setCfOrderId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);


  useEffect(() => {
    // Extract parameters from the URL
    const cf_order_id = searchParams.get('cf_order_id'); // Cashfree's order ID
    const cf_payment_id = searchParams.get('cf_payment_id'); // Cashfree's payment ID
    const cf_status = searchParams.get('cf_status'); // Cashfree's payment status
    
    // Parameters we passed to Cashfree and got back
    const app_order_id_from_url = searchParams.get('app_order_id'); // Our internal order_id
    const event_id_from_url = searchParams.get('event_id');
    const user_id_from_url = searchParams.get('user_id');

    setAppOrderId(app_order_id_from_url);
    setCfOrderId(cf_order_id);
    setEventId(event_id_from_url);
    setUserId(user_id_from_url);
    
    console.log("[Payment Status Page] URL Params:", {
        cf_order_id, cf_payment_id, cf_status, app_order_id_from_url, event_id_from_url, user_id_from_url
    });


    if (!app_order_id_from_url || !event_id_from_url || !user_id_from_url) {
      setStatus('error');
      setMessage('Invalid payment return URL. Necessary information from our app is missing.');
      toast({ title: "Error", description: "Invalid payment link.", variant: "destructive" });
      return;
    }
    
    if (!cf_order_id) {
        setStatus('error');
        setMessage('Cashfree order ID missing from return URL. Cannot confirm status.');
        toast({ title: "Error", description: "Payment confirmation incomplete.", variant: "destructive" });
        return;
    }


    const handlePaymentResult = async () => {
      if (cf_status === 'SUCCESS') {
        setStatus('loading'); // Show loading while processing participation
        setMessage(`Payment for Order ID: ${app_order_id_from_url} successful! Confirming participation...`);
        
        const result = await processSuccessfulCashfreePayment({
          appOrderId: app_order_id_from_url,
          cfOrderId: cf_order_id,
          eventId: event_id_from_url,
          userId: user_id_from_url,
          cfPaymentId: cf_payment_id || undefined,
        });

        if (result.success) {
          setStatus('success');
          setMessage(result.message || `Payment successful! Your participation for event is confirmed.`);
          toast({
            title: "Payment Successful!",
            description: result.message || "Your participation is confirmed.",
            variant: "default"
          });
        } else {
          setStatus('error'); // Set to error if participation recording fails
          setMessage(result.message || `Payment was successful, but participation recording failed for Order ID: ${app_order_id_from_url}. Please contact support.`);
          toast({
            title: "Participation Error",
            description: result.message || "Error confirming participation.",
            variant: "destructive"
          });
        }
      } else if (cf_status === 'FAILED' || cf_status === 'CANCELLED' || cf_status === 'USER_DROPPED') {
        setStatus('failure');
        setMessage(`Payment for Order ID: ${app_order_id_from_url} ${cf_status?.toLowerCase()}. Please try again or contact support.`);
        toast({
          title: `Payment ${cf_status || 'Failed'}`,
          description: "Please try again or contact support.",
          variant: "destructive"
        });
      } else if (cf_status === 'PENDING') {
        setStatus('pending');
        setMessage(`Payment for Order ID: ${app_order_id_from_url} is pending. We will update you once confirmed.`);
        toast({
          title: "Payment Pending",
          description: "We will update you once confirmed.",
          variant: "default"
        });
      } else if (cf_status === 'FLAGGED') {
        setStatus('pending'); // Or a specific 'flagged' status
        setMessage(`Payment for Order ID: ${app_order_id_from_url} is under review. We will update you.`);
        toast({
            title: "Payment Under Review",
            description: "Your payment is currently under review.",
            variant: "default"
        });
      }
      else {
        // If cf_status is not present or unrecognized, it's an ambiguous state.
        // This might happen if Cashfree redirects without a clear status (unlikely for standard flow).
        // Or if some parameters are missing.
        console.warn("Cashfree payment status parameter 'cf_status' not found, unrecognized, or key parameters missing from return URL. This is an ambiguous state.");
        setStatus('error');
        setMessage(`Payment status for Order ID: ${app_order_id_from_url} is unclear. Cashfree status: '${cf_status || 'N/A'}'. Please contact support if you believe your payment was successful.`);
        toast({
          title: "Payment Status Unclear",
          description: "Please contact support to confirm your payment.",
          variant: "destructive"
        });
      }
    };

    handlePaymentResult();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, toast]); // Not adding internal state setters like setAppOrderId to deps to avoid re-triggering on their change.

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
        return "Payment Failed / Cancelled";
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
          {appOrderId && <p className="text-sm text-muted-foreground mb-1">Your Order ID: {appOrderId}</p>}
          {cfOrderId && <p className="text-xs text-muted-foreground mb-4">Gateway Order ID: {cfOrderId}</p>}
          
          {(status === 'success' || status === 'pending') && eventId && (
            <Button asChild className="mt-4">
              <Link href={`/profile`}>Go to My Tickets</Link>
            </Button>
          )}
          {(status === 'failure' || status === 'error' && status !== 'loading') && eventId && (
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
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary"/> Processing...</div>}>
            <PaymentStatusPageContents />
        </Suspense>
    );
}
