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
  MessageCircle, 
  Info,
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart, 
  Home, 
  Lightbulb, 
  MessageSquare, 
  Loader2, 
  Link2, 
  QrCode, 
  Users as UsersIcon, 
  FileText, 
  Contact as ContactIcon,
  ShieldCheck, 
  ScrollText,  
  Image as ImageIcon, 
} from 'lucide-react';
import React, { useEffect, useState } from 'react'; 
import { getContent } from '@/services/content'; 
import type { SiteLinks } from '@/services/content'; 
import { useAuth } from '@/hooks/use-auth'; 
import { toast } from '@/hooks/use-toast'; 

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
        setLinks({ whatsappCommunity: '' }); 
      }
      setLoadingLinks(false);
    }
    fetchLinks();
  }, []);


  const handleLinkClick = () => {
    closeSheet(); 
  };

   const handleCombinedLogout = () => {
     handleLogout();
     closeSheet();
   };

   const handleFeedbackClick = () => {
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

        {isLoggedIn && !isAdmin && ( 
          <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        )}

        {isAdmin && ( 
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
              <Link href="/admin/content/privacy">
                <ShieldCheck className="mr-2 h-4 w-4"/> Edit Privacy Policy
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/terms">
                <ScrollText className="mr-2 h-4 w-4"/> Edit Terms & Conditions
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/links">
                <Link2 className="mr-2 h-4 w-4" /> Manage Site Links
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/homepage-images">
                <ImageIcon className="mr-2 h-4 w-4" /> Manage Carousel Images
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/edit-explore-ideas-image">
                <ImageIcon className="mr-2 h-4 w-4" /> "Explore Ideas" Img
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/admin/content/edit-latest-event-image">
                <ImageIcon className="mr-2 h-4 w-4" /> "Latest Event" Img
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

        {/* Legal Links */}
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/terms-and-conditions">
              <ScrollText className="mr-2 h-4 w-4" /> Terms & Conditions
            </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <Link href="/privacy-policy">
              <ShieldCheck className="mr-2 h-4 w-4" /> Privacy Policy
            </Link>
        </Button>


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
        ) : null }


        <Button variant="ghost" className="w-full justify-start" onClick={handleFeedbackClick}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
        </Button>

         <Separator />

      </nav>

      <div className="mt-auto pb-4 px-2 space-y-4">
        <div className="px-2 py-1">
                <Label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </Label>
                <div className="flex items-center justify-between space-x-2 mt-2 pl-2">
                    <div className="flex items-center space-x-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label htmlFor="theme-switch-mobile" className="text-sm"> 
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Label>
                    </div>
                    <Switch
                        id="theme-switch-mobile" 
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        aria-label="Toggle theme"
                    />
                </div>
            </div>
        {isLoggedIn && (
            <Button variant="outline" className="w-full justify-start" onClick={handleCombinedLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        )}
        {!isLoggedIn && !authError && (
            <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                        <Link href="/login"><User className="mr-2 h-4 w-4"/>Login</Link>
                    </Button>
                    <Button variant="default" className="w-full justify-start" asChild onClick={handleLinkClick}>
                        <Link href="/register"><User className="mr-2 h-4 w-4"/>Register</Link>
                    </Button>
            </div>
        )}
      </div>
    </div>
  );
}
