
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading, authError } = useAuth(); // Use auth context, include authError
  const isLoggedIn = !authLoading && (!!userId || isAdmin); // Consider logged in only if loading is complete

  useEffect(() => {
    // Redirect if user is already logged in and auth check is complete
    if (isLoggedIn && !authError) { // Only redirect if no auth error and logged in
      console.log('[Login Page] User already logged in, redirecting to /');
      router.replace('/'); // Redirect to home page
    }
  }, [isLoggedIn, router, authError]);

  // Show loading skeleton while checking auth status or if logged in (and no error)
  if (loading || (isLoggedIn && !authError)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-full mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-1" />
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render login form if not loading and not logged in
  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20"> {/* Added subtle border */}
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-primary tracking-tight">Welcome Back!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your GLAD CELL account. Don't have one?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
            {/* Admin Login link removed - access via /admin/login directly */}
             {/*
             <br/>
             <Link href="/admin/login" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">
               Admin Login
             </Link>
             */}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4"> {/* Added space-y */}
          {authError && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                    {authError.message}. Please check the setup or contact support. Login functionality is unavailable.
                </AlertDescription>
            </Alert>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
