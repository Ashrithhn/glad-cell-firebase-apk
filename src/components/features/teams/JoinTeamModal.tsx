
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
import { requestToJoinTeam } from '@/services/teams';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  onJoinRequestSent: () => void;
}

const formSchema = z.object({
  code: z.string().length(6, { message: 'Join code must be 6 characters long.' }).regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers.'),
});

type FormData = z.infer<typeof formSchema>;

export function JoinTeamModal({ isOpen, onClose, event, onJoinRequestSent }: JoinTeamModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { userId } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '' },
  });

  async function onSubmit(values: FormData) {
    if (!userId) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await requestToJoinTeam(values.code, userId);
      if (result.success) {
        toast({
            title: "Request Sent!",
            description: "Your request to join the team has been sent to the team leader for approval."
        });
        onJoinRequestSent(); // Callback to refresh or close modal
      } else {
        throw new Error(result.message || 'Failed to send join request.');
      }
    } catch (error: any) {
      toast({
        title: 'Could Not Send Request',
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
          <DialogTitle>Join a Team for {event.name}</DialogTitle>
          <DialogDescription>
            Enter the 6-character code you received from your team leader to request to join.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Join Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABC123"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
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
                Request to Join
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
