
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { EventData } from '@/services/events';
import { createTeam, TeamWithMembers } from '@/services/teams';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  onTeamCreated: (team: TeamWithMembers) => void;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Team name must be at least 3 characters.' }).max(50),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTeamModal({ isOpen, onClose, event, onTeamCreated }: CreateTeamModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { userProfile, userId } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: FormData) {
    if (!userId) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createTeam(event.id!, userId, values.name, userProfile?.college_id);
      if (result.success && result.team) {
        onTeamCreated(result.team);
      } else {
        throw new Error(result.message || 'Failed to create team.');
      }
    } catch (error: any) {
      toast({
        title: 'Team Creation Failed',
        description: error.message,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Team for {event.name}</DialogTitle>
          <DialogDescription>
            Enter a name for your team. You'll get a unique code to share with others to join.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Code Crusaders" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
