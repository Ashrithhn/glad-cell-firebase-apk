
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User as UserIcon, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { NotificationBell } from './notification-bell';

import { CommunityDropdown } from './community-dropdown';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function Header() {
  const router = useRouter();
  const { userId, isAdmin, loading, logout, authError } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const isLoggedIn = !!userId || isAdmin;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'Could not log out.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm shadow-md">
        <div className="container flex h-16 items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="h-5 w-24 bg-muted rounded"></div>
          </div>
          <div className="hidden md:flex items-center gap-1 md:gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-20" />
          </div>
          <div className="md:hidden h-8 w-8 bg-muted rounded-md"></div>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-4 z-50 w-[95%] max-w-7xl mx-auto rounded-full border bg-gray-900/90 text-white shadow-lg backdrop-blur-md mt-4">
      <div className="mx-auto flex h-16 w-full max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="GLAD CELL Logo" width={40} height={40} className="h-10 w-10" unoptimized={true} />
          <span className="font-bold text-lg text-white">GLAD CELL</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 md:gap-2">
          <Button variant="ghost" className="text-white hover-neon-glow" asChild size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" className="text-white hover-neon-glow" asChild size="sm">
            <Link href="/programs">Our Programs</Link>
          </Button>
          <Button variant="ghost" className="text-white hover-neon-glow" asChild size="sm">
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" className="text-white hover-neon-glow" asChild size="sm">
            <Link href="/help">Help</Link>
          </Button>
          <Button variant="ghost" className="text-white hover-neon-glow" asChild size="sm">
            <Link href="/contact">Contact</Link>
          </Button>

          <div className="flex items-center gap-1 pl-4">
            {isLoggedIn && <NotificationBell />}

            <CommunityDropdown />

            <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />

            {isLoggedIn ? (
              <div
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="@user" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">User Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Manage your account
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer w-full flex items-center">
                          <BarChart className="mr-2 h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {!isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full flex items-center">
                          <UserIcon className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="outline" className="text-white border-white/50 bg-transparent hover-neon-glow" asChild size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="default" className="bg-white text-gray-900 hover-neon-glow hover:bg-transparent hover:text-white" asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isLoggedIn && <NotificationBell />}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="hover:bg-white/10" size="icon" disabled={!!authError}>
                <Menu className="h-6 w-6 text-white" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                    <Image src="/logo.png" alt="GLAD CELL Logo" width={32} height={32} className="h-8 w-8" unoptimized={true} />
                    <span className="font-bold text-lg text-primary">GLAD CELL</span>
                  </Link>
                </SheetTitle>
                {authError && (
                  <Alert variant="destructive" className="mt-4 text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {authError.message}. Some features might be unavailable.
                    </AlertDescription>
                  </Alert>
                )}
              </SheetHeader>
              <SidebarContent
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                handleLogout={handleLogout}
                closeSheet={() => setIsSheetOpen(false)}
                authError={authError}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
