
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Loader2 } from 'lucide-react';
import { registerUser } from '@/services/auth'; // Supabase registerUser
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // For authError

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registrationNumber: z.string().min(5, { message: 'Unique registration number is required and must be valid.' }).max(20),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
    // Removed Gmail specific validation as Supabase handles various email providers
  collegeName: z.string().min(1, { message: 'College name is required.' }).max(150),
  city: z.string().min(1, { message: 'City is required.' }).max(100),
  pincode: z.string().regex(/^\d{6}$/, { message: 'Pincode must be 6 digits.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { authError } = useAuth(); // Use authError from Supabase client

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      branch: '',
      semester: undefined,
      registrationNumber: '',
      email: '',
      collegeName: '',
      city: '',
      pincode: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('[Client] Supabase Registration Data:', values);

    try {
      if (authError) { // Check for Supabase client initialization errors
          throw new Error(`Cannot register: ${authError.message}`);
      }
      const result = await registerUser(values); // Calls Supabase registerUser
      console.log('[Client] Supabase Registration Result:', result);

      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: result.message || 'Your account has been created. Please check your email to verify your account.',
          variant: 'default',
          className: 'bg-accent text-accent-foreground',
        });
        router.push('/login'); // Redirect to login after successful registration
      } else {
        throw new Error(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Supabase Registration Error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !!authError;

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <fieldset disabled={isDisabled} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} suppressHydrationWarning />
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
                        <Input type="email" placeholder="Enter your email address" {...field} suppressHydrationWarning />
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
                      <FormLabel>Unique Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your USN or Reg No." {...field} suppressHydrationWarning />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password (min. 8 chars)" {...field} suppressHydrationWarning />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science" {...field} suppressHydrationWarning />
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
                        <Input type="number" min="1" max="8" placeholder="Enter current semester (1-8)" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} suppressHydrationWarning />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                  control={form.control}
                  name="collegeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your college name" {...field} suppressHydrationWarning />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 6-digit pincode" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>
              </div>
           </fieldset>

          <div className="md:col-span-2 mt-4">
            <Button type="submit" className="w-full" disabled={isDisabled} suppressHydrationWarning>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                 'Register Account'
              )}
            </Button>
          </div>
        </form>
      </Form>
  );
}
