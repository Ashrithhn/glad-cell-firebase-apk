
// Placeholder Admin Dashboard Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

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
        <Card>
          <CardHeader>
            <CardTitle>Manage Programs</CardTitle>
            <CardDescription>Add, edit, or remove programs and initiatives.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to program management */}
            <Button asChild variant="secondary">
              <Link href="/admin/programs">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Program
              </Link>
            </Button>
             {/* Add list/table of existing programs here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Events</CardTitle>
            <CardDescription>Create and manage upcoming events.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to event management */}
            <Button asChild variant="secondary">
               <Link href="/admin/events">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
               </Link>
            </Button>
             {/* Add list/table of existing events here */}
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Manage Ideas</CardTitle>
            <CardDescription>Review and manage submitted student ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to idea management */}
            <Button asChild variant="outline">
               <Link href="/admin/ideas">
                 View Submitted Ideas
               </Link>
            </Button>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and manage registered student accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content or link to user management */}
             <Button asChild variant="outline">
               <Link href="/admin/users">
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
