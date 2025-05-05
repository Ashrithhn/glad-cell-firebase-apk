
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

export default function LoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading } = useAuth(); // Use auth context
  const isLoggedIn = !!userId || isAdmin;

  useEffect(() => {
    // Redirect if user is already logged in and auth check is complete
    if (!loading && isLoggedIn) {
      console.log('[Login Page] User already logged in, redirecting to /');
      router.replace('/'); // Redirect to home page
    }
  }, [loading, isLoggedIn, router]);

  // Show loading skeleton while checking auth status
  if (loading || isLoggedIn) { // Also show skeleton if logged in until redirect happens
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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Login</CardTitle>
          <CardDescription>
            Access your GLAD CELL account. Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
            <br/>
            <Link href="/admin/login" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">
              Admin Login
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
