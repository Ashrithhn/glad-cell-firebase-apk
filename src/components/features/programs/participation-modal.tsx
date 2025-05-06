
'use client';

import * as React from 'react';
// Script import for Razorpay is removed as we are switching to Cashfree
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
// Updated import to use Cashfree actions
import { createCashfreeOrderAction, verifyCashfreeAndParticipateAction } from '@/services/payment';
import { useAuth } from '@/hooks/use-auth'; 
import { getUserProfile } from '@/services/events'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 

// Razorpay Key ID is no longer needed
// const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string; // This should be a pre-formatted date string
    fee: number; // Fee in Paisa
  };
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registrationNumber: z.string().min(5, { message: 'Registration number must be valid.' }).max(20),
});

type FormData = z.infer<typeof formSchema>;

// Razorpay global type declaration is removed
// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  // razorpayLoaded state is removed
  // const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);
  const { user, userId, loading: authLoading, authError } = useAuth(); 
  const [isFetchingProfile, setIsFetchingProfile] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: '',
      email: '',
      phone: '',
      branch: '',
      semester: undefined, // Initialize as undefined
      registrationNumber: '',
    },
  });

  React.useEffect(() => {
      const fetchAndPrefillProfile = async () => {
          if (isOpen && userId && !authLoading && !authError) {
              setIsFetchingProfile(true);
              try {
                  const profileResult = await getUserProfile(userId);
                  if (profileResult.success && profileResult.data) {
                      const semesterValue = parseInt(String(profileResult.data.semester), 10);
                      form.reset({
                          name: profileResult.data.name || '',
                          email: profileResult.data.email || '',
                          phone: (profileResult.data as any).phone || '', // Cast to any if phone is not in UserProfileData type
                          branch: profileResult.data.branch || '',
                          semester: isNaN(semesterValue) ? undefined : semesterValue,
                          registrationNumber: profileResult.data.registrationNumber || '',
                      });
                  } else {
                      form.reset({
                          ...form.getValues(), 
                          email: user?.email || '',
                      });
                  }
              } catch (error) {
                   form.reset({
                       ...form.getValues(),
                       email: user?.email || '',
                   });
              } finally {
                  setIsFetchingProfile(false);
              }
          } else if (!isOpen) {
              form.reset(); 
          } else if (authError) {
              form.reset();
          }
      };
      fetchAndPrefillProfile();
  }, [isOpen, userId, user, authLoading, form, authError]);


  // Razorpay script loading logic is removed. Cashfree redirects to their page.
  // React.useEffect(() => {
  //   if (isOpen && !authError) {
  //     loadRazorpay();
  //   }
  //    return () => { ... };
  // }, [isOpen, authError]);


  async function initiatePayment(values: FormData) {
     if (authError) {
         toast({ title: "Error", description: "Cannot proceed due to configuration error.", variant: "destructive" });
         return;
     }
     if (!userId) {
         toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
         return;
     }
    // Check for Cashfree App ID and Secret Key (typically done on server, but a client check can be added if they are NEXT_PUBLIC_)
    // For now, assuming server-side validation handles missing Cashfree credentials.

    setIsPaying(true);
    setIsSubmitting(true);

    try {
      // 1. Create Cashfree Order/Link
      const orderResult = await createCashfreeOrderAction({
        orderId: `GLADCELL_${eventDetails.id}_${userId}_${Date.now()}`, // Unique order ID
        orderAmount: eventDetails.fee / 100, // Cashfree expects amount in base currency units (Rupees)
        customerName: values.name,
        customerEmail: values.email,
        customerPhone: values.phone,
      });

      if (!orderResult.success || !orderResult.paymentLink) {
        throw new Error(orderResult.message || 'Failed to create payment order with Cashfree.');
      }

      // 2. Redirect to Cashfree payment page
      // Cashfree typically involves redirecting the user to their payment page.
      // The verification would happen on a return URL.
      if (typeof window !== 'undefined') {
        window.location.href = orderResult.paymentLink;
      } else {
        // This case should ideally not happen if the action is client-side.
        // If it does, it indicates a problem with the environment.
        toast({title: "Redirection Error", description: "Could not redirect to payment page.", variant: "destructive"});
        setIsPaying(false);
        setIsSubmitting(false);
      }

      // Note: The actual participation recording will happen after successful payment callback
      // from Cashfree, which will hit a server-side endpoint using verifyCashfreeAndParticipateAction.
      // The current modal flow won't directly call verifyPaymentAndParticipateAction.
      // That action is for the webhook/return URL handler from Cashfree.

    } catch (error) {
      console.error('Cashfree Payment Initiation Error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Could not initiate payment with Cashfree.',
        variant: 'destructive',
      });
      setIsPaying(false);
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(); 
      onClose(); 
    }
  };

  const formattedFee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);

  const isDisabled = authLoading || isFetchingProfile || isSubmitting || isPaying || !!authError;
  // isPaymentDisabled check simplified, as Cashfree SDK loading is not managed here.
  const isPaymentDisabled = isDisabled;

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
                             <Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} suppressHydrationWarning/>
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
                  Click below to proceed with the payment of {formattedFee} via Cashfree.
                </p>
                 {authError && <p className="text-sm text-destructive italic">Payment disabled due to configuration error.</p>}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPaying} suppressHydrationWarning>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPaymentDisabled} suppressHydrationWarning>
                  {isPaying || isSubmitting ? ( // Simplified loading state for Cashfree
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </>
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
