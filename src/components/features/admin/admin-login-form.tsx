
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
import { loginAdmin } from '@/services/auth'; // Placeholder service
import { useRouter } from 'next/navigation';
// No need for useAuth here as admin login is separate for now

// Define the validation schema using Zod
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormData = z.infer<typeof formSchema>;

export function AdminLoginForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    // console.log('Admin Login Data:', values);

    try {
      const result = await loginAdmin(values); // Still uses the placeholder service
      // console.log('Admin Login Result:', result);

      if (result.success) {
         // Simulate setting admin authentication state (using localStorage for demo)
         // IMPORTANT: This is NOT secure for production. Use Firebase Custom Claims.
        if (typeof window !== 'undefined') {
            localStorage.setItem('isAdminLoggedIn', 'true');
             // Trigger authChange event to update global state (via useAuth hook listener)
             window.dispatchEvent(new Event('authChange'));
        }

        toast({
          title: 'Admin Login Successful!',
          description: 'Redirecting to dashboard...',
          variant: 'default',
        });
        router.push('/admin/dashboard'); // Redirect to admin dashboard
        router.refresh(); // Refresh layout
      } else {
        throw new Error(result.message || 'Invalid admin credentials.');
      }
    } catch (error) {
      console.error('Admin Login Error:', error);
      toast({
        title: 'Admin Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
       // Clear the flag if login fails
       if (typeof window !== 'undefined') {
          localStorage.removeItem('isAdminLoggedIn');
          window.dispatchEvent(new Event('authChange')); // Notify of state change
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin username" {...field} suppressHydrationWarning />
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
                <Input type="password" placeholder="Enter admin password" {...field} suppressHydrationWarning/>
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
            'Login as Admin'
          )}
        </Button>
      </form>
    </Form>
  );
}
