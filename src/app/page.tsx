
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, CalendarCheck, AlertCircle } from 'lucide-react';
import { getPrograms } from '@/services/programs'; // Import the service function
import type { ProgramData } from '@/services/programs'; // Import the type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Fetch programs data on the server
async function loadPrograms(): Promise<{ programs?: ProgramData[], error?: string }> {
    const result = await getPrograms();
    if (result.success) {
        // Limit to maybe 1 or 2 most recent programs for the homepage
        return { programs: result.programs?.slice(0, 1) }; // Show only the latest program/event
    } else {
        return { error: result.message || 'Failed to load programs.' };
    }
}

export default async function Home() {
  const { programs, error } = await loadPrograms();

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
                     <AlertTitle>Could not load program</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                 </Alert>
             )}
             {!error && programs && programs.length > 0 ? (
                programs.map(program => ( // Display the latest program found
                 <div key={program.id}>
                    <p className="font-medium text-primary">{program.name}</p>
                    <CardDescription className='mt-1'>
                      {program.description.substring(0, 100)}{program.description.length > 100 ? '...' : ''} {/* Show short description */}
                    </CardDescription>
                     {/* Display date if it exists (assuming events also use this structure or adapt as needed) */}
                     {/* <p className="text-muted-foreground">Date: May 12, 2025</p> */}
                 </div>
                ))
             ) : !error ? (
                <p className="text-muted-foreground italic">No upcoming programs announced yet.</p>
             ) : null /* Don't show 'No programs' if there was an error */}

             <Button variant="outline" asChild>
               <Link href="/programs">
                 View All Programs <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}