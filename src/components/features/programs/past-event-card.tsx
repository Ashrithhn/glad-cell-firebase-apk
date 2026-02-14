
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, MapPin, Archive, ImageOff } from 'lucide-react';
import type { EventData } from '@/services/events';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';

interface PastEventCardProps {
  event: EventData;
}

export function PastEventCard({ event }: PastEventCardProps) {
  const formattedDate = event.start_date
    ? format(parseISO(event.start_date), 'MMM d, yyyy')
    : 'Date N/A';

  return (
    <Card className="flex flex-col h-full bg-muted/50 border-dashed">
      <div className="relative">
         <div className="aspect-video bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
            {event.image_url ? (
            <Image
                src={event.image_url}
                alt={`Image for ${event.name}`}
                width={400}
                height={225}
                className="object-cover w-full h-full"
                unoptimized
                data-ai-hint="event team"
            />
            ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/50 h-full">
                <ImageOff className="h-16 w-16" />
            </div>
            )}
        </div>
        <Badge variant="secondary" className="absolute top-2 right-2 flex items-center gap-1">
            <Archive className="h-3 w-3" />
            Archived
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-muted-foreground">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-4 text-sm text-muted-foreground">
         <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span>Held on: {formattedDate}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Venue: {event.venue}</span>
         </div>
      </CardFooter>
    </Card>
  );
}
