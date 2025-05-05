
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Loader2, Calendar, MapPin, IndianRupee } from 'lucide-react'; // Added icons
import type { EventData } from '@/services/events'; // Import type
import { deleteEvent } from '@/services/admin'; // Import delete action
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns'; // For date formatting

interface EventListClientProps {
  events: EventData[];
}

export function EventListClient({ events }: EventListClientProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null); // Store ID of event being deleted
  const router = useRouter();

  const handleDelete = async (eventId: string, eventName: string) => {
    setIsDeleting(eventId);
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast({
          title: 'Item Deleted',
          description: `"${eventName}" has been successfully deleted.`,
          variant: 'default',
        });
        // Re-fetching or relying on revalidation might be better in complex scenarios
        router.refresh(); // Refresh the page to show updated list
      } else {
        throw new Error(result.message || 'Failed to delete the item.');
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast({
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

   const formatFee = (feeInPaisa: number) => {
     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
   }

  return (
    <>
      {events.length > 0 ? (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md hover:bg-muted/50 gap-4">
              <div className='flex-1 min-w-0'> {/* Ensure content doesn't overflow */}
                <p className="font-semibold text-lg truncate">{event.name}</p>
                {/* Display core details concisely */}
                 <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p className='flex items-center gap-1'><Calendar className="h-3 w-3"/>
                        {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                        {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}` : ''}
                    </p>
                     <p className='flex items-center gap-1'><MapPin className="h-3 w-3"/> {event.venue || 'N/A'}</p>
                     <p className='flex items-center gap-1'><IndianRupee className="h-3 w-3"/> {formatFee(event.fee)}</p>
                 </div>
                 {/* Optional: Show description snippet */}
                 {/* <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p> */}
              </div>
              <div className="flex-shrink-0 flex gap-2 pt-2 sm:pt-0">
                {/* TODO: Add Edit functionality */}
                <Button variant="outline" size="sm" disabled className="mr-2">
                    <Edit className="mr-1 h-3 w-3"/> Edit (soon)
                </Button>

                 {/* Delete Button with Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" disabled={isDeleting === event.id}>
                         {isDeleting === event.id ? (
                             <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                         ) : (
                            <Trash2 className="mr-1 h-3 w-3"/>
                         )}
                        Delete
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the item
                        <span className="font-semibold"> "{event.name}"</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting === event.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                         onClick={() => handleDelete(event.id!, event.name)} // Pass ID and name
                         disabled={isDeleting === event.id}
                         className="bg-destructive hover:bg-destructive/90"
                      >
                         {isDeleting === event.id ? 'Deleting...' : 'Yes, delete it'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-center">No items found.</p>
      )}
    </>
  );
}

