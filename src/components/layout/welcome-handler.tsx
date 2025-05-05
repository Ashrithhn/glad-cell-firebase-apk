
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Define the key for localStorage
const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

interface WelcomeHandlerProps {
  children: React.ReactNode;
}

export function WelcomeHandler({ children }: WelcomeHandlerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false);

  useEffect(() => {
    // Only run this logic on the client-side
      if (typeof window !== 'undefined') {
        const welcomeSeen = localStorage.getItem(WELCOME_SEEN_KEY);
        let shouldRender = false; // Local variable for clarity

        // If the user hasn't seen the welcome page and isn't already on it, redirect.
        if (!welcomeSeen && pathname !== '/welcome') {
          // console.log('[WelcomeHandler] Welcome not seen, redirecting to /welcome');
          router.replace('/welcome');
          shouldRender = false; // Don't render children if redirecting
        }
        // If the user is on the welcome page, don't render the main layout children.
        else if (pathname === '/welcome') {
           // console.log('[WelcomeHandler] Currently on /welcome, not rendering children');
           shouldRender = false;
        }
        // Otherwise (welcome seen or not applicable), allow rendering children.
        else {
          // console.log('[WelcomeHandler] Welcome seen or path is /welcome, allowing children render');
          shouldRender = true;
        }

        setShouldRenderChildren(shouldRender);
        setIsCheckComplete(true); // Mark the check as complete
      }
  }, [pathname, router]);

  // Only render children if the check is complete AND it's determined they should be rendered.
  // This prevents flashing content before a potential redirect.

  if (!isCheckComplete || !shouldRenderChildren) {
    // console.log(`[WelcomeHandler] Returning null (isCheckComplete: ${isCheckComplete}, shouldRenderChildren: ${shouldRenderChildren})`);
    // Return null (or a minimal loading skeleton) while checking or if children shouldn't render
    // If the path is /welcome, let the WelcomePage render itself.
    if (pathname === '/welcome') {
        return <>{children}</> // Let the WelcomePage component handle its own rendering
    }
    return null;
  }

  // console.log('[WelcomeHandler] Rendering children');
  return <>{children}</>;
}
