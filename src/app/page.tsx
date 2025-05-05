import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Lightbulb, UserPlus, CalendarCheck } from 'lucide-react';

export default function Home() {
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

      <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-lg">
        <Image
          src="https://picsum.photos/800/450?grayscale&blur=2"
          alt="Innovation Hub Concept"
          layout="fill"
          objectFit="cover"
          data-ai-hint="collaboration innovation technology students"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h2 className="text-2xl font-semibold">Fostering Innovation Together</h2>
          <p className="text-sm opacity-80">Join our community and turn ideas into reality.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
         {/* Registration card removed as per previous request */}
        {/* <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Register Now</CardTitle>
            <UserPlus className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Become a part of the GLAD CELL community. Register with a small fee to submit your ideas and access exclusive resources.
            </p>
            <Button asChild>
              <Link href="/register">
                Register <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card> */}

        <Card className="hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1"> {/* Adjusted span for layout */}
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

         <Card className="w-full max-w-4xl hover:shadow-lg transition-shadow duration-300 bg-secondary/50 md:col-span-2 lg:col-span-1"> {/* Adjusted span for layout */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Upcoming Program</CardTitle>
               <CalendarCheck className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>
                 Join us for our inaugural event focused on igniting startup potential!
              </CardDescription>
              <p className="font-medium text-primary">Startup Ideation Kickstart</p>
              <p className="text-muted-foreground">Date: May 12, 2025</p>
              <Button variant="outline" asChild>
                <Link href="/programs">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

      </div>


    </div>
  );
}
