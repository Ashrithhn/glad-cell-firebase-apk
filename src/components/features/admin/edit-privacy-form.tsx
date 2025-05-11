
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { updateContent } from '@/services/content';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }).max(10000, { message: 'Content is too long.' }),
});

type FormData = z.infer<typeof formSchema>;

interface EditPrivacyFormProps {
  currentContent: string;
}

export function EditPrivacyForm({ currentContent }: EditPrivacyFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: currentContent || '',
    },
  });

  React.useEffect(() => {
    form.reset({ content: currentContent || '' });
  }, [currentContent, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to update content.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      const result = await updateContent('privacy-policy', values.content);

      if (result.success) {
        toast({
          title: 'Privacy Policy Updated!',
          description: 'The privacy policy content has been saved.',
        });
        router.refresh(); 
      } else {
        throw new Error(result.message || 'Failed to update privacy policy.');
      }
    } catch (error) {
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
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy Policy Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter the content for the Privacy Policy page..." {...field} rows={20} />
                </FormControl>
                 <FormDescription>
                   Supports Markdown for formatting (e.g., **bold**, *italic*, lists, links).
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Content...
              </>
            ) : (
              'Save Privacy Policy'
            )}
          </Button>
          {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can update content.</p>}
        </div>
      </form>
    </Form>
  );
}
