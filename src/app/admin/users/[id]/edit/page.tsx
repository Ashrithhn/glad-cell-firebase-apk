
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditUserForm } from '@/components/features/admin/edit-user-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCog, AlertCircle } from 'lucide-react';
import { getUserProfileById } from '@/services/users';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { success, data: user, message } = await getUserProfileById(id);

  if (!success || !user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading User</AlertTitle>
          <AlertDescription>{message || 'Could not find the specified user.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <UserCog className="h-5 w-5" /> Edit User Profile
          </CardTitle>
          <CardDescription>
            Modify user details, role, and level. Email and registration number cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditUserForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
