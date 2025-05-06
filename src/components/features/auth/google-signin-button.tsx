
'use client';

import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, initializationError } from '@/lib/firebase/config';
import { handleGoogleSignInUserData } from '@/services/auth'; // Server action
import { Loader2 } from 'lucide-react';
import React from 'react';

// Define a simple SVG for the Google icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.8 0-5.18-1.88-6.04-4.42H2.05v2.84C3.87 20.98 7.66 23 12 23z" fill="#34A853"/>
    <path d="M5.96 14.05c-.23-.66-.35-1.36-.35-2.05s.12-1.39.35-2.05V7.11H2.05C1.33 8.66.86 10.27.86 12s.47 3.34 1.19 4.89l3.91-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.66 1 3.87 3.02 2.05 6.21l3.91 2.84c.86-2.54 3.24-4.42 6.04-4.42z" fill="#EA4335"/>
  </svg>
);


interface GoogleSignInButtonProps {
  onSuccess: (userId: string) => void;
  onError: (errorMessage: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({ onSuccess, onError, disabled = false }: GoogleSignInButtonProps) {
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);

    if (!auth || initializationError) {
      onError(initializationError?.message || "Firebase not initialized. Cannot sign in with Google.");
      setIsSigningIn(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Send user data to server action to handle Firestore storage/update
        const serverResult = await handleGoogleSignInUserData({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });

        if (serverResult.success && serverResult.userId) {
          onSuccess(serverResult.userId);
        } else {
          onError(serverResult.message || 'Failed to process Google Sign-In on server.');
        }
      } else {
        throw new Error('No user returned from Google Sign-In.');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let message = "Failed to sign in with Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        message = "Sign-in popup closed before completion.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "Network error during sign-in. Please check your connection.";
      } else if (error.code) {
        message = `Google Sign-In failed: ${error.code}`;
      } else {
        message = error.message || message;
      }
      onError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleSignIn}
      disabled={disabled || isSigningIn}
      suppressHydrationWarning
    >
      {isSigningIn ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
}
