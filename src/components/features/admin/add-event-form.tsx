
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
<<<<<<< HEAD
import { CalendarIcon, Loader2, MapPin, FileImage, FileText } from "lucide-react" 
import NextImage from 'next/image';

import { toast } from '@/hooks/use-toast';
import { addEvent } from '@/services/admin'; 
import type { AddEventInput as SupabaseAddEventInput } from '@/services/admin';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; 

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fileSchema = z.custom<File | null>((val) => val === null || val instanceof File, {
  message: "Invalid file.",
});

const imageFileSchema = fileSchema.refine(file => file ? file.size <= MAX_FILE_SIZE_BYTES : true, `Image size should be less than ${MAX_FILE_SIZE_MB}MB.`)
  .refine(file => file ? ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type) : true, `Only .png, .jpg, .jpeg, .gif, .webp formats are supported for images.`);

const pdfFileSchema = fileSchema.refine(file => file ? file.size <= MAX_FILE_SIZE_BYTES : true, `PDF size should be less than ${MAX_FILE_SIZE_MB}MB.`)
  .refine(file => file ? file.type === 'application/pdf' : true, `Only .pdf format is supported for rules.`);

=======
import { CalendarIcon, Loader2, MapPin, ImageUp } from "lucide-react" 
import Image from 'next/image';

import { toast } from '@/hooks/use-toast';
import { addEvent } from '@/services/admin'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; 

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
<<<<<<< HEAD
  venue: z.string().min(3, { message: 'Venue/Location must be at least 3 characters.'}).max(150), 
  rules: z.string().optional(),
  start_date: z.date({ required_error: "A start date is required." }),
  end_date: z.date({ required_error: "An end date is required." }),
  registration_deadline: z.date().optional(),
  event_type: z.enum(['individual', 'group'], { required_error: "You must select an event type." }),
  min_team_size: z.coerce.number().min(1).optional(),
  max_team_size: z.coerce.number().min(1).optional(),
  fee: z.coerce.number().min(0, { message: 'Fee cannot be negative.' }).default(0),
  eventImage: imageFileSchema.optional().nullable(),
  rulesPdf: pdfFileSchema.optional().nullable(),
}).refine(data => {
    if (data.event_type === 'group' && (!data.min_team_size || !data.max_team_size)) {
=======
  venue: z.string().min(3, { message: 'Venue/Location must be at least 3 characters.'}).max(150),
  rules: z.string().optional(),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
  registrationDeadline: z.date().optional(), 
  eventType: z.enum(['individual', 'group'], { required_error: "You must select an event type." }),
  minTeamSize: z.coerce.number().min(1).optional(),
  maxTeamSize: z.coerce.number().min(1).optional(),
  fee: z.coerce.number().min(0, { message: 'Fee cannot be negative.' }).default(0),
  imageFile: z.string().optional(), // Store as Data URI string
  imagePreview: z.string().optional(), // For client-side preview
}).refine(data => {
    if (data.eventType === 'group' && (!data.minTeamSize || !data.maxTeamSize)) {
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      return false;
    }
    return true;
  }, {
    message: 'Minimum and maximum team size are required for group events.',
    path: ['min_team_size'], 
  }).refine(data => {
<<<<<<< HEAD
      if (data.event_type === 'group' && data.min_team_size && data.max_team_size) {
          return data.min_team_size <= data.max_team_size;
=======
      if (data.eventType === 'group' && data.minTeamSize && data.maxTeamSize) {
          return data.minTeamSize <= data.maxTeamSize;
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      }
      return true;
  }, {
      message: 'Minimum team size cannot be greater than maximum team size.',
      path: ['min_team_size'],
  }).refine(data => {
<<<<<<< HEAD
      return data.end_date >= data.start_date;
=======
      return data.endDate >= data.startDate;
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
  }, {
      message: 'End date cannot be before the start date.',
      path: ['end_date'],
  }).refine(data => {
<<<<<<< HEAD
      if (data.registration_deadline) {
          return data.registration_deadline <= data.start_date;
=======
      if (data.registrationDeadline) {
          return data.registrationDeadline <= data.startDate;
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      }
      return true;
  }, {
      message: 'Registration deadline cannot be after the event start date.',
      path: ['registration_deadline'],
  });

type FormData = z.infer<typeof formSchema>;

export function AddEventForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [pdfPreviewName, setPdfPreviewName] = React.useState<string | null>(null);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth(); 
<<<<<<< HEAD
=======
  const fileInputRef = React.useRef<HTMLInputElement>(null);

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      venue: '', 
      rules: '',
<<<<<<< HEAD
      start_date: undefined,
      end_date: undefined,
      registration_deadline: undefined, 
      event_type: undefined,
      min_team_size: undefined,
      max_team_size: undefined,
      fee: 0,
      eventImage: null,
      rulesPdf: null,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'eventImage' | 'rulesPdf') => {
    const file = event.target.files?.[0];
    const isImageField = fieldName === 'eventImage'; // Define isImageField in the outer scope

    if (file) {
      const allowedTypes = isImageField ? ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] : ['application/pdf'];
      const fieldTypeMessage = isImageField ? "PNG, JPG, GIF or WEBP image" : "PDF";

      if (!allowedTypes.includes(file.type)) {
          toast({ title: "Invalid File Type", description: `Please select a ${fieldTypeMessage}.`, variant: "destructive" });
          form.setValue(fieldName, null); 
          if (isImageField) setImagePreview(null); else setPdfPreviewName(null);
          if (event.target) event.target.value = ''; 
          return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) { 
          toast({ title: "File Too Large", description: `File size should be less than ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
          form.setValue(fieldName, null);
          if (isImageField) setImagePreview(null); else setPdfPreviewName(null);
          if (event.target) event.target.value = ''; 
          return;
      }

      form.setValue(fieldName, file);
      if (isImageField) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPdfPreviewName(file.name);
      }
    } else {
      form.setValue(fieldName, null);
      if (isImageField) {
        setImagePreview(null); 
      } else {
        setPdfPreviewName(null);
      }
      // Clear the file input visually if a file was cleared
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
=======
      startDate: undefined,
      endDate: undefined,
      registrationDeadline: undefined, 
      eventType: undefined,
      minTeamSize: undefined,
      maxTeamSize: undefined,
      fee: 0,
      imageFile: undefined,
      imagePreview: undefined,
    },
  });

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError('imageFile', { type: 'manual', message: `File size should be less than ${MAX_FILE_SIZE / (1024*1024)}MB.` });
        return;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
         form.setError('imageFile', { type: 'manual', message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}.` });
        return;
      }
      form.clearErrors('imageFile');
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageFile', reader.result as string);
        form.setValue('imagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('[Admin Add Event] Form Data:', values);

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to add items.", variant: "destructive" });
        setIsSubmitting(false); return;
    }

    let imageDataUriToSend: string | null = null;
    if (values.eventImage) {
      try {
        imageDataUriToSend = await fileToDataUri(values.eventImage);
      } catch (error) {
        toast({ title: "Image Read Error", description: "Could not process image file.", variant: "destructive" });
        setIsSubmitting(false); return;
      }
    }

    let rulesPdfDataUriToSend: string | null = null;
    if (values.rulesPdf) {
        try {
            rulesPdfDataUriToSend = await fileToDataUri(values.rulesPdf);
        } catch (error) {
            toast({ title: "PDF Read Error", description: "Could not process PDF file.", variant: "destructive" });
            setIsSubmitting(false); return;
        }
    }

    try {
<<<<<<< HEAD
      const dataToSend: SupabaseAddEventInput = {
        name: values.name,
        description: values.description,
        venue: values.venue,
        rules: values.rules,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        registration_deadline: values.registration_deadline?.toISOString(),
        event_type: values.event_type,
        min_team_size: values.min_team_size,
        max_team_size: values.max_team_size,
        fee: Math.round(values.fee * 100), 
        imageDataUri: imageDataUriToSend,
        rulesPdfDataUri: rulesPdfDataUriToSend,
      };

      const result = await addEvent(dataToSend); 

      if (result.success) {
        toast({ title: 'Item Added Successfully!', description: `"${values.name}" created.`});
        form.reset(); setImagePreview(null); setPdfPreviewName(null);
        router.push('/admin/events'); router.refresh(); 
=======
      const { imagePreview, ...dataToSendBackend } = values; // Exclude imagePreview from backend data

      const dataForService = {
        ...dataToSendBackend,
        fee: Math.round(values.fee * 100),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        registrationDeadline: values.registrationDeadline?.toISOString(),
        imageFile: values.imageFile, // Pass the Data URI string
      };
      
      const result = await addEvent(dataForService);

      if (result.success) {
        toast({
          title: 'Item Added Successfully!',
          description: `"${values.name}" has been created.`,
          variant: 'default',
        });
        form.reset(); 
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        router.push('/admin/events'); 
        router.refresh(); 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      } else {
        throw new Error(result.message || 'Failed to add item.');
      }
    } catch (error) {
      toast({ title: 'Failed to Add Item', description: error instanceof Error ? error.message : 'Unexpected error.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;
<<<<<<< HEAD
  const eventTypeWatched = form.watch('event_type');
=======
  const eventType = form.watch('eventType'); 
  const imagePreview = form.watch('imagePreview');
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
<<<<<<< HEAD
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name (Program/Event)</FormLabel><FormControl><Input placeholder="e.g., Annual Hackathon 2025" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the item..." {...field} rows={5} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="venue" render={({ field }) => (<FormItem><FormLabel>Venue / Location</FormLabel><FormControl><div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="e.g., College Auditorium" className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="rules" render={({ field }) => (<FormItem><FormLabel>Rules / Guidelines (Text - Optional)</FormLabel><FormControl><Textarea placeholder="Enter rules text here if not providing a PDF, or as a summary..." {...field} rows={5} /></FormControl><FormDescription>Detailed text rules. You can also upload a PDF below.</FormDescription><FormMessage /></FormItem>)} />

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField control={form.control} name="start_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick start date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="end_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick end date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => (form.getValues("start_date") && date < form.getValues("start_date")) || date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="registration_deadline" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Registration Deadline (Opt.)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick deadline</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || (form.getValues("start_date") && date > form.getValues("start_date"))} initialFocus /></PopoverContent></Popover><FormDescription className="text-xs">Last day to register.</FormDescription><FormMessage /></FormItem>)} />
=======
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Program/Event)</FormLabel>
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
            name="rules"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rules / Guidelines (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter specific rules, judging criteria, program structure, etc. (One point per line recommended)" {...field} rows={5} />
                </FormControl>
                 <FormDescription>
                   Detailed information for participants or attendees.
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Image Upload */}
          <FormField
            control={form.control}
            name="imageFile" // This field won't directly hold the file object, but its error messages can be tied here
            render={({ fieldState }) => ( // Only need fieldState for error display
              <FormItem>
                <FormLabel className="flex items-center gap-2"><ImageUp className="h-4 w-4"/> Event Image (Optional)</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        onChange={handleImageFileChange}
                        ref={fileInputRef}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                </FormControl>
                <FormDescription>Max file size: {MAX_FILE_SIZE / (1024*1024)}MB. Recommended aspect ratio: 16:9.</FormDescription>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                {imagePreview && (
                    <div className="mt-2 border rounded-md p-2 max-w-xs">
                        <Image src={imagePreview} alt="Event image preview" width={300} height={169} className="rounded-md object-cover" data-ai-hint="event banner"/>
                    </div>
                )}
              </FormItem>
            )}
          />


           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField
                 control={form.control}
                 name="startDate"
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
                 name="endDate"
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
                              (form.getValues("startDate") && date < form.getValues("startDate")) ||
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
                 name="registrationDeadline"
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
                              (form.getValues("startDate") && date > form.getValues("startDate"))
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
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
           </div>

           <FormField control={form.control} name="event_type" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Participation Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="individual" /></FormControl><FormLabel className="font-normal">Individual</FormLabel></FormItem><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="group" /></FormControl><FormLabel className="font-normal">Team/Group</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />

<<<<<<< HEAD
           {eventTypeWatched === 'group' && (
=======
           <FormField
             control={form.control}
             name="eventType"
             render={({ field }) => (
               <FormItem className="space-y-3">
                 <FormLabel>Participation Type</FormLabel>
                 <FormControl>
                   <RadioGroup
                     onValueChange={field.onChange}
                     defaultValue={field.value}
                     className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                   >
                     <FormItem className="flex items-center space-x-3 space-y-0">
                       <FormControl>
                         <RadioGroupItem value="individual" />
                       </FormControl>
                       <FormLabel className="font-normal">
                         Individual
                       </FormLabel>
                     </FormItem>
                     <FormItem className="flex items-center space-x-3 space-y-0">
                       <FormControl>
                         <RadioGroupItem value="group" />
                       </FormControl>
                       <FormLabel className="font-normal">
                         Team/Group
                       </FormLabel>
                     </FormItem>
                   </RadioGroup>
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           {eventType === 'group' && (
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/50">
                <FormField control={form.control} name="min_team_size" render={({ field }) => (<FormItem><FormLabel>Min Team Size</FormLabel><FormControl><Input type="number" min="1" placeholder="Min members" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="max_team_size" render={({ field }) => (<FormItem><FormLabel>Max Team Size</FormLabel><FormControl><Input type="number" min="1" placeholder="Max members" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
             </div>
           )}

<<<<<<< HEAD
          <FormField control={form.control} name="eventImage" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-1"><FileImage className="h-4 w-4" /> Event Image (Optional)</FormLabel><FormControl><Input type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={(e) => handleFileChange(e, 'eventImage')} className="border-dashed border-2 p-2 hover:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" /></FormControl>{imagePreview && (<div className="mt-2 border rounded-md p-2 inline-block bg-muted/50"><NextImage src={imagePreview} alt="Event image preview" width={200} height={120} className="object-cover rounded-md" data-ai-hint="event poster"/></div>)}<FormDescription>Upload an image (Max {MAX_FILE_SIZE_MB}MB: PNG, JPG, GIF, WEBP).</FormDescription><FormMessage /></FormItem>)} />
          
          <FormField control={form.control} name="rulesPdf" render={({ field }) => ( <FormItem><FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4" /> Rules/Instructions PDF (Optional)</FormLabel><FormControl><Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'rulesPdf')} className="border-dashed border-2 p-2 hover:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" /></FormControl>{pdfPreviewName && (<p className="mt-1 text-sm text-muted-foreground">Selected: {pdfPreviewName}</p>)}<FormDescription>Upload a PDF document (Max {MAX_FILE_SIZE_MB}MB).</FormDescription><FormMessage /></FormItem>)} />
=======
           <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee (INR)</FormLabel>
                 <FormControl>
                   <Input type="number" step="0.01" min="0" placeholder="Enter fee in Rupees (e.g., 100.00 or 0 for free)" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                 </FormControl>
                 <FormDescription>
                   Enter 0 for free items.
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

          <FormField control={form.control} name="fee" render={({ field }) => (<FormItem><FormLabel>Fee (INR)</FormLabel><FormControl><Input type="number" step="0.01" min="0" placeholder="Enter fee (e.g., 100.00)" {...field} value={field.value ?? 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormDescription>Enter 0 for free items.</FormDescription><FormMessage /></FormItem>)} />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Item...</> : 'Add Item'}
          </Button>
           {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can add items.</p>}
        </div>
      </form>
    </Form>
  );
}
