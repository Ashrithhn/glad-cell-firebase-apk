
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
import { Edit, Loader2, Calendar, MapPin, IndianRupee, ImageOff, Clock, Building, Users, Archive, QrCode } from 'lucide-react'; 
import type { EventData } from '@/services/events'; 
import { archiveEvent } from '@/services/admin'; 
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns'; 
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface EventListClientProps {
  events: EventData[];
}

export function EventListClient({ events: initialEvents }: EventListClientProps) {
  const [events, setEvents] = React.useState<EventData[]>(initialEvents);
  const [isArchiving, setIsArchiving] = React.useState<string | null>(null); 
  const router = useRouter();

  const handleArchive = async (eventId: string, eventName: string) => {
    if (!eventId) return;
    setIsArchiving(eventId);
    try {
      const result = await archiveEvent(eventId);
      if (result.success) {
        toast({
          title: 'Event Archived',
          description: `"${eventName}" has been successfully archived.`,
        });
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === eventId ? { ...event, status: 'Archived' } : event
            )
        );
        router.refresh(); 
      } else {
        throw new Error(result.message || 'Failed to archive the item.');
      }
    } catch (error) {
      toast({
        title: 'Archiving Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsArchiving(null);
    }
  };

   const formatFee = (feeInPaisa: number) => {
     if (feeInPaisa === 0) return "Free";
     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
   }

  return (
    <>
      {events.length > 0 ? (
        <ul className="space-y-6">
          {events.map((event) => (
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start p-4 border rounded-lg hover:shadow-md transition-shadow duration-300 gap-4">
              <div className="w-full sm:w-1/3 md:w-1/4 aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {event.image_url ? (
                    <Image 
                        src={event.image_url} 
                        alt={`Image for ${event.name}`} 
                        width={300}
                        height={169}
                        className="object-cover w-full h-full"
                        unoptimized
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
                <p className="font-semibold text-lg text-primary truncate flex items-center gap-2">
                    {event.name}
                    {event.status === 'Archived' && <Badge variant="secondary">Archived</Badge>}
                    {event.status === 'Cancelled' && <Badge variant="destructive">Cancelled</Badge>}
                </p>
                 <div className="text-sm text-muted-foreground space-y-1">
                    <p className='flex items-center gap-1.5'><Building className="h-4 w-4"/> {event.college_name || 'N/A'}</p>
                    <p className='flex items-center gap-1.5'><Calendar className="h-4 w-4"/>
                        {event.start_date ? format(parseISO(event.start_date as string), 'MMM d, yyyy') : 'N/A'}
                        {event.end_date && event.start_date !== event.end_date ? ` - ${format(parseISO(event.end_date as string), 'MMM d, yyyy')}` : ''}
                    </p>
                     <p className='flex items-center gap-1.5'><MapPin className="h-4 w-4"/> {event.venue || 'N/A'}</p>
                     <p className='flex items-center gap-1.5'><IndianRupee className="h-4 w-4"/> {formatFee(event.fee)}</p>
                     {event.registration_deadline && (
                        <p className='flex items-center gap-1.5 text-destructive/80'><Clock className="h-4 w-4"/> Reg. Deadline: {format(parseISO(event.registration_deadline as string), 'MMM d, yyyy')}</p>
                     )}
                 </div>
                 <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0 self-start sm:self-center">
                 <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                    <Link href={`/admin/attendance?eventId=${event.id}`}>
                        <QrCode className="mr-1 h-3 w-3"/> Scan
                    </Link>
                 </Button>
                 <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={`/admin/events/${event.id}/participants`}>
                        <Users className="mr-1 h-3 w-3"/> Participants
                    </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={`/admin/events/${event.id}/edit`}>
                        <Edit className="mr-1 h-3 w-3"/> Edit
                    </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" disabled={isArchiving === event.id || event.status === 'Archived'} className="w-full sm:w-auto">
                         {isArchiving === event.id ? (
                             <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                         ) : (
                            <Archive className="mr-1 h-3 w-3"/>
                         )}
                        {event.status === 'Archived' ? 'Archived' : 'Archive'}
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to archive this event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will hide the event from the public "Our Programs" page. It will NOT delete the event data, and you can still view it here.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isArchiving === event.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                         onClick={() => handleArchive(event.id!, event.name)} 
                         disabled={isArchiving === event.id}
                         className="bg-destructive hover:bg-destructive/90"
                      >
                         {isArchiving === event.id ? 'Archiving...' : 'Yes, archive it'}
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
