
'use client'; 

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee, Download, FileText } from 'lucide-react'; 
import NextImage from 'next/image'; 
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isPast } from 'date-fns'; 

export default function ProgramsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventData | null>(null); 
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [eventsError, setEventsError] = React.useState<string | null>(null);

  const { userId, isAdmin, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      setEventsError(null);
      const result = await getEvents(); 
      if (result.success && result.events) {
        const sortedEvents = result.events.sort((a, b) => {
          const aIsPast = a.registration_deadline ? isPast(parseISO(a.registration_deadline)) : isPast(parseISO(a.start_date));
          const bIsPast = b.registration_deadline ? isPast(parseISO(b.registration_deadline)) : isPast(parseISO(b.start_date));
          
          if (aIsPast && !bIsPast) return 1;
          if (!aIsPast && bIsPast) return -1;
          
          // Sort by start_date descending, then by registration_deadline descending if start_dates are same
          const startDateComparison = parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime();
          if (startDateComparison !== 0) return startDateComparison;

          const regDeadlineA = a.registration_deadline ? parseISO(a.registration_deadline).getTime() : 0;
          const regDeadlineB = b.registration_deadline ? parseISO(b.registration_deadline).getTime() : 0;
          return regDeadlineB - regDeadlineA;
        });
        setEvents(sortedEvents);
      } else {
        setEventsError(result.message || 'Failed to load programs/events.');
      }
      setLoadingEvents(false);
    }
    loadEvents();
  }, []);

  const isLoggedIn = !authLoading && !!userId;

  const handleParticipateClick = (event: EventData) => {
    const registrationDeadline = event.registration_deadline ? parseISO(event.registration_deadline) : parseISO(event.start_date);
    if (isPast(registrationDeadline)) {
      toast({
        title: "Registration Closed",
        description: "The registration deadline for this event has passed.",
        variant: "destructive",
      });
      return;
    }

    if (isLoggedIn && !isAdmin) {
      const formattedStartDate = event.start_date ? format(parseISO(event.start_date as string), 'PPP') : 'N/A';
      setSelectedEvent({ ...event, start_date: formattedStartDate });
      setIsModalOpen(true);
    } else if (isAdmin) {
      toast({ title: "Admin View", description: "Admins cannot participate.", variant: "default" });
    } else { // Not logged in
      toast({ title: "Login Required", description: "Please login to participate in events.", variant: "default" });
      router.push('/login?redirect=/programs');
    }
  };

  const formatFee = (feeInPaisa: number) => {
    if (feeInPaisa === 0) return "Free";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
  };

  if (authLoading || loadingEvents) { // Show skeleton if either auth or events are loading
    return (
      <div className="space-y-12 max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden shadow-lg">
              <Skeleton className="w-full h-56 sm:h-64 md:h-72" />
              <CardHeader className="border-b bg-muted/30">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-1" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Skeleton className="h-5 w-2/3" /> <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-1/2" /> <Skeleton className="h-5 w-2/3" />
                </div>
                <Skeleton className="h-10 w-40 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Our Programs & Events</h1>
        <p className="text-muted-foreground mt-2">
          Initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

       {eventsError && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Items</AlertTitle>
            <AlertDescription>{eventsError}</AlertDescription>
         </Alert>
       )}

      {!loadingEvents && !eventsError && events.length > 0 && (
        events.map((event) => {
          const registrationDeadline = event.registration_deadline ? parseISO(event.registration_deadline) : parseISO(event.start_date);
          const isRegistrationOver = isPast(registrationDeadline);

          return (
            <Card key={event.id} id={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 scroll-mt-20">
              {event.image_url && (
                <div className="relative w-full h-56 sm:h-64 md:h-72">
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
                              {event.end_date && event.start_date !== event.end_date ? ` - ${format(parseISO(event.end_date as string), 'MMM d, yyyy')}`: ''}
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
                           <div className={`flex items-center gap-2 text-muted-foreground ${isRegistrationOver ? 'text-destructive' : ''}`}>
                              <Clock className={`h-4 w-4 flex-shrink-0 ${isRegistrationOver ? 'text-destructive' : 'text-primary'}`} />
                              <span>Register by: {format(parseISO(event.registration_deadline as string), 'MMM d, yyyy')} {isRegistrationOver && "(Closed)"}</span>
                          </div>
                       )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                           <span>{event.event_type === 'group' ? `Team (${event.min_team_size || 'N/A'}-${event.max_team_size || 'N/A'} members)` : 'Individual'}</span>
                        </div>
                  </div>

                {event.rules && (
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-base font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Rules/Guidelines (Text)</h3>
                     <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm pl-2">
                       {event.rules.split('\\n').map((rule, index) => rule.trim() && <li key={index}>{rule.trim()}</li>)}
                     </ul>
                  </div>
                )}

                {event.rules_pdf_url && (
                    <div className="pt-3 border-t">
                        <Button variant="outline" asChild>
                            <a href={event.rules_pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Download Rules PDF
                            </a>
                        </Button>
                    </div>
                )}

                 <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6">
                     {isRegistrationOver ? (
                        <Button disabled className="flex-shrink-0">
                            Registration Closed
                        </Button>
                     ) : isLoggedIn && !isAdmin ? (
                          <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                              <UserCheck className="mr-2 h-4 w-4" /> Participate Now
                          </Button>
                      ) : ( 
                         <Button onClick={() => handleParticipateClick(event)} className="flex-shrink-0">
                              <LogIn className="mr-2 h-4 w-4" /> 
                              {isAdmin ? "Admin View (Cannot Participate)" : "Login to Participate"}
                         </Button>
                     )}
                     <p className="text-sm text-muted-foreground italic flex-1">
                      {isRegistrationOver ? "Registration for this event has ended." : 
                       isLoggedIn && !isAdmin ? `Click to register. Fee: ${formatFee(event.fee)}.` : 
                       isAdmin ? "Admins cannot participate in events." : "Please login to participate."}
                    </p>
                 </div>
              </CardContent>
            </Card>
          );
        })
      )}

       {!loadingEvents && !eventsError && events.length === 0 && (
         <div className="text-center pt-8">
            <h2 className="text-2xl font-semibold text-primary">No Programs or Events Announced Yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for upcoming activities!</p>
         </div>
       )}

       {selectedEvent && (
         <ParticipationModal
            isOpen={isModalOpen}
            onClose={() => {setIsModalOpen(false); setSelectedEvent(null);}} 
            eventDetails={{ 
                id: selectedEvent.id || 'unknown-event',
                name: selectedEvent.name,
                date: selectedEvent.start_date as string, 
                fee: selectedEvent.fee
            }}
         />
       )}
    </div>
  );
}
    