
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient'; // Import Supabase client
import type { UserCredentials, SignUpWithPasswordCredentials, Session } from '@supabase/supabase-js';

// User profile data structure for your 'users' table in Supabase
// Ensure this matches the columns in your Supabase 'users' table
export interface UserProfileSupabase {
  id: string; // This will be the Supabase auth user ID
  email?: string | null;
  name?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registration_number?: string | null; // Using snake_case as is common in Postgres
  college_name?: string | null;
  city?: string | null;
  pincode?: string | null;
  photo_url?: string | null;
  auth_provider?: string | null; // e.g., 'email', 'google'
  created_at?: string; // Supabase timestamps are typically ISO strings
  updated_at?: string;
}


/**
 * Registers a user with Supabase Authentication and stores profile data in a 'users' table.
 */
export async function registerUser(userData: any): Promise<{ success: boolean; userId?: string; message?: string }> {
  console.log('[Supabase Server Action] registerUser invoked.');

  if (supabaseError || !supabase) {
    const errorMessage = `Registration service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}. Check setup.`;
    console.error(`[Supabase Server Action Error] registerUser: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  const { email, password, name, branch, semester, registrationNumber, collegeName, city, pincode } = userData;
  console.log('[Supabase Server Action] Attempting Supabase registration for user:', email);

  try {
    // Check if registration number already exists
    const { data: existingUserByReg, error: regCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('registration_number', registrationNumber)
      .limit(1)
      .single();

    if (regCheckError && regCheckError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('[Supabase Server Action] Error checking registration number:', regCheckError.message);
      return { success: false, message: `Error checking registration number: ${regCheckError.message}` };
    }
    if (existingUserByReg) {
      console.warn('[Supabase Server Action] Registration number already exists:', registrationNumber);
      return { success: false, message: 'This registration number is already in use. Please use a different one.' };
    }

    // Sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // Metadata that can be useful, but full profile stored separately
          full_name: name,
        }
      }
    });

    if (signUpError) {
      console.error('[Supabase Server Action Error] Supabase SignUp Error:', signUpError.message);
      return { success: false, message: signUpError.message || 'Failed to sign up with Supabase Auth.' };
    }

    if (!authData.user) {
      return { success: false, message: 'User not created in Supabase Auth despite no error.' };
    }
    const user = authData.user;
    console.log('[Supabase Server Action] Supabase Auth user created:', user.id);

    // Store additional user profile information in your 'users' table
    const profileData: Omit<UserProfileSupabase, 'created_at' | 'updated_at' | 'auth_provider'> = {
      id: user.id, // Link to the auth.users table
      email: user.email,
      name,
      branch,
      semester,
      registration_number: registrationNumber,
      college_name: collegeName,
      city,
      pincode,
      photo_url: user.user_metadata?.avatar_url, // If available from social sign-up options
    };

    const { error: insertError } = await supabase.from('users').insert(profileData);

    if (insertError) {
      console.error('[Supabase Server Action Error] Error inserting user profile:', insertError.message);
      // Potentially try to clean up the auth user if profile insertion fails, though this can be complex.
      return { success: false, message: `User authenticated, but profile creation failed: ${insertError.message}` };
    }
    console.log('[Supabase Server Action] User profile stored in Supabase table for ID:', user.id);

    return { success: true, userId: user.id, message: 'Registration successful! Please check your email to verify your account.' };
  } catch (error: any) {
    console.error('[Supabase Server Action Error] Unexpected error during registration:', error.message);
    return { success: false, message: `Registration failed: ${error.message || 'An unknown error occurred.'}` };
  }
}

/**
 * Logs in a user using Supabase Authentication.
 */
export async function loginUser(credentials: UserCredentials): Promise<{ success: boolean; userId?: string; session?: Session | null; message?: string }> {
   console.log('[Supabase Server Action] loginUser invoked.');

   if (supabaseError || !supabase) {
    const errorMessage = `Login service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}. Check setup.`;
    console.error(`[Supabase Server Action Error] loginUser: ${errorMessage}`);
    return { success: false, message: errorMessage };
   }

  const { email, password } = credentials;
  console.log('[Supabase Server Action] Attempting Supabase login for user:', email);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase Server Action Error] Supabase Login Error:', error.message);
      // Check for specific Supabase auth errors
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { success: false, message: 'Email not confirmed. Please check your inbox for a verification link.' };
      }
      if (error.message.toLowerCase().includes('invalid login credentials')) {
         return { success: false, message: 'Invalid email or password. Please try again.' };
      }
      return { success: false, message: error.message || 'Login failed due to an unknown error.' };
    }

    if (!data.user || !data.session) {
        return { success: false, message: 'Login failed: No user or session returned.' };
    }
    console.log('[Supabase Server Action] Supabase Login Successful:', data.user.id);
    return { success: true, userId: data.user.id, session: data.session };

  } catch (error: any) {
    console.error('[Supabase Server Action Error] Unexpected error during login:', error.message);
    return { success: false, message: `Login failed: ${error.message || 'An unknown error occurred.'}` };
  }
}


/**
 * Logs out the currently signed-in Supabase user.
 */
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    console.log('[Supabase Server Action] logoutUser invoked.');

    if (supabaseError || !supabase) {
        const errorMessage = `Logout service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.warn(`[Supabase Server Action Warning] logoutUser: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    console.log('[Supabase Server Action] Attempting Supabase logout');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('[Supabase Server Action Error] Supabase Logout Error:', error.message);
            return { success: false, message: error.message || 'Logout failed.' };
        }
        console.log('[Supabase Server Action] Supabase Logout Successful');
        return { success: true };
    } catch (error: any) {
        console.error('[Supabase Server Action Error] Unexpected error during logout:', error.message);
        return { success: false, message: error.message || 'Logout failed.' };
    }
}


/**
 * Placeholder service for admin login. This needs to be adapted for Supabase roles/permissions.
 */
export async function loginAdmin(credentials: any): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Server Action] loginAdmin invoked (placeholder).');
  // Implement proper admin authentication. This is NOT secure.
  // For Supabase, you'd typically check a user's role after they log in normally,
  // or have a separate admin user system.
  await new Promise(resolve => setTimeout(resolve, 500));

  if (credentials.username === 'admin' && credentials.password === 'adminpass') {
     console.log('[Supabase Server Action] Admin login successful (placeholder).');
     return { success: true };
  } else {
     console.warn('[Supabase Server Action] Admin login failed (placeholder): Invalid credentials.');
     return { success: false, message: 'Invalid admin credentials.' };
  }
}

/**
 * Sends a password reset email to the given email address using Supabase.
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    console.log('[Supabase Server Action] sendPasswordReset invoked for email:', email);

    if (supabaseError || !supabase) {
        const errorMessage = `Password reset service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Server Action Error] sendPasswordReset: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        // For password reset, Supabase typically sends a magic link or OTP depending on project settings.
        // The redirectTo option is important to guide the user back to your app.
        const redirectTo = process.env.NEXT_PUBLIC_APP_BASE_URL ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/update-password` : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });

        if (error) {
            console.error('[Supabase Server Action Error] Error sending password reset email:', error.message);
            return { success: false, message: error.message || 'Failed to send password reset email.' };
        }
        console.log('[Supabase Server Action] Password reset email sent to:', email);
        return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
    } catch (error: any) {
        console.error('[Supabase Server Action Error] Unexpected error sending password reset email:', error.message);
        return { success: false, message: `Password reset failed: ${error.message || 'An unknown error occurred.'}` };
    }
}

// Note: Google Sign-In was removed previously. If re-added, implement with supabase.auth.signInWithOAuth({ provider: 'google' })
// and handle the callback to store user profile in your 'users' table.
// The handleGoogleSignInUserData function would need to be adapted.
// It would involve:
// 1. Client-side: `supabase.auth.signInWithOAuth({ provider: 'google' })`
// 2. Client-side: onAuthStateChange to detect successful Google login.
// 3. Server-side (optional, or client can do it): If new Google user, insert/update their profile into your `users` table.
//    Supabase's `auth.users` table stores basic auth info. Your `users` (or `profiles`) table stores additional app-specific info.
// type Session = import('@supabase/supabase-js').Session; // Already imported at the top
