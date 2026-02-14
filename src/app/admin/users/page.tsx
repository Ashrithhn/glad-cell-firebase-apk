
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { getAllUsers } from '@/services/users';
import type { UserProfileSupabase as UserProfileData } from '@/services/users';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { UserListClient } from '@/components/features/admin/user-list-client';

async function loadUsers(): Promise<{ users?: UserProfileData[], error?: string }> {
    const result = await getAllUsers();
    if (result.success && result.users) {
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
          <CardDescription>
            List of all registered users. A Super Admin can edit a user to assign them the 'Admin' role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!error && users ? (
            <UserListClient initialUsers={users} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No users found.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
