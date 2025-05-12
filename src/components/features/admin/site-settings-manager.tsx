
'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
=======
import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link'; // Added import for Link
>>>>>>> 349b43b (I see this error with the app, reported by NextJS, please fix it. The error is reported as HTML but presented visually to the user).)
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ServerOff, UserPlus, Palette, Globe, Edit3, UserCog, Shield } from 'lucide-react'; // Added Settings icon back
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, updateSiteSettings } from '@/services/settings'; // Correct: Use Supabase settings service
import type { SiteSettingsData } from '@/services/settings'; // Correct: Use Supabase settings type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
=======
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Globe, Palette, ShieldCheck, Save, ExternalLink, UserCog } from 'lucide-react'; // Added UserCog
import { getSiteSettings, updateSiteSettings } from '@/services/site-settings';
import type { SiteSettings } from '@/services/site-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes'; // For theme consistency
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

export function SiteSettingsManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
<<<<<<< HEAD

  // State for various settings, matching Supabase structure
  const [siteName, setSiteName] = useState('GLAD CELL - GEC Mosalehosahalli');
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Site is currently undergoing maintenance. Please check back soon.');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('');
  // Add more states if needed for other settings like theme
=======
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { theme: currentNextTheme, setTheme: setNextTheme } = useTheme(); // For syncing with next-themes

  // Local temporary state for form fields
  const [tempSeoTitle, setTempSeoTitle] = useState('');
  const [tempSeoDescription, setTempSeoDescription] = useState('');
  const [tempCustomDomain, setTempCustomDomain] = useState('');

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
<<<<<<< HEAD
      const result = await getSiteSettings(); // Fetches from Supabase settings service
      if (result.success && result.settings) {
        const { general, maintenance, notifications } = result.settings;
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
=======
      try {
        const result = await getSiteSettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
          setTempSeoTitle(result.settings.seoTitle || '');
          setTempSeoDescription(result.settings.seoDescription || '');
          setTempCustomDomain(result.settings.customDomain || '');
        } else {
          const defaultSettings: SiteSettings = { maintenanceMode: false, theme: 'default', seoTitle: '', seoDescription: '', customDomain: '' };
          setSettings(defaultSettings);
          if (!result.success) {
            toast({
              title: 'Error Loading Settings',
              description: result.message || 'Could not fetch site settings. Using defaults.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        setSettings({ maintenanceMode: false, theme: 'default', seoTitle: '', seoDescription: '', customDomain: '' });
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        toast({
          title: "Error Loading Settings",
          description: result.message || "Could not fetch site settings. Using defaults.",
          variant: "destructive",
        });
        // Set defaults if loading fails
        setSiteName('GLAD CELL - GEC Mosalehosahalli');
        setAllowRegistrations(true);
        setMaintenanceModeEnabled(false);
        setMaintenanceMessage('Site is currently undergoing maintenance. Please check back soon.');
        setAdminNotificationEmail('');
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [toast]);

<<<<<<< HEAD
  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Construct the settings object according to SiteSettingsData structure
    const currentSettings: SiteSettingsData = {
      general: {
        siteName,
        allowRegistrations,
      },
      maintenance: {
        enabled: maintenanceModeEnabled,
        message: maintenanceMessage,
      },
      notifications: {
          adminEmail: adminNotificationEmail,
          // Assuming 'notifyOnNewUser' might be controlled by a switch not shown in the screenshot.
          // If not, adjust this part or make 'notifications' optional in the payload.
          notifyOnNewUser: false, // Placeholder: get actual value if there's a UI element for it
=======
  const handleSettingChange = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Update temp states if specific keys are changed
    if (key === 'seoTitle') setTempSeoTitle(value);
    if (key === 'seoDescription') setTempSeoDescription(value);
    if (key === 'customDomain') setTempCustomDomain(value);
  };

  const handleSaveSettings = (sectionName: string) => {
    if (!settings) return;
    
    // Consolidate temp states into settings before saving
    const settingsToSave: SiteSettings = {
        ...settings,
        seoTitle: tempSeoTitle,
        seoDescription: tempSeoDescription,
        customDomain: tempCustomDomain,
    };

    startTransition(async () => {
      setIsSaving(true);
      try {
        const result = await updateSiteSettings(settingsToSave);
        if (result.success) {
          setSettings(settingsToSave); // Persist consolidated settings to main state
          toast({
            title: `${sectionName} Settings Updated`,
            description: 'Site settings have been saved successfully.',
          });
          if (sectionName === "Theme") {
             setNextTheme(settingsToSave.theme || 'default'); // Sync with next-themes
          }
        } else {
          throw new Error(result.message || 'Failed to save settings.');
        }
      } catch (error) {
        toast({
          title: 'Error Saving Settings',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      }
    };

    const result = await updateSiteSettings(currentSettings); // Updates Supabase settings
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
  };

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading settings...</p>
=======
      <div className="space-y-6">
        {[1,2,3].map(i => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3 mt-1" /></CardHeader>
          <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          <CardFooter><Skeleton className="h-8 w-24" /></CardFooter>
        </Card>
        ))}
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      </div>
    );
  }
  
  if (!settings) {
      return <p>Error: Settings could not be loaded.</p>;
  }


  return (
<<<<<<< HEAD
    <div className="space-y-8">
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
            <div>
                <Label htmlFor="site-logo">Site Logo</Label>
                <Input id="site-logo" type="file" disabled />
                <p className="text-xs text-muted-foreground mt-1">Logo upload (placeholder).</p>
            </div>
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
                <p className="text-sm text-muted-foreground">Theme options can be added here. Currently, theme is user-controlled via light/dark mode toggle.</p>
                {/* Example: Placeholder for default theme selection */}
                {/* <Select disabled><SelectTrigger><SelectValue placeholder="Select default theme (soon)" /></SelectTrigger><SelectContent></SelectContent></Select> */}
            </CardContent>
        </Card>

        {/* Security & Access - Placeholder, with Admin User Management link */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security &amp; Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                 <Label>Admin User Management (Placeholder)</Label>
                 {/* This link might need to be adjusted if your user management for admins is different */}
                 <Button variant="outline" className="w-full justify-start" asChild disabled>
                     <Link href="/admin/users?role=admin"><UserCog className="mr-2 h-4 w-4" /> Manage Admin Accounts</Link>
                 </Button>
                 <p className="text-xs text-muted-foreground mt-1">Functionality for distinct admin roles coming soon.</p>
             </div>
             <div className="flex items-center justify-between p-3 border rounded-md mt-4">
                <Label htmlFor="two-fa-toggle" className="font-medium">Enable Two-Factor Auth (Admins)</Label>
                <Switch id="two-fa-toggle" disabled /> 
            </div>
             <p className="text-xs text-muted-foreground mt-1 italic">2FA for admins coming soon.</p>
            </CardContent>
        </Card>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-6">
            <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4"/>}
                {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
         <p className="text-xs text-muted-foreground text-center italic mt-4">
            Note: Some settings are placeholders. Maintenance mode, site name, and registration toggle are functional.
        </p>
=======
    <div className="space-y-8" id="site-settings">
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
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              disabled={isSaving || isPending}
              aria-label="Toggle Maintenance Mode"
            />
            <Label htmlFor="maintenance-mode" className="flex-grow cursor-pointer">
              {settings.maintenanceMode ? 'Maintenance Mode is ON' : 'Maintenance Mode is OFF'}
            </Label>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={() => handleSaveSettings('Maintenance Mode')} disabled={isSaving || isPending}>
                {isSaving || isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Maintenance Setting
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Theme Settings
          </CardTitle>
          <CardDescription>
            Manage the visual theme of the application. Changes apply globally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <Label htmlFor="site-theme">Select Site Theme</Label>
            <Select
                value={settings.theme || 'default'}
                onValueChange={(value) => handleSettingChange('theme', value)}
            >
                <SelectTrigger id="site-theme" className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="default">System Default</SelectItem>
                    {/* Add more custom themes here if created */}
                </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground">
                "System Default" will respect the user's OS preference. Current active theme: {currentNextTheme}.
            </p>
        </CardContent>
         <CardFooter>
            <Button onClick={() => handleSaveSettings('Theme')} disabled={isSaving || isPending}>
                {isSaving || isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Theme Setting
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Domain & SEO
          </CardTitle>
          <CardDescription>
            Configure custom domain, SEO metadata, and analytics integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="customDomain">Custom Domain (e.g., www.gladcell.com)</Label>
                <Input id="customDomain" placeholder="Enter custom domain" value={tempCustomDomain} onChange={e => setTempCustomDomain(e.target.value)} disabled={isSaving || isPending}/>
                <p className="text-xs text-muted-foreground mt-1">Requires DNS configuration. Contact support for assistance.</p>
            </div>
            <div>
                <Label htmlFor="seoTitle">Default SEO Title</Label>
                <Input id="seoTitle" placeholder="Site title for search engines" value={tempSeoTitle} onChange={e => setTempSeoTitle(e.target.value)} disabled={isSaving || isPending}/>
            </div>
             <div>
                <Label htmlFor="seoDescription">Default SEO Meta Description</Label>
                <Textarea id="seoDescription" placeholder="Brief description for search engines (approx. 160 characters)" value={tempSeoDescription} onChange={e => setTempSeoDescription(e.target.value)} rows={3} disabled={isSaving || isPending}/>
            </div>
             {/* Placeholder for Analytics */}
             <div>
                <Label>Analytics Integration (e.g., Google Analytics ID)</Label>
                <Input placeholder="UA-XXXXX-Y or G-XXXXXXX (Coming Soon)" disabled />
             </div>
        </CardContent>
         <CardFooter>
            <Button onClick={() => handleSaveSettings('Domain & SEO')} disabled={isSaving || isPending}>
                {isSaving || isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save SEO Settings
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Security & Access
          </CardTitle>
          <CardDescription>
            Manage admin roles, IP restrictions, and other security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div>
                <Label>Admin User Management</Label>
                 <Button variant="outline" className="w-full justify-start" asChild>
                     <Link href="/admin/users?role=admin"><UserCog className="mr-2 h-4 w-4" /> Manage Admin Accounts</Link>
                 </Button>
                 <p className="text-xs text-muted-foreground mt-1">Add, remove, or modify users with administrative privileges.</p>
             </div>
             <div>
                <Label htmlFor="ipRestrictions">IP Address Restrictions (CIDR format, one per line)</Label>
                <Textarea id="ipRestrictions" placeholder="e.g., 192.168.1.0/24 (Coming Soon)" rows={3} disabled />
                 <p className="text-xs text-muted-foreground mt-1">Limit access to the admin panel from specific IP ranges.</p>
             </div>
              <div>
                <Label>Two-Factor Authentication (2FA)</Label>
                <Button variant="outline" className="w-full justify-start" disabled>
                    <ShieldCheck className="mr-2 h-4 w-4"/> Configure 2FA for Admins (Coming Soon)
                </Button>
             </div>
        </CardContent>
         <CardFooter>
            <Button onClick={() => handleSaveSettings('Security')} disabled={isSaving || isPending || true /* Disable save for now */}>
                {isSaving || isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Security Settings (Disabled)
            </Button>
        </CardFooter>
      </Card>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
    </div>
  );
}

