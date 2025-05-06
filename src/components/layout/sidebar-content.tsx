
'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  User,
  CalendarCheck,
  MessageCircle, // Keep for WhatsApp
  Info,
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart, // Added Admin Icon
  Home, // Added Home Icon
  Lightbulb, // Added Ideas Icon
  MessageSquare, // Added Feedback Icon
  Loader2, // For loading state
  Link2, // Generic link icon
  QrCode, 
  Users as UsersIcon, // Renamed to avoid conflict
  FileText, // For content editing
  Contact as ContactIcon, // Renamed to avoid conflict
} from 'lucide-react';
import React, { useEffect, useState } from 'react'; // Import React hooks
import { getContent } from '@/services/content'; // Import content service
import type { SiteLinks } from '@/services/content'; // Import type
import { useAuth } from '@/hooks/use-auth'; // Keep useAuth for login state etc.
import { toast } from '@/hooks/use-toast'; // For feedback placeholder

interface SidebarContentProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  handleLogout: () => void;
  closeSheet: () => void;
  authError: Error | null;
}

export function SidebarContent({ isLoggedIn, isAdmin, handleLogout, closeSheet, authError }: SidebarContentProps) {
  const { theme, setTheme } = useTheme();
  const [links, setLinks] = useState<SiteLinks | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      setLoadingLinks(true);
      const result = await getContent('links');
      if (result.success && typeof result.data === 'object' && result.data !== null) {
        setLinks(result.data as SiteLinks);
      } else {
        console.warn("Could not fetch site links for sidebar:", result.message);
        setLinks({ whatsappCommunity: '' }); // Default to empty if fetch fails
      }
      setLoadingLinks(false);
    }
    fetchLinks();
  }, []);


  const handleLinkClick = () => {
    closeSheet(); // Close sheet when a link is clicked
  };

   const handleCombinedLogout = () => {
     handleLogout();
     closeSheet();
   };

   const handleFeedbackClick = () => {
       // TODO: Implement feedback mechanism (e.g., open modal, link to form)
       toast({
           title: "Feedback",
           description: "Feedback feature coming soon! Thanks for your interest.",
           variant: "default"
       });
       closeSheet();
   }

   const whatsappLink = links?.whatsappCommunity;

  return (
    <div className="flex flex-col h-full pt-6">
      <nav className="flex-grow space-y-2">
         <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/ideas">
              <Lightbulb className="mr-2 h-4 w-4" />
              Ideas
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/programs">
                <CalendarCheck className="mr-2 h-4 w-4" /> Our Programs
            </Link>
          </Button>

        {isLoggedIn && !isAdmin && ( // Show profile only for logged-in non-admin users
          <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        )}

        {isAdmin && ( // Admin-specific section
          <>
            <Separator />
             <Label className="flex items-center text-sm font-medium text-muted-foreground mb-1 px-2 pt-2">
               <Settings className="mr-2 h-4 w-4" /> Admin Tools
             </Label>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/dashboard">
                <BarChart className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/events">
                <CalendarCheck className="mr-2 h-4 w-4" /> Manage Events
              </Link>
            </Button>
             <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/users">
                <UsersIcon className="mr-2 h-4 w-4" /> Manage Users
              </Link>
            </Button>
             <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/ideas">
                <Lightbulb className="mr-2 h-4 w-4" /> Manage Ideas
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/attendance">
                <QrCode className="mr-2 h-4 w-4" /> Attendance Scanner
              </Link>
            </Button>
            
             <Separator />
             <Label className="flex items-center text-sm font-medium text-muted-foreground mb-1 px-2 pt-2">
               <FileText className="mr-2 h-4 w-4" /> Content &amp; Settings
             </Label>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/about">
                <Info className="mr-2 h-4 w-4" /> Edit About Us
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/contact">
                <ContactIcon className="mr-2 h-4 w-4"/> Edit Contact Info
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/links">
                <Link2 className="mr-2 h-4 w-4" /> Manage Site Links
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" /> Site Settings
              </Link>
            </Button>
          </>
        )}
        <Separator/>
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/about">
              <Info className="mr-2 h-4 w-4" /> About Us
            </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/contact">
              <ContactIcon className="mr-2 h-4 w-4" /> Contact
            </Link>
        </Button>


         {/* Dynamic WhatsApp Community Link */}
        {loadingLinks ? (
             <Button variant="ghost" className="w-full justify-start" disabled>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Link...
             </Button>
        ) : whatsappLink ? (
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Community
                </a>
            </Button>
        ) : null /* Don't render if link is empty or not loaded */}


         {/* Feedback Button */}
        <Button variant="ghost" className="w-full justify-start" onClick={handleFeedbackClick}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
        </Button>

        <Separator />

        {/* Settings Section */}
        <div className="px-2 py-1">
             <Label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                 <Settings className="mr-2 h-4 w-4" /> Settings
             </Label>
            <div className="flex items-center justify-between space-x-2 mt-2 pl-2">
                 <div className="flex items-center space-x-2">
                 {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                 <Label htmlFor="theme-switch-mobile" className="text-sm"> {/* Unique ID for mobile switch */}
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                 </Label>
                 </div>
                <Switch
                    id="theme-switch-mobile" // Unique ID
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    aria-label="Toggle theme"
                />
            </div>
        </div>

         <Separator />

      </nav>

      {/* Logout button at the bottom */}
      {isLoggedIn && (
        <div className="mt-auto pb-4 px-2">
          <Button variant="outline" className="w-full justify-start" onClick={handleCombinedLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
       {/* Show Login/Register only if not logged in AND no auth error */}
       {!isLoggedIn && !authError && (
           <div className="mt-auto pb-4 px-2 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                    <Link href="/login"><User className="mr-2 h-4 w-4"/>Login</Link>
                 </Button>
                 <Button variant="default" className="w-full justify-start" asChild onClick={handleLinkClick}>
                     <Link href="/register"><User className="mr-2 h-4 w-4"/>Register</Link>
                 </Button>
           </div>
       )}
    </div>
  );
}
