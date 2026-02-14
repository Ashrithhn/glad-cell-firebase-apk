
'use client';

import { ForgotPasswordForm } from '@/components/features/auth/forgot-password-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen auth-page-gradient px-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-lg border-primary/20 backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className={cn(
              "text-2xl font-bold text-primary text-shadow-pop-animation text-glow"
          )}>
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No problem! Enter your email address below and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
