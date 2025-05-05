
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const welcomeSteps = [
  {
    title: 'Welcome to GLAD CELL!',
    description: 'An initiative by the Department of Computer Science and Engineering, GECM Hassan, fostering innovation.',
  },
  {
    title: 'Share & Discover Ideas',
    description: 'Explore groundbreaking concepts from students or submit your own unique startup ideas.',
  },
  {
    title: 'Focus on the Best',
    description: 'Collaborate, refine, and get support to turn the most promising ideas into reality.',
  },
  {
    title: "Let's Get Started!",
    description: 'Join the GLAD CELL community and start your innovation journey today by registering.', // Updated description
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client to prevent hydration errors if any client-specific logic were added later.
    setIsClient(true);
    // No need to check localStorage anymore, the flow forces registration/login after welcome.
  }, []);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, welcomeSteps.length - 1));
  };

  const handleGetStarted = () => {
    // Redirect to the registration page
    router.replace('/register');
  };

  const progressValue = ((currentStep + 1) / welcomeSteps.length) * 100;
  const stepData = welcomeSteps[currentStep];
  const isLastStep = currentStep === welcomeSteps.length - 1;

  // Render nothing on the server or until the client check is complete
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  // Full-screen black background container
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-foreground p-4">
      <div className="w-full max-w-md text-center space-y-8 flex-grow flex flex-col justify-center">
        {/* Progress bar at the top */}
        <Progress value={progressValue} className="w-full h-2 mb-8 bg-muted" /> {/* Ensured background for visibility */}

        {/* Step Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-primary">{stepData.title}</h2>
          <p className="text-lg text-muted-foreground">{stepData.description}</p>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="w-full max-w-md p-4 mt-auto">
        {isLastStep ? (
          <Button size="lg" onClick={handleGetStarted} className="w-full">
            Register / Login <Check className="ml-2 h-5 w-5" /> {/* Updated button text */}
          </Button>
        ) : (
          <Button size="lg" onClick={handleNext} variant="secondary" className="w-full">
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
