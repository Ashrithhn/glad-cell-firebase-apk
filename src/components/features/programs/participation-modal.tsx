
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
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { createCashfreeOrderAction } from '@/services/payment'; 
import { useAuth } from '@/hooks/use-auth'; 
import { getUserProfile } from '@/services/events'; // Uses Supabase
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 
import type { UserProfileSupabase } from '@/services/auth'; // Supabase profile type

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string; // This might be start_date
    fee: number; // Fee in Paisa
  };
}

// Zod schema using Supabase field names (snake_case for registrationNumber)
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registration_number: z.string().min(5, { message: 'Registration number must be valid.' }).max(20), // snake_case
});

type FormData = z.infer<typeof formSchema>;

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user, userId, loading: authLoading, authError } = useAuth(); 
  const [isFetchingProfile, setIsFetchingProfile] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
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
          if (isOpen && userId && !authLoading && !authError && supabase) { // Check supabase client
              setIsFetchingProfile(true);
              try {
                  const profileResult = await getUserProfile(userId); // Fetches from Supabase
                  if (profileResult.success && profileResult.data) {
                      const profile: UserProfileSupabase = profileResult.data;
                      const semesterValue = parseInt(String(profile.semester), 10);
                      form.reset({
                          name: profile.name || '',
                          email: profile.email || '',
                          phone: (profile as any).phone || '', // Assuming phone is available
                          branch: profile.branch || '',
                          semester: isNaN(semesterValue) ? undefined : semesterValue,
                          registration_number: profile.registration_number || '',
                      });
                  } else { 
                      form.reset({ ...form.getValues(), email: user?.email || '', name: user?.user_metadata?.full_name || '', });
                  }
              } catch (error) { 
                   form.reset({ ...form.getValues(), email: user?.email || '', name: user?.user_metadata?.full_name || '', });
              } finally {
                  setIsFetchingProfile(false);
              }
          } else if (!isOpen) {
              form.reset(); 
          } else if (authError || !supabase) {
              form.reset(); 
          }
      };
      fetchAndPrefillProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, user, authLoading, authError]); 

  async function initiatePayment(values: FormData) {
     if (authError || !supabase) {
         toast({ title: "Error", description: `Cannot proceed: ${authError?.message || 'Supabase client not available'}.`, variant: "destructive" });
         return;
     }
     if (!userId) {
         toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
         return;
     }

    setIsSubmitting(true);
    const appOrderId = `GLAD_${eventDetails.id.slice(0,10)}_${userId.slice(0,10)}_${Date.now()}`.slice(0, 45);

    try {
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

    } catch (error) {
      toast({ title: 'Payment Failed', description: error instanceof Error ? error.message : 'Could not initiate payment.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (open: boolean) => { if (!open) { form.reset(); onClose(); } };
  const formattedFee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(eventDetails.fee / 100);
  const isDisabled = authLoading || isFetchingProfile || isSubmitting || !!authError || !supabase; // Add !supabase check

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Participate in: {eventDetails.name}</DialogTitle>
            <DialogDescription>Confirm details and complete payment of {formattedFee}. Date: {eventDetails.date}</DialogDescription>
            {isFetchingProfile && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Loading profile...</p>}
          </DialogHeader>

          {(authError || !supabase) && (
             <Alert variant="destructive" className="my-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>{authError?.message || 'Supabase client not available.'} Participation unavailable.</AlertDescription>
             </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(initiatePayment)} className="grid gap-4 py-4">
              <fieldset disabled={isDisabled} className="grid gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="Enter your email" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Enter 10-digit phone number" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="branch" render={({ field }) => (<FormItem><FormLabel>Branch</FormLabel><FormControl><Input placeholder="e.g., CSE" {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="registration_number" render={({ field }) => (<FormItem><FormLabel>Reg. Number</FormLabel><FormControl><Input placeholder="USN/Reg No." {...field} suppressHydrationWarning/></FormControl><FormMessage /></FormItem>)} />
                  </div>
               </fieldset>
              <div className="border-t pt-4 mt-4 space-y-2"><h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment</h3><p className="text-sm text-muted-foreground">Click below to proceed with {formattedFee} via Cashfree.</p>{(authError || !supabase) && <p className="text-sm text-destructive italic">Payment disabled due to configuration error.</p>}</div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting} suppressHydrationWarning>Cancel</Button></DialogClose>
                <Button type="submit" disabled={isDisabled} suppressHydrationWarning>
                  {isSubmitting ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </> : isFetchingProfile ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Profile... </> : `Proceed to Pay ${formattedFee}`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Reference to supabase client to ensure it's bundled if used in useEffect dependencies (though not directly)
const supabase = import('@/lib/supabaseClient').then(m => m.supabase);
