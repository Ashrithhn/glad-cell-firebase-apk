
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
import { loginUser } from '@/services/auth'; // Supabase loginUser
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { login, authError } = useAuth(); // Use the login function and authError from Supabase context

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    try {
      if (authError) { // Check for Supabase client initialization errors
          throw new Error(`Cannot log in due to Supabase configuration error: ${authError.message}`);
      }

      const result = await loginUser(values); // Call the Supabase backend service

      if (result.success && result.userId && result.session) {
        await login(result.session); // Use the login function from useAuth hook with Supabase session

        toast({
          title: 'Login Successful!',
          description: 'Welcome back!',
          variant: 'default',
        });

        router.push('/'); // Redirect to home page
        router.refresh(); // Refresh to update header, etc.
      } else {
        // Display the specific message from the service layer (e.g., "Email not confirmed" or "Invalid email or password")
        toast({
          title: 'Login Failed',
          description: result.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Supabase Login Error:', error);
      toast({
        title: 'Login Failed',
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} suppressHydrationWarning/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <Button type="submit" className="w-full" disabled={isDisabled} suppressHydrationWarning>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </Form>
  );
}
