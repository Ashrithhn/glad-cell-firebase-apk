
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
import { updateContent } from '@/services/content';
import type { SiteLinks } from '@/services/content';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Schema for site links, allowing empty strings for optional links
const formSchema = z.object({
  whatsappCommunity: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  telegram: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  instagram: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  linkedin: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
  github: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')),
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
      telegram: currentLinks?.telegram || '',
      instagram: currentLinks?.instagram || '',
      linkedin: currentLinks?.linkedin || '',
      github: currentLinks?.github || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      whatsappCommunity: currentLinks?.whatsappCommunity || '',
      telegram: currentLinks?.telegram || '',
      instagram: currentLinks?.instagram || '',
      linkedin: currentLinks?.linkedin || '',
      github: currentLinks?.github || '',
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
      const result = await updateContent('links', values);
      if (result.success) {
        toast({ title: 'Links Updated Successfully!', description: 'The site social media links have been saved.', variant: 'default' });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update links.');
      }
    } catch (error) {
      console.error('Error updating links:', error);
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'An unexpected error occurred.', variant: 'destructive' });
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
                <FormLabel className="flex items-center gap-2">WhatsApp Link</FormLabel>
                <FormControl><Input type="url" placeholder="Enter the full WhatsApp group/channel invite link" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="telegram" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2">Telegram Link</FormLabel><FormControl><Input type="url" placeholder="Enter Telegram channel link" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="instagram" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2">Instagram Link</FormLabel><FormControl><Input type="url" placeholder="Enter Instagram profile link" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2">LinkedIn Link</FormLabel><FormControl><Input type="url" placeholder="Enter LinkedIn page/profile link" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="github" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2">GitHub Link</FormLabel><FormControl><Input type="url" placeholder="Enter GitHub organization/profile link" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Links...</> : 'Save Links'}
          </Button>
          {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can update content.</p>}
        </div>
      </form>
    </Form>
  );
}
