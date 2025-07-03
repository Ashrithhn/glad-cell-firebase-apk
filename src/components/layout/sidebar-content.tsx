
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
  HelpCircle as HelpCircleIcon,
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart, 
  Lightbulb, 
  MessageSquare, 
  Loader2, 
  Link2 as Link2Icon,
  QrCode,
  Users as UsersIcon,
  Image as ImageIcon,
  FileText,
  Contact as ContactIcon,
  ShieldCheck, 
  ScrollText,  
  LogIn as LogInIcon,
  UserPlus,
  Home
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
    { href: "/", label: "Home", Icon: Home },
    { href: "/ideas", label: "Ideas", Icon: Lightbulb },
    { href: "/programs", label: "Our Programs", Icon: CalendarCheck },
    { href: "/about", label: "About Us", Icon: Info },
    { href: "/contact", label: "Contact", Icon: ContactIcon },
    { href: "/terms-and-conditions", label: "Terms", Icon: ScrollText},
    { href: "/privacy-policy", label: "Privacy", Icon: ShieldCheck},
  ];

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", Icon: BarChart },
    { href: "/admin/events", label: "Manage Events", Icon: CalendarCheck },
    { href: "/admin/users", label: "Manage Users", Icon: UsersIcon },
    { href: "/admin/ideas", label: "Manage Ideas", Icon: Lightbulb },
    { href: "/admin/attendance", label: "Attendance Scanner", Icon: QrCode },
    { label: "Content & Settings", isSeparator: true },
    { href: "/admin/content/about", label: "Edit About Page", Icon: Info },
    { href: "/admin/content/contact", label: "Edit Contact Info", Icon: ContactIcon },
    { href: "/admin/content/links", label: "Manage Site Links", Icon: Link2Icon },
    { href: "/admin/content/homepage-images", label: "Homepage Images", Icon: ImageIcon },
    { href: "/admin/settings", label: "Site Settings", Icon: Settings }, 
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

        {/* User-specific profile link (not admin) */}
        {!isAdmin && isLoggedIn && (
          <>
            <Separator />
            <Button variant="ghost" className="w-full justify-start text-sm" asChild onClick={handleLinkClick}>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
          </>
        )}
        
        <Separator/>

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

         {authLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : null}

        {!authLoading && isLoggedIn ? (
          <Button variant="outline" className="w-full justify-start" onClick={handleCombinedLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
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
    </div>
  );
}
