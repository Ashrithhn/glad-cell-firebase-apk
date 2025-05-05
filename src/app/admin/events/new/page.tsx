
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddEventForm } from '@/components/features/admin/add-event-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminAddEventPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/events">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Events List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Event</CardTitle>
          <CardDescription>
            Enter the details for the new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddEventForm />
        </CardContent>
      </Card>
    </div>
  );
}
