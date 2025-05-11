
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle, MapPin } from 'lucide-react';
import { getEvents } from '@/services/events';
import type { EventData } from '@/services/events';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import NextImage from 'next/image';


// Fetch events data on the server
async function loadLatestEvent(): Promise<{ event?: EventData, error?: string }> {
    const result = await getEvents();
    if (result.success && result.events && result.events.length > 0) {
        // Sort events: Handle potential null createdAt values, treat null as older
        const sortedEvents = result.events.sort((a, b) => {
            const dateA = a.createdAt ? parseISO(a.createdAt as string).getTime() : 0;
            const dateB = b.createdAt ? parseISO(b.createdAt as string).getTime() : 0;
            return dateB - dateA;
        });
        return { event: sortedEvents[0] };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load events.' };
    } else {
        return { event: undefined };
    }
}


export default async function Home() {
  const { event, error: eventError } = await loadLatestEvent();
  
  return (
    <div className="flex flex-col items-center justify-center space-y-12 home-page-texture min-h-[calc(100vh-var(--header-height,4rem))] py-8">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary animate-fade-in-down">
          Welcome to GLAD CELL!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up delay-200">
          An initiative by the <span className="font-semibold">Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli</span>.
          Discover, share, and collaborate on innovative startup and ideathon concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Explore Ideas Card */}
        <Card className="transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-primary/10 animate-slide-in-left">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Explore Ideas</CardTitle>
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse through the diverse collection of startup and ideathon concepts submitted by students across the college.
            </p>
            <Button variant="secondary" asChild className="bg-primary/10 hover:bg-primary/20 text-primary">
              <Link href="/ideas">
                View Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Program/Event Card - Dynamic */}
        <Card className="transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-accent/20 animate-slide-in-right">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-xl font-semibold">Latest Program/Event</CardTitle>
             <CalendarCheck className="h-6 w-6 text-accent" />
           </CardHeader>
           <CardContent className="space-y-4">
             {eventError && (
                 <Alert variant="destructive" className="mt-2">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Could not load event</AlertTitle>
                     <AlertDescription>{eventError}</AlertDescription>
                 </Alert>
             )}
             {!eventError && event ? (
                 <div key={event.id} className='space-y-2'>
                    {event.imageUrl && (
                      <div className="relative w-full h-40 md:h-48 mb-3 rounded-md overflow-hidden shadow-sm">
                        <NextImage
                          src={event.imageUrl}
                          alt={event.name || 'Latest Event Image'}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-105"
                          data-ai-hint="program poster"
                        />
                      </div>
                    )}
                    <p className="font-medium text-primary text-lg">{event.name}</p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                         <CalendarCheck className="h-4 w-4 flex-shrink-0"/>
                         {event.startDate && typeof event.startDate === 'string' ? format(parseISO(event.startDate), 'MMM d, yyyy') : 'N/A'}
                         {event.endDate && typeof event.endDate === 'string' && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate), 'MMM d, yyyy')}` : ''}
                     </p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {event.venue || 'Venue TBD'}
                     </p>
                    <CardDescription className='mt-1 pt-2 border-t line-clamp-2'>
                      {event.description}
                    </CardDescription>
                     <Button size="sm" asChild className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                       <Link href={`/programs#${event.id}`}>
                          Participate / View Details <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                    </Button>
                 </div>
             ) : !eventError ? (
                <>
                  <p className="text-muted-foreground italic">No upcoming programs or events announced yet.</p>
                   <div className="relative w-full h-40 md:h-48 mb-3 rounded-md overflow-hidden shadow-sm bg-muted flex items-center justify-center">
                        <CalendarCheck className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                </>
             ) : null }
             <Button variant="outline" asChild className='mt-4 w-full'>
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
