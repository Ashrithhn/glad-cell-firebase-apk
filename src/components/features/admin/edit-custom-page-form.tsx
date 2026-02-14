
// This file is new
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
import { useRouter } from 'next/navigation';
import { Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { CustomPage } from '@/services/custom-pages';
import { createCustomPage, updateCustomPage } from '@/services/custom-pages';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(150),
  slug: z.string()
      .min(3, { message: 'URL path must be at least 3 characters.' })
      .regex(/^[a-z0-9-]+$/, { message: 'URL path can only contain lowercase letters, numbers, and hyphens.' }),
  content: z.string().optional(),
  is_published: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface EditCustomPageFormProps {
  page?: CustomPage;
}

export function EditCustomPageForm({ page }: EditCustomPageFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      content: page?.content || '',
      is_published: page?.is_published || false,
    },
  });

  const pageId = page?.id;

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      let result;
      if (pageId) {
        result = await updateCustomPage(pageId, values);
      } else {
        result = await createCustomPage(values);
      }

      if (result.success) {
        toast({ title: `Page ${pageId ? 'Updated' : 'Created'}!`, description: result.message });
        router.push('/admin/pages');
        router.refresh();
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Title</FormLabel>
                <FormControl><Input placeholder="e.g., Our Sponsors" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><LinkIcon className="h-4 w-4"/> URL Path (Slug)</FormLabel>
                <FormControl>
                    <div className="flex items-center">
                        <span className="text-sm text-muted-foreground pl-3 pr-1 py-2 bg-muted rounded-l-md border border-r-0">/</span>
                        <Input placeholder="our-sponsors" {...field} className="rounded-l-none"/>
                    </div>
                </FormControl>
                <FormDescription>This determines the page's URL. Use only lowercase letters, numbers, and hyphens.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/> Page Content</FormLabel>
                <FormControl><Textarea placeholder="Write your page content here..." {...field} rows={15} value={field.value || ''}/></FormControl>
                <FormDescription>Supports Markdown for formatting (e.g., # Heading, **bold**, *italic*).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publish Page</FormLabel>
                  <FormDescription>
                    {field.value ? "This page is live and accessible to the public." : "This page is a draft and not visible to the public."}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
            />

        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pageId ? 'Save Changes' : 'Create Page'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
