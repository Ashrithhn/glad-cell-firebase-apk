
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/auth/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function LoginPage() {
  const router = useRouter();
  const { user, userId, isAdmin, loading, authError } = useAuth();
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

  // Google Sign-In was removed, so related handlers are also removed.

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
            {/* Removed Skeleton for Google button */}
            <Skeleton className="h-8 w-1/3 mx-auto mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-4">
          <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className={cn(
              "text-3xl font-bold tracking-tight text-primary text-shadow-pop-animation text-glow"
          )}>
              Welcome Back!
          </CardTitle>
          <CardDescription className="!mt-2">
            Access your GLAD CELL account. Don't have one?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {authError && ( // Display Supabase client init error or auth errors
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                    {authError.message}. Please check the setup or contact support. Login functionality may be unavailable.
                </AlertDescription>
            </Alert>
          )}
          <LoginForm />

          <div className="text-sm text-right">
            <Link href="/forgot-password" className="text-muted-foreground hover:text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Removed Google Sign-In button and separator */}

           {/* 
            Admin Login Link - Removed from public view. 
            Admins should navigate to /admin/login directly.
          */}
        </CardContent>
      </Card>
    </div>
  );
}
