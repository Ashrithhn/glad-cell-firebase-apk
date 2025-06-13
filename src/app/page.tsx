'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle, MapPin, PlusCircle, UserCheck } from 'lucide-react';
import { getEvents } from '@/services/events';
import type { EventData } from '@/services/events'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, parseISO, isPast } from 'date-fns';
import NextImage from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { userId, isAdmin, loading: authLoading } = useAuth();
  const [latestEvent, setLatestEvent] = useState<EventData | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    async function loadLatestEvent() {
      setLoadingEvent(true);
      const result = await getEvents();
      if (result.success && result.events && result.events.length > 0) {
        const sortedEvents = result.events.sort((a, b) => {
          const dateA = a.created_at ? parseISO(a.created_at as string).getTime() : 0;
          const dateB = b.created_at ? parseISO(b.created_at as string).getTime() : 0;
          return dateB - dateA;
        });
        setLatestEvent(sortedEvents[0]);
      } else if (!result.success) {
        setEventError(result.message || 'Failed to load events.');
      } else {
        setLatestEvent(null);
      }
      setLoadingEvent(false);
    }
    loadLatestEvent();
  }, []);
  
  const isLoggedIn = !authLoading && !!userId;

  if (authLoading || loadingEvent) {
    return (
        <div className="flex flex-col items-center justify-center space-y-12 home-page-texture min-h-[calc(100vh-var(--header-height,4rem))] py-8">
            <div className="text-center space-y-4 px-4">
                <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto" />
                <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
                <Skeleton className="h-5 w-5/6 max-w-xl mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                <Skeleton className="h-52 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
            </div>
             {isLoggedIn && !isAdmin && (
                <Skeleton className="h-52 rounded-xl w-full max-w-4xl px-4 md:col-span-2" />
            )}
        </div>
    );
  }

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
             {!eventError && latestEvent ? (
                 <div key={latestEvent.id} className='space-y-2'>
                    {latestEvent.image_url && (
                      <div className="relative w-full h-40 md:h-48 mb-3 rounded-md overflow-hidden shadow-sm">
                        <NextImage
                          src={latestEvent.image_url}
                          alt={latestEvent.name || 'Latest Event Image'}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-105"
                          data-ai-hint="program poster"
                        />
                      </div>
                    )}
                    <p className="font-medium text-primary text-lg">{latestEvent.name}</p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                         <CalendarCheck className="h-4 w-4 flex-shrink-0"/>
                         {latestEvent.start_date && typeof latestEvent.start_date === 'string' ? format(parseISO(latestEvent.start_date), 'MMM d, yyyy') : 'N/A'}
                         {latestEvent.end_date && typeof latestEvent.end_date === 'string' && latestEvent.start_date !== latestEvent.end_date ? ` - ${format(parseISO(latestEvent.end_date), 'MMM d, yyyy')}` : ''}
                     </p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {latestEvent.venue || 'Venue TBD'}
                     </p>
                    <CardDescription className='mt-1 pt-2 border-t line-clamp-2'>
                      {latestEvent.description}
                    </CardDescription>
                     <Button size="sm" asChild className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                       <Link href={`/programs#${latestEvent.id}`}> {/* Link to specific event on programs page */}
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

        {/* Submit Your Idea Card - Visible if logged in and not admin */}
        {isLoggedIn && !isAdmin && (
             <Card className="md:col-span-2 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm border-secondary/30 animate-fade-in-up delay-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-semibold">Have an Idea?</CardTitle>
                <PlusCircle className="h-6 w-6 text-secondary-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Share your innovative concepts with the GLAD CELL community. We can help you shape and grow it.
                </p>
                {/* This link should ideally go to a user-facing idea submission form if one exists, or to the ideas page to explore */}
                <Button variant="default" asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  {/* For now, linking to /ideas. If you create a user idea submission page, link to that. */}
                  <Link href="/ideas"> 
                    Submit / Explore Ideas <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}