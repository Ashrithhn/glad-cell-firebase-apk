
'use client'; // Changed to client component to handle modal state and auth checks easily

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, Lightbulb, LogIn, UserCheck, GraduationCap, AlertCircle, Loader2 } from 'lucide-react'; // Added GraduationCap, AlertCircle, Loader2
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { getPrograms } from '@/services/programs'; // Import program service
import type { ProgramData } from '@/services/programs'; // Import program type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define Event Details Separately (Example, could be fetched too)
const specificEventDetails = {
    id: 'kickstart-2025', // Match this ID if this specific event allows participation
    name: 'Startup Ideation Kickstart',
    date: 'May 12, 2025',
    fee: 10000, // Example fee: ₹100.00 (in paisa)
};


export default function ProgramsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [programs, setPrograms] = React.useState<ProgramData[]>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(true);
  const [programsError, setProgramsError] = React.useState<string | null>(null);

  const { user, userId, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch programs on component mount
  React.useEffect(() => {
    async function loadPrograms() {
      setLoadingPrograms(true);
      setProgramsError(null);
      const result = await getPrograms();
      if (result.success && result.programs) {
        setPrograms(result.programs);
      } else {
        setProgramsError(result.message || 'Failed to load programs.');
      }
      setLoadingPrograms(false);
    }
    loadPrograms();
  }, []);


  // Determine login status based on auth context
  const isLoggedIn = !authLoading && (!!userId || isAdmin);

  // Handle participation for the SPECIFIC event
  const handleParticipateClick = () => {
     if (isLoggedIn && !isAdmin) { // Only allow logged-in non-admin users
        setIsModalOpen(true);
     } else if (isAdmin) {
         toast({
             title: "Admin View",
             description: "Admins cannot participate in events.",
             variant: "default",
         });
     }
     else {
         toast({
             title: "Login Required",
             description: "Please log in or register to participate.",
             variant: "destructive",
         });
         router.push('/login'); // Redirect to login page
     }
  };


  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Our Programs & Events</h1>
        <p className="text-muted-foreground mt-2">
          Initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

       {/* Loading State */}
       {loadingPrograms && (
         <div className='space-y-6'>
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-32 w-full" />
         </div>
       )}

       {/* Error State */}
       {programsError && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Programs</AlertTitle>
            <AlertDescription>{programsError}</AlertDescription>
         </Alert>
       )}

      {/* Display Programs/Events */}
      {!loadingPrograms && !programsError && programs.length > 0 && (
        programs.map((program) => (
          <Card key={program.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl text-primary flex items-center gap-2">
                 {/* Use different icons based on type if available, default to GraduationCap */}
                 {program.id === specificEventDetails.id ? <CalendarCheck className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                 {program.name}
              </CardTitle>
              <CardDescription className="pt-1">
                {program.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Display Goals if available */}
              {program.goals && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Goals</h3>
                  {/* Split goals by newline if needed */}
                   <ul className="list-disc list-inside text-muted-foreground space-y-1">
                     {program.goals.split('\n').map((goal, index) => goal.trim() && <li key={index}>{goal.trim()}</li>)}
                   </ul>
                </div>
              )}

              {/* Display Duration if available */}
              {program.duration && (
                 <p className="text-sm text-muted-foreground"><strong>Duration:</strong> {program.duration}</p>
              )}

              {/* Display Target Audience if available */}
              {program.targetAudience && (
                 <p className="text-sm text-muted-foreground"><strong>Target Audience:</strong> {program.targetAudience}</p>
              )}

              {/* Specific Section for the 'Startup Ideation Kickstart' event */}
              {program.id === specificEventDetails.id && (
                 <>
                    <div className="flex items-center gap-4">
                       <p className="text-lg font-semibold text-accent">Date: {specificEventDetails.date}</p>
                       <p className="text-lg font-semibold">Fee: ₹{specificEventDetails.fee / 100}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/> What to Expect</h3>
                     <p className="text-muted-foreground">
                       Engaging workshops, guest speakers from the industry, brainstorming sessions, and networking opportunities. Learn how to identify problems, develop solutions, and pitch your initial concepts.
                     </p>
                    </div>

                     <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t pt-6">
                         {authLoading ? (
                              <Skeleton className="h-10 w-40" /> // Show skeleton while loading auth state
                         ) : isLoggedIn && !isAdmin ? (
                              <Button onClick={handleParticipateClick} className="flex-shrink-0">
                                  <UserCheck className="mr-2 h-4 w-4" /> Participate Now
                              </Button>
                          ) : (
                             <Button onClick={handleParticipateClick} className="flex-shrink-0">
                                  <LogIn className="mr-2 h-4 w-4" /> Login to Participate
                              </Button>
                         )}
                         <p className="text-sm text-muted-foreground italic flex-1">
                          More details regarding venue and specific timings will be announced soon. Participation requires login and completion of the payment process. Admins cannot participate.
                        </p>
                     </div>
                 </>
              )}

            </CardContent>
          </Card>
        ))
      )}

       {/* Message if no programs are found */}
      {!loadingPrograms && !programsError && programs.length === 0 && (
         <div className="text-center pt-8">
            <h2 className="text-2xl font-semibold text-primary">No Programs Announced Yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for upcoming events and initiatives!</p>
         </div>
      )}


       {/* Participation Modal - Conditionally render only if user is logged in */}
       {isLoggedIn && !isAdmin && (
         <ParticipationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventDetails={specificEventDetails} // Pass the specific event details
         />
       )}
    </div>
  );
}