
'use client'; 

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { CalendarCheck, Target, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee, Download, FileText } from 'lucide-react'; 
import NextImage from 'next/image'; 
=======
import { CalendarCheck, Target, Lightbulb, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee, ImageOff } from 'lucide-react';
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isPast } from 'date-fns'; 
<<<<<<< HEAD
=======
import Image from 'next/image';

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

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

<<<<<<< HEAD
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
=======
  const isLoggedIn = !authLoading && (!!userId || isAdmin);

  const handleParticipateClick = (event: EventData) => {
     if (isLoggedIn && !isAdmin) { 
        
        if (event.registrationDeadline && isPast(parseISO(event.registrationDeadline as string))) {
            toast({
                title: "Registration Closed",
                description: `Registration for "${event.name}" has ended.`,
                variant: "destructive",
            });
            return;
        }

        const formattedStartDate = event.startDate ? format(parseISO(event.startDate as string), 'PPP') : 'N/A';
        setSelectedEvent({
            ...event,
            startDate: formattedStartDate, 
        });
        setIsModalOpen(true);
     } else if (isAdmin) {
         toast({
             title: "Admin View",
             description: "Admins cannot participate in events directly.",
             variant: "default",
         });
     }
     else {
         router.push('/login');
     }
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
  };

  const formatFee = (feeInPaisa: number) => {
    if (feeInPaisa === 0) return "Free";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
  };
<<<<<<< HEAD

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
=======
>>>>>>> 591e8d1 (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Our Programs & Events</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

<<<<<<< HEAD
=======
       {loadingEvents && (
         <div className='space-y-8'>
             <Skeleton className="h-72 w-full rounded-lg" />
             <Skeleton className="h-64 w-full rounded-lg" />
         </div>
       )}

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
       {eventsError && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Items</AlertTitle>
            <AlertDescription>{eventsError}</AlertDescription>
         </Alert>
       )}

      {!loadingEvents && !eventsError && events.length > 0 && (
        events.map((event) => {
<<<<<<< HEAD
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
=======
            const isDeadlinePast = event.registrationDeadline && isPast(parseISO(event.registrationDeadline as string));
            return (
          <Card key={event.id} id={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {event.imageUrl ? (
                <Image 
                    src={event.imageUrl} 
                    alt={`Image for ${event.name}`}
                    width={400} 
                    height={225} 
                    className="object-cover w-full h-full"
                    data-ai-hint="conference team"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                    <ImageOff className="h-16 w-16" />
                    <p className="text-sm mt-2">No Image Available</p>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow">
                <CardHeader className="border-b md:border-b-0 md:border-l bg-background/50">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    {event.eventType === 'group' ? <Users className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                    {event.name}
                </CardTitle>
                <CardDescription className="pt-1 line-clamp-3"> 
                    {event.description}
                </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-grow">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarCheck className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>
                                {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                                {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}`: ''}
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
                        {event.registrationDeadline && (
                            <div className={`flex items-center gap-2 text-muted-foreground ${isDeadlinePast ? 'text-destructive' : ''}`}>
                                <Clock className={`h-4 w-4 flex-shrink-0 ${isDeadlinePast ? 'text-destructive' : 'text-primary'}`} />
                                <span>Register by: {format(parseISO(event.registrationDeadline as string), 'MMM d, yyyy')} {isDeadlinePast ? "(Closed)" : ""}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{event.eventType === 'group' ? `Team (${event.minTeamSize}-${event.maxTeamSize} members)` : 'Individual Participation'}</span>
                        </div>
                    </div>

                {event.rules && (
                    <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-base font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Rules/Guidelines</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm pl-2 max-h-32 overflow-y-auto">
                        {event.rules.split('\n').map((rule, index) => rule.trim() && <li key={index}>{rule.trim()}</li>)}
                    </ul>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6 mt-auto"> {/* mt-auto pushes button to bottom */}
                    {authLoading ? (
                            <Skeleton className="h-10 w-40" /> 
                    ) : (
                        <Button 
                            onClick={() => handleParticipateClick(event)} 
                            className="flex-shrink-0 w-full sm:w-auto"
                            disabled={isDeadlinePast && !isAdmin} // Disable if deadline past for non-admins
                        >
                            {isLoggedIn && !isAdmin ? <UserCheck className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                            {isAdmin ? "View as Admin" : (isDeadlinePast ? "Registration Closed" : (isLoggedIn ? "Participate Now" : "Login to Participate"))}
                        </Button>
                    )}
                    <p className="text-sm text-muted-foreground italic flex-1">
                        {isLoggedIn && !isAdmin ? (isDeadlinePast ? "Registration for this event has ended." : "Click to register. Payment may be required.") : isAdmin ? "Admins manage events, participation is for users." : "Please login to participate."}
                    </p>
                </div>
                </CardContent>
            </div>
          </Card>
        )})}
      )}

      {!loadingEvents && !eventsError && events.length === 0 && (
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
         <div className="text-center pt-8">
            <Image src="https://picsum.photos/seed/no-events-found/400/250" alt="No events" width={400} height={250} className="mx-auto rounded-lg mb-4 opacity-70" data-ai-hint="empty calendar illustration"/>
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
<<<<<<< HEAD
                date: selectedEvent.start_date as string, 
=======
                date: selectedEvent.startDate as string, 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
                fee: selectedEvent.fee
            }}
         />
       )}
    </div>
  );
}
    