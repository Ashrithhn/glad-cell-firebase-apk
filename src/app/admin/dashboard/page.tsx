<<<<<<< HEAD
=======

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
'use client'; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
<<<<<<< HEAD
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact as ContactIcon, Link2, LogOut, QrCode, Image as ImageIcon, Globe, ShieldCheck, ScrollText } from 'lucide-react'; 
=======
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact as ContactIcon, Link2, LogOut, QrCode, Image as ImageIcon, Globe, ShieldCheck, HelpCircleIcon } from 'lucide-react'; 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
import { useAuth } from '@/hooks/use-auth'; 
import { useRouter } from 'next/navigation'; 
import { SiteSettingsManager } from '@/components/features/admin/site-settings-manager';


export default function AdminDashboardPage() {
  const { logout } = useAuth(); 
  const router = useRouter(); 

  const handleAdminLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Admin Dashboard</h1>
         <Button variant="outline" onClick={handleAdminLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Program & Event Management */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Activity className="h-6 w-6 text-primary"/> Manage Programs &amp; Events</CardTitle>
<<<<<<< HEAD
            <CardDescription>Create, view, and manage all campus programs and events. Upload images specific to each event.</CardDescription>
=======
            <CardDescription>Create, view, and manage all campus programs and events, including images.</CardDescription>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="default" className="w-full">
               <Link href="/admin/events">
                 View/Manage List
               </Link>
            </Button>
             <Button asChild variant="outline" className="w-full">
               <Link href="/admin/events/new">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* Site Content Management */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><FileText className="h-6 w-6 text-primary"/> Site Content</CardTitle>
<<<<<<< HEAD
            <CardDescription>Edit text content for "About Us", "Contact", legal pages, and manage site links.</CardDescription>
=======
            <CardDescription>Edit text for "About Us", "Contact", "Help/FAQ", and manage site links.</CardDescription>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/about">
                 <FileText className="mr-2 h-4 w-4"/> Edit About Page
               </Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/contact">
                 <ContactIcon className="mr-2 h-4 w-4"/> Edit Contact Info
               </Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/privacy">
                 <ShieldCheck className="mr-2 h-4 w-4"/> Edit Privacy Policy
               </Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/terms">
                 <ScrollText className="mr-2 h-4 w-4"/> Edit Terms & Conditions
               </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/links">
                 <Link2 className="mr-2 h-4 w-4"/> Manage Site Links
               </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/help">
                 <HelpCircleIcon className="mr-2 h-4 w-4"/> Edit Help/FAQ Page
               </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Attendance Scanner Card */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><QrCode className="h-6 w-6 text-accent"/> Attendance Scanner</CardTitle>
            <CardDescription>Scan QR codes on event tickets to mark participant attendance.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
               <Link href="/admin/attendance">
                 Open Scanner
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* User Management Card */}
         <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Users className="h-6 w-6 text-secondary-foreground"/> Manage Users</CardTitle>
            <CardDescription>View and manage registered student accounts.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className="w-full">
               <Link href="/admin/users">
                 View Registered Users
               </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Idea Management Card (Still Placeholder) */}
         <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
             <CardTitle className="flex items-center gap-3 text-xl"><Lightbulb className="h-6 w-6 text-secondary-foreground"/> Manage Ideas</CardTitle>
            <CardDescription>Review and manage submitted student ideas. (Feature Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
               <Link href="/admin/ideas">
                 View Submitted Ideas
               </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Homepage Content Management */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><ImageIcon className="h-6 w-6 text-primary"/> Homepage Content</CardTitle>
            <CardDescription>Manage images (carousel, section promos) and other featured content on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/homepage-images">
                 <ImageIcon className="mr-2 h-4 w-4"/> Manage Homepage Images
               </Link>
            </Button>
            {/* Add more links here e.g., for featured event text, announcements */}
          </CardContent>
        </Card>


        {/* Site Settings Card (Encompassing Maintenance Mode) */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50 col-span-1 sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Settings className="h-6 w-6 text-secondary-foreground"/> Site Settings</CardTitle>
            <CardDescription>Manage general site configurations, including maintenance mode, theme, and more.</CardDescription>
          </CardHeader>
          <CardContent>
             <SiteSettingsManager />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}