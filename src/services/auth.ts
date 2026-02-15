
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import type { Session } from '@supabase/supabase-js';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfileSupabase {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registration_number?: string | null;
  college_name?: string | null;
  college_id?: string | null; // For multi-tenancy
  city?: string | null;
  photo_url?: string | null;
  auth_provider?: string | null;
  created_at?: string;
  updated_at?: string;
  role?: 'Super Admin' | 'Admin' | 'Participant' | string | null;
}

/**
 * Registers a user with Supabase Authentication and stores profile data in a 'users' table.
 * Uses the admin client to securely create users without requiring a user session.
 */
export async function registerUser(userData: any): Promise<{ success: boolean; userId?: string; message?: string }> {
  console.log('[Supabase Server Action] registerUser invoked.');

  if (!supabaseAdmin) {
    const errorMessage = `Registration service unavailable: Admin Supabase client not initialized. Check server logs for SUPABASE_SERVICE_ROLE_KEY.`;
    return { success: false, message: errorMessage };
  }

  const { email, password, name, phone, branch, semester, registrationNumber, collegeName, city, role } = userData;

  try {
    const { data: existingUserByEmail, error: emailCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      return { success: false, message: `Error checking email: ${emailCheckError.message}` };
    }
    if (existingUserByEmail) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const { data: existingUserByReg, error: regCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('registration_number', registrationNumber)
      .limit(1)
      .single();

    if (regCheckError && regCheckError.code !== 'PGRST116') {
      return { success: false, message: `Error checking registration number: ${regCheckError.message}` };
    }
    if (existingUserByReg) {
      return { success: false, message: 'This registration number is already in use.' };
    }

    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (signUpError) {
      return { success: false, message: signUpError.message || 'Failed to sign up.' };
    }
    if (!authData.user) {
      return { success: false, message: 'User not created despite no error.' };
    }
    const user = authData.user;

    const profileData: Omit<UserProfileSupabase, 'created_at' | 'updated_at' | 'auth_provider'> = {
      id: user.id,
      email: user.email,
      name,
      phone,
      branch,
      semester,
      registration_number: registrationNumber,
      college_name: collegeName,
      city,
      photo_url: user.user_metadata?.avatar_url,
      role: role || 'Participant',
    };

    const { error: insertError } = await supabaseAdmin.from('users').insert(profileData);

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return { success: false, message: `User authenticated, but profile creation failed: ${insertError.message}. The user has been removed to allow re-registration.` };
    }

    return { success: true, userId: user.id, message: 'Registration successful! Please check your email to verify your account.' };
  } catch (error: any) {
    return { success: false, message: `Registration failed: ${error.message || 'An unknown error occurred.'}` };
  }
}

/**
 * Logs in a user using Supabase Authentication. This function correctly handles session cookies.
 */
export async function loginUser(credentials: UserCredentials): Promise<{ success: boolean; userId?: string; session?: Session | null; message?: string }> {
  const supabase = await createSupabaseServerClient();
  const { email, password } = credentials;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, message: error.message || 'Invalid email or password.' };
    if (!data.user || !data.session) return { success: false, message: 'Login failed: No user or session returned.' };

    return { success: true, userId: data.user.id, session: data.session };

  } catch (error: any) {
    return { success: false, message: `Login failed: ${error.message || 'An unknown error occurred.'}` };
  }
}


/**
 * Logs out the currently signed-in Supabase user and clears the session cookie.
 */
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, message: error.message || 'Logout failed.' };
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Logout failed.' };
  }
}

/**
 * Sends a password reset email to the given email address using Supabase.
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    const redirectTo = process.env.NEXT_PUBLIC_APP_BASE_URL ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/update-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) return { success: false, message: error.message || 'Failed to send password reset email.' };
    return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
  } catch (error: any) {
    return { success: false, message: `Password reset failed: ${error.message || 'An unknown error occurred.'}` };
  }
}
