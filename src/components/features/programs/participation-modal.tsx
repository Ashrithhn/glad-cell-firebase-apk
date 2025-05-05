
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
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { createRazorpayOrderAction, verifyPaymentAndParticipateAction } from '@/services/payment';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { getUserProfile } from '@/services/events'; // Or from a dedicated user service
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

// Define environment variable for Razorpay Key ID
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string;
    fee: number;
  };
}

// Schema remains the same
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registrationNumber: z.string().min(5, { message: 'Registration number must be valid.' }).max(20),
});

type FormData = z.infer<typeof formSchema>;

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);
  const { user, userId, loading: authLoading, authError } = useAuth(); // Get user ID and authError from auth context
  const [isFetchingProfile, setIsFetchingProfile] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set initial empty values
      name: '',
      email: '',
      phone: '',
      branch: '',
      semester: '' as any,
      registrationNumber: '',
    },
  });

  // Effect to prefill form with user data when modal opens and user is logged in
  React.useEffect(() => {
      const fetchAndPrefillProfile = async () => {
          // Ensure prefill only happens if auth is working
          if (isOpen && userId && !authLoading && !authError) {
              setIsFetchingProfile(true);
              console.log('Fetching profile for prefill:', userId);
              try {
                  const profileResult = await getUserProfile(userId);
                  if (profileResult.success && profileResult.data) {
                      console.log('Prefilling form with profile:', profileResult.data);
                      // Ensure semester is treated as a number for the form state
                      const semesterValue = parseInt(String(profileResult.data.semester), 10); // Ensure string conversion before parseInt
                      form.reset({
                          name: profileResult.data.name || '',
                          email: profileResult.data.email || '',
                          phone: profileResult.data.phone || '', // Assuming phone is stored
                          branch: profileResult.data.branch || '',
                          semester: isNaN(semesterValue) ? '' : semesterValue, // Handle potential NaN
                          registrationNumber: profileResult.data.registrationNumber || '',
                      });
                  } else {
                      // Fallback to email from auth if profile fetch fails
                      form.reset({
                          ...form.getValues(), // Keep existing values if any
                          email: user?.email || '',
                      });
                      console.warn('Failed to fetch full profile, prefilling email only.');
                  }
              } catch (error) {
                  console.error('Error fetching profile for prefill:', error);
                  // Fallback to email from auth on error
                   form.reset({
                       ...form.getValues(),
                       email: user?.email || '',
                   });
              } finally {
                  setIsFetchingProfile(false);
              }
          } else if (!isOpen) {
              form.reset(); // Reset form when modal closes
          } else if (authError) {
              // Optionally reset or clear form if there's an auth error on open
              form.reset();
          }
      };
      fetchAndPrefillProfile();
  }, [isOpen, userId, user, authLoading, form, authError]); // Add authError dependency


  // Load Razorpay script
  const loadRazorpay = () => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        setRazorpayLoaded(true); // Already loaded
        return;
    }
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
        setIsPaying(false); // Also reset paying state if load fails
        setIsSubmitting(false); // Reset submitting state
    };
    document.body.appendChild(script);
  };

   React.useEffect(() => {
    // Load Razorpay only if modal is open and there's no auth error
    if (isOpen && !authError) {
      loadRazorpay();
    }
     // Cleanup function to remove script if component unmounts
     return () => {
       const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
       if (script && script.parentNode) {
         // Check parentNode before removal
         script.parentNode.removeChild(script);
         setRazorpayLoaded(false); // Reset loaded state on cleanup
       }
     };
  }, [isOpen, authError]); // Add authError dependency


  async function initiatePayment(values: FormData) {
     // Prevent initiation if auth error, not logged in, or payment keys missing
     if (authError) {
         toast({ title: "Error", description: "Cannot proceed due to configuration error.", variant: "destructive" });
         return;
     }
     if (!userId) {
         toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
         return;
     }
     if (!razorpayKeyId) {
       console.error("Razorpay Key ID is not configured.");
       toast({ title: "Configuration Error", description: "Payment gateway not set up.", variant: "destructive" });
       return;
     }
     if (!razorpayLoaded || typeof window === 'undefined' || !window.Razorpay) {
         console.error("Razorpay SDK not loaded yet.");
         toast({ title: "Payment Initializing", description: "Payment gateway is loading. Please wait and try again.", variant: "default" });
         if (!razorpayLoaded) loadRazorpay(); // Attempt to load again if not loaded
         return;
     }

    setIsPaying(true);
    setIsSubmitting(true);

    try {
      // 1. Create Razorpay Order
      const orderResult = await createRazorpayOrderAction({
        amount: eventDetails.fee,
        currency: 'INR',
        receipt: `receipt_${eventDetails.id}_${userId}_${Date.now()}` // More specific receipt
      });

      if (!orderResult.success || !orderResult.orderId) {
        throw new Error(orderResult.message || 'Failed to create payment order.');
      }

      // 2. Configure Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: `Participation: ${eventDetails.name}`,
        description: `Fee for ${eventDetails.name}`,
        order_id: orderResult.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment and Record Participation
          try {
            const verifyResult = await verifyPaymentAndParticipateAction({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: userId, // Pass the logged-in user's ID
              eventId: eventDetails.id,
              eventName: eventDetails.name,
              ...values, // Include validated participant details from the form
            });

            if (verifyResult.success) {
              toast({
                title: 'Participation Recorded!',
                description: `You are now registered for ${eventDetails.name}.`,
                variant: 'default',
                className: 'bg-accent text-accent-foreground',
              });
              form.reset();
              onClose();
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
              // Reset states regardless of verification outcome
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
          userId: userId, // Add userId to notes
          eventId: eventDetails.id,
          registrationNumber: values.registrationNumber,
          branch: values.branch,
          semester: values.semester.toString(),
        },
        theme: {
          color: '#2563EB', // Example blue color - match your primary theme color
        },
        modal: {
            ondismiss: function() {
                console.log('Razorpay checkout closed');
                // Only reset states if payment wasn't already handled by success/fail handler
                if(isPaying) {
                    setIsPaying(false);
                    setIsSubmitting(false);
                    toast({
                        title: "Payment Cancelled",
                        description: "You closed the payment window before completing the transaction.",
                        variant: "default",
                    });
                }
            }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any){
            console.error("Razorpay Payment Failed:", response.error);
             toast({
                title: "Payment Failed",
                description: `Code: ${response.error?.code || 'N/A'}, Description: ${response.error?.description || 'Unknown Razorpay error'}`,
                variant: "destructive",
             });
            // Reset states on failure
            setIsPaying(false);
            setIsSubmitting(false);
      });

      rzp.open(); // Open Razorpay checkout

    } catch (error) {
      console.error('Payment Initiation Error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Could not initiate payment.',
        variant: 'destructive',
      });
      // Reset states on initiation error
      setIsPaying(false);
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when dialog closes
      onClose(); // Call original onClose
    }
  };

  const formattedFee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);

  // Disable form/button if auth is loading, profile is fetching, payment is processing, or there's an auth error
  const isDisabled = authLoading || isFetchingProfile || isSubmitting || isPaying || !!authError;
  const isPaymentDisabled = isDisabled || !razorpayLoaded; // Payment specifically needs Razorpay loaded

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Participate in: {eventDetails.name}</DialogTitle>
            <DialogDescription>
              Confirm your details and complete the payment of {formattedFee} to participate.
              Date: {eventDetails.date}
            </DialogDescription>
            {isFetchingProfile && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Loading profile...</p>}
          </DialogHeader>

          {authError && (
             <Alert variant="destructive" className="my-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>
                     {authError.message}. Participation is currently unavailable.
                 </AlertDescription>
             </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(initiatePayment)} className="grid gap-4 py-4">
              {/* Wrap fields in fieldset for easy disabling */}
              <fieldset disabled={isDisabled} className="grid gap-4">
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
                             {/* Corrected value and onChange */}
                             <Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || '')} suppressHydrationWarning/>
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
               </fieldset>

              <div className="border-t pt-4 mt-4 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click below to proceed with the payment of {formattedFee} via Razorpay.
                </p>
                 {authError && <p className="text-sm text-destructive italic">Payment disabled due to configuration error.</p>}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  {/* Disable cancel button only during active payment processing */}
                  <Button type="button" variant="outline" disabled={isPaying} suppressHydrationWarning>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPaymentDisabled} suppressHydrationWarning>
                  {isPaying ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </>
                  ) : !razorpayLoaded && !authError ? ( // Show loading only if no auth error
                     <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Gateway... </>
                  ) : isFetchingProfile ? (
                      <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Profile... </>
                  ): (
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
