
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditEventForm } from '@/components/features/admin/edit-event-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { getEventById } from '@/services/events';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { success, event, message } = await getEventById(id);

  if (!success || !event) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/events">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Event</AlertTitle>
          <AlertDescription>{message || 'Could not find the specified event.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/admin/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events List
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Edit className="h-5 w-5" /> Edit Event
          </CardTitle>
          <CardDescription>
            Modify the details for the event: "{event.name}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditEventForm event={event} />
        </CardContent>
      </Card>
    </div>
  );
}
