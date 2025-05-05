
'use client'; // Still client component for modal state and participation logic

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, Lightbulb, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee } from 'lucide-react'; // Added icons
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/events'; // Use the renamed service function
import type { EventData } from '@/services/events'; // Use the renamed type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns'; // For formatting dates


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
      const result = await getEvents(); // Use the renamed service
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
        const formattedStartDate = event.startDate ? format(parseISO(event.startDate as string), 'PPP') : 'N/A';

        setSelectedEvent({
            ...event,
            startDate: formattedStartDate, // Pass formatted date if needed by modal
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
         toast({
             title: "Login Required",
             description: "Please log in or register to participate.",
             variant: "destructive",
         });
         router.push('/login'); // Redirect to login page
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
             <Skeleton className="h-64 w-full rounded-lg" />
             <Skeleton className="h-48 w-full rounded-lg" />
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
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                 {/* Use different icons based on type if available, default to GraduationCap/CalendarCheck */}
                 {event.eventType ? <CalendarCheck className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                 {event.name}
              </CardTitle>
              <CardDescription className="pt-1 line-clamp-3"> {/* Limit description lines */}
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {/* Start & End Date */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                            {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                            {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}`: ''}
                        </span>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{event.venue || 'N/A'}</span>
                    </div>

                     {/* Fee */}
                     <div className="flex items-center gap-2 text-muted-foreground">
                        <IndianRupee className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{formatFee(event.fee)}</span>
                    </div>

                     {/* Registration Deadline */}
                     {event.registrationDeadline && (
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-destructive flex-shrink-0" />
                            <span>Register by: {format(parseISO(event.registrationDeadline as string), 'MMM d, yyyy')}</span>
                        </div>
                     )}

                     {/* Participation Type & Team Size */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                         <span>{event.eventType === 'group' ? `Group (${event.minTeamSize}-${event.maxTeamSize} members)` : 'Individual'}</span>
                      </div>
                </div>


              {/* Display Rules/Guidelines if available */}
              {event.rules && (
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-base font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Rules/Guidelines</h3>
                  {/* Split rules by newline and display as list */}
                   <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm pl-2">
                     {event.rules.split('\n').map((rule, index) => rule.trim() && <li key={index}>{rule.trim()}</li>)}
                   </ul>
                </div>
              )}


              {/* Participation Button Section */}
              {/* Conditionally render Participate button only if fee > 0 ? Adapt as needed */}
              {/* For now, show Participate button for all */}
               <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6">
                   {authLoading ? (
                        <Skeleton className="h-10 w-40" /> // Show skeleton while loading auth state
                   ) : isLoggedIn && !isAdmin ? (
                        <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                            <UserCheck className="mr-2 h-4 w-4" /> Participate Now
                        </Button>
                    ) : (
                       <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                            <LogIn className="mr-2 h-4 w-4" /> Login to Participate
                       </Button>
                   )}
                   <p className="text-sm text-muted-foreground italic flex-1">
                    Click to register your participation. Requires login and payment completion (if applicable). Admins cannot participate.
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
            onClose={() => {setIsModalOpen(false); setSelectedEvent(null);}} // Clear selected event on close
            eventDetails={{ // Pass the details of the selected event
                id: selectedEvent.id || 'unknown-event',
                name: selectedEvent.name,
                date: selectedEvent.startDate as string, // Pass formatted or raw date string
                fee: selectedEvent.fee
            }}
         />
       )}
    </div>
  );
}
