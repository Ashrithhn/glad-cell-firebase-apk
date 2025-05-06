
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
import { updateContent } from '@/services/content'; // Import the service
import type { SiteLinks } from '@/services/content';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle } from 'lucide-react'; // Using WhatsApp icon
import { useAuth } from '@/hooks/use-auth';

// Schema for site links
const formSchema = z.object({
  whatsappCommunity: z.string().url({ message: 'Please enter a valid URL (e.g., https://...)' }).max(300).or(z.literal('')), // Allow empty string
});

type FormData = z.infer<typeof formSchema>;

interface EditLinksFormProps {
  currentLinks: SiteLinks;
}

export function EditLinksForm({ currentLinks }: EditLinksFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsappCommunity: currentLinks?.whatsappCommunity || '',
    },
  });

  // Update default values if currentLinks changes
  React.useEffect(() => {
    form.reset({
      whatsappCommunity: currentLinks?.whatsappCommunity || '',
    });
  }, [currentLinks, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to update content.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      // The data structure matches SiteLinks
      const result = await updateContent('links', values);

      if (result.success) {
        toast({
          title: 'Links Updated Successfully!',
          description: 'The site links have been saved.',
          variant: 'default',
        });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update links.');
      }
    } catch (error) {
      console.error('Error updating links:', error);
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
            name="whatsappCommunity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><MessageCircle className="h-4 w-4"/> WhatsApp Community Link</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="Enter the full WhatsApp group invite link" {...field} />
                </FormControl>
                 <FormDescription>This link will be used in the sidebar. Leave blank to hide the link.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Add more fields for other links as needed */}
          {/*
           <FormField
            control={form.control}
            name="otherLink"
            render={({ field }) => ( ... )}
          />
          */}
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Links...
              </>
            ) : (
              'Save Links'
            )}
          </Button>
          {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can update content.</p>}
        </div>
      </form>
    </Form>
  );
}
