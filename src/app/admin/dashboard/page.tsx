// Placeholder Admin Dashboard Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, Lightbulb, Activity, GraduationCap } from 'lucide-react'; // Added icons

// In a real app, this page should be protected and only accessible to logged-in admins.
// You would typically use middleware or a higher-order component for authentication checks.

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
         {/* Add Logout Button or User Profile Dropdown here */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Program Management Card */}
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5"/> Manage Programs</CardTitle>
            <CardDescription>Add, edit, or remove programs and initiatives.</CardDescription>
          </CardHeader>
          <CardContent>
             {/* Link to view/manage existing programs */}
            <Button asChild variant="secondary" className="mb-2 w-full">
              <Link href="/admin/programs">
                View/Manage Programs
              </Link>
            </Button>
            {/* Link to add a new program */}
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/programs/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Program
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Event Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Manage Events</CardTitle>
            <CardDescription>Create and manage upcoming events like competitions, workshops.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Link to view/manage existing events */}
            <Button asChild variant="secondary" className="mb-2 w-full">
               <Link href="/admin/events">
                 View/Manage Events
               </Link>
            </Button>
            {/* Link to add a new event */}
             <Button asChild variant="outline" className="w-full">
               <Link href="/admin/events/new">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* Idea Management Card */}
         <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5"/> Manage Ideas</CardTitle>
            <CardDescription>Review and manage submitted student ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to idea management */}
            <Button asChild variant="outline" className="w-full">
               <Link href="/admin/ideas"> {/* Placeholder Link */}
                 View Submitted Ideas
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* User Management Card */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Manage Users</CardTitle>
            <CardDescription>View and manage registered student accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to user management */}
             <Button asChild variant="outline" className="w-full">
               <Link href="/admin/users"> {/* Placeholder Link */}
                 View Registered Users
               </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Add more cards for other admin functions as needed */}

      </div>
    </div>
  );
}
