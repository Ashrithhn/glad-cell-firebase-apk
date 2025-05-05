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
import { Loader2 } from 'lucide-react';
import { addProgram } from '@/services/programs'; // Use the new program service
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // For admin check

// Define the validation schema using Zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Program name must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  goals: z.string().min(10, { message: 'Goals must be at least 10 characters.' }).max(1000),
  duration: z.string().optional(), // Optional field
  targetAudience: z.string().optional(), // Optional field
});

type FormData = z.infer<typeof formSchema>;

export function AddProgramForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth(); // Use auth context for admin check

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      goals: '',
      duration: '',
      targetAudience: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('[Admin Add Program] Form Data:', values);

     // Basic check if user is admin (enhance with server-side check)
    if (!isAdmin) {
        toast({ title: "Unauthorized", description: "You do not have permission to add programs.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      // Data is already in the correct format for addProgram action
      const result = await addProgram(values); // Call the server action

      if (result.success) {
        toast({
          title: 'Program Added Successfully!',
          description: `Program "${values.name}" has been created.`,
          variant: 'default',
        });
        form.reset(); // Clear the form
        router.push('/admin/programs'); // Redirect to the programs list
        router.refresh(); // Optional: Force refresh data on the target page
      } else {
        throw new Error(result.message || 'Failed to add program.');
      }
    } catch (error) {
      console.error('[Admin Add Program] Error:', error);
      toast({
        title: 'Failed to Add Program',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Disable form if auth is loading or user is not admin
  const isDisabled = isSubmitting || authLoading || !isAdmin;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Wrap fields in fieldset for easy disabling */}
        <fieldset disabled={isDisabled} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Program Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mentorship Initiative" {...field} />
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
                  <Textarea placeholder="Describe the program, its purpose, activities, etc." {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="goals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goals</FormLabel>
                <FormControl>
                  <Textarea placeholder="List the main objectives and expected outcomes of the program. (One goal per line recommended)" {...field} rows={4} />
                </FormControl>
                 <FormDescription>
                   What does this program aim to achieve?
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ongoing, 6 Months, Academic Year 2025-26" {...field} />
                </FormControl>
                 <FormDescription>
                   Specify the length or timeframe of the program.
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., All Students, CSE Students, Final Year Students" {...field} />
                </FormControl>
                 <FormDescription>
                   Who is this program primarily for?
                 </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </fieldset>

        {/* Submit Button */}
        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Program...
              </>
            ) : (
              'Add Program'
            )}
          </Button>
           {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can add programs.</p>}
        </div>
      </form>
    </Form>
  );
}