'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { initiatePayment, verifyPayment } from '@/services/razorpay'; // Assuming verifyPayment exists
import { Loader2 } from 'lucide-react';

// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  department: z.string().min(1, { message: 'Department is required.' }),
  interests: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Define Razorpay options interface (adjust based on actual Razorpay script needs)
declare global {
  interface Window {
    Razorpay: any; // Use 'any' for simplicity, or define a more specific type if needed
  }
}

const REGISTRATION_FEE = 100; // Example fee in Rupees

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      interests: '',
    },
  });

  async function onSubmit(values: FormData) {
    if (!razorpayLoaded) {
      toast({
        title: "Payment Error",
        description: "Razorpay script not loaded yet. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Registration Data:', values);

    try {
      // Step 1: Initiate payment on your backend (or directly if secure)
      // This would typically involve creating an order_id with Razorpay API
      // For this prototype, we'll simulate it and use the registration ID concept from the service
      const registrationId = `reg_${Date.now()}`; // Simple unique ID for demo
      console.log('Initiating payment for:', registrationId, 'Amount:', REGISTRATION_FEE);

      // Simulate backend call to get Razorpay order details (replace with actual API call)
      // const orderResponse = await fetch('/api/razorpay/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: REGISTRATION_FEE * 100, registrationId }), // Amount in paise
      // });
      // if (!orderResponse.ok) throw new Error('Failed to create Razorpay order.');
      // const orderData = await orderResponse.json();
      // const { order_id, key_id } = orderData;

      // For demo, using placeholders
      const order_id = `order_demo_${Date.now()}`;
      const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'; // Ensure this is set in .env.local

      if (!key_id || key_id === 'rzp_test_YOUR_KEY_ID') {
         console.error("Razorpay Key ID not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.");
         toast({
            title: "Configuration Error",
            description: "Razorpay integration is not configured correctly.",
            variant: "destructive",
         });
         setIsSubmitting(false);
         return;
      }

      console.log('Using Razorpay Key ID:', key_id);
      console.log('Generated Order ID:', order_id);


      // Step 2: Open Razorpay Checkout
      const options = {
        key: key_id,
        amount: REGISTRATION_FEE * 100, // Amount in paise
        currency: 'INR',
        name: 'IdeaSpark Registration',
        description: `Fee for ${values.name}`,
        order_id: order_id, // Use the order ID from your backend
        handler: async function (response: any) {
          console.log('Razorpay Response:', response);
          try {
            // Step 3: Verify payment on your backend
            // Send response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature to your server
            // For demo, use the service directly
            const verification = await verifyPayment(response.razorpay_payment_id);
            console.log('Payment Verification:', verification);

            if (verification.status === 'success') {
              toast({
                title: 'Registration Successful!',
                description: 'Your payment was successful and you are registered.',
                variant: 'default', // Use default (or create a success variant)
                className: 'bg-accent text-accent-foreground', // Apply green accent style
              });
              form.reset(); // Clear the form
              // Potentially redirect user or update UI state
              // router.push('/dashboard');
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (verificationError) {
            console.error('Payment Verification Error:', verificationError);
            toast({
              title: 'Payment Verification Failed',
              description:
                'We could not confirm your payment. Please contact support if the amount was deducted.',
              variant: 'destructive',
            });
          } finally {
             setIsSubmitting(false);
          }
        },
        prefill: {
          name: values.name,
          email: values.email,
          // contact: '9999999999' // Optional contact number
        },
        notes: {
          registrationId: registrationId, // Pass registration ID or other data
          department: values.department,
        },
        theme: {
          color: '#007BFF', // College Blue
        },
        modal: {
            ondismiss: function() {
                console.log('Razorpay modal dismissed');
                setIsSubmitting(false); // Re-enable button if modal is closed without payment
                toast({
                    title: 'Payment Cancelled',
                    description: 'The registration process was cancelled.',
                    variant: 'default',
                });
            }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed:', response.error);
        toast({
          title: 'Payment Failed',
          description: `Error: ${response.error.description}. Please try again or contact support.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Registration/Payment Error:', error);
      toast({
        title: 'Registration Failed',
        description:
          'An unexpected error occurred during registration or payment initiation. Please try again later.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  return (
    <>
     <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          console.log('Razorpay script loaded.');
          setRazorpayLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Razorpay script:', e);
          toast({
             title: "Error Loading Payment Gateway",
             description: "Could not load Razorpay. Please check your connection or try refreshing.",
             variant: "destructive",
          });
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                  <Input type="email" placeholder="Enter your college email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Computer Science, Mechanical Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idea Interests (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about areas you're interested in (e.g., AI, Sustainability, EdTech)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Helps us recommend relevant ideas and collaborators.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="text-center text-lg font-semibold text-primary">
            Registration Fee: ₹{REGISTRATION_FEE}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !razorpayLoaded}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
               `Register and Pay ₹${REGISTRATION_FEE}`
            )}
          </Button>
           {!razorpayLoaded && !isSubmitting && (
             <p className="text-sm text-muted-foreground text-center mt-2">Loading payment gateway...</p>
          )}
        </form>
      </Form>
    </>
  );
}
