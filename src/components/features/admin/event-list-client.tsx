
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
import { Trash2, Edit, Loader2, Calendar, MapPin, IndianRupee, ImageIcon, ImageOff } from 'lucide-react'; 
import type { EventData } from '@/services/events'; 
import { deleteEvent } from '@/services/admin'; 
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns'; 
import Image from 'next/image'; // Import next/image

interface EventListClientProps {
  events: EventData[];
}

export function EventListClient({ events: initialEvents }: EventListClientProps) {
  const [events, setEvents] = React.useState<EventData[]>(initialEvents);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null); 
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
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        router.refresh(); 
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
        <ul className="space-y-6">
          {events.map((event) => (
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start p-4 border rounded-lg hover:shadow-md transition-shadow duration-300 gap-4">
              {/* Event Image */}
              <div className="w-full sm:w-1/3 md:w-1/4 aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {event.imageUrl ? (
                    <Image 
                        src={event.imageUrl} 
                        alt={`Image for ${event.name}`} 
                        width={300} // Adjust as needed
                        height={169} // Adjust for 16:9 aspect ratio
                        className="object-cover w-full h-full"
                        data-ai-hint="event poster"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageOff className="h-12 w-12" />
                        <p className="text-xs mt-1">No Image</p>
                    </div>
                )}
              </div>
              
              <div className='flex-1 min-w-0 space-y-1'> 
                <p className="font-semibold text-lg text-primary truncate">{event.name}</p>
                 <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className='flex items-center gap-1'><Calendar className="h-3 w-3"/>
                        {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                        {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}` : ''}
                    </p>
                     <p className='flex items-center gap-1'><MapPin className="h-3 w-3"/> {event.venue || 'N/A'}</p>
                     <p className='flex items-center gap-1'><IndianRupee className="h-3 w-3"/> {formatFee(event.fee)}</p>
                     {event.registrationDeadline && (
                        <p className='flex items-center gap-1 text-destructive/80'><Calendar className="h-3 w-3"/> Reg. Deadline: {format(parseISO(event.registrationDeadline as string), 'MMM d, yyyy')}</p>
                     )}
                 </div>
                 <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0 self-start sm:self-center">
                <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                    <Edit className="mr-1 h-3 w-3"/> Edit (soon)
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" disabled={isDeleting === event.id} className="w-full sm:w-auto">
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
                        <span className="font-semibold"> "{event.name}"</span> and its associated image.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting === event.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                         onClick={() => handleDelete(event.id!, event.name)} 
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
        <p className="text-muted-foreground text-center py-10">No items found. Click "Add New Item" to create one.</p>
      )}
    </>
  );
}
