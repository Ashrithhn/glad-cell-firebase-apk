
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Globe, Palette, Save, Lightbulb } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/services/site-settings';
import type { SiteSettings } from '@/services/site-settings';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';

interface SiteSettingsManagerProps {
  initialSettings?: SiteSettings;
}

export function SiteSettingsManager({ initialSettings }: SiteSettingsManagerProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  useEffect(() => {
    if (!initialSettings) {
      async function fetchSettings() {
        setIsLoading(true);
        const result = await getSiteSettings();
        if (result.success && result.settings) {
          setSettings(result.settings);
        } else {
          toast({
            title: 'Error Loading Settings',
            description: result.message || 'Could not fetch site settings. Using defaults.',
            variant: 'destructive',
          });
        }
        setIsLoading(false);
      }
      fetchSettings();
    }
  }, [initialSettings, toast]);

  const handleSettingChange = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings(prevSettings => ({ ...prevSettings!, [key]: value }));
  };

  const handleSaveSettings = () => {
    if (!settings) return;

    startTransition(async () => {
      setIsSaving(true);
      try {
        const result = await updateSiteSettings(settings);
        if (result.success) {
          toast({
            title: `Settings Updated`,
            description: 'Site settings have been saved successfully.',
          });

          // Refresh the page to reflect changes, like hidden menu items
          router.refresh();
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
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-2/3 mt-1" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!settings) {
    return <p>Error: Settings could not be loaded. Please try refreshing the page.</p>;
  }

  const isSaveDisabled = isSaving || isPending;

  return (
    <div className="space-y-8" id="site-settings">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Maintenance Mode
          </CardTitle>
          <CardDescription>
            When enabled, a maintenance banner will be shown to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Switch
              id="maintenance-mode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              disabled={isSaveDisabled}
              aria-label="Toggle Maintenance Mode"
            />
            <Label htmlFor="maintenance-mode" className="flex-grow cursor-pointer">
              {settings.maintenanceMode ? 'Maintenance Mode is ON' : 'Maintenance Mode is OFF'}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> Feature Flags
          </CardTitle>
          <CardDescription>
            Toggle major features of the application on or off globally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Switch
              id="allow-idea-submissions"
              checked={settings.allowIdeaSubmissions}
              onCheckedChange={(checked) => handleSettingChange('allowIdeaSubmissions', checked)}
              disabled={isSaveDisabled}
              aria-label="Toggle Idea Submissions"
            />
            <Label htmlFor="allow-idea-submissions" className="flex-grow cursor-pointer">
              {settings.allowIdeaSubmissions ? 'Idea Submissions are ENABLED' : 'Idea Submissions are DISABLED'}
            </Label>
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Domain & SEO
          </CardTitle>
          <CardDescription>
            Configure default SEO metadata for your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">Default SEO Title</Label>
            <Input id="seoTitle" placeholder="Site title for search engines" value={settings.seoTitle || ''} onChange={e => handleSettingChange('seoTitle', e.target.value)} disabled={isSaveDisabled} />
          </div>
          <div>
            <Label htmlFor="seoDescription">Default SEO Meta Description</Label>
            <Textarea id="seoDescription" placeholder="Brief description for search engines (approx. 160 characters)" value={settings.seoDescription || ''} onChange={e => handleSettingChange('seoDescription', e.target.value)} rows={3} disabled={isSaveDisabled} />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 border-t -mx-4 -mb-4">
        <Button onClick={handleSaveSettings} disabled={isSaveDisabled} className="w-full sm:w-auto">
          {isSaveDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
