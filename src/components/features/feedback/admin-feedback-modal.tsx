
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { submitFeedback, FeedbackData } from '@/services/feedback';

interface AdminFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackAdded: (newFeedback: FeedbackData) => void;
}

const formSchema = z.object({
  author_name: z.string().min(2, 'Author name is required.').max(100),
  author_designation: z.string().min(2, 'Designation is required.').max(100),
  message: z.string().min(10, 'Feedback must be at least 10 characters.').max(1000),
});

type FormData = z.infer<typeof formSchema>;

export function AdminFeedbackModal({ isOpen, onClose, onFeedbackAdded }: AdminFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author_name: '',
      author_designation: '',
      message: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        message: values.message,
        author_name: values.author_name,
        author_designation: values.author_designation,
        is_approved: true, // Admin-added feedback is pre-approved
      };
      
      const result = await submitFeedback(payload);

      if (result.success && result.feedback) {
        toast({ title: 'Feedback Added!', description: 'The new testimonial has been saved and is live.' });
        onFeedbackAdded(result.feedback);
        form.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Testimonial</DialogTitle>
          <DialogDescription>
            Manually add a testimonial. It will be automatically approved and displayed on the homepage.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author's Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Dr. Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author_designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author's Designation/Role</FormLabel>
                  <FormControl><Input placeholder="e.g., Professor of CSE, HOD" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonial Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="The testimonial text..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Testimonial
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
