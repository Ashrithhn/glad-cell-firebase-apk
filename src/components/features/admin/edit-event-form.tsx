
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2, MapPin, ImageUp, Building, AlertCircle, FileText, FileCheck } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

import { toast } from '@/hooks/use-toast';
import { updateEvent } from '@/services/admin';
import type { EventData } from '@/services/events';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  venue: z.string().min(3, { message: 'Venue/Location must be at least 3 characters.'}).max(150),
  rules: z.string().optional(),
  start_date: z.date({ required_error: "A start date is required." }),
  end_date: z.date({ required_error: "An end date is required." }),
  registration_deadline: z.date().optional(),
  event_type: z.enum(['individual', 'group'], { required_error: "You must select an event type." }),
  min_team_size: z.coerce.number().min(1).optional(),
  max_team_size: z.coerce.number().min(1).optional(),
  fee: z.coerce.number().min(0, { message: 'Fee cannot be negative.' }).default(0),
  imageDataUri: z.string().optional(),
  imagePreview: z.string().optional(),
  rulesPdfDataUri: z.string().optional(),
  rulesPdfName: z.string().optional(),
}).refine(data => {
    if (data.event_type === 'group' && (!data.min_team_size || !data.max_team_size)) {
      return false;
    }
    return true;
  }, {
    message: 'Minimum and maximum team size are required for group events.',
    path: ['min_team_size'],
  }).refine(data => {
      if (data.event_type === 'group' && data.min_team_size && data.max_team_size) {
          return data.min_team_size <= data.max_team_size;
      }
      return true;
  }, {
      message: 'Minimum team size cannot be greater than maximum team size.',
      path: ['min_team_size'],
  }).refine(data => {
      return data.end_date >= data.start_date;
  }, {
      message: 'End date cannot be before the start date.',
      path: ['end_date'],
  }).refine(data => {
      if (data.registration_deadline) {
          return data.registration_deadline <= data.start_date;
      }
      return true;
  }, {
      message: 'Registration deadline cannot be after the event start date.',
      path: ['registration_deadline'],
  });

type FormData = z.infer<typeof formSchema>;

export function EditEventForm({ event }: { event: EventData }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event.name || '',
      description: event.description || '',
      venue: event.venue || '',
      rules: event.rules || '',
      start_date: event.start_date ? parseISO(event.start_date) : new Date(),
      end_date: event.end_date ? parseISO(event.end_date) : new Date(),
      registration_deadline: event.registration_deadline ? parseISO(event.registration_deadline) : undefined,
      event_type: event.event_type,
      min_team_size: event.min_team_size ?? undefined,
      max_team_size: event.max_team_size ?? undefined,
      fee: event.fee / 100,
      imagePreview: event.image_url || undefined,
      rulesPdfName: event.rules_pdf_url?.split('/').pop()?.substring(37) || undefined,
    },
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: `Image size should be less than ${MAX_FILE_SIZE / (1024*1024)}MB.`, variant: "destructive" });
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
         toast({ title: "Invalid File Type", description: `Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}.`, variant: "destructive" });
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

   const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            toast({ title: "File Too Large", description: `PDF size should be less than ${MAX_FILE_SIZE / (1024*1024)}MB.`, variant: "destructive" });
            return;
        }
        if (!ALLOWED_PDF_TYPES.includes(file.type)) {
            toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            form.setValue('rulesPdfDataUri', reader.result as string);
            form.setValue('rulesPdfName', file.name);
        };
        reader.readAsDataURL(file);
    }
  };


  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to edit events.", variant: "destructive" });
        setIsSubmitting(false); return;
    }

    try {
      const { imagePreview, rulesPdfName, ...dataToSend } = values;

      const result = await updateEvent(event.id!, {
        ...dataToSend,
        fee: Math.round(dataToSend.fee * 100), // Convert to Paisa
        start_date: dataToSend.start_date.toISOString(),
        end_date: dataToSend.end_date.toISOString(),
        registration_deadline: dataToSend.registration_deadline?.toISOString(),
      });

      if (result.success) {
        toast({
          title: 'Event Updated Successfully!',
          description: `"${values.name}" has been saved.`,
        });
        router.push('/admin/events');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update event.');
      }
    } catch (error) {
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;
  const eventType = form.watch('event_type');
  const imagePreview = form.watch('imagePreview');
  const pdfName = form.watch('rulesPdfName');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl><Input placeholder="e.g., Annual Hackathon 2025" {...field} /></FormControl>
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
                <FormControl>
                  <Textarea placeholder="Describe the item, its goals, target audience, etc." {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Note on File Replacement</AlertTitle>
            <AlertDescription>
                Uploading a new image or PDF will permanently replace the existing one.
            </AlertDescription>
           </Alert>

           <FormField
            control={form.control}
            name="imageDataUri"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4"/> Replace Event Image (Optional)</FormLabel>
                <FormControl>
                    <Input type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleImageFileChange} ref={imageInputRef} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                </FormControl>
                 <FormDescription>Max file size: {MAX_FILE_SIZE / (1024*1024)}MB.</FormDescription>
                {imagePreview && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                        <Image src={imagePreview} alt="Event image preview" width={300} height={169} className="rounded-md object-cover" data-ai-hint="event banner" />
                    </div>
                )}
              </FormItem>
            )}
          />

            <FormField
                control={form.control}
                name="rulesPdfDataUri"
                render={() => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/> Replace Rules PDF (Optional)</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept={ALLOWED_PDF_TYPES.join(',')}
                            onChange={handlePdfFileChange}
                            ref={pdfInputRef}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </FormControl>
                    <FormDescription>Max file size: {MAX_FILE_SIZE / (1024*1024)}MB.</FormDescription>
                    {(pdfName || event.rules_pdf_url) && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            <span>Current: {pdfName || 'rules.pdf'}</span>
                            {event.rules_pdf_url && (
                                <Link href={event.rules_pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">(View)</Link>
                            )}
                        </div>
                    )}
                </FormItem>
                )}
            />
          
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee (INR)</FormLabel>
                   <FormControl>
                     <Input type="number" step="0.01" min="0" placeholder="Enter fee in Rupees" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value) || 0)} />
                   </FormControl>
                   <FormDescription>
                     Enter 0 for free events.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </fieldset>
        
        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
