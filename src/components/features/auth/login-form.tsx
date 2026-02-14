
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
  const [showPassword, setShowPassword] = React.useState(false);
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
        
        router.replace('/'); 
      } else {
        throw new Error(result.message || 'Invalid email or password.');
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
                <FormDescription>(Please use a valid email address.)</FormDescription>
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
        </fieldset>
        <Button type="submit" className="w-full animated-border-button" disabled={isDisabled} suppressHydrationWarning>
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
