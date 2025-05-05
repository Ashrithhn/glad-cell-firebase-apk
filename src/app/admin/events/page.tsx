
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, List } from 'lucide-react';

// TODO: Fetch events data from Firestore
const sampleEvents = [
  { id: 'kickstart-2025', name: 'Startup Ideation Kickstart', date: '2025-05-12', fee: 10000 },
  { id: 'hackathon-fall-2025', name: 'Fall Hackathon 2025', date: '2025-10-20', fee: 0 },
];

export default function AdminManageEventsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Events</h1>
        <Button asChild variant="default">
          <Link href="/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Existing Events</CardTitle>
          <CardDescription>List of current and past events.</CardDescription>
        </CardHeader>
        <CardContent>
          {sampleEvents.length > 0 ? (
            <ul className="space-y-4">
              {sampleEvents.map((event) => (
                <li key={event.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {event.date} | Fee: ₹{event.fee / 100}
                    </p>
                  </div>
                  <div>
                    {/* TODO: Add Edit/Delete buttons and functionality */}
                    <Button variant="outline" size="sm" disabled className="mr-2">Edit (soon)</Button>
                    <Button variant="destructive" size="sm" disabled>Delete (soon)</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">No events found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
