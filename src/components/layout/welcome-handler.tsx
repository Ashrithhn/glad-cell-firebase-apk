
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import WelcomePage from '@/app/welcome/page'; // Import the WelcomePage component

const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

interface WelcomeHandlerProps {
    children: React.ReactNode;
}

export function WelcomeHandler({ children }: WelcomeHandlerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
      if (typeof window !== 'undefined') {
        const welcomeSeen = localStorage.getItem(WELCOME_SEEN_KEY);

        if (!welcomeSeen) {
           console.log('[WelcomeHandler] Welcome not seen, showing WelcomePage.');
           setShowWelcome(true);
        } else {
           console.log('[WelcomeHandler] Welcome seen, showing main content.');
           setShowWelcome(false);
           // If somehow user lands on /welcome after seeing it, redirect them
           if (pathname === '/welcome') {
               console.log('[WelcomeHandler] Redirecting from /welcome to /');
               router.replace('/');
           }
        }
        setIsCheckComplete(true);
      }
  }, [pathname, router]);


  if (!isCheckComplete) {
    // Optional: Return a full-screen loader matching the welcome screen background
     return <div className="fixed inset-0 bg-black flex items-center justify-center"> {/* Loading state */}
                {/* Optional: Add a spinner */}
            </div>;
  }

  if (showWelcome) {
    // Render the WelcomePage component directly instead of redirecting
    return <WelcomePage />;
  }

  // Render the main application children if welcome screen is not needed
  return <>{children}</>;
}
