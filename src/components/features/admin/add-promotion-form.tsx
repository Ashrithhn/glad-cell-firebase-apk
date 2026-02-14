
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
import { createPromotion } from '@/services/promotions';
import type { Promotion } from '@/services/promotions';
import { useRouter } from 'next/navigation';
import { Loader2, ImageUp, Link2, ListOrdered, CaseSensitive } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(500),
  cta_text: z.string().max(30).optional(),
  cta_link: z.string().url({ message: 'Please enter a valid URL.' }).max(300).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
  imageDataUri: z.string().optional(),
  imagePreview: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddPromotionForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      cta_text: 'Learn More',
      cta_link: '',
      is_active: true,
      display_order: 0,
    },
  });

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: `Image size must be less than ${MAX_FILE_SIZE / (1024*1024)}MB.`, variant: "destructive" });
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
         toast({ title: "Invalid File Type", description: `Allowed image types: ${ALLOWED_IMAGE_TYPES.join(', ')}.`, variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageDataUri', reader.result as string);
        form.setValue('imagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You must be an admin to add promotions.", variant: "destructive" });
      setIsSubmitting(false); return;
    }

    try {
      const { imagePreview, ...dataToSend } = values;

      const result = await createPromotion(dataToSend);

      if (result.success) {
        toast({
          title: 'Promotion Added!',
          description: `"${values.title}" has been created.`,
        });
        form.reset();
        router.push('/admin/promotions');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to add promotion.');
      }
    } catch (error) {
      toast({ title: 'Failed to Add Promotion', description: error instanceof Error ? error.message : 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;
  const imagePreview = form.watch('imagePreview');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
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
        
          <FormField
            control={form.control}
            name="imageDataUri"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4"/> Promotion Image (Optional)</FormLabel>
                <FormControl>
                    <Input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        onChange={handleImageFileChange}
                        ref={imageInputRef}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                </FormControl>
                <FormDescription>Max file size: {MAX_FILE_SIZE / (1024*1024)}MB. Recommended aspect ratio: 16:9.</FormDescription>
                <FormMessage />
                {imagePreview && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                        <Image src={imagePreview} alt="Promotion image preview" width={300} height={169} className="rounded-md object-cover" data-ai-hint="promotion banner" />
                    </div>
                )}
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
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Promotion'}
          </Button>
           {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can add promotions.</p>}
        </div>
      </form>
    </Form>
  );
}
