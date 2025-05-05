
'use client';

import * as React from 'react';
import Script from 'next/script';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { createRazorpayOrderAction, verifyPaymentAndParticipateAction } from '@/services/payment'; // Import payment actions

// Define environment variable for Razorpay Key ID (must be set in your .env.local or environment)
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string;
    fee: number; // Participation fee in paisa (e.g., 10000 for ₹100)
  };
}

// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }), // Added phone for Razorpay prefill
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registrationNumber: z.string().min(5, { message: 'Registration number must be valid.' }).max(20),
});

type FormData = z.infer<typeof formSchema>;

declare global {
    interface Window {
        Razorpay: any; // Add Razorpay to the window interface
    }
}

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // TODO: Pre-fill defaultValues with logged-in user data if available
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      branch: '',
      semester: undefined,
      registrationNumber: '',
    },
  });

   // Load Razorpay script
  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
        console.error("Razorpay SDK failed to load.");
        toast({
            title: "Payment Error",
            description: "Could not load payment gateway. Please try again later.",
            variant: "destructive",
        });
        setIsPaying(false); // Allow retry
    };
    document.body.appendChild(script);
  };

   React.useEffect(() => {
    if (isOpen) {
      loadRazorpay(); // Load script when modal opens
    }
     // Cleanup function to remove the script if the component unmounts or modal closes
     return () => {
       const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
       if (script) {
         document.body.removeChild(script);
         setRazorpayLoaded(false); // Reset loaded state
       }
     };
  }, [isOpen]); // Dependency on isOpen ensures script loads/unloads with modal


  async function initiatePayment(values: FormData) {
     if (!razorpayKeyId) {
       console.error("Razorpay Key ID is not configured.");
       toast({
         title: "Configuration Error",
         description: "Payment gateway is not set up correctly.",
         variant: "destructive",
       });
       return;
     }

     if (!razorpayLoaded || !window.Razorpay) {
         console.error("Razorpay SDK not loaded yet.");
         toast({
             title: "Payment Initializing",
             description: "Payment gateway is loading. Please wait a moment and try again.",
             variant: "default",
         });
         if (!razorpayLoaded) loadRazorpay(); // Attempt to reload if failed initially
         return;
     }


    setIsPaying(true);
    setIsSubmitting(true); // Disable form submission during payment

    try {
      // 1. Create Razorpay Order on the server
      const orderResult = await createRazorpayOrderAction({
        amount: eventDetails.fee, // Amount in paisa
        currency: 'INR',
        receipt: `receipt_${eventDetails.id}_${Date.now()}` // Unique receipt ID
      });

      if (!orderResult.success || !orderResult.orderId) {
        throw new Error(orderResult.message || 'Failed to create payment order.');
      }

      // 2. Configure Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: orderResult.amount, // Amount in paisa from server response
        currency: orderResult.currency,
        name: `Participation: ${eventDetails.name}`,
        description: `Fee for ${eventDetails.name}`,
        order_id: orderResult.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment and Record Participation on the server
          try {
            const verifyResult = await verifyPaymentAndParticipateAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: eventDetails.id,
              eventName: eventDetails.name,
              ...values, // Include participant details
            });

            if (verifyResult.success) {
              toast({
                title: 'Participation Recorded!',
                description: `You are now registered for ${eventDetails.name}.`,
                variant: 'default',
              });
              form.reset(); // Reset form fields
              onClose(); // Close the modal
            } else {
              throw new Error(verifyResult.message || 'Payment verification failed.');
            }
          } catch (verifyError) {
             console.error('Payment Verification/Participation Error:', verifyError);
             toast({
                title: 'Verification Failed',
                description: verifyError instanceof Error ? verifyError.message : 'Could not verify payment or record participation. Please contact support.',
                variant: 'destructive',
             });
          } finally {
              setIsPaying(false);
              setIsSubmitting(false);
          }
        },
        prefill: {
          name: values.name,
          email: values.email,
          contact: values.phone,
        },
        notes: {
          eventId: eventDetails.id,
          registrationNumber: values.registrationNumber,
          branch: values.branch,
          semester: values.semester.toString(),
        },
        theme: {
          color: '#2563EB', // Primary color (Tailwind blue-600)
        },
        modal: {
            ondismiss: function() {
                console.log('Razorpay checkout closed');
                setIsPaying(false); // Re-enable button if user closes modal
                setIsSubmitting(false);
                toast({
                    title: "Payment Cancelled",
                    description: "You closed the payment window.",
                    variant: "default", // Or maybe "destructive" depending on desired UX
                });
            }
        }
      };

      const rzp = new window.Razorpay(options);

       // Handle payment failures
      rzp.on('payment.failed', function (response: any){
            console.error("Razorpay Payment Failed:", response.error);
             toast({
                title: "Payment Failed",
                description: `Code: ${response.error.code}, Description: ${response.error.description}`,
                variant: "destructive",
             });
            setIsPaying(false);
            setIsSubmitting(false);
      });


      rzp.open(); // Open Razorpay Checkout

    } catch (error) {
      console.error('Payment Initiation Error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while initiating payment. Please try again.',
        variant: 'destructive',
      });
      setIsPaying(false);
      setIsSubmitting(false);
    }
    // Don't set isSubmitting to false here, handler function will do it
  }

  // Handle modal state change
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when closing
      onClose();
    }
  };

  // Format fee for display (convert paisa to rupees)
  const formattedFee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);

  return (
    <>
      {/* Include Razorpay script - moved to useEffect for better control */}
      {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Participate in: {eventDetails.name}</DialogTitle>
            <DialogDescription>
              Confirm your details and complete the payment of {formattedFee} to participate.
              Date: {eventDetails.date}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            {/* Form submission now triggers payment initiation */}
            <form onSubmit={form.handleSubmit(initiatePayment)} className="grid gap-4 py-4">
              {/* User Information Fields */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} suppressHydrationWarning/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} suppressHydrationWarning/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter 10-digit phone number" {...field} suppressHydrationWarning/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CSE" {...field} suppressHydrationWarning/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="8" placeholder="1-8" {...field} suppressHydrationWarning/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reg. Number</FormLabel>
                      <FormControl>
                        <Input placeholder="USN/Reg No." {...field} suppressHydrationWarning/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Button Section */}
              <div className="border-t pt-4 mt-4 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click below to proceed with the payment of {formattedFee} via Razorpay.
                </p>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting || isPaying} suppressHydrationWarning>
                    Cancel
                  </Button>
                </DialogClose>
                {/* Submit button now triggers payment */}
                <Button type="submit" disabled={isSubmitting || isPaying || !razorpayLoaded} suppressHydrationWarning>
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : !razorpayLoaded ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Gateway...
                     </>
                  ) : (
                    `Proceed to Pay ${formattedFee}`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
