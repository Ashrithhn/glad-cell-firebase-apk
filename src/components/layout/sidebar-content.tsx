
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
  HelpCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarContentProps {
  isLoggedIn: boolean | null;
  handleLogout: () => void;
  closeSheet: () => void; // Function to close the sheet
}

export function SidebarContent({ isLoggedIn, handleLogout, closeSheet }: SidebarContentProps) {
  const { theme, setTheme } = useTheme();

  const handleLinkClick = () => {
    closeSheet(); // Close sheet when a link is clicked
  };

   const handleCombinedLogout = () => {
     handleLogout();
     closeSheet();
   };

  return (
    <div className="flex flex-col h-full pt-6">
      <nav className="flex-grow space-y-2">
        {isLoggedIn && (
          <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
             {/* Link to a future profile page */}
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        )}
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
          <Link href="/programs">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Events
          </Link>
        </Button>
         {/* Placeholder link - replace with your actual WhatsApp group link */}
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
            <a href="https://chat.whatsapp.com/YourGroupInviteLink" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp Community
            </a>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
          {/* Link to a future About Us page */}
          <Link href="/about">
            <Info className="mr-2 h-4 w-4" />
            About Us
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
          <Link href="/contact"> {/* Assuming contact page serves as help */}
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Link>
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
                 <Label htmlFor="theme-switch" className="text-sm">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                 </Label>
                 </div>
                <Switch
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    aria-label="Toggle theme"
                />
            </div>
            {/* Add more settings options here */}
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
    </div>
  );
}
