
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check, Lightbulb, Rocket, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

const welcomeSteps = [
  {
    title: 'Welcome to GLAD CELL!',
    description: 'An initiative by the Department of Computer Science and Engineering, GECM Hassan, fostering innovation.',
    Icon: Lightbulb,
    iconColor: 'text-accent', // Use accent color (Orange/Yellow)
  },
  {
    title: 'Validate Your Ideas',
    description: 'Share your concepts, get feedback, and refine your vision within a supportive community.',
     Icon: Rocket,
     iconColor: 'text-primary', // Use primary color (Purple/Pink)
  },
  {
    title: 'Focus on the Best',
    description: 'Collaborate, access resources, and get guidance to turn promising ideas into reality.',
    Icon: Target,
    iconColor: 'text-teal-400', // Example: Teal color
  },
  {
    title: "Let's Get Started!",
    description: 'Join the GLAD CELL community and begin your innovation journey.',
     Icon: Check,
     iconColor: 'text-green-400', // Example: Green color
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setIsClient(true);
    router.prefetch('/');
  }, [router]);

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, welcomeSteps.length - 1));
  };

  const handleGetStarted = () => {
     if (typeof window !== 'undefined') {
        localStorage.setItem(WELCOME_SEEN_KEY, 'true');
     }
    router.replace('/');
  };

  const progressValue = ((currentStep + 1) / welcomeSteps.length) * 100;
  const stepData = welcomeSteps[currentStep];
  const isLastStep = currentStep === welcomeSteps.length - 1;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  if (!isClient) {
    // Full black screen while loading, matching the welcome page style
    return <div className="initial-page-loader"><div className="global-loader-spinner"></div></div>;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground p-6 overflow-hidden transition-colors duration-300">
       <div className="w-full max-w-md mb-8 mt-auto px-4">
         {/* Progress bar with primary color fill */}
         <Progress value={progressValue} className="w-full h-1.5 bg-muted [&>*]:bg-primary transition-all duration-500 ease-out" />
       </div>

      <div className="relative w-full max-w-md text-center space-y-8 flex-grow flex flex-col justify-center items-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 250, damping: 25 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="absolute w-full px-4"
          >
            <div className="flex flex-col items-center space-y-6">
                <stepData.Icon className={cn("h-20 w-20 mb-4 drop-shadow-lg", stepData.iconColor)} strokeWidth={1.5}/>
               <h2 className="text-4xl font-bold tracking-tight text-primary">{stepData.title}</h2>
               <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">{stepData.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md p-4 mt-auto">
        {isLastStep ? (
          <Button
             size="lg"
             onClick={handleGetStarted}
             className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 text-lg py-3.5 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105"
             >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleNext}
            variant="secondary"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 text-lg py-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
