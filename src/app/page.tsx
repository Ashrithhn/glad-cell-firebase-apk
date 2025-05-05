
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle, MapPin } from 'lucide-react'; // Added MapPin
import { getEvents } from '@/services/events'; // Import the renamed service function
import type { EventData } from '@/services/events'; // Import the renamed type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns'; // For date formatting

// Fetch events data on the server
async function loadLatestEvent(): Promise<{ event?: EventData, error?: string }> {
    const result = await getEvents(); // Use the renamed function
    if (result.success && result.events && result.events.length > 0) {
        // Assuming the first event is the latest due to Firestore ordering
        return { event: result.events[0] };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load events.' };
    } else {
        return { event: undefined }; // No events found
    }
}

export default async function Home() {
  const { event, error } = await loadLatestEvent();

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to GLAD CELL!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          An initiative by the <span className="font-semibold">Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli</span>.
          Discover, share, and collaborate on innovative startup and ideathon concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Explore Ideas Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Explore Ideas</CardTitle>
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse through the diverse collection of startup and ideathon concepts submitted by students across the college.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/ideas">
                View Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Program/Event Card - Dynamic */}
        <Card className="w-full hover:shadow-lg transition-shadow duration-300 bg-secondary/50">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-xl font-semibold">Latest Program/Event</CardTitle>
             <CalendarCheck className="h-6 w-6 text-accent" />
           </CardHeader>
           <CardContent className="space-y-4">
             {error && (
                 <Alert variant="destructive" className="mt-2">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Could not load event</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                 </Alert>
             )}
             {!error && event ? (
                 <div key={event.id} className='space-y-2'>
                    <p className="font-medium text-primary text-lg">{event.name}</p>
                     {/* Display Dates */}
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                         <CalendarCheck className="h-4 w-4 flex-shrink-0"/>
                         {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                         {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}` : ''}
                     </p>
                     {/* Display Venue */}
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {event.venue || 'Venue TBD'}
                     </p>
                    <CardDescription className='mt-1 pt-2 border-t line-clamp-2'> {/* Show short description */}
                      {event.description}
                    </CardDescription>
                 </div>
             ) : !error ? (
                <p className="text-muted-foreground italic">No upcoming programs or events announced yet.</p>
             ) : null /* Don't show 'No items' if there was an error */}

             <Button variant="outline" asChild className='mt-4'>
               <Link href="/programs">
                 View All Programs &amp; Events <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
