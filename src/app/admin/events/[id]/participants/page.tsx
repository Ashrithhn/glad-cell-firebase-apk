
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Users } from 'lucide-react';
import { getEventById, getParticipantsForEvent } from '@/services/events';
import type { ParticipationData } from '@/services/events';
import { getTeamsAndMembersForEvent } from '@/services/teams';
import type { TeamWithMembers } from '@/services/teams';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ParticipantListClient } from '@/components/features/admin/participant-list-client';

interface ParticipantsPageProps {
  params: { id: string };
}

async function loadData(eventId: string): Promise<{
  participants?: ParticipationData[];
  teams?: TeamWithMembers[];
  eventName?: string;
  error?: string;
}> {
  const [participantsResult, eventResult, teamsResult] = await Promise.all([
    getParticipantsForEvent(eventId),
    getEventById(eventId),
    getTeamsAndMembersForEvent(eventId)
  ]);

  if (!eventResult.success) {
    return { error: eventResult.message || 'Failed to load event details.' };
  }

  const errorMessages = [];
  if (!participantsResult.success) {
    errorMessages.push(participantsResult.message || 'Failed to load participants.');
  }
   if (!teamsResult.success) {
    errorMessages.push(teamsResult.message || 'Failed to load teams.');
  }

  return {
    participants: participantsResult.participants,
    teams: teamsResult.teams,
    eventName: eventResult.event?.name,
    error: errorMessages.length > 0 ? errorMessages.join(' ') : undefined,
  };
}

export default async function AdminEventParticipantsPage({ params }: ParticipantsPageProps) {
  const { participants, teams, eventName, error } = await loadData(params.id);

  if (!eventName && error?.includes('event')) { // Check if error is specifically about the event
    return (
        <div className="container mx-auto py-12 px-4">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/admin/events"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Events</Link>
            </Button>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Event</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/admin/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
        </Link>
      </Button>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Participants & Teams</h1>
          <p className="text-muted-foreground">For event: {eventName}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Page Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ParticipantListClient
          participants={participants || []}
          teams={teams || []}
          eventName={eventName!}
        />
    </div>
  );
}
