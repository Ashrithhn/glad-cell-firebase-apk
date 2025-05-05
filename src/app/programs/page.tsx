
'use client'; // Required for hooks and handlers

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Target, Lightbulb, LogIn, UserCheck } from 'lucide-react'; // Added UserCheck
import { ParticipationModal } from '@/components/features/programs/participation-modal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { useRouter } from 'next/navigation'; // For redirecting to login

export default function ProgramsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { user, userId, isAdmin, loading: authLoading } = useAuth(); // Use auth context
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  // Determine login status based on auth context
  const isLoggedIn = !authLoading && (!!userId || isAdmin);

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

  // Define event details (can be fetched from an API/Firestore later)
  const eventDetails = {
      id: 'kickstart-2025',
      name: 'Startup Ideation Kickstart',
      date: 'May 12, 2025',
      fee: 10000, // Example fee: ₹100.00 (in paisa)
  };


  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Our Programs</h1>
        <p className="text-muted-foreground mt-2">
          Events and initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            Upcoming Event: {eventDetails.name}
            </CardTitle>
          <CardDescription className="pt-1">
             Our inaugural program designed to help students generate and refine startup ideas. Participation requires login and payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
           <div className="flex items-center gap-4">
             <p className="text-lg font-semibold text-accent">Date: {eventDetails.date}</p>
             <p className="text-lg font-semibold">Fee: ₹{eventDetails.fee / 100}</p>
           </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Program Goals</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Inspire students to think entrepreneurially.</li>
              <li>Provide frameworks for idea generation and validation.</li>
              <li>Connect students with potential mentors and resources.</li>
              <li>Encourage the development of innovative solutions.</li>
            </ul>
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

        </CardContent>
      </Card>

      {/* Placeholder for future programs */}
       <div className="text-center pt-8">
         <h2 className="text-2xl font-semibold text-primary">More Programs Coming Soon!</h2>
         <p className="text-muted-foreground mt-2">We are actively planning more workshops, competitions, and mentorship sessions.</p>
       </div>

       {/* Participation Modal - Conditionally render only if user is logged in */}
       {isLoggedIn && !isAdmin && (
         <ParticipationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            eventDetails={eventDetails}
         />
       )}
    </div>
  );
}
