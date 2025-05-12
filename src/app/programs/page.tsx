
'use client'; // Still client component for modal state and participation logic

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, Lightbulb, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee } from 'lucide-react'; // Added icons
import NextImage from 'next/image'; // For displaying image
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns'; 


// Define Event Details Separately (Example, could be fetched too)
// This is now less relevant as we fetch all events, but keep for modal structure
const specificEventDetails = {
    id: 'kickstart-2025', // This ID might need to be dynamic based on the selected event
    name: 'Startup Ideation Kickstart', // Default/Placeholder Name
    date: '', // Will be set dynamically
    fee: 0, // Will be set dynamically
};


export default function ProgramsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventData | null>(null); // Store the event to participate in
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [eventsError, setEventsError] = React.useState<string | null>(null);

  const { user, userId, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch events on component mount
  React.useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      setEventsError(null);
      const result = await getEvents(); 
      if (result.success && result.events) {
        setEvents(result.events);
      } else {
        setEventsError(result.message || 'Failed to load programs/events.');
      }
      setLoadingEvents(false);
    }
    loadEvents();
  }, []);


  // Determine login status based on auth context
  const isLoggedIn = !authLoading && (!!userId || isAdmin);

  // Handle opening the participation modal for a SPECIFIC event
  const handleParticipateClick = (event: EventData) => {
     if (isLoggedIn && !isAdmin) { // Only allow logged-in non-admin users
        // Format dates before passing to modal if needed, or format inside modal
        const formattedStartDate = event.start_date ? format(parseISO(event.start_date as string), 'PPP') : 'N/A';

        setSelectedEvent({
            ...event,
            start_date: formattedStartDate, // Pass formatted date if needed by modal
        });
        setIsModalOpen(true);
     } else if (isAdmin) {
         toast({
             title: "Admin View",
             description: "Admins cannot participate.",
             variant: "default",
         });
     }
     else {
         router.push('/login');
     }
  };

  const formatFee = (feeInPaisa: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Our Programs & Events</h1>
        <p className="text-muted-foreground mt-2">
          Initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

       {/* Loading State */}
       {loadingEvents && (
         <div className='space-y-6'>
             <Skeleton className="h-72 w-full rounded-lg" /> {/* Increased height for image */}
             <Skeleton className="h-56 w-full rounded-lg" /> {/* Increased height for image */}
         </div>
       )}

       {/* Error State */}
       {eventsError && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Items</AlertTitle>
            <AlertDescription>{eventsError}</AlertDescription>
         </Alert>
       )}

      {/* Display Programs/Events */}
      {!loadingEvents && !eventsError && events.length > 0 && (
        events.map((event) => (
          <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {event.image_url && (
              <div className="relative w-full h-56 sm:h-64 md:h-72"> {/* Responsive height */}
                <NextImage
                  src={event.image_url}
                  alt={event.name || 'Event Image'}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                  data-ai-hint="event program"
                />
              </div>
            )}
            <CardHeader className={`border-b bg-muted/30 ${event.image_url ? 'pt-4' : ''}`}>
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                 {event.event_type === 'group' ? <Users className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                 {event.name}
              </CardTitle>
              <CardDescription className="pt-1 line-clamp-3"> 
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                            {event.start_date ? format(parseISO(event.start_date as string), 'MMM d, yyyy') : 'N/A'}
                            {event.end_date && event.start_date !== event.end_date ? ` - ${format(parseISO(event.end_date), 'MMM d, yyyy')}`: ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{event.venue || 'N/A'}</span>
                    </div>

                     <div className="flex items-center gap-2 text-muted-foreground">
                        <IndianRupee className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{formatFee(event.fee)}</span>
                    </div>

                     {event.registration_deadline && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-destructive flex-shrink-0" />
                            <span>Register by: {format(parseISO(event.registration_deadline as string), 'MMM d, yyyy')}</span>
                        </div>
                     )}

                      <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                         <span>{event.event_type === 'group' ? `Team (${event.min_team_size || 'N/A'}-${event.max_team_size || 'N/A'} members)` : 'Individual'}</span>
                      </div>
                </div>


              {event.rules && (
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-base font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Rules/Guidelines</h3>
                   <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm pl-2">
                     {event.rules.split('\n').map((rule, index) => rule.trim() && <li key={index}>{rule.trim()}</li>)}
                   </ul>
                </div>
              )}


               <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6">
                   {authLoading ? (
                        <Skeleton className="h-10 w-40" /> 
                   ) : isLoggedIn && !isAdmin ? (
                        <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                            <UserCheck className="mr-2 h-4 w-4" /> Participate Now
                        </Button>
                    ) : ( 
                       <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                            <LogIn className="mr-2 h-4 w-4" /> 
                            {isAdmin ? "Admin View" : "Login to Participate"}
                       </Button>
                   )}
                   <p className="text-sm text-muted-foreground italic flex-1">
                    {isLoggedIn && !isAdmin ? "Click to register your participation. Requires payment completion (if applicable)." : isAdmin ? "Admins cannot participate." : "Please login to participate."}
                  </p>
               </div>

            </CardContent>
          </Card>
        ))
      )}

       {/* Message if no programs are found */}
      {!loadingEvents && !eventsError && events.length === 0 && (
         <div className="text-center pt-8">
            <h2 className="text-2xl font-semibold text-primary">No Programs or Events Announced Yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for upcoming activities!</p>
         </div>
      )}


       {/* Participation Modal - Rendered conditionally based on selectedEvent */}
       {selectedEvent && (
         <ParticipationModal
            isOpen={isModalOpen}
            onClose={() => {setIsModalOpen(false); setSelectedEvent(null);}} 
            eventDetails={{ 
                id: selectedEvent.id || 'unknown-event',
                name: selectedEvent.name,
                date: selectedEvent.start_date as string, // Use start_date from EventData
                fee: selectedEvent.fee
            }}
         />
       )}
    </div>
  );
}
