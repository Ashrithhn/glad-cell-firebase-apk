
'use client';

import React, { useState, useEffect } from 'react';
// import Image from 'next/image'; // Removed Image import
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the key for localStorage
const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

const welcomeSteps = [
  {
    title: 'Welcome to GLAD CELL!',
    description: 'An initiative by the Department of Computer Science and Engineering, GECM Hassan, fostering innovation.',
    // imageSrc: 'https://picsum.photos/seed/welcome/600/400', // Removed
    // imageAlt: 'Abstract representation of innovation', // Removed
    // aiHint: 'innovation abstract technology', // Removed
  },
  {
    title: 'Share & Discover Ideas',
    description: 'Explore groundbreaking concepts from students or submit your own unique startup ideas.',
    // imageSrc: 'https://picsum.photos/seed/ideas/600/400', // Removed
    // imageAlt: 'Lightbulb representing ideas', // Removed
    // aiHint: 'ideas lightbulb collaboration', // Removed
  },
  {
    title: 'Focus on the Best',
    description: 'Collaborate, refine, and get support to turn the most promising ideas into reality.',
    // imageSrc: 'https://picsum.photos/seed/focus/600/400', // Removed
    // imageAlt: 'Team working together', // Removed
    // aiHint: 'collaboration teamwork focus', // Removed
  },
  {
    title: "Let's Get Started!",
    description: 'Join the GLAD CELL community and start your innovation journey today.',
    // imageSrc: 'https://picsum.photos/seed/start/600/400', // Removed
    // imageAlt: 'Rocket launching symbolizing startup', // Removed
    // aiHint: 'startup launch rocket', // Removed
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
    const welcomeSeen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (welcomeSeen) {
      // If already seen, redirect to home immediately
      router.replace('/');
    }
  }, [router]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, welcomeSteps.length - 1));
  };

  const handleGetStarted = () => {
    // Mark welcome as seen in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    }
    // Redirect to the main home page
    router.replace('/');
  };

  const progressValue = ((currentStep + 1) / welcomeSteps.length) * 100;
  const stepData = welcomeSteps[currentStep];
  const isLastStep = currentStep === welcomeSteps.length - 1;

  // Render nothing on the server or until the client check is complete
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    // Adjusted styles for full-screen dark background
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden bg-card border-border">
        <CardContent className="p-6 text-center space-y-6">
           {/* Removed Image wrapper div */}

          <Progress value={progressValue} className="w-full h-2" />

          <h2 className="text-2xl font-semibold text-primary">{stepData.title}</h2>
          <p className="text-muted-foreground">{stepData.description}</p>
        </CardContent>
        <CardFooter className="bg-card p-4 flex justify-center border-t border-border">
          {isLastStep ? (
            <Button size="lg" onClick={handleGetStarted} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started <Check className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={handleNext} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Continue <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
      {/* Removed style tag for fade-in animation */}
    </div>
  );
}
