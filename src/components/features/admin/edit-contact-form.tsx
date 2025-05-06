
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { updateContent } from '@/services/content'; // Import the service
import type { ContactInfo } from '@/services/content';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Schema for contact info
const formSchema = z.object({
  address: z.string().min(5, { message: 'Address is required.' }).max(300),
  email: z.string().email({ message: 'Please enter a valid email address.' }).max(100),
  phone: z.string().min(5, {message: 'Phone number is required'}).max(50), // More flexible phone validation
});

type FormData = z.infer<typeof formSchema>;

interface EditContactFormProps {
  currentInfo: ContactInfo;
}

export function EditContactForm({ currentInfo }: EditContactFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: currentInfo?.address || '',
      email: currentInfo?.email || '',
      phone: currentInfo?.phone || '',
    },
  });

  // Update default values if currentInfo changes
  React.useEffect(() => {
    form.reset({
      address: currentInfo?.address || '',
      email: currentInfo?.email || '',
      phone: currentInfo?.phone || '',
    });
  }, [currentInfo, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to update content.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      // The data structure matches ContactInfo, so we can pass values directly
      const result = await updateContent('contact', values);

      if (result.success) {
        toast({
          title: 'Contact Info Updated!',
          description: 'The contact details have been saved.',
          variant: 'default',
        });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update contact info.');
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the full address..." {...field} rows={4} />
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
                 <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4"/> Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter contact email" {...field} />
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
                <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4"/> Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact phone number" {...field} />
                </FormControl>
                 <FormDescription>Include country code if applicable.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Info...
              </>
            ) : (
              'Save Contact Info'
            )}
          </Button>
          {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can update content.</p>}
        </div>
      </form>
    </Form>
  );
}
