// Placeholder Admin Dashboard Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact, Link2, LogOut } from 'lucide-react'; // Added LogOut
import { useAuth } from '@/hooks/use-auth'; // Import useAuth to handle logout for admin
import { useRouter } from 'next/navigation'; // For redirecting after logout


// This is a client component because of useAuth and useRouter
// 'use client'; // No longer needed at top level if using hooks in a function defined below

export default function AdminDashboardPage() {
  // const { logout } = useAuth(); // This would require 'use client' at the top
  // const router = useRouter(); // This would also require 'use client'

  // Handle admin logout (function will be passed to a client component or kept here if page is client)
  // For now, keeping it simple, assuming logout is handled in header or a dedicated client button
  // const handleAdminLogout = async () => {
  //   await logout();
  //   router.push('/admin/login');
  // };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Admin Dashboard</h1>
         {/* Logout button can be added here - would require this to be a client component or use a separate client component for it */}
         {/* Example: <Button variant="outline" onClick={handleAdminLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button> */}
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
            <CardDescription>Edit text content for "About Us", "Contact", and manage site links.</CardDescription>
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
               <Link href="/admin/content/links">
                 <Link2 className="mr-2 h-4 w-4"/> Manage Site Links
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* User Management Card - Placeholder */}
         <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Users className="h-6 w-6 text-secondary-foreground"/> Manage Users</CardTitle>
            <CardDescription>View and manage registered student accounts. (Feature coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className="w-full" disabled>
               <Link href="/admin/users">
                 View Registered Users
               </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Idea Management Card - Placeholder */}
         <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
             <CardTitle className="flex items-center gap-3 text-xl"><Lightbulb className="h-6 w-6 text-secondary-foreground"/> Manage Ideas</CardTitle>
            <CardDescription>Review and manage submitted student ideas. (Feature coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
               <Link href="/admin/ideas">
                 View Submitted Ideas
               </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Site Settings Card (Optional) - Placeholder */}
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl"><Settings className="h-6 w-6 text-secondary-foreground"/> Site Settings</CardTitle>
            <CardDescription>Manage general site configurations. (Feature coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="outline" className="w-full" disabled>
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
