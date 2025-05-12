
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
<<<<<<< HEAD
=======
  HelpCircle as HelpCircleIcon, // Renamed to avoid conflict
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart, 
  Lightbulb, 
  MessageSquare, 
  Loader2, 
<<<<<<< HEAD
  Link2, 
<<<<<<< HEAD
  QrCode, 
  Users as UsersIcon, 
  FileText, 
  Contact as ContactIcon,
  ShieldCheck, 
  ScrollText,  
  Image as ImageIcon, 
  LogIn as LogInIcon,
  UserPlus
=======
=======
  Link2 as Link2Icon, // Renamed to avoid conflict with Link component
>>>>>>> 2d08f22 (and remove home button in admin dashboard)
  QrCode,
  Users as UsersIcon, // For Manage Users
  Image as ImageIcon, // For Homepage Images
  FileText, // For general content
<<<<<<< HEAD
  Contact, // For contact edit
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
=======
  Contact as ContactIcon, // Renamed to avoid conflict
>>>>>>> 2d08f22 (and remove home button in admin dashboard)
} from 'lucide-react';
import React, { useEffect, useState } from 'react'; 
import { getContent } from '@/services/content'; 
import type { SiteLinks } from '@/services/content'; 
import { useAuth } from '@/hooks/use-auth'; 
import { toast } from '@/hooks/use-toast'; 

interface SidebarContentProps {
  closeSheet: () => void;
}

export function SidebarContent({ closeSheet }: SidebarContentProps) {
  const { theme, setTheme } = useTheme();
  const [links, setLinks] = useState<SiteLinks | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const { isLoggedIn, isAdmin, logout: authLogout, loading: authLoading, authError } = useAuth(); // Ensure authLogout is destructured


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
     if (authLogout) { // Check if authLogout is defined
        authLogout(); 
     }
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

  // Common navigation items
  const commonNavItems = [
    { href: "/", label: "Home", Icon: Lightbulb }, // Using Lightbulb for Home as per original
    { href: "/ideas", label: "Ideas", Icon: Lightbulb },
    { href: "/programs", label: "Events", Icon: CalendarCheck },
    { href: "/about", label: "About Us", Icon: Info },
    { href: "/contact", label: "Contact & Help", Icon: HelpCircleIcon },
  ];

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", Icon: BarChart },
    { href: "/admin/events", label: "Manage Events", Icon: CalendarCheck },
    { href: "/admin/users", label: "Manage Users", Icon: UsersIcon },
    { href: "/admin/attendance", label: "Attendance Scanner", Icon: QrCode },
    { label: "Content Management", isSeparator: true },
    { href: "/admin/content/about", label: "Edit About Page", Icon: FileText },
    { href: "/admin/content/contact", label: "Edit Contact Info", Icon: ContactIcon },
    { href: "/admin/content/links", label: "Manage Site Links", Icon: Link2Icon },
    { href: "/admin/content/help", label: "Edit Help/FAQ", Icon: HelpCircleIcon },
    { href: "/admin/content/homepage-images", label: "Homepage Images", Icon: ImageIcon },
    { label: "Site Configuration", isSeparator: true },
    { href: "/admin/dashboard#site-settings", label: "Site Settings", Icon: Settings }, // Link to section in dashboard
  ];

  const navItemsToRender = isAdmin ? adminNavItems : commonNavItems;


  return (
    <div className="flex flex-col h-full pt-6">
<<<<<<< HEAD
      <nav className="flex-grow space-y-2">
         {!isAdmin && ( 
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
                <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
                </Link>
            </Button>
         )}

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
=======
      <nav className="flex-grow space-y-1">
        {navItemsToRender.map((item, index) => {
          if (item.isSeparator) {
            return <Separator key={`sep-${index}`} className="my-2" />;
          }
          const { Icon, href, label } = item;
          return (
            <Button key={href || label} variant="ghost" className="w-full justify-start text-sm" asChild onClick={handleLinkClick}>
              <Link href={href!}>
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {label}
              </Link>
            </Button>
          );
        })}

        {/* User-specific links (not admin) */}
        {!isAdmin && isLoggedIn && (
          <Button variant="ghost" className="w-full justify-start text-sm" asChild onClick={handleLinkClick}>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        )}

<<<<<<< HEAD
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

=======
        {/* Dynamic WhatsApp Community Link (for all users if available) */}
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        {loadingLinks ? (
             <Button variant="ghost" className="w-full justify-start text-sm" disabled>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Link...
             </Button>
        ) : whatsappLink ? (
            <Button variant="ghost" className="w-full justify-start text-sm" asChild onClick={handleLinkClick}>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Community
                </a>
            </Button>
<<<<<<< HEAD
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
        
        {authLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : null}

        {!authLoading && isLoggedIn ? (
=======
        ) : null}

        {/* Feedback Button (for all users) */}
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleFeedbackClick}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
        </Button>
        
        {!isAdmin && <Separator />}

      </nav>

      {/* Settings and Auth Section */}
      <div className="mt-auto pb-4 px-2 space-y-2">
        <div className="px-2 py-1">
             <Label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                 <Settings className="mr-2 h-4 w-4" /> Display Settings
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
        <Separator />

        {isLoggedIn && (
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
          <Button variant="outline" className="w-full justify-start" onClick={handleCombinedLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
<<<<<<< HEAD
        ) : null}

        {!authLoading && !isLoggedIn && !authError ? (
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/login"><LogInIcon className="mr-2 h-4 w-4"/>Login</Link>
            </Button>
            <Button variant="default" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link href="/register"><UserPlus className="mr-2 h-4 w-4"/>Register</Link>
            </Button>
          </div>
        ) : null}
        
      </div>
=======
        )}
       {!isLoggedIn && !authError && (
           <>
                <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                    <Link href="/login"><User className="mr-2 h-4 w-4"/>Login</Link>
                 </Button>
                 <Button variant="default" className="w-full justify-start" asChild onClick={handleLinkClick}>
                     <Link href="/register"><User className="mr-2 h-4 w-4"/>Register</Link>
                 </Button>
           </>
       )}
       </div>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
    </div>
  );
}

