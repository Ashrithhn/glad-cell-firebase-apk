
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert, KeyRound } from 'lucide-react'; // Added KeyRound
import { GoogleSignInButton } from '@/components/features/auth/google-signin-button'; // Import Google Sign-In button
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function LoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading, authError, login: authLogin } = useAuth(); // Use auth context, include authError and login
  const isLoggedIn = !loading && (!!userId || isAdmin);
  const { toast } = useToast(); // Initialize toast

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
      description: 'Welcome!',
      variant: 'default',
    });
    router.push('/');
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
            <Skeleton className="h-10 w-full mt-2" /> {/* For Google button */}
            <Skeleton className="h-8 w-1/3 mx-auto mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-primary tracking-tight">Welcome Back!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your GLAD CELL account. Don't have one?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
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

          <div className="text-sm text-right">
            <Link href="/forgot-password" className="text-muted-foreground hover:text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="relative my-4"> {/* Reduced margin for separator */}
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

           <div className="text-center mt-6"> {/* Increased margin for admin login */}
             <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1">
               <ShieldAlert className="h-4 w-4" />
               Admin Login
             </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
