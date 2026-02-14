
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
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { submitFeedback } from '@/services/feedback';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  author_name: z.string().optional(),
  message: z.string().min(10, 'Feedback must be at least 10 characters.').max(1000),
  submission_type: z.enum(['anonymous', 'named'], { required_error: 'Please select a submission type.' }),
});

type FormData = z.infer<typeof formSchema>;

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { userProfile } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author_name: '',
      message: '',
      submission_type: 'anonymous',
    },
  });

  const submissionType = form.watch('submission_type');

  React.useEffect(() => {
    if (submissionType === 'named' && userProfile?.name) {
      form.setValue('author_name', userProfile.name);
    } else {
      form.setValue('author_name', '');
    }
  }, [submissionType, userProfile, form]);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        message: values.message,
        author_name: values.submission_type === 'named' ? values.author_name : 'Anonymous',
        user_id: userProfile?.id || null,
      };
      
      const result = await submitFeedback(payload);

      if (result.success) {
        toast({ title: 'Feedback Submitted!', description: 'Thank you for your valuable input.' });
        form.reset();
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts on our app or events. Your feedback helps us improve.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's on your mind?" {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submission_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Type</FormLabel>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="anonymous" /></FormControl>
                      <FormLabel className="font-normal">Submit Anonymously</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="named" disabled={!userProfile} /></FormControl>
                      <FormLabel className="font-normal">Use My Name</FormLabel>
                    </FormItem>
                  </RadioGroup>
                  {!userProfile && <FormMessage>You must be logged in to submit feedback with your name.</FormMessage>}
                </FormItem>
              )}
            />
            {submissionType === 'named' && (
              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} disabled /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
