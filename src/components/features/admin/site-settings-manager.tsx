
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link'; // Added import for Link
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { theme: currentNextTheme, setTheme: setNextTheme } = useTheme(); // For syncing with next-themes

  // Local temporary state for form fields
  const [tempSeoTitle, setTempSeoTitle] = useState('');
  const [tempSeoDescription, setTempSeoDescription] = useState('');
  const [tempCustomDomain, setTempCustomDomain] = useState('');


  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
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
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3 mt-1" /></CardHeader>
          <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          <CardFooter><Skeleton className="h-8 w-24" /></CardFooter>
        </Card>
        ))}
      </div>
    );
  }
  
  if (!settings) {
      return <p>Error: Settings could not be loaded.</p>;
  }


  return (
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
    </div>
  );
}

