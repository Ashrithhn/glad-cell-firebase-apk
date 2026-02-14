
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
import { submitIdea } from '@/services/ideas';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Tag } from 'lucide-react';

interface IdeaSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaSubmitted: () => void;
}

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(150),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }).max(2000),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function IdeaSubmissionModal({ isOpen, onClose, onIdeaSubmitted }: IdeaSubmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { userId } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    },
  });

  async function onSubmit(values: FormData) {
    if (!userId) {
      toast({ title: "Error", description: "Authentication failed. Please log in and try again.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const result = await submitIdea({
        title: values.title,
        description: values.description,
        tags: tagsArray,
      });

      if (result.success) {
        form.reset();
        onIdeaSubmitted();
      } else {
        throw new Error(result.message || 'Failed to submit idea.');
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Your Innovative Idea</DialogTitle>
          <DialogDescription>
            Share your concept with the GLAD CELL community. Your idea will be reviewed by administrators.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idea Title</FormLabel>
                  <FormControl><Input placeholder="e.g., AI-Powered Campus Waste Management" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl><Textarea placeholder="Explain your idea. What problem does it solve? Who is it for? How does it work?" {...field} rows={8} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/> Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., AI, Sustainability, EdTech" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter relevant keywords separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Idea
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
