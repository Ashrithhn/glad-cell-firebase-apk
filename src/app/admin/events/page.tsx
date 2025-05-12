
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { PlusCircle, List, ArrowLeft, AlertCircle } from 'lucide-react';
import { getEvents } from '@/services/events'; // Uses Supabase
import type { EventData } from '@/services/events'; // Supabase type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EventListClient } from '@/components/features/admin/event-list-client'; // Uses Supabase service for delete

async function loadEvents(): Promise<{ events?: EventData[], error?: string }> {
    const result = await getEvents(); // Fetches from Supabase
    if (result.success && result.events) { // Check events array directly
=======
import { PlusCircle, List, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
import { getEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EventListClient } from '@/components/features/admin/event-list-client'; 

async function loadEvents(): Promise<{ events?: EventData[], error?: string }> {
    const result = await getEvents(); 
    if (result.success) {
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
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
          <CardDescription>List of current programs and events. Click an item to edit (soon) or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && events ? (
<<<<<<< HEAD
            <EventListClient events={events} />
=======
            <EventListClient events={events} /> 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
          ) : !error ? (
            <p className="text-muted-foreground text-center">No items found.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
