
import { getPublicArchivedEvents } from '@/services/events';
import type { EventData } from '@/services/events';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, AlertCircle, Archive } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PastEventCard } from '@/components/features/programs/past-event-card';

async function loadArchivedEvents(): Promise<{ events?: EventData[], error?: string }> {
    const result = await getPublicArchivedEvents();
    if (result.success && result.events) {
        return { events: result.events };
    }
    return { error: result.message || 'Failed to load past events.' };
}

export default async function PastEventsPage() {
  const { events, error } = await loadArchivedEvents();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold animated-gradient-text flex items-center justify-center gap-3">
          <Archive className="h-8 w-8 text-primary" />
          Past Events Archive
        </h1>
        <p className="text-muted-foreground mt-2">
          A look back at our previous programs and initiatives.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Events</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <PastEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : !error ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No Past Events Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">The archive is currently empty. Check out our current programs!</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/programs">View Current Programs</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
