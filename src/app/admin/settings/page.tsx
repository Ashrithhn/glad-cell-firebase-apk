'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Shield, Palette, Bell, Globe, UserPlus, Edit3, ServerOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSiteSettings, updateSiteSettings } from '@/services/settings';
import type { SiteSettingsData, MaintenanceSettings, GeneralSiteSettings } from '@/services/settings';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for various settings
  const [siteName, setSiteName] = useState('GLAD CELL - GEC Mosalehosahalli');
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Site is currently undergoing maintenance. Please check back soon.');

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const result = await getSiteSettings();
      if (result.success && result.settings) {
        const { general, maintenance } = result.settings;
        if (general) {
          setSiteName(general.siteName || 'GLAD CELL - GEC Mosalehosahalli');
          setAllowRegistrations(typeof general.allowRegistrations === 'boolean' ? general.allowRegistrations : true);
        }
        if (maintenance) {
          setMaintenanceModeEnabled(maintenance.enabled || false);
          setMaintenanceMessage(maintenance.message || 'Site is currently undergoing maintenance. Please check back soon.');
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
      <div className="container mx-auto py-12 px-4 max-w-3xl flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-6">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      
      <h1 className="text-3xl font-bold text-primary mb-8">Site Settings</h1>

      <div className="space-y-8">
        
        {/* General Site Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5"/> Site Branding</CardTitle>
            <CardDescription>Customize general site information and appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Your Application Name" />
                <p className="text-xs text-muted-foreground mt-1">This name appears in browser tabs and metadata.</p>
            </div>
            <div>
                <Label htmlFor="site-logo">Site Logo</Label>
                <Input id="site-logo" type="file" disabled />
                <p className="text-xs text-muted-foreground mt-1">Logo upload coming soon. (Current logo is hardcoded)</p>
            </div>
             <div>
                <Label htmlFor="site-favicon">Site Favicon</Label>
                <Input id="site-favicon" type="file" disabled />
                <p className="text-xs text-muted-foreground mt-1">Favicon upload coming soon.</p>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Theme &amp; Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the public site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="dark-mode-toggle" className="font-medium">Enable Dark Mode by Default for Users</Label>
              <Switch id="dark-mode-toggle" defaultChecked={false} disabled/>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Theme choice is user-controlled. This setting is a placeholder for future default theme selection.
            </p>
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5"/> Registration Settings</CardTitle>
            <CardDescription>Control user registration behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="allow-registrations-toggle" className="font-medium">Allow New User Registrations</Label>
                <Switch id="allow-registrations-toggle" checked={allowRegistrations} onCheckedChange={setAllowRegistrations} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="require-approval-toggle" className="font-medium">Require Admin Approval for New Accounts</Label>
                <Switch id="require-approval-toggle" disabled /> 
            </div>
            <p className="text-sm text-muted-foreground italic">Approval system coming soon.</p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notification Settings</CardTitle>
            <CardDescription>Configure email notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="admin-email">Admin Notification Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@example.com" disabled />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="notify-new-user-toggle" className="font-medium">Notify on New User Registration</Label>
                <Switch id="notify-new-user-toggle" disabled />
            </div>
            <p className="text-sm text-muted-foreground italic">Email notification system coming soon.</p>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/> Security &amp; Access</CardTitle>
            <CardDescription>Manage admin access and site security features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" disabled>Manage Admin Accounts</Button>
             <p className="text-sm text-muted-foreground italic mt-2">Advanced admin role management coming soon.</p>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="two-fa-toggle" className="font-medium">Enable Two-Factor Authentication for Admins</Label>
                <Switch id="two-fa-toggle" disabled />
            </div>
            <p className="text-sm text-muted-foreground italic">2FA setup coming soon.</p>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ServerOff className="h-5 w-5"/> Maintenance Mode</CardTitle>
            <CardDescription>Temporarily make the site unavailable to public users.</CardDescription>
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
                    <p className="text-xs text-muted-foreground mt-1">This message will be shown to users when maintenance mode is active.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Separator />

        {/* Save Changes Button */}
        <div className="flex justify-end">
            <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4"/>}
                {isSaving ? 'Saving...' : 'Save All Settings'}
            </Button>
        </div>
         <p className="text-xs text-muted-foreground text-center italic mt-4">
            Note: Some settings are placeholders. Maintenance mode and registration toggle are functional.
        </p>
      </div>
    </div>
  );
}
