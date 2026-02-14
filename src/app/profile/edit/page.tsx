
import { getCurrentUser } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/features/profile/edit-profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, UserCog } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default async function EditProfilePage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    redirect('/login?redirect=/profile/edit');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button asChild variant="outline" size="sm">
            <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
       </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <UserCog className="h-6 w-6" />
            Edit Your Profile
          </CardTitle>
          <CardDescription>
            Update your personal information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              Your email address and registration number cannot be changed.
            </AlertDescription>
          </Alert>
          <EditProfileForm userProfile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
