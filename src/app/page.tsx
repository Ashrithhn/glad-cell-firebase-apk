
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle, MapPin, ImageOff, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { getEvents } from '@/services/events'; 
import type { EventData } from '@/services/events'; 
import { getHomepageImages } from '@/services/homepage';
import type { HomepageImage } from '@/services/homepage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns'; 
import Image from 'next/image';


async function loadLatestEvent(): Promise<{ event?: EventData, error?: string }> {
    const result = await getEvents(); 
    if (result.success && result.events && result.events.length > 0) {
        const upcomingEvents = result.events.filter(e => e.endDate && !isPast(parseISO(e.endDate as string)));
        if (upcomingEvents.length > 0) {
            return { event: upcomingEvents.sort((a,b) => parseISO(a.startDate as string).getTime() - parseISO(b.startDate as string).getTime())[0] };
        }
        return { event: result.events[0] }; // Fallback to most recently created if no upcoming
    } else if (!result.success) {
        return { error: result.message || 'Failed to load events.' };
    }
    return { event: undefined }; 
}

function isPast(date: Date): boolean {
  return date.getTime() < new Date().setHours(0,0,0,0);
}

async function loadHomepageSectionImages(): Promise<{
  exploreIdeasImage?: HomepageImage;
  latestEventPromoImage?: HomepageImage;
  error?: string;
}> {
  const result = await getHomepageImages();
  if (result.success && result.images) {
    const exploreIdeasImg = result.images.find(img => img.section === 'exploreIdeas' && img.isActive);
    const latestEventPromoImg = result.images.find(img => img.section === 'latestEventPromo' && img.isActive);
    return { exploreIdeasImage: exploreIdeasImg, latestEventPromoImage: latestEventPromoImg };
  }
  return { error: result.message || "Failed to load homepage section images." };
}


export default async function Home() {
  const { event, error: eventError } = await loadLatestEvent();
  const { error: imageError } = await loadHomepageSectionImages();
  const overallError = eventError || imageError;

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

       {overallError && (
         <Alert variant="destructive" className="max-w-4xl w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Page Content</AlertTitle>
            <AlertDescription>{overallError}</AlertDescription>
         </Alert>
       )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <Card className="transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-primary/10 animate-slide-in-left">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Explore Ideas</CardTitle>
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground"/>
            </div>
            <p className="text-muted-foreground">
              Browse through the diverse collection of startup and ideathon concepts submitted by students.
            </p>
            <Button variant="secondary" asChild className="bg-primary/10 hover:bg-primary/20 text-primary">
              <Link href="/ideas">
                View Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-accent/20 animate-slide-in-right">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-xl font-semibold">Latest Program/Event</CardTitle>
             <CalendarCheck className="h-6 w-6 text-accent" />
           </CardHeader>
           <CardContent className="space-y-4">
             {!eventError && event ? (
                 <div key={event.id} className='space-y-2'>
                    {event.imageUrl ? (
                        <Image 
                            src={event.imageUrl} 
                            alt={`Image for ${event.name}`}
                            width={600} 
                            height={300} 
                            className="rounded-md mb-3 object-cover aspect-video"
                            data-ai-hint="conference event"
                        />
                    ) : (
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            <ImageOff className="h-16 w-16 text-muted-foreground"/>
                        </div>
                    )}
                    <p className="font-medium text-primary text-lg">{event.name}</p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                         <CalendarCheck className="h-4 w-4 flex-shrink-0"/>
                         {event.startDate ? format(parseISO(event.startDate as string), 'MMM d, yyyy') : 'N/A'}
                         {event.endDate && event.startDate !== event.endDate ? ` - ${format(parseISO(event.endDate as string), 'MMM d, yyyy')}` : ''}
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
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <ImageOff className="h-16 w-16 text-muted-foreground"/>
                  </div>
                  <p className="text-muted-foreground italic">No upcoming programs or events announced yet.</p>
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
