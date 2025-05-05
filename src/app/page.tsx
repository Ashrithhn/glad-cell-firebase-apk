import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to IdeaSpark!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your college's central hub for innovative startup and ideathon concepts. Register, share your brilliance, and discover groundbreaking ideas from fellow students.
        </p>
      </div>

      <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-lg">
        <Image
          src="https://picsum.photos/800/450"
          alt="Ideation Concept"
          layout="fill"
          objectFit="cover"
          data-ai-hint="collaboration ideas brainstorming"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h2 className="text-2xl font-semibold">Ignite Your Inner Innovator</h2>
          <p className="text-sm opacity-80">Join the community and shape the future.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Register Now</CardTitle>
            <UserPlus className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Become a part of the IdeaSpark community. Register with a small fee to unlock full access and submit your own ideas.
            </p>
            <Button asChild>
              <Link href="/register">
                Register <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Explore Ideas</CardTitle>
            <Lightbulb className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse through the diverse collection of startup and ideathon ideas submitted by students across various departments.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/ideas">
                View Ideas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
