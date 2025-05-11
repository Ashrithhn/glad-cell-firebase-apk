import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle, MapPin, Image as ImageIcon } from 'lucide-react';
import { getEvents } from '@/services/events';
import type { EventData } from '@/services/events';
import { getHomepageImages } from '@/services/homepageContent'; // Import new service
import type { HomepageImage } from '@/services/homepageContent'; // Import type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import Image from 'next/image'; // Use next/image

// Fetch events data on the server
async function loadLatestEvent(): Promise<{ event?: EventData, error?: string }> {
    const result = await getEvents();
    if (result.success && result.events && result.events.length > 0) {
        return { event: result.events.sort((a,b) => parseISO(b.createdAt as string).getTime() - parseISO(a.createdAt as string).getTime())[0] };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load events.' };
    } else {
        return { event: undefined }; // No events found
    }
}

// Fetch homepage images
async function loadHomepageImagesData(): Promise<{ images?: HomepageImage[], error?: string }> {
    const result = await getHomepageImages();
    if (result.success && result.images) {
        return { images: result.images.filter(img => img.isActive).sort((a,b) => a.order - b.order) };
    } else {
        return { error: result.message || 'Failed to load homepage images.' };
    }
}


export default async function Home() {
  const { event, error: eventError } = await loadLatestEvent();
  const { images: homepageImages, error: imagesError } = await loadHomepageImagesData();

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

      {/* Dynamic Homepage Images Section */}
      {imagesError && (
        <Alert variant="destructive" className="w-full max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not load homepage images</AlertTitle>
            <AlertDescription>{imagesError}</AlertDescription>
        </Alert>
      )}
      {homepageImages && homepageImages.length > 0 && (
        <section className="w-full max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-6 text-primary flex items-center justify-center gap-2">
            <ImageIcon className="h-6 w-6"/> Featured Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homepageImages.slice(0,3).map((img) => ( // Display up to 3 images
              <Card key={img.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
                <Image 
                  src={img.imageUrl} 
                  alt={img.altText} 
                  width={600} 
                  height={400} 
                  className="w-full h-56 object-cover"
                />
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{img.altText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Explore Ideas Card */}
        <Card className="transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-primary/10 animate-slide-in-left">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Explore Ideas</CardTitle>
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Image 
              src="https://picsum.photos/seed/ideas/600/300" // Fallback or default static image
              alt="Abstract representation of ideas" 
              width={600} 
              height={300} 
              className="rounded-md mb-3 object-cover"
              data-ai-hint="innovation abstract"
            />
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
                    <Image 
                        src="https://picsum.photos/seed/event/600/300" // Fallback or default static image
                        alt="Representation of an event or program" 
                        width={600} 
                        height={300} 
                        className="rounded-md mb-3 object-cover"
                        data-ai-hint="conference event"
                    />
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
                  <Image 
                      src="https://picsum.photos/seed/no-event/600/300" 
                      alt="Placeholder for no events" 
                      width={600} 
                      height={300} 
                      className="rounded-md mb-3 object-cover opacity-50"
                      data-ai-hint="empty calendar"
                  />
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
