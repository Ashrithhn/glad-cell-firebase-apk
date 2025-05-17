<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ServerOff, UserPlus, Palette, Settings, Globe, Edit3, UserCog, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, updateSiteSettings } from '@/services/settings';
import type { SiteSettingsData } from '@/services/settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link'; // Ensure Link is imported

export function SiteSettingsManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [siteName, setSiteName] = useState('GLAD CELL - GEC Mosalehosahalli');
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Site is currently undergoing maintenance. Please check back soon.');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('');


  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const result = await getSiteSettings();
      if (result.success && result.settings) {
        const { general, maintenance, notifications } = result.settings as any; // Using any temporarily if notifications not in type
        if (general) {
          setSiteName(general.siteName || 'GLAD CELL - GEC Mosalehosahalli');
          setAllowRegistrations(typeof general.allowRegistrations === 'boolean' ? general.allowRegistrations : true);
        }
        if (maintenance) {
          setMaintenanceModeEnabled(maintenance.enabled || false);
          setMaintenanceMessage(maintenance.message || 'Site is currently undergoing maintenance. Please check back soon.');
        }
        if (notifications) {
            setAdminNotificationEmail(notifications.adminEmail || '');
        }
      } else {
        toast({
          title: "Error Loading Settings",
          description: result.message || "Could not fetch site settings.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [toast]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const currentSettings: SiteSettingsData = {
      general: {
        siteName,
        allowRegistrations,
      },
      maintenance: {
        enabled: maintenanceModeEnabled,
        message: maintenanceMessage,
      },
      // Add other settings groups like notifications if they are part of SiteSettingsData
      notifications: { // Assuming notifications is part of the structure
          adminEmail: adminNotificationEmail,
          notifyOnNewUser: (document.getElementById('notify-new-user-toggle') as HTMLButtonElement)?.dataset?.state === 'checked', // Example
      }
    };

    const result = await updateSiteSettings(currentSettings);
    if (result.success) {
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully.",
      });
    } else {
      toast({
        title: "Error Saving Settings",
        description: result.message || "Could not save site settings.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
=======

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Globe, Palette, ShieldCheck } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/services/site-settings';
import type { SiteSettings } from '@/services/site-settings';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const result = await getSiteSettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
        } else {
          // Initialize with default settings if none found
          setSettings({ maintenanceMode: false, theme: 'default' });
          if (!result.success) {
            toast({
              title: 'Error Loading Settings',
              description: result.message || 'Could not fetch site settings. Using defaults.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        setSettings({ maintenanceMode: false, theme: 'default' });
        toast({
          title: 'Error Loading Settings',
          description: 'An unexpected error occurred while fetching settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const handleToggleMaintenanceMode = (enabled: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, maintenanceMode: enabled };
    setSettings(newSettings);
    saveSettings(newSettings, 'Maintenance mode');
  };
  
  const handleThemeChange = (newTheme: string) => {
    if (!settings) return;
    // In a real app, you'd have a select or radio group for themes
    // For now, this is a placeholder
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    saveSettings(newSettings, `Theme changed to ${newTheme}`);
     toast({
        title: "Theme Change (Placeholder)",
        description: "Theme selection UI not fully implemented. This is a placeholder for future theme management.",
    });
  };


  const saveSettings = (newSettings: SiteSettings, successMessagePrefix: string) => {
    startTransition(async () => {
      setIsSaving(true);
      try {
        const result = await updateSiteSettings(newSettings);
        if (result.success) {
          toast({
            title: `${successMessagePrefix} Updated`,
            description: 'Site settings have been saved successfully.',
          });
        } else {
          throw new Error(result.message || 'Failed to save settings.');
        }
      } catch (error) {
        toast({
          title: 'Error Saving Settings',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
        // Optionally revert UI state if save fails
        // For simplicity, we're not reverting here but you might want to
      } finally {
        setIsSaving(false);
      }
    });
>>>>>>> 338bb2b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
  };

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading settings...</p>
=======
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
>>>>>>> 338bb2b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
      </div>
    );
  }

  return (
    <div className="space-y-8">
<<<<<<< HEAD
        {/* General Site Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5"/> Site Branding &amp; General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Your Application Name" />
            </div>
            {/* Logo and Favicon upload are conceptual for now */}
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5"/> Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="allow-registrations-toggle" className="font-medium">Allow New User Registrations</Label>
                <Switch id="allow-registrations-toggle" checked={allowRegistrations} onCheckedChange={setAllowRegistrations} />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ServerOff className="h-5 w-5"/> Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="maintenance-mode-toggle" className="font-medium">Enable Maintenance Mode</Label>
                <Switch id="maintenance-mode-toggle" checked={maintenanceModeEnabled} onCheckedChange={setMaintenanceModeEnabled} />
            </div>
            {maintenanceModeEnabled && (
                <div>
                    <Label htmlFor="maintenance-message">Maintenance Mode Message</Label>
                    <Textarea
                        id="maintenance-message"
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="Site is down for scheduled maintenance."
                        rows={3}
                    />
                </div>
            )}
          </CardContent>
        </Card>
        
        {/* Theme & Appearance - Placeholder */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme & Appearance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Theme options (e.g., default theme, color palettes) can be added here. Currently, theme is user-controlled.</p>
            </CardContent>
        </Card>

        {/* Security & Access - Placeholder, with Admin User Management link */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security &amp; Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                 <Label>Admin User Management</Label>
                 <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/admin/users?role=admin"><UserCog className="mr-2 h-4 w-4" /> Manage Admin Accounts</Link>
                 </Button>
                 <p className="text-xs text-muted-foreground mt-1">Add, remove, or modify users with administrative privileges.</p>
             </div>
             {/* Placeholder for 2FA or other security settings */}
             <div className="flex items-center justify-between p-3 border rounded-md mt-4">
                <Label htmlFor="two-fa-toggle" className="font-medium">Enable Two-Factor Auth (Admins)</Label>
                <Switch id="two-fa-toggle" disabled /> 
            </div>
             <p className="text-xs text-muted-foreground mt-1 italic">2FA coming soon.</p>
            </CardContent>
        </Card>


        {/* Save Changes Button */}
        <div className="flex justify-end pt-6">
            <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4"/>}
                {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
    </div>
  );
}
=======
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Maintenance Mode
          </CardTitle>
          <CardDescription>
            When enabled, a maintenance page will be shown to all non-admin users. Admins can still access the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Switch
              id="maintenance-mode"
              checked={settings?.maintenanceMode || false}
              onCheckedChange={handleToggleMaintenanceMode}
              disabled={isSaving || isPending}
              aria-label="Toggle Maintenance Mode"
            />
            <Label htmlFor="maintenance-mode" className="flex-grow cursor-pointer">
              {settings?.maintenanceMode ? 'Maintenance Mode is ON' : 'Maintenance Mode is OFF'}
            </Label>
            {(isSaving || isPending) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Enabling this will restrict access for regular users. Use with caution.
            </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Theme Settings
          </CardTitle>
          <CardDescription>
            Manage the visual theme of the application (Coming Soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => handleThemeChange(settings?.theme === 'dark' ? 'light' : 'dark')} disabled>
                Toggle Theme (Placeholder)
            </Button>
             <p className="text-sm text-muted-foreground mt-2">
                Currently selected theme: {settings?.theme || 'default'}. Full theme customization will be available in the future.
            </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Domain & SEO
          </CardTitle>
          <CardDescription>
            Configure custom domain, SEO metadata, and analytics integrations (Coming Soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                This section will allow management of domain settings, meta tags for search engines, and integration with analytics services.
            </p>
             <Button variant="outline" disabled className="mt-4">Configure SEO (Coming Soon)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Security & Access
          </CardTitle>
          <CardDescription>
            Manage admin roles, IP restrictions, and other security settings (Coming Soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
             <p className="text-sm text-muted-foreground">
                Advanced security configurations, including multi-factor authentication settings, user role management, and access controls will be available here.
            </p>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled className="mt-4">Manage Admin Access (Coming Soon)</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Feature Not Yet Implemented</AlertDialogTitle>
                    <AlertDialogDescription>
                        Managing admin access and advanced security features are planned for a future update.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>


    </div>
  );
}
>>>>>>> 338bb2b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
