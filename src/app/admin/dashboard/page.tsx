'use client'; // Added to make this a Client Component

// Placeholder Admin Dashboard Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact, Link2, LogOut, QrCode, ShieldCheck, ScrollText, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { useAuth } from '@/hooks/use-auth'; // Import useAuth to handle logout for admin
import { useRouter } from 'next/navigation'; // For redirecting after logout

export default function AdminDashboardPage() {
  const { logout } = useAuth(); 
  const router = useRouter(); 

  // Handle admin logout
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
            <CardDescription>Create, view, and manage all campus programs and events.</CardDescription>
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
            <CardDescription>Edit text content for "About Us", "Contact", legal pages, and manage site links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/about">
                 <FileText className="mr-2 h-4 w-4"/> Edit About Page
               </Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start text-left">
               <Link href="/admin/content/contact">
                 <Contact className="mr-2 h-4 w-4"/> Edit Contact Info
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
               <Link href="/admin/content/homepage-images">
                 <ImageIcon className="mr-2 h-4 w-4"/> Manage Homepage Images
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


         {/* User Management Card - Now Enabled */}
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

        {/* Idea Management Card - Now Enabled */}
         <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
             <CardTitle className="flex items-center gap-3 text-xl"><Lightbulb className="h-6 w-6 text-secondary-foreground"/> Manage Ideas</CardTitle>
            <CardDescription>Review and manage submitted student ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
               <Link href="/admin/ideas">
                 View Submitted Ideas
               </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Site Settings Card (Optional) - Now Enabled */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Settings className="h-6 w-6 text-secondary-foreground"/> Site Settings</CardTitle>
            <CardDescription>Manage general site configurations. (Placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className="w-full">
               <Link href="/admin/settings">
                 Configure Settings
               </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
