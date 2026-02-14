
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
import { getAdminEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EventListClient } from '@/components/features/admin/event-list-client'; 

async function loadEvents(): Promise<{ events?: EventData[], error?: string }> {
    const result = await getAdminEvents(); 
    if (result.success && result.events) {
        return { events: result.events };
    } else {
        return { error: result.message || 'Failed to load events.' };
    }
}

export default async function AdminManageEventsPage() {
  const { events, error } = await loadEvents();

  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Programs &amp; Events</h1>
        <Button asChild variant="default">
          <Link href="/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Link>
        </Button>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Events</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Existing Items</CardTitle>
          <CardDescription>List of current and archived programs and events. Click an item to edit or archive.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && events ? (
            <EventListClient events={events} /> 
          ) : !error ? (
            <p className="text-muted-foreground text-center">No items found.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
