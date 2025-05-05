
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, Target, Lightbulb, ArrowRight, LogIn } from 'lucide-react'; // Added LogIn
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProgramsPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Our Programs</h1>
        <p className="text-muted-foreground mt-2">
          Events and initiatives by GLAD CELL to foster innovation and entrepreneurship.
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
         {/* Removed Image component */}
        <CardHeader className="border-b">
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            Upcoming Event: Startup Ideation Kickstart
            </CardTitle>
          <CardDescription className="pt-1">
            Our inaugural program designed to help students generate and refine startup ideas. Registration is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
           <div className="flex items-center gap-4">
             <p className="text-lg font-semibold text-accent">Date: May 12, 2025</p>
             {/* <Badge variant="outline">Full Day Event</Badge> */}
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

           {/* Changed Register button to point to login/register flow */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button asChild>
                <Link href="/login"> {/* Point to login, which links to register */}
                    <LogIn className="mr-2 h-4 w-4" /> Login/Register to Participate
                </Link>
                </Button>
                <p className="text-sm text-muted-foreground italic flex-1">
                 More details regarding venue and specific timings will be announced soon. Stay tuned!
               </p>
            </div>

        </CardContent>
      </Card>

      {/* Placeholder for future programs */}
       <div className="text-center pt-8">
         <h2 className="text-2xl font-semibold text-primary">More Programs Coming Soon!</h2>
         <p className="text-muted-foreground mt-2">We are actively planning more workshops, competitions, and mentorship sessions.</p>
       </div>
    </div>
  );
}
