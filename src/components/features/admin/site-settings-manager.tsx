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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
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