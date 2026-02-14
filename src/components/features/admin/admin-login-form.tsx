
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Define the validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormData = z.infer<typeof formSchema>;

export function AdminLoginForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const { login, authError } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('[Admin Login Form] Submitting credentials for:', values.email);
    try {
       if (authError) {
          throw new Error(`Cannot log in due to Supabase configuration error: ${authError.message}`);
      }
      const result = await loginUser(values);

      if (result.success && result.session?.user) {
        await login(result.session); // Update the auth context
        
        // The useAuth hook will fetch the user profile. If the role is Admin/Super Admin,
        // the redirect logic in `app/admin/login/page.tsx` will handle moving to the dashboard.
        // We can add a toast as a fallback.
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your dashboard...',
        });
        
        // The redirection is handled by useEffect in the login page based on the `isAdmin` state.
        // We don't need to push the router here.
      } else {
        throw new Error(result.message || 'Invalid credentials or non-admin account.');
      }
    } catch (error) {
      console.error('[Admin Login Form] Login Error:', error);
      toast({
        title: 'Admin Login Failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your admin email" {...field} suppressHydrationWarning />
              </FormControl>
              <FormDescription>(Admins use the same login form as users but on this dedicated page.)</FormDescription>
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
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...field}
                    suppressHydrationWarning
                    className="pr-10"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full animated-border-button" disabled={isDisabled} suppressHydrationWarning>
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
