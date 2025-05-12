
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Users, ArrowLeft, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { getAllUsers } from '@/services/users'; // Import the service function to get users
import type { UserProfileSupabase as UserProfileData } from '@/services/users'; // Import the user profile type from Supabase-refactored service
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserListClient } from '@/components/features/admin/user-list-client'; // Client component to display list

async function loadUsers(): Promise<{ users?: UserProfileData[], error?: string }> {
    const result = await getAllUsers();
    if (result.success && result.users) { // Check for users directly
=======
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { getUsers } from '@/services/admin'; // Assuming getUsers function in admin service
import type { UserProfileData } from '@/services/admin'; // Type for user profile
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserListClient } from '@/components/features/admin/user-list-client'; // Client component for list

async function loadUsers(): Promise<{ users?: UserProfileData[], error?: string }> {
    const result = await getUsers();
    if (result.success) {
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        return { users: result.users };
    } else {
        return { error: result.message || 'Failed to load users.' };
    }
}

export default async function AdminManageUsersPage() {
  const { users, error } = await loadUsers();

  return (
    <div className="container mx-auto py-12 px-4">
<<<<<<< HEAD
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Users</h1>
        {/* Placeholder for "Add New User" if needed in future */}
        {/* <Button asChild variant="default">
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User (Manual)
          </Link>
        </Button> */}
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Users</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
=======
      <Button asChild variant="outline" className="mb-4">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Users</h1>
        {/* Add New User button can be added here if needed */}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Users</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
      )}

      <Card>
        <CardHeader>
<<<<<<< HEAD
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Registered Users</CardTitle>
          <CardDescription>List of all registered student accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && users ? (
            <UserListClient users={users} /> // Use client component to display list
          ) : !error ? (
            <p className="text-muted-foreground text-center">No users found.</p>
          ) : null }
=======
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Registered Users</CardTitle>
          <CardDescription>List of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && users ? (
            <UserListClient users={users} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No users found.</p>
          ) : null}
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        </CardContent>
      </Card>
    </div>
  );
}
