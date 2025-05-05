
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
import { Loader2, CreditCard } from 'lucide-react';
import { participateInEvent } from '@/services/events'; // Placeholder service

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    id: string;
    name: string;
    date: string;
    // Add participation fee if needed
  };
}

// Define the validation schema using Zod (similar to registration, adjust as needed)
// Consider fetching logged-in user data to pre-fill fields
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  branch: z.string().min(1, { message: 'Branch is required.' }).max(100),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
  registrationNumber: z.string().min(5, { message: 'Registration number must be valid.' }).max(20),
  // Add payment related fields if necessary, e.g., transaction ID placeholder
});

type FormData = z.infer<typeof formSchema>;

export function ParticipationModal({ isOpen, onClose, eventDetails }: ParticipationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // TODO: Pre-fill defaultValues with logged-in user data if available
    defaultValues: {
      name: '',
      email: '',
      branch: '',
      semester: undefined,
      registrationNumber: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    console.log('Participation Data:', { eventId: eventDetails.id, ...values });

    try {
      // Placeholder: Call a service to record participation
      const result = await participateInEvent({
        eventId: eventDetails.id,
        eventName: eventDetails.name,
        ...values,
        // Add payment details if collected
      });
      console.log('Participation Result:', result);

      if (result.success) {
        toast({
          title: 'Participation Recorded!',
          description: `You are now registered for ${eventDetails.name}.`,
          variant: 'default',
        });
        form.reset(); // Reset form fields
        onClose(); // Close the modal
      } else {
        throw new Error(result.message || 'Participation failed.');
      }
    } catch (error) {
      console.error('Participation Error:', error);
      toast({
        title: 'Participation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle modal state change
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when closing
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Participate in: {eventDetails.name}</DialogTitle>
          <DialogDescription>
            Confirm your details and complete the payment (if applicable) to participate.
             Date: {eventDetails.date}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {/* User Information Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CSE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="8" placeholder="1-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reg. Number</FormLabel>
                      <FormControl>
                        <Input placeholder="USN/Reg No." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Placeholder Payment Section */}
            <div className="border-t pt-4 mt-4 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary"/> Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                    Payment integration is currently unavailable. This event might be free or require offline payment. Please check event announcements for details.
                </p>
                {/* Add actual payment fields/integration here later */}
                 {/* Example:
                 <FormField name="transactionId" ... />
                 <Button type="button" onClick={initiatePayment}>Pay Now</Button>
                 */}
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                ) : (
                    'Confirm Participation'
                )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
