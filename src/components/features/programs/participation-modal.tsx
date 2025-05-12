
'use client';

import * as React from 'react';
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
<<<<<<< HEAD
import { Loader2, CreditCard, AlertCircle, Send } from 'lucide-react';
import { createCashfreeOrderAction, registerFreeParticipationAction } from '@/services/payment'; 
import { useAuth } from '@/hooks/use-auth'; 
import { getUserProfile, getEventById } from '@/services/events'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 
import type { UserProfileSupabase } from '@/services/auth';
import type { EventData } from '@/services/events';
import { supabase as supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
=======
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
// Updated import to use Cashfree actions
import { createCashfreeOrderAction, verifyCashfreePaymentAndParticipateAction } from '@/services/payment';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { getUserProfile } from '@/services/events'; // Or from a dedicated user service
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

// Define environment variable for Cashfree Key ID (if needed client-side for SDKs, otherwise server handles it)
// const cashfreeKeyId = process.env.NEXT_PUBLIC_CASHFREE_KEY_ID; // Example if client-side SDK was used
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string; 
    fee: number; // Fee in Paisa
  };
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registration_number: z.string().min(5, { message: 'Registration number must be valid.' }).max(20),
});

type FormData = z.infer<typeof formSchema>;

<<<<<<< HEAD
export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user, userId, loading: authLoading, authError } = useAuth(); 
=======
// Note: Cashfree integration is primarily server-to-server for creating payment links.
// No direct Cashfree SDK usage on client-side for this flow means no global Window.Cashfree.

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPaying, setIsPaying] = React.useState(false);
  const [paymentLinkLoading, setPaymentLinkLoading] = React.useState(false); // State for loading payment link

  const { user, userId, loading: authLoading, authError } = useAuth();
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
  const [isFetchingProfile, setIsFetchingProfile] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
<<<<<<< HEAD
    defaultValues: { 
=======
    defaultValues: {
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
      name: '',
      email: '',
      phone: '',
      branch: '',
      semester: undefined, 
      registration_number: '',
    },
  });

  React.useEffect(() => {
      const fetchAndPrefillProfile = async () => {
<<<<<<< HEAD
          if (isOpen && userId && !authLoading && !authError && supabaseClient) { 
=======
          if (isOpen && userId && !authLoading && !authError) {
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
              setIsFetchingProfile(true);
              try {
                  const profileResult = await getUserProfile(userId); 
                  if (profileResult.success && profileResult.data) {
<<<<<<< HEAD
                      const profile: UserProfileSupabase = profileResult.data;
                      const semesterValue = parseInt(String(profile.semester), 10);
                      form.reset({
                          name: profile.name || '',
                          email: profile.email || '',
                          phone: (profile as any).phone || '', 
                          branch: profile.branch || '',
                          semester: isNaN(semesterValue) ? undefined : semesterValue,
                          registration_number: profile.registration_number || '',
                      });
                  } else { 
                      form.reset({ ...form.getValues(), email: user?.email || '', name: user?.user_metadata?.full_name || '', });
                  }
              } catch (error) { 
                   form.reset({ ...form.getValues(), email: user?.email || '', name: user?.user_metadata?.full_name || '', });
=======
                      const semesterValue = parseInt(String(profileResult.data.semester), 10);
                      form.reset({
                          name: profileResult.data.name || '',
                          email: profileResult.data.email || '',
                          phone: (profileResult.data as any)?.phone || '',
                          branch: profileResult.data.branch || '',
                          semester: isNaN(semesterValue) ? ('' as any) : semesterValue,
                          registrationNumber: profileResult.data.registrationNumber || '',
                      });
                  } else {
                      form.reset({
                          ...form.getValues(),
                          email: user?.email || '',
                      });
                  }
              } catch (error) {
                  console.error('Error fetching profile for prefill:', error);
                   form.reset({
                       ...form.getValues(),
                       email: user?.email || '',
                   });
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
              } finally {
                  setIsFetchingProfile(false);
              }
          } else if (!isOpen) {
<<<<<<< HEAD
              form.reset(); 
          } else if (authError || !supabaseClient) {
              form.reset(); 
          }
      };
      fetchAndPrefillProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, user, authLoading, authError]); 

  async function handleSubmit(values: FormData) {
     if (authError || !supabaseClient) {
         toast({ title: "Error", description: `Cannot proceed: ${authError?.message || 'Supabase client not available'}.`, variant: "destructive" });
=======
              form.reset();
          } else if (authError) {
              form.reset();
          }
      };
      fetchAndPrefillProfile();
  }, [isOpen, userId, user, authLoading, form, authError]);


  async function initiatePayment(values: FormData) {
     if (authError) {
         toast({ title: "Error", description: "Cannot proceed due to configuration error.", variant: "destructive" });
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
         return;
     }
     if (!userId) {
         toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
         return;
     }
<<<<<<< HEAD

    setIsSubmitting(true);
    const appOrderId = `GLAD_${eventDetails.id.slice(0,10)}_${userId.slice(0,10)}_${Date.now()}`.slice(0, 45);

    try {
      if (eventDetails.fee === 0) {
        // Handle free event registration
        const eventResult = await getEventById(eventDetails.id);
        if (!eventResult.success || !eventResult.event) {
            throw new Error("Could not fetch event details for free registration.");
        }

        const result = await registerFreeParticipationAction({
            appOrderId,
            eventId: eventDetails.id,
            userId,
            userName: values.name,
            userEmail: values.email,
            userPhone: values.phone,
            userBranch: values.branch,
            userSemester: values.semester,
            userRegistrationNumber: values.registration_number,
            eventName: eventResult.event.name,
        });

        if (result.success) {
            toast({ title: "Registration Successful!", description: result.message || "You are now registered for this free event." });
            onClose();
            router.push('/profile'); // Redirect to profile to see ticket
        } else {
            throw new Error(result.message || "Failed to register for free event.");
        }

      } else {
        // Handle paid event registration (Cashfree)
        const orderResult = await createCashfreeOrderAction({
          orderId: appOrderId, 
          orderAmount: eventDetails.fee / 100, 
          customerName: values.name,
          customerEmail: values.email,
          customerPhone: values.phone,
          eventId: eventDetails.id, 
          userId: userId, 
        });

        if (!orderResult.success || !orderResult.paymentLink) {
          throw new Error(orderResult.message || 'Failed to create payment order with Cashfree.');
        }
        
        if (typeof window !== 'undefined') {
          window.location.href = orderResult.paymentLink; 
        } else {
          toast({title: "Redirection Error", description: "Could not redirect to payment page.", variant: "destructive"});
          setIsSubmitting(false);
        }
      }

    } catch (error) {
      toast({ title: 'Registration Failed', description: error instanceof Error ? error.message : 'Could not complete registration.', variant: 'destructive' });
=======
    
    setPaymentLinkLoading(true);
    setIsPaying(true); // General paying state
    setIsSubmitting(true); // Also set submitting to disable form fields

    try {
      // 1. Create Cashfree Order and get payment link
      const orderResult = await createCashfreeOrderAction({
        amount: eventDetails.fee / 100, // Convert Paisa to Rupees for Cashfree
        currency: 'INR',
        receipt: `event_${eventDetails.id}_user_${userId}`, // Unique receipt
        customer_id: userId,
        customer_email: values.email,
        customer_phone: values.phone,
        customer_name: values.name,
        eventId: eventDetails.id,
        // Include other participant details to pass to webhook or for record-keeping
        // These will be available in `order_tags` or `order_notes` in Cashfree if needed
        // eventName: eventDetails.name, // Not typically needed for order creation itself
        // branch: values.branch,
        // semester: values.semester,
        // registrationNumber: values.registrationNumber
      });

      setPaymentLinkLoading(false);

      if (!orderResult.success || !orderResult.paymentLink) {
        throw new Error(orderResult.message || 'Failed to create payment order with Cashfree.');
      }

      // 2. Redirect to Cashfree payment page
      // The Cashfree payment page will handle the actual payment.
      // After payment, Cashfree redirects to your specified return_url.
      // The verification happens on the server-side via webhook or return URL handler.
      console.log('Redirecting to Cashfree payment page:', orderResult.paymentLink);
      window.location.href = orderResult.paymentLink;
      
      // The modal will close implicitly due to page redirect.
      // Further actions (like calling verifyPaymentAndParticipateAction)
      // will be handled by the Cashfree webhook/return URL handler.
      // This client-side function's role is done after redirection.

    } catch (error) {
      console.error('Payment Initiation Error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Could not initiate payment.',
        variant: 'destructive',
      });
      setPaymentLinkLoading(false);
      setIsPaying(false);
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
      setIsSubmitting(false);
    }
    // setIsSubmitting(false) is handled by redirection or in catch block
  }

<<<<<<< HEAD
  const handleOpenChange = (open: boolean) => { if (!open) { form.reset(); onClose(); } };
  const formattedFee = eventDetails.fee === 0 ? "Free" : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);
  const isDisabled = authLoading || isFetchingProfile || isSubmitting || !!authError || !supabaseClient;
=======
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };

  const formattedFee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);
  const isDisabled = authLoading || isFetchingProfile || isSubmitting || isPaying || paymentLinkLoading || !!authError;
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Participate in: {eventDetails.name}</DialogTitle>
            <DialogDescription>
              Confirm details. Event Date: {eventDetails.date}. Fee: {formattedFee}
            </DialogDescription>
            {isFetchingProfile && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Loading profile...</p>}
          </DialogHeader>

          {(authError || !supabaseClient) && (
             <Alert variant="destructive" className="my-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>{authError?.message || 'Supabase client not available.'} Participation unavailable.</AlertDescription>
             </Alert>
          )}

          <Form {...form}>
<<<<<<< HEAD
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
              <fieldset disabled={isDisabled} className="grid gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="Enter your email" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Enter 10-digit phone number" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="branch" render={({ field }) => (<FormItem><FormLabel>Branch</FormLabel><FormControl><Input placeholder="e.g., CSE" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="registration_number" render={({ field }) => (<FormItem><FormLabel>Reg. Number</FormLabel><FormControl><Input placeholder="USN/Reg No." {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
=======
            <form onSubmit={form.handleSubmit(initiatePayment)} className="grid gap-4 py-4">
              <fieldset disabled={isDisabled} className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} suppressHydrationWarning value={field.value ?? ''} />
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
                          <Input type="email" placeholder="Enter your email" {...field} suppressHydrationWarning value={field.value ?? ''}/>
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
                          <Input type="tel" placeholder="Enter 10-digit phone number" {...field} suppressHydrationWarning value={field.value ?? ''}/>
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
                            <Input placeholder="e.g., CSE" {...field} suppressHydrationWarning value={field.value ?? ''}/>
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
                             <Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} suppressHydrationWarning/>
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
                            <Input placeholder="USN/Reg No." {...field} suppressHydrationWarning value={field.value ?? ''}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
                  </div>
               </fieldset>
              <div className="border-t pt-4 mt-4 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    {eventDetails.fee > 0 ? <CreditCard className="h-5 w-5 text-primary" /> : <Send className="h-5 w-5 text-primary" />}
                    {eventDetails.fee > 0 ? "Payment" : "Confirmation"}
                </h3>
                <p className="text-sm text-muted-foreground">
<<<<<<< HEAD
                    {eventDetails.fee > 0 ? `Click below to proceed with ${formattedFee} via Cashfree.` : "Click below to confirm your free registration."}
=======
                  Click below to proceed with the payment of {formattedFee} via Cashfree.
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
                </p>
                {(authError || !supabaseClient) && <p className="text-sm text-destructive italic">Action disabled due to configuration error.</p>}
              </div>
              <DialogFooter>
<<<<<<< HEAD
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting} suppressHydrationWarning>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isDisabled} suppressHydrationWarning>
                  {isSubmitting ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </> : 
                   isFetchingProfile ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Profile... </> : 
                   eventDetails.fee > 0 ? `Proceed to Pay ${formattedFee}` : 'Confirm Free Registration'}
=======
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPaying || paymentLinkLoading} suppressHydrationWarning>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isDisabled} suppressHydrationWarning>
                  {paymentLinkLoading ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Payment Link... </>
                  ) : isPaying ? (
                     <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to Payment... </>
                  ) : isFetchingProfile ? (
                      <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Profile... </>
                  ): (
                    `Proceed to Pay ${formattedFee}`
                  )}
>>>>>>> c3d62c5 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
