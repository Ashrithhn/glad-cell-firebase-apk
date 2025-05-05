
'use client'; // Required for using usePathname, useState, useEffect

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb, LogIn, LogOut } from 'lucide-react'; // Added LogOut
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter
import { toast } from '@/hooks/use-toast';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Use null initial state

  // Function to check auth status
  const checkAuthStatus = () => {
     if (typeof window !== 'undefined') {
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        // console.log('[Header] Checked auth status:', loggedInStatus);
        setIsLoggedIn(loggedInStatus);
      }
  };

  useEffect(() => {
    // Initial check on mount
    checkAuthStatus();

    // Listen for custom 'authChange' events (fired from login/logout)
    const handleAuthChange = () => {
        // console.log('[Header] Detected authChange event');
        checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    // Also re-check when pathname changes (e.g., after navigation)
    // This helps ensure the header reflects the state even if the event listener is missed
    checkAuthStatus();


    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname]); // Re-run effect if pathname changes


  // Hide header on specific pages
  const hiddenPaths = ['/welcome', '/login', '/register', '/admin/login']; // Welcome page handled by WelcomeHandler
  if (hiddenPaths.includes(pathname)) {
    // console.log('[Header] Hiding header for path:', pathname);
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      // console.log('[Header] User logged out');
      window.dispatchEvent(new Event('authChange')); // Notify other components
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login'); // Redirect to login page after logout
      router.refresh(); // Refresh potentially needed data
    }
  };


  // Render nothing or a placeholder until auth status is determined
  if (isLoggedIn === null) {
     // Optional: Render a skeleton or minimal header while loading
     return (
       <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full"></div>
                <div className="h-5 w-24 bg-muted rounded"></div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
                <div className="h-7 w-16 bg-muted rounded"></div>
                <div className="h-7 w-16 bg-muted rounded"></div>
                <div className="h-7 w-24 bg-muted rounded"></div>
                <div className="h-7 w-20 bg-muted rounded"></div>
                <div className="h-9 w-32 bg-muted rounded-md"></div>
            </div>
         </div>
       </header>
     );
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">GLAD CELL</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
          <Button variant="ghost" asChild size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/ideas">Ideas</Link>
          </Button>
           <Button variant="ghost" asChild size="sm">
            <Link href="/programs">Our Programs</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/contact">Contact</Link>
          </Button>
          {/* Conditional Login/Logout Button */}
          {isLoggedIn ? (
             <Button variant="outline" size="sm" onClick={handleLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
          ) : (
            <Button variant="default" asChild size="sm">
              <Link href="/login">
                 <LogIn className="mr-2 h-4 w-4" /> Login / Register
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
