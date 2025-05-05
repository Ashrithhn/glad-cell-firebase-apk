
'use client'; // Required for using usePathname, useState, useEffect

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb, LogOut, Menu } from 'lucide-react'; // Added Menu icon
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'; // Import Sheet components
import { SidebarContent } from './sidebar-content'; // Import SidebarContent

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for sidebar

  // Function to check auth status
  const checkAuthStatus = () => {
     if (typeof window !== 'undefined') {
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedInStatus);
      }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleAuthChange = () => {
        checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    checkAuthStatus(); // Re-check on path change

    // Close sheet on navigation
    setIsSheetOpen(false);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname]);

  // Hide header on specific pages
  const hiddenPaths = ['/login', '/register', '/admin/login'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      window.dispatchEvent(new Event('authChange'));
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
      router.refresh();
    }
  };

  // Render nothing or a placeholder until auth status is determined
  if (isLoggedIn === null) {
     return (
       <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full"></div>
                <div className="h-5 w-24 bg-muted rounded"></div>
            </div>
            <div className="hidden md:flex items-center gap-1 md:gap-2"> {/* Hide nav links on mobile */}
                <div className="h-7 w-16 bg-muted rounded"></div>
                <div className="h-7 w-16 bg-muted rounded"></div>
                <div className="h-7 w-24 bg-muted rounded"></div>
                <div className="h-7 w-20 bg-muted rounded"></div>
                <div className="h-9 w-32 bg-muted rounded-md"></div>
            </div>
             <div className="md:hidden h-8 w-8 bg-muted rounded-md"></div> {/* Placeholder for menu button */}
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 md:gap-2 flex-wrap justify-end">
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
          {isLoggedIn && (
             <Button variant="outline" size="sm" onClick={handleLogout} suppressHydrationWarning>
               <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
          )}
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                     <Lightbulb className="h-6 w-6 text-primary" />
                     <span className="font-bold text-lg text-primary">GLAD CELL</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              {/* Pass necessary props to SidebarContent */}
              <SidebarContent isLoggedIn={isLoggedIn} handleLogout={handleLogout} closeSheet={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
