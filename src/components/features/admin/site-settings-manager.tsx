
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
  };

  if (isLoading) {
    return (
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
