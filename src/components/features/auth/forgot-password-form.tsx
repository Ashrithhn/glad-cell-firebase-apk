
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
import { Loader2, Mail } from 'lucide-react';
import { sendPasswordReset } from '@/services/auth'; // Supabase server action
import { useAuth } from '@/hooks/use-auth'; // To check for Supabase client initialization errors

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormData = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { authError } = useAuth(); // To check for Supabase client initialization errors

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    try {
      if (authError) { // Check for Supabase client initialization errors
        throw new Error(`Cannot proceed: ${authError.message}`);
      }
      const result = await sendPasswordReset(values.email); // Calls Supabase service

      if (result.success) {
        toast({
          title: 'Check Your Email',
          description: result.message || 'If an account with that email exists, a password reset link has been sent.',
          variant: 'default',
        });
        form.reset(); // Clear the form
      } else {
        throw new Error(result.message || 'Failed to send password reset email.');
      }
    } catch (error) {
      console.error('Supabase Forgot Password Error:', error);
      toast({
        title: 'Error',
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your registered email" {...field} className="pl-10" suppressHydrationWarning/>
                  </div>
                </FormControl>
                <FormDescription>(Enter the email you used to register.)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <Button type="submit" className="w-full" disabled={isDisabled} suppressHydrationWarning>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </Form>
  );
}
