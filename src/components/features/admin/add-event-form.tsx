
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
import { CalendarIcon, Loader2, MapPin, ImageUp } from "lucide-react" 
import Image from 'next/image';

import { toast } from '@/hooks/use-toast';
import { addEvent } from '@/services/admin'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; 

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
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
      return false;
    }
    return true;
  }, {
    message: 'Minimum and maximum team size are required for group events.',
    path: ['minTeamSize'],
  }).refine(data => {
      if (data.eventType === 'group' && data.minTeamSize && data.maxTeamSize) {
          return data.minTeamSize <= data.maxTeamSize;
      }
      return true;
  }, {
      message: 'Minimum team size cannot be greater than maximum team size.',
      path: ['minTeamSize'],
  }).refine(data => {
      return data.endDate >= data.startDate;
  }, {
      message: 'End date cannot be before the start date.',
      path: ['endDate'],
  }).refine(data => {
      if (data.registrationDeadline) {
          return data.registrationDeadline <= data.startDate;
      }
      return true;
  }, {
      message: 'Registration deadline cannot be after the event start date.',
      path: ['registrationDeadline'],
  });


type FormData = z.infer<typeof formSchema>;

export function AddEventForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth(); 
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      venue: '', 
      rules: '',
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

    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to add items.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
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
      } else {
        throw new Error(result.message || 'Failed to add item.');
      }
    } catch (error) {
      console.error('[Admin Add Event] Error:', error);
      toast({
        title: 'Failed to Add Item',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || authLoading || !isAdmin;
  const eventType = form.watch('eventType'); 
  const imagePreview = form.watch('imagePreview');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
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
           </div>


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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/50">
                <FormField
                 control={form.control}
                 name="minTeamSize"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Min Team Size</FormLabel>
                     <FormControl>
                       <Input type="number" min="1" placeholder="Minimum members per team" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="maxTeamSize"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Max Team Size</FormLabel>
                     <FormControl>
                       <Input type="number" min="1" placeholder="Maximum members per team" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
           )}

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

        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Item...
              </>
            ) : (
              'Add Item'
            )}
          </Button>
           {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can add items.</p>}
        </div>
      </form>
    </Form>
  );
}
