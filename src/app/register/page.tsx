
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/features/auth/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { GoogleSignInButton } from '@/components/features/auth/google-signin-button'; // Import Google Sign-In button
import { Separator } from '@/components/ui/separator'; // Import Separator
import { toast } from '@/hooks/use-toast'; // Import toast


export default function RegisterPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading, authError, login: authLogin } = useAuth(); // Use auth context, include authError and login
  const isLoggedIn = !loading && (!!userId || isAdmin);

  useEffect(() => {
    if (!loading) {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        } else if (userId) {
          router.replace('/');
        }
      }
  }, [loading, userId, isAdmin, router]);

  const handleGoogleSuccess = async (uid: string) => {
    await authLogin(uid); // Update auth context
    toast({
      title: 'Google Sign-In Successful!',
      description: 'Welcome! Your account has been set up.',
      variant: 'default',
    });
    router.push('/'); // Redirect to home or profile setup page
    router.refresh();
  };

  const handleGoogleError = (errorMsg: string) => {
    toast({
      title: 'Google Sign-In Failed',
      description: errorMsg,
      variant: 'destructive',
    });
  };


  if (loading || (isLoggedIn && !authError)) {
    return (
      <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4 py-12">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
             <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
             <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
             <div className="space-y-6">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
             </div>
              <div className="space-y-6">
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                </div>
             </div>
             <div className="md:col-span-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full mt-2" /> {/* For Google button */}
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4 py-12">
      <Card className="w-full max-w-2xl shadow-lg border-primary/20 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Student Registration</CardTitle>
          <CardDescription>
            Create your GLAD CELL account. Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
             <Alert variant="destructive" className="mb-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>
                     {authError.message}. Please check the setup or contact support. Registration functionality is unavailable.
                 </AlertDescription>
             </Alert>
          )}
          <RegistrationForm />

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={!!authError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
