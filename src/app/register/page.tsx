
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
<<<<<<< HEAD
// Google Sign-In button removed
// import { Separator } from '@/components/ui/separator'; // Import Separator
import { useToast } from '@/hooks/use-toast';
=======
import { Separator } from '@/components/ui/separator'; 
import { toast } from '@/hooks/use-toast'; 
>>>>>>> b65b534 (remove login with google option)


export default function RegisterPage() {
  const router = useRouter();
<<<<<<< HEAD
  const { user, userId, isAdmin, loading, authError } = useAuth();
=======
  const { user, userId, isAdmin, loading, authError } = useAuth(); 
>>>>>>> b65b534 (remove login with google option)
  const isLoggedIn = !loading && (!!userId || isAdmin);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        } else if (userId) {
          router.replace('/');
        }
      }
  }, [loading, userId, isAdmin, router]);

<<<<<<< HEAD
  // Google Sign-In was removed, so related handlers are also removed.

=======
>>>>>>> b65b534 (remove login with google option)

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
                {/* Removed Skeleton for Google button */}
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
          {authError && ( // Display Supabase client init error or auth errors
             <Alert variant="destructive" className="mb-4">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Configuration Error</AlertTitle>
                 <AlertDescription>
                     {authError.message}. Please check the setup or contact support. Registration functionality may be unavailable.
                 </AlertDescription>
             </Alert>
          )}
          <RegistrationForm />

<<<<<<< HEAD
          {/* Removed Google Sign-In button and separator */}
=======
          {/* Removed OR Separator and GoogleSignInButton */}
          
>>>>>>> b65b534 (remove login with google option)
        </CardContent>
      </Card>
    </div>
  );
}
