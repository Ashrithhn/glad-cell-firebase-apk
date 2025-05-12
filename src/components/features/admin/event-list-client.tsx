
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
<<<<<<< HEAD
import { Trash2, Edit, Loader2, Calendar, MapPin, IndianRupee, Clock } from 'lucide-react'; 
import type { EventData } from '@/services/events'; // Supabase type
import { deleteEvent } from '@/services/admin'; // Supabase service
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
=======
import { Trash2, Edit, Loader2, Calendar, MapPin, IndianRupee, ImageIcon, ImageOff } from 'lucide-react'; 
import type { EventData } from '@/services/events'; 
import { deleteEvent } from '@/services/admin'; 
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns'; 
import Image from 'next/image'; // Import next/image
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

interface EventListClientProps {
  events: EventData[];
}

<<<<<<< HEAD
export function EventListClient({ events }: EventListClientProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
=======
export function EventListClient({ events: initialEvents }: EventListClientProps) {
  const [events, setEvents] = React.useState<EventData[]>(initialEvents);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null); 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
  const router = useRouter();

  const handleDelete = async (eventId: string, eventName: string) => {
    if (!eventId) return;
    setIsDeleting(eventId);
    try {
      const result = await deleteEvent(eventId); // Uses Supabase service
      if (result.success) {
        toast({
          title: 'Item Deleted',
          description: `"${eventName}" has been successfully deleted.`,
        });
<<<<<<< HEAD
=======
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        router.refresh(); 
      } else {
        throw new Error(result.message || 'Failed to delete the item.');
      }
    } catch (error) {
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
<<<<<<< HEAD
            <li key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md hover:bg-muted/50 gap-4">
              <div className='flex-1 min-w-0'>
                <p className="font-semibold text-lg truncate text-primary">{event.name}</p>
                 <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
=======
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
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
                    <p className='flex items-center gap-1'><Calendar className="h-3 w-3"/>
                        {/* Use snake_case field names from Supabase EventData */}
                        {event.start_date ? format(parseISO(event.start_date), 'MMM d, yyyy') : 'N/A'}
                        {event.end_date && event.start_date !== event.end_date ? ` - ${format(parseISO(event.end_date), 'MMM d, yyyy')}` : ''}
                    </p>
                     <p className='flex items-center gap-1'><MapPin className="h-3 w-3"/> {event.venue || 'N/A'}</p>
                     <p className='flex items-center gap-1'><IndianRupee className="h-3 w-3"/> {formatFee(event.fee)}</p>
<<<<<<< HEAD
                     {event.created_at && (
                        <p className='flex items-center gap-1 text-muted-foreground/80'>
                            <Clock className="h-3 w-3"/>
                            Created: {format(parseISO(event.created_at), 'MMM d, yyyy, p')}
                        </p>
                     )}
                 </div>
              </div>
              <div className="flex-shrink-0 flex gap-2 pt-2 sm:pt-0">
                <Button variant="outline" size="sm" disabled className="mr-2">
=======
                     {event.registrationDeadline && (
                        <p className='flex items-center gap-1 text-destructive/80'><Calendar className="h-3 w-3"/> Reg. Deadline: {format(parseISO(event.registrationDeadline as string), 'MMM d, yyyy')}</p>
                     )}
                 </div>
                 <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0 self-start sm:self-center">
                <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
                    <Edit className="mr-1 h-3 w-3"/> Edit (soon)
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
<<<<<<< HEAD
                     <Button variant="destructive" size="sm" disabled={isDeleting === event.id}>
                         {isDeleting === event.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3"/>}
=======
                     <Button variant="destructive" size="sm" disabled={isDeleting === event.id} className="w-full sm:w-auto">
                         {isDeleting === event.id ? (
                             <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                         ) : (
                            <Trash2 className="mr-1 h-3 w-3"/>
                         )}
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
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
<<<<<<< HEAD
                      <AlertDialogAction onClick={() => handleDelete(event.id!, event.name)} disabled={isDeleting === event.id} className="bg-destructive hover:bg-destructive/90">
=======
                      <AlertDialogAction
                         onClick={() => handleDelete(event.id!, event.name)} 
                         disabled={isDeleting === event.id}
                         className="bg-destructive hover:bg-destructive/90"
                      >
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
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
