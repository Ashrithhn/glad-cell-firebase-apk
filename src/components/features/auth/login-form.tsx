
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
import { loginUser } from '@/services/auth'; // Placeholder service
import { useRouter } from 'next/navigation';

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Basic check for login
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    // console.log('Login Data:', values);

    try {
      // Placeholder: Call a service to login the user
      const result = await loginUser(values);
      // console.log('Login Result:', result);

      if (result.success) {
        // Simulate setting authentication state (using localStorage for demo)
        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            // Optionally trigger a custom event or use a state management library
            // to notify other components (like the Header) about the state change.
             window.dispatchEvent(new Event('authChange'));
        }

        toast({
          title: 'Login Successful!',
          description: 'Welcome back!',
          variant: 'default',
        });

        // Redirect to home page after successful login
        router.push('/'); // Redirect to the main home page
        router.refresh(); // Force refresh to potentially update header state if needed
      } else {
        throw new Error(result.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
       // Clear the flag if login fails, just in case
       if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          window.dispatchEvent(new Event('authChange'));
       }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full" disabled={isSubmitting} suppressHydrationWarning>
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
