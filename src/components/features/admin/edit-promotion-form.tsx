
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
import { updatePromotion } from '@/services/promotions';
import type { Promotion } from '@/services/promotions';
import { useRouter } from 'next/navigation';
import { Loader2, Link2, ListOrdered, CaseSensitive } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500),
  cta_text: z.string().max(30).optional(),
  cta_link: z.string().url({ message: 'Please enter a valid URL.' }).max(300).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

type FormData = z.infer<typeof formSchema>;

interface EditPromotionFormProps {
  promotion: Promotion;
}

export function EditPromotionForm({ promotion }: EditPromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: promotion.title,
      description: promotion.description,
      cta_text: promotion.cta_text || '',
      cta_link: promotion.cta_link || '',
      is_active: promotion.is_active,
      display_order: promotion.display_order,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to edit promotions.", variant: "destructive" });
      setIsSubmitting(false); return;
    }

    try {
      const result = await updatePromotion(promotion.id!, values);
      if (result.success) {
        toast({ title: 'Promotion Updated!', description: `"${values.title}" has been saved.` });
        router.push('/admin/promotions');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update promotion.');
      }
    } catch (error) {
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Image Not Editable</AlertTitle>
            <AlertDescription>
              To change the image for a promotion, please delete this entry and create a new one with the desired image.
            </AlertDescription>
          </Alert>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotion Title</FormLabel>
                <FormControl><Input placeholder="e.g., Special Guest Lecture!" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Short and engaging description of the promotion." {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="cta_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><CaseSensitive className="h-4 w-4"/> Button Text (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., Register Now, Learn More" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cta_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4"/> Button Link (Optional)</FormLabel>
                  <FormControl><Input type="url" placeholder="https://example.com/register" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><ListOrdered className="h-4 w-4"/> Display Order</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormDescription>Lower numbers appear first.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-col rounded-lg border p-3">
                  <FormLabel>Status</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>{field.value ? 'Active' : 'Inactive'}</FormLabel>
                  </div>
                  <FormDescription>Inactive promotions won't be shown to users.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
