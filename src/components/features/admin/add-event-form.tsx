
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
import { format } from "date-fns";
import { CalendarIcon, Loader2, MapPin, ImageUp, Building, FileText, FileCheck } from "lucide-react";
import Image from 'next/image';

import { toast } from '@/hooks/use-toast';
import { addEvent } from '@/services/admin';
import type { AddEventInput as SupabaseAddEventInput } from '@/services/admin';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

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

export function AddEventForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      venue: '',
      rules: '',
      event_type: undefined,
      fee: 0,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    if (!userProfile) {
        toast({ title: "Unauthorized", description: "You must be logged in as an admin to add items.", variant: "destructive" });
        setIsSubmitting(false); return;
    }

    try {
      const { imagePreview, rulesPdfName, ...dataToSend } = values;
      
      const dataForService: Omit<SupabaseAddEventInput, 'college_id' | 'college_name'> = {
        ...dataToSend,
        fee: Math.round(dataToSend.fee * 100), 
        start_date: dataToSend.start_date.toISOString(),
        end_date: dataToSend.end_date.toISOString(),
        registration_deadline: dataToSend.registration_deadline?.toISOString(),
      };

      const result = await addEvent(dataForService);

      if (result.success) {
        toast({
          title: 'Item Added Successfully!',
          description: `"${values.name}" has been created.`,
        });
        form.reset();
        if(imageInputRef.current) imageInputRef.current.value = "";
        if(pdfInputRef.current) pdfInputRef.current.value = "";
        router.push('/admin/events');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to add item.');
      }
    } catch (error) {
      toast({ title: 'Failed to Add Item', description: error instanceof Error ? error.message : 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

   const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: `Image size should be less than ${MAX_FILE_SIZE / (1024*1024)}MB.`, variant: "destructive" });
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


  const isDisabled = isSubmitting || authLoading || !userProfile;
  const eventType = form.watch('event_type');
  const imagePreview = form.watch('imagePreview');
  const pdfName = form.watch('rulesPdfName');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
          <FormItem>
            <FormLabel>College Name</FormLabel>
            <FormControl>
               <div className="relative">
                 <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input placeholder="Loading college info..." value={userProfile?.college_name || ''} className="pl-10" disabled />
              </div>
            </FormControl>
            <FormDescription>This is based on your admin profile and cannot be changed.</FormDescription>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Annual Hackathon 2025, Mentorship Program" {...field} />
                </FormControl>
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

          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue / Location</FormLabel>
                <FormControl>
                   <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                     <Input placeholder="e.g., College Auditorium, Online via Meet" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="imageDataUri"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4"/> Event Image (Optional)</FormLabel>
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
                        <Image src={imagePreview} alt="Event image preview" width={300} height={169} className="rounded-md object-cover" data-ai-hint="event banner"/>
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
                    <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4"/> Rules PDF (Optional)</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept={ALLOWED_PDF_TYPES.join(',')}
                            onChange={handlePdfFileChange}
                            ref={pdfInputRef}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </FormControl>
                    <FormDescription>Max file size: {MAX_FILE_SIZE / (1024*1024)}MB. This will be available for users to download.</FormDescription>
                    <FormMessage />
                    {pdfName && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            <span>{pdfName}</span>
                        </div>
                    )}
                </FormItem>
                )}
            />
            
           <FormField
            control={form.control}
            name="rules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rules Summary (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter a brief summary of rules or guidelines here..." {...field} rows={5} />
                </FormControl>
                 <FormDescription>
                   This text will be displayed directly on the page. Use the field above for a full PDF rulebook.
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField
                 control={form.control}
                 name="start_date"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>Start Date</FormLabel>
                     <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={"outline"}
                             className={cn(
                               "w-full justify-start text-left font-normal",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {field.value ? (
                               format(field.value, "PPP")
                             ) : (
                               <span>Pick start date</span>
                             )}
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                           disabled={(date) =>
                             date < new Date(new Date().setHours(0, 0, 0, 0))
                           }
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="end_date"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>End Date</FormLabel>
                      <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={"outline"}
                             className={cn(
                               "w-full justify-start text-left font-normal",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {field.value ? (
                               format(field.value, "PPP")
                             ) : (
                               <span>Pick end date</span>
                             )}
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                            disabled={(date) =>
                              (form.getValues("start_date") && date < form.getValues("start_date")) ||
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                <FormField
                 control={form.control}
                 name="registration_deadline"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>Registration Deadline (Opt.)</FormLabel>
                      <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={"outline"}
                             className={cn(
                               "w-full justify-start text-left font-normal",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                             {field.value ? (
                               format(field.value, "PPP")
                             ) : (
                               <span>Pick deadline (optional)</span>
                             )}
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              (form.getValues("start_date") && date > form.getValues("start_date"))
                            }
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                      <FormDescription className="text-xs">Last day to register, if applicable.</FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               />
           </div>

           <FormField control={form.control} name="event_type" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Participation Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="individual" /></FormControl><FormLabel className="font-normal">Individual</FormLabel></FormItem><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="group" /></FormControl><FormLabel className="font-normal">Team/Group</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />

           {eventType === 'group' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/50">
                <FormField control={form.control} name="min_team_size" render={({ field }) => (<FormItem><FormLabel>Min Team Size</FormLabel><FormControl><Input type="number" min="1" placeholder="Min members" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="max_team_size" render={({ field }) => (<FormItem><FormLabel>Max Team Size</FormLabel><FormControl><Input type="number" min="1" placeholder="Max members" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
             </div>
           )}

           <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee (INR)</FormLabel>
                 <FormControl>
                   <Input type="number" step="0.01" min="0" placeholder="Enter fee in Rupees (e.g., 100.00 or 0 for free)" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value) || 0)} />
                 </FormControl>
                 <FormDescription>
                   Enter 0 for free items. The fee will be converted to paisa for payment processing.
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Item...</> : 'Add Item'}
          </Button>
           {!userProfile && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can add items.</p>}
        </div>
      </form>
    </Form>
  );
}
