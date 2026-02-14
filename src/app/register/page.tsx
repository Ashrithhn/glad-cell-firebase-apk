
'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationForm } from '@/components/features/auth/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export default function RegisterPage() {
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
        <CardHeader className="text-center space-y-4">
          <Avatar className="mx-auto h-20 w-20 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10">
              <UserPlus className="h-10 w-10 text-primary" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className={cn(
              "text-2xl font-bold text-primary text-shadow-pop-animation text-glow"
          )}>
            Student Registration
          </CardTitle>
          <CardDescription className="!mt-2">
            Create your GLAD CELL account in a few simple steps. Already have one?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
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

          {/* Removed Google Sign-In button and separator */}
        </CardContent>
      </Card>
    </div>
  );
}
