
'use client'; // Required for state and event handlers if any are added

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Shield, Palette, Bell, Globe, UserPlus, Edit3, ServerOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import React, { useState } from 'react'; // Import useState for local component state

// This page will have more enabled and new placeholder settings.
// Actual functionality for new settings would require backend logic and state management.

export default function AdminSettingsPage() {
  // Example state for new settings (local to this component for UI demonstration)
  const [siteName, setSiteName] = useState('GLAD CELL - GEC Mosalehosahalli');
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Site is currently undergoing maintenance. Please check back soon.');

  // Handlers for new settings (would interact with backend in a real app)
  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteName(e.target.value);
  const handleAllowRegistrationsToggle = () => setAllowRegistrations(!allowRegistrations);
  const handleMaintenanceModeToggle = () => setMaintenanceMode(!maintenanceMode);
  const handleMaintenanceMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setMaintenanceMessage(e.target.value);

  const handleSaveChanges = () => {
    // In a real app, this would trigger a server action to save all settings.
    // For now, it can show a toast or log to console.
    console.log("Saving settings:", { siteName, allowRegistrations, maintenanceMode, maintenanceMessage });
    // Example: toast({ title: "Settings Saved (Placeholder)", description: "Changes would be applied in a live app." });
  };


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
                <Input id="site-name" value={siteName} onChange={handleSiteNameChange} placeholder="Your Application Name" />
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


        {/* Theme & Appearance (Existing, now 'enabled' UI-wise) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Theme &amp; Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the public site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="dark-mode-toggle" className="font-medium">Enable Dark Mode by Default for Users</Label>
              <Switch id="dark-mode-toggle" defaultChecked={false} />
            </div>
            <p className="text-sm text-muted-foreground italic">
              Theme choice is primarily user-controlled via the header toggle. This setting (if implemented) would set the initial default theme for new visitors.
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
                <Switch id="allow-registrations-toggle" checked={allowRegistrations} onCheckedChange={handleAllowRegistrationsToggle} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="require-approval-toggle" className="font-medium">Require Admin Approval for New Accounts</Label>
                <Switch id="require-approval-toggle" disabled /> {/* Placeholder */}
            </div>
            <p className="text-sm text-muted-foreground italic">Approval system coming soon.</p>
          </CardContent>
        </Card>

        {/* Notification Settings (Existing, remains placeholder for backend) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notification Settings</CardTitle>
            <CardDescription>Configure email notifications for new registrations, submissions, etc.</CardDescription>
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
            <p className="text-sm text-muted-foreground italic">Email notification system (e.g., SendGrid, Nodemailer integration) coming soon.</p>
          </CardContent>
        </Card>

        {/* Security & Access (Existing, "Manage Admin Accounts" now 'enabled' UI-wise) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/> Security &amp; Access</CardTitle>
            <CardDescription>Manage admin access and site security features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline">Manage Admin Accounts</Button> {/* Button is now enabled */}
             <p className="text-sm text-muted-foreground italic mt-2">Advanced admin role management (e.g., using Firebase Custom Claims) is a future enhancement.</p>
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
                <Switch id="maintenance-mode-toggle" checked={maintenanceMode} onCheckedChange={handleMaintenanceModeToggle} />
            </div>
            {maintenanceMode && (
                <div>
                    <Label htmlFor="maintenance-message">Maintenance Mode Message</Label>
                    <Textarea id="maintenance-message" value={maintenanceMessage} onChange={handleMaintenanceMessageChange} placeholder="Site is down for scheduled maintenance." rows={3}/>
                    <p className="text-xs text-muted-foreground mt-1">This message will be shown to users when maintenance mode is active.</p>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Separator />

        {/* Save Changes Button */}
        <div className="flex justify-end">
            <Button size="lg" onClick={handleSaveChanges}>
                <Edit3 className="mr-2 h-4 w-4"/> Save All Settings
            </Button>
        </div>
         <p className="text-xs text-muted-foreground text-center italic mt-4">
            Note: Many settings on this page are placeholders for UI demonstration. Full functionality requires backend implementation.
        </p>

      </div>
    </div>
  );
}
