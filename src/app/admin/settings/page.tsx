
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Shield, Palette, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// This is a placeholder page. Actual settings would involve backend logic.

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-6">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      
      <h1 className="text-3xl font-bold text-primary mb-8">Site Settings</h1>

      <div className="space-y-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Theme &amp; Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the public site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="dark-mode-toggle" className="font-medium">Enable Dark Mode Default</Label>
              <Switch id="dark-mode-toggle" disabled />
            </div>
            <p className="text-sm text-muted-foreground italic">Theme settings are currently managed globally. Advanced theme customization coming soon.</p>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notification Settings</CardTitle>
            <CardDescription>Configure email notifications for new registrations, submissions, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">Notification configuration coming soon. Admins will be notified by default for critical actions.</p>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/> Security &amp; Access</CardTitle>
            <CardDescription>Manage admin access and site security features.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="outline" disabled>Manage Admin Accounts</Button>
            <p className="text-sm text-muted-foreground italic mt-2">Advanced security settings and role management coming soon.</p>
          </CardContent>
        </Card>

         {/* Add more setting categories as needed */}
      </div>
    </div>
  );
}
