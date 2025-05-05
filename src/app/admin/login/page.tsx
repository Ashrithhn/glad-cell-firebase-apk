
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from '@/components/features/admin/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading } = useAuth(); // Use auth context
  const isLoggedIn = !!userId || isAdmin; // Check if user or admin is logged in

  useEffect(() => {
    // Redirect if already logged in (as user or admin) and auth check is complete
    if (!loading && isLoggedIn) {
       if (isAdmin) {
           console.log('[Admin Login Page] Admin already logged in, redirecting to dashboard');
           router.replace('/admin/dashboard');
       } else {
            console.log('[Admin Login Page] Regular user logged in, redirecting to home');
            router.replace('/');
       }
    }
  }, [loading, isLoggedIn, isAdmin, router]);

  // Show loading skeleton while checking auth status or if logged in
  if (loading || isLoggedIn) {
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

  // Render admin login form if not loading and not logged in
  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription>
            Access the administrative dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
