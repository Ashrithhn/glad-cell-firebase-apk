
'use client'; // Required for using hooks

import React from 'react'; // Import React for Fragment
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb, LogOut, Menu, User as UserIcon, BarChart, Building2, Home, Settings, MessageCircle, Info, HelpCircle } from 'lucide-react'; // Added icons
import { useRouter, usePathname } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userId, isAdmin, loading, logout, authError } = useAuth(); // Use auth context
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Combine user and admin login status
  const isLoggedIn = !!userId || isAdmin;

  // Hide header on specific pages - Removed welcome page
  // const hiddenPaths = ['/welcome'];
  // if (hiddenPaths.includes(pathname)) {
  //   return null;
  // }

  const handleLogout = async () => {
    try {
      await logout(); // Use logout from useAuth
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login'); // Redirect to login after logout
      router.refresh();
    } catch (error) {
        toast({
            title: 'Logout Failed',
            description: error instanceof Error ? error.message : 'Could not log out.',
            variant: 'destructive',
          });
    }
  };

  // Show skeleton while auth state is loading
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between animate-pulse">
           <div className="flex items-center gap-2">
               <div className="h-6 w-6 bg-muted rounded-full"></div>
               <div className="h-5 w-24 bg-muted rounded"></div>
           </div>
           <div className="hidden md:flex items-center gap-1 md:gap-2">
               <Skeleton className="h-7 w-16" />
               <Skeleton className="h-7 w-16" />
               <Skeleton className="h-7 w-24" />
               <Skeleton className="h-7 w-20" />
               <Skeleton className="h-7 w-20" />
               <Skeleton className="h-9 w-20" /> {/* Placeholder for login/logout or profile */}
           </div>
            <div className="md:hidden h-8 w-8 bg-muted rounded-md"></div>
        </div>
      </header>
    );
  }

  // Removed the problematic if (authError) block that caused the syntax error

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">GLAD CELL</span>
        </Link>

        {/* Desktop Navigation - Removed Login/Register */}
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
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/contact">Contact</Link>
          </Button>
          {isAdmin && ( // Show Admin Dashboard link if admin
            <Button variant="ghost" asChild size="sm">
                 <Link href="/admin/dashboard">
                     <BarChart className="mr-2 h-4 w-4"/> Admin Dashboard
                 </Link>
            </Button>
          )}
           {isLoggedIn && !isAdmin && ( // Show Profile for logged in regular users
             <Button variant="ghost" asChild size="sm">
                  <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4"/> Profile
                  </Link>
             </Button>
           )}
          {isLoggedIn ? ( // Show Logout only if logged in (user or admin)
             <Button variant="outline" size="sm" onClick={handleLogout}>
               <LogOut className="mr-2 h-4 w-4" /> Logout
             </Button>
          ) : null /* Hide Login/Register buttons here */ }
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!!authError}>
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
                 {authError && ( // Show error in Sheet if Firebase fails
                   <Alert variant="destructive" className="mt-4 text-left">
                       <AlertCircle className="h-4 w-4" />
                       <AlertTitle>Error</AlertTitle>
                       <AlertDescription>
                           {authError.message}. Some features might be unavailable.
                       </AlertDescription>
                   </Alert>
                 )}
              </SheetHeader>
              {/* Pass necessary props to SidebarContent */}
              <SidebarContent
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                handleLogout={handleLogout}
                closeSheet={() => setIsSheetOpen(false)}
                authError={authError} // Pass authError to disable login/register in sidebar
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
