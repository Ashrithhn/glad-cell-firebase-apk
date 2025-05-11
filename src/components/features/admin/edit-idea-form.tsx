
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { updateIdea } from '@/services/ideas';
import type { IdeaData } from '@/services/ideas';
import { useRouter } from 'next/navigation';
import { Loader2, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const ideaStatusEnum = z.enum(['Pending', 'Approved', 'Rejected', 'Implemented']);

// Schema for editing, similar to adding but ID is external
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(2000),
  submitterName: z.string().optional(),
  department: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
  status: ideaStatusEnum,
});

type FormData = z.infer<typeof formSchema>;

interface EditIdeaFormProps {
  currentIdea: IdeaData;
}

export function EditIdeaForm({ currentIdea }: EditIdeaFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentIdea.title || '',
      description: currentIdea.description || '',
      submitterName: currentIdea.submitterName || '',
      department: currentIdea.department || '',
      tags: currentIdea.tags || [],
      status: currentIdea.status || 'Pending',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to update ideas.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!currentIdea.id) {
      toast({ title: "Error", description: "Idea ID is missing. Cannot update.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const ideaPayload: Partial<Omit<IdeaData, 'id' | 'createdAt'>> = {
        title: values.title,
        description: values.description,
        submitterName: values.submitterName || undefined,
        department: values.department || undefined,
        tags: values.tags,
        status: values.status,
      };
      
      const result = await updateIdea(currentIdea.id, ideaPayload);

      if (result.success) {
        toast({
          title: 'Idea Updated Successfully!',
          description: `"${values.title}" has been saved.`,
        });
        router.push('/admin/ideas');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update idea.');
      }
    } catch (error) {
      toast({
        title: 'Failed to Update Idea',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const isDisabled = isSubmitting || authLoading || !isAdmin;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isDisabled} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idea Title</FormLabel>
                <FormControl><Input placeholder="e.g., AI Campus Navigator" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idea Description</FormLabel>
                <FormControl><Textarea placeholder="Detailed description of the idea..." {...field} rows={6} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="submitterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submitter Name (Optional)</FormLabel>
                  <FormControl><Input placeholder="Name of the person who submitted the idea" {...field} /></FormControl>
                  <FormDescription>If submitted by a specific student or admin themselves.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g., CSE, Mechanical" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/> Tags (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., AI, Sustainability, EdTech (comma-separated)" 
                    {...field} 
                    value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>Enter tags separated by commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select idea status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ideaStatusEnum.options.map(statusValue => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {statusValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto" disabled={isDisabled}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving Idea...' : 'Save Idea'}
          </Button>
          {!isAdmin && !authLoading && <p className="text-sm text-destructive mt-2">Only administrators can update ideas.</p>}
        </div>
      </form>
    </Form>
  );
}
