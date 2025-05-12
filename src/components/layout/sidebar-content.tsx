
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
  HelpCircle as HelpCircleIcon, // Renamed to avoid conflict
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart, 
  Lightbulb, 
  MessageSquare, 
  Loader2, 
  Link2 as Link2Icon, // Renamed to avoid conflict with Link component
  QrCode,
  Users as UsersIcon, // For Manage Users
  Image as ImageIcon, // For Homepage Images
  FileText, // For general content
  Contact as ContactIcon, // Renamed to avoid conflict
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
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        )}

        {/* Dynamic WhatsApp Community Link (for all users if available) */}
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
          <Button variant="outline" className="w-full justify-start" onClick={handleCombinedLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
    </div>
  );
}

