
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2, MapPin, Clock, Users, IndianRupee, ImageOff, CheckCircle, UserPlus, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getPublicActiveEvents } from '@/services/events';
import type { EventData, ParticipationData } from '@/services/events';
import { getTeamsForUser } from '@/services/teams';
import type { TeamWithMembers } from '@/services/teams';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isPast } from 'date-fns';
import Image from 'next/image';
import { processFreeRegistration } from '@/services/payment';
import { CreateTeamModal } from '@/components/features/teams/CreateTeamModal';
import { JoinTeamModal } from '@/components/features/teams/JoinTeamModal';
import { ViewTeamModal } from '@/components/features/teams/ViewTeamModal';
import Link from 'next/link';

const ParticipationModal = dynamic(
  () => import('@/components/features/programs/participation-modal').then(mod => mod.ParticipationModal),
  { 
    ssr: false,
    loading: () => <p className="text-sm">Loading...</p>
  }
);

export default function ProgramsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<EventData | null>(null);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [eventsError, setEventsError] = React.useState<string | null>(null);
  const [isRegisteringFree, setIsRegisteringFree] = React.useState<string | null>(null);

  // Team-related state
  const [userTeams, setUserTeams] = React.useState<Map<string, TeamWithMembers>>(new Map());
  const [isCreateTeamModalOpen, setCreateTeamModalOpen] = React.useState(false);
  const [isJoinTeamModalOpen, setJoinTeamModalOpen] = React.useState(false);
  const [isViewTeamModalOpen, setViewTeamModalOpen] = React.useState(false);
  const [selectedEventForTeam, setSelectedEventForTeam] = React.useState<EventData | null>(null);


  const { user, userId, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const refreshUserTeams = React.useCallback(async () => {
    if (userId) {
      const teamsResult = await getTeamsForUser(userId);
      if (teamsResult.success && teamsResult.teams) {
        const teamsMap = new Map(teamsResult.teams.map(team => [team.event_id, team]));
        setUserTeams(teamsMap);
      }
    }
  }, [userId]);

  const loadData = React.useCallback(async () => {
    setLoadingEvents(true);
    setEventsError(null);
    
    const eventsResult = await getPublicActiveEvents();
    if (eventsResult.success && eventsResult.events) {
      setEvents(eventsResult.events);
    } else {
      setEventsError(eventsResult.message || 'Failed to load programs/events.');
    }

    await refreshUserTeams();

    setLoadingEvents(false);
  }, [refreshUserTeams]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const isLoggedIn = !authLoading && (!!userId || isAdmin);

  const handleParticipateClick = async (event: EventData) => {
    if (authLoading) {
      toast({ title: "Loading...", description: "Please wait, authentication status is loading." });
      return;
    }
    if (!isLoggedIn) {
      toast({ title: "Login Required", description: "Please login to participate.", variant: "destructive" });
      router.push('/login?redirect=/programs');
      return;
    }
    if (isAdmin) {
      toast({ title: "Admin View", description: "Admins cannot participate in events." });
      return;
    }
    if (event.registration_deadline && isPast(parseISO(event.registration_deadline))) {
      toast({ title: "Registration Closed", description: `Registration for "${event.name}" has ended.`, variant: "destructive" });
      return;
    }

    if (event.event_type === 'individual') {
        const participationsResult = await getPublicActiveEvents(); 
        const isAlreadyRegistered = participationsResult.events?.some(p => p.id === event.id);

        if (isAlreadyRegistered) {
            toast({ title: "Already Registered", description: "You have already registered for this event." });
            return;
        }

        if (event.fee === 0) {
            setIsRegisteringFree(event.id!);
            try {
                const result = await processFreeRegistration({ eventId: event.id!, userId: userId! });
                if (result.success) {
                    toast({ title: "Registration Successful!", description: result.message, variant: 'default' });
                    router.push('/profile');
                } else {
                    throw new Error(result.message || 'Failed to register.');
                }
            } catch (error: any) {
                toast({ title: "Registration Failed", description: error.message, variant: 'destructive' });
            } finally {
                setIsRegisteringFree(null);
            }
        } else {
            const formattedStartDate = event.start_date ? format(parseISO(event.start_date), 'PPP') : 'N/A';
            setSelectedEvent({ ...event, start_date: formattedStartDate });
            setIsModalOpen(true);
        }
    }
  };

  const handleTeamAction = (event: EventData, action: 'create' | 'join' | 'view') => {
      if (!isLoggedIn) {
          toast({ title: "Login Required", description: "Please login to manage teams.", variant: "destructive" });
          router.push('/login?redirect=/programs');
          return;
      }
      setSelectedEventForTeam(event);
      if (action === 'create') setCreateTeamModalOpen(true);
      if (action === 'join') setJoinTeamModalOpen(true);
      if (action === 'view') setViewTeamModalOpen(true);
  };
  
  const onTeamCreatedOrJoined = (newTeam: TeamWithMembers) => {
    setUserTeams(prev => new Map(prev).set(newTeam.event_id, newTeam));
    setCreateTeamModalOpen(false);
    setJoinTeamModalOpen(false);
    toast({ title: "Success!", description: `You have joined the team "${newTeam.name}".`, variant: "default"});
  };

  const onJoinRequestSent = () => {
    setJoinTeamModalOpen(false);
  };

  const onTeamModified = () => {
    refreshUserTeams();
    // Potentially close the view modal if it's open, or let it handle its own state.
    setViewTeamModalOpen(false);
  }

  const formatFee = (feeInPaisa?: number) => {
    if (feeInPaisa === undefined || feeInPaisa === null) return "N/A";
    if (feeInPaisa === 0) return "Free";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(feeInPaisa / 100);
  };
  
  const renderParticipationButton = (event: EventData) => {
    const isDeadlinePast = event.registration_deadline && isPast(parseISO(event.registration_deadline));
    const isCurrentlyRegistering = isRegisteringFree === event.id;

    if (authLoading) return <Skeleton className="h-10 w-40" />;

    if (event.event_type === 'group') {
        const team = userTeams.get(event.id!);
        if (team) {
            return (
                <Button onClick={() => handleTeamAction(event, 'view')} className="flex-shrink-0 w-full sm:w-auto">
                    <Eye className="mr-2 h-4 w-4" /> View My Team
                </Button>
            );
        }
        return (
            <div className="flex flex-col sm:flex-row gap-2">
                 <Button onClick={() => handleTeamAction(event, 'create')} disabled={isDeadlinePast} className="flex-shrink-0">
                    <UserPlus className="mr-2 h-4 w-4" /> Create Team
                 </Button>
                 <Button onClick={() => handleTeamAction(event, 'join')} disabled={isDeadlinePast} variant="outline" className="flex-shrink-0">
                    Join Team
                </Button>
            </div>
        );
    }
    
    // Logic for individual events
    const isAlreadyRegistered = false; // This needs to be fetched, placeholder for now.
    return (
        <Button
            onClick={() => handleParticipateClick(event)}
            className="flex-shrink-0 w-full sm:w-auto"
            disabled={(isDeadlinePast && !isAdmin) || authLoading || isCurrentlyRegistering || isAlreadyRegistered}
        >
            {isCurrentlyRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             : isAlreadyRegistered ? <CheckCircle className="mr-2 h-4 w-4" />
             : isLoggedIn && !isAdmin ? <UserCheck className="mr-2 h-4 w-4" /> 
             : <LogIn className="mr-2 h-4 w-4" />}
            
            {isCurrentlyRegistering ? "Registering..."
             : isAlreadyRegistered ? "Already Registered"
             : isAdmin ? "View as Admin" 
             : isDeadlinePast ? "Registration Closed" 
             : isLoggedIn ? (event.fee === 0 ? "Register for Free" : "Participate Now")
             : "Login to Participate"}
        </Button>
    );
  };
  
  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold animated-gradient-text tracking-tight">Our Programs & Events</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

       {(loadingEvents || authLoading) && (
         <div className='space-y-8'>
             <Skeleton className="h-72 w-full rounded-lg" />
             <Skeleton className="h-64 w-full rounded-lg" />
         </div>
       )}

       {eventsError && !loadingEvents && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Items</AlertTitle>
            <AlertDescription>{eventsError}</AlertDescription>
         </Alert>
       )}

      {!loadingEvents && !authLoading && !eventsError && events.length > 0 && (
        events.map((event) => {
            const isDeadlinePast = event.registration_deadline && isPast(parseISO(event.registration_deadline));
            const teamForEvent = userTeams.get(event.id!);

            return (
          <Card key={event.id} id={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 aspect-video md:aspect-auto bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {event.image_url ? (
                <Image
                    src={event.image_url}
                    alt={`Image for ${event.name}`}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                    unoptimized
                    data-ai-hint="conference team"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                    <ImageOff className="h-16 w-16" />
                    <p className="text-sm mt-2">No Image Available</p>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-grow">
                <CardHeader className="border-b md:border-b-0 md:border-l bg-background/50">
                <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    {event.event_type === 'group' ? <Users className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
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
                                {event.start_date ? format(parseISO(event.start_date), 'MMM d, yyyy') : 'N/A'}
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
                            <div className={`flex items-center gap-2 text-muted-foreground ${isDeadlinePast ? 'text-destructive' : ''}`}>
                                <Clock className={`h-4 w-4 flex-shrink-0 ${isDeadlinePast ? 'text-destructive' : 'text-primary'}`} />
                                <span>Register by: {format(parseISO(event.registration_deadline), 'MMM d, yyyy')} {isDeadlinePast ? "(Closed)" : ""}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{event.event_type === 'group' ? `Team (${event.min_team_size || 'N/A'}-${event.max_team_size || 'N/A'} members)` : 'Individual Participation'}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                        {(event.rules_pdf_url) ? (
                            <Button asChild variant="secondary" size="sm">
                                <Link href={(event as any).rules_pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Download Rules (PDF)
                                </Link>
                            </Button>
                        ) : event.rules && (
                             <Alert className="text-sm p-2">
                                <AlertTitle className="font-semibold text-xs">Summary of Rules</AlertTitle>
                                <AlertDescription className="text-xs">{event.rules.split('\n').slice(0, 2).join(' ')}...</AlertDescription>
                             </Alert>
                        )}
                    </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6 mt-auto">
                    {renderParticipationButton(event)}
                    <p className="text-sm text-muted-foreground italic flex-1">
                        {isDeadlinePast ? "Registration for this event has ended." : teamForEvent ? `You are on team "${teamForEvent.name}". View the team to get your join code.` : event.event_type === 'group' ? "Create a team or join one with a code." : "Click to participate individually."}
                    </p>
                </div>
                </CardContent>
            </div>
          </Card>
        )})
      )}

      {!loadingEvents && !authLoading && !eventsError && events.length === 0 && (
         <div className="text-center pt-8">
            <Image src="https://placehold.co/400x250.png" alt="No events" width={400} height={250} className="mx-auto rounded-lg mb-4 opacity-70" data-ai-hint="empty calendar illustration"/>
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

        {selectedEventForTeam && (
            <>
                <CreateTeamModal 
                    isOpen={isCreateTeamModalOpen} 
                    onClose={() => setCreateTeamModalOpen(false)} 
                    event={selectedEventForTeam} 
                    onTeamCreated={onTeamCreatedOrJoined}
                />
                <JoinTeamModal
                    isOpen={isJoinTeamModalOpen}
                    onClose={() => setJoinTeamModalOpen(false)}
                    event={selectedEventForTeam}
                    onJoinRequestSent={onJoinRequestSent}
                />
                {isViewTeamModalOpen && (
                  <ViewTeamModal
                      isOpen={isViewTeamModalOpen}
                      onClose={() => setViewTeamModalOpen(false)}
                      event={selectedEventForTeam}
                      team={userTeams.get(selectedEventForTeam.id!)}
                      onTeamModified={onTeamModified}
                  />
                )}
            </>
        )}
    </div>
  );
}
