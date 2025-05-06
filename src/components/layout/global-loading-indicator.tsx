
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname(); // Can be used to trigger loading on route changes

  useEffect(() => {
    // Simulate network loading for demonstration or integrate with actual loading state management
    // For example, you might listen to events from a data fetching library (e.g., TanStack Query)

    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Example: Router events (if you want to show loader on navigation)
    // This part might need adjustment depending on how Next.js handles route change events in App Router
    // For now, we'll simulate it.
    // router.events.on('routeChangeStart', handleStart);
    // router.events.on('routeChangeComplete', handleComplete);
    // router.events.on('routeChangeError', handleComplete);

    // Simulate initial load
    handleStart();
    const timer = setTimeout(() => handleComplete(), 1500); // Simulate load complete after 1.5s

    return () => {
      // router.events.off('routeChangeStart', handleStart);
      // router.events.off('routeChangeComplete', handleComplete);
      // router.events.off('routeChangeError', handleComplete);
      clearTimeout(timer);
    };
  }, [pathname]); // Rerun on pathname change to simulate loading on navigation

  if (!isLoading) {
    return null;
  }

  return (
    <div className="global-loader-overlay" aria-live="assertive" role="alert">
      <div className="global-loader-spinner"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
