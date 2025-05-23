
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { getUsers } from '@/services/admin'; // Assuming getUsers function in admin service
import type { UserProfileData } from '@/services/admin'; // Type for user profile
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserListClient } from '@/components/features/admin/user-list-client'; // Client component for list

async function loadUsers(): Promise<{ users?: UserProfileData[], error?: string }> {
    const result = await getUsers();
    if (result.success) {
        return { users: result.users };
    } else {
        return { error: result.message || 'Failed to load users.' };
    }
}

export default async function AdminManageUsersPage() {
  const { users, error } = await loadUsers();

  return (
    <div className="container mx-auto py-12 px-4">
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
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Registered Users</CardTitle>
          <CardDescription>List of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && users ? (
            <UserListClient users={users} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No users found.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
