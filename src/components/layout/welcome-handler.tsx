
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
           if (pathname === '/welcome') {
               console.log('[WelcomeHandler] Redirecting from /welcome to /');
               router.replace('/');
           }
        }
        // Add a small delay to allow initial styles to apply and prevent flash
        // This is a common trick for smoother transitions with client-side logic.
        setTimeout(() => setIsCheckComplete(true), 50);
      }
  }, [pathname, router]);


  if (!isCheckComplete) {
    // Use the styled initial page loader
     return <div className="initial-page-loader"><div className="global-loader-spinner"></div></div>;
  }

  if (showWelcome && pathname !== '/welcome') {
    // If we determined to show welcome, but somehow the URL is not /welcome yet,
    // redirect to /welcome. This case might happen due to race conditions or async nature.
    // It's important for the WelcomePage to be rendered at its designated route.
    if (isClient) { // Ensure router.replace is called client-side
        router.replace('/welcome');
        return <div className="initial-page-loader"><div className="global-loader-spinner"></div></div>; // Show loader during redirect
    }
  }

  if (pathname === '/welcome') {
    if (showWelcome) {
        return <WelcomePage />;
    } else {
        // If welcome has been seen, and user tries to access /welcome directly, redirect them.
        if (isClient) {
            router.replace('/');
            return <div className="initial-page-loader"><div className="global-loader-spinner"></div></div>;
        }
    }
  }

  // Render the main application children if welcome screen is not needed or already handled
  return <>{children}</>;
}

// Helper to check if running on client (useEffect cannot be called conditionally)
const isClient = typeof window !== 'undefined';
