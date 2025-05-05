
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check, Lightbulb, Rocket, Target } from 'lucide-react'; // Added icons
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import { cn } from '@/lib/utils';

const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

const welcomeSteps = [
  {
    title: 'Welcome to GLAD CELL!',
    description: 'An initiative by the Department of Computer Science and Engineering, GECM Hassan, fostering innovation.',
    Icon: Lightbulb,
  },
  {
    title: 'Validate Your Ideas',
    description: 'Share your concepts, get feedback, and refine your vision within a supportive community.',
     Icon: Rocket,
  },
  {
    title: 'Focus on the Best',
    description: 'Collaborate, access resources, and get guidance to turn promising ideas into reality.',
    Icon: Target,
  },
  {
    title: "Let's Get Started!",
    description: 'Join the GLAD CELL community and begin your innovation journey.',
     Icon: Check,
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward (for animation)

  useEffect(() => {
    setIsClient(true);
    // Optional: Prefetch the next page for smoother transition
    router.prefetch('/'); // Prefetch the home page
  }, [router]);

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, welcomeSteps.length - 1));
  };

  const handleGetStarted = () => {
     if (typeof window !== 'undefined') {
        localStorage.setItem(WELCOME_SEEN_KEY, 'true');
     }
    // Redirect to the home page
    router.replace('/');
  };

  const progressValue = ((currentStep + 1) / welcomeSteps.length) * 100;
  const stepData = welcomeSteps[currentStep];
  const isLastStep = currentStep === welcomeSteps.length - 1;

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Render nothing on the server or until the client check is complete
  if (!isClient) {
    return <div className="fixed inset-0 bg-black"></div>; // Full black screen while loading
  }

  // Full-screen black background container
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white p-6 overflow-hidden">

      {/* Progress bar at the top */}
       <div className="w-full max-w-md mb-8 mt-auto px-4">
         <Progress value={progressValue} className="w-full h-1.5 bg-gray-700 [&>*]:bg-primary" />
       </div>


      {/* Animated Step Content Area */}
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
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full px-4" // Ensure slides take full width
          >
            <div className="flex flex-col items-center space-y-6">
               {/* Icon */}
                <stepData.Icon className="h-16 w-16 text-primary mb-4" strokeWidth={1.5}/>

               {/* Title */}
               <h2 className="text-3xl font-semibold tracking-tight">{stepData.title}</h2>

               {/* Description */}
               <p className="text-lg text-gray-400 leading-relaxed">{stepData.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with buttons */}
      <div className="w-full max-w-md p-4 mt-auto">
        {isLastStep ? (
          <Button
             size="lg"
             onClick={handleGetStarted}
             className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 text-lg py-3 rounded-full shadow-lg"
             >
            Get Started <Check className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleNext}
            variant="secondary" // Use secondary variant for continue
            className="w-full bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300 text-lg py-3 rounded-full shadow-lg"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
