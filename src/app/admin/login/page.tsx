
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from '@/components/features/admin/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading } = useAuth(); // Use auth context
  const { toast } = useToast();

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    if (isAdmin) {
      // If the user is an admin, they should be on the dashboard
      console.log('[Admin Login Page] Admin logged in, redirecting to dashboard');
      router.replace('/admin/dashboard');
    } else if (userId) {
      // If a non-admin user is logged in, they should not see this page
      toast({
        title: "Access Denied",
        description: "The admin login page is for administrators only.",
        variant: "destructive",
      });
      router.replace('/');
    }
    // If not loading and not any kind of logged-in user, show the form
  }, [loading, isAdmin, userId, router, toast]);

  // Show loading skeleton while checking auth status or if a redirect is imminent.
  // This prevents the login form from flashing if the user is already logged in (as either admin or normal user).
  const shouldRedirect = !loading && (isAdmin || userId);
  if (loading || shouldRedirect) {
    return (
        <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4">
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

  // If not loading and not any kind of logged-in user, show the login form.
  return (
    <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </AvatarFallback>
          </Avatar>
          <CardTitle className={cn("text-2xl font-bold text-primary text-shadow-pop-animation text-glow")}>
              College Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the administrative dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
