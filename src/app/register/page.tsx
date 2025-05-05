
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/features/auth/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function RegisterPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading, authError } = useAuth(); // Use auth context, include authError
  const isLoggedIn = !!userId || isAdmin;

  useEffect(() => {
    // Redirect if user is already logged in and auth check is complete
    if (!loading && isLoggedIn && !authError) { // Only redirect if no auth error
      console.log('[Register Page] User already logged in, redirecting to /');
      router.replace('/'); // Redirect to home page
    }
  }, [loading, isLoggedIn, router, authError]);

  // Show loading skeleton while checking auth status or if logged in
  if (loading || (isLoggedIn && !authError)) { // Also show skeleton if logged in until redirect happens (unless there's an auth error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4 py-12">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
             <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
             <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
             {/* Skeleton for form fields */}
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
              </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render registration form if not loading and not logged in
  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4 py-12">
      <Card className="w-full max-w-2xl shadow-lg">
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
        </CardContent>
      </Card>
    </div>
  );
}
