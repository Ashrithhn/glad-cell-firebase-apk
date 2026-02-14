
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';
import type { UserProfileSupabase } from './auth'; // Import the Supabase user profile type
import { getCurrentUser, createSupabaseServerClient } from '@/lib/server-utils';

/**
 * Fetches all user profiles from the 'users' table in Supabase.
 * Orders users by creation date (newest first).
 * If the current user is an 'Admin', it scopes the results to their college.
 * Super Admins can see all users.
 */
export async function getAllUsers(): Promise<{ success: boolean; users?: UserProfileSupabase[]; message?: string }> {
    const supabase = createSupabaseServerClient();
    console.log('[Supabase Server Action - Admin] getAllUsers invoked.');

    const { profile } = await getCurrentUser();

    try {
        let query = supabase
            .from('users') // Assuming your table is named 'users'
            .select('*')
            .order('created_at', { ascending: false });

        // If the user is an Admin (but not a Super Admin), filter by their college_id
        if (profile?.role === 'Admin' && profile.college_id) {
            console.log(`[Supabase Service] Scoping users for Admin of college ID: ${profile.college_id}`);
            query = query.eq('college_id', profile.college_id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[Supabase Server Action Error - Admin] Error fetching users from Supabase:', error.message);
            throw error;
        }

        const users: UserProfileSupabase[] = data || [];

        console.log(`[Supabase Server Action - Admin] getAllUsers: Fetched ${users.length} users.`);
        return { success: true, users };

    } catch (error: any) {
        console.error('[Supabase Server Action Error - Admin] Error fetching users from Supabase DB:', error.message, error.stack);
        return { success: false, message: `Could not fetch users due to a database error: ${error.message || 'Unknown error'}` };
    }
}


// Type specifically for data returned by Supabase which might have slightly different field names or types
// until fully mapped to UserProfileData.
// This is for the Supabase `auth.users` table, not necessarily your public `users` or `profiles` table.
export interface SupabaseAuthUser {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  identities?: Array<{
    identity_id: string;
    id: string;
    user_id: string;
    identity_data?: Record<string, any>;
    provider: string;
    last_sign_in_at?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}


export async function getUserProfileById(userId: string): Promise<{ success: boolean; data?: UserProfileSupabase; message?: string }> {
    const supabase = createSupabaseServerClient();
    if (!userId) return { success: false, message: 'User ID is required.' };

    try {
        const { data, error } = await supabase
            .from('users') // Your public profiles table
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Specific check for "not found"
                return { success: false, message: `User with ID ${userId} not found.` };
            }
            throw error; // Rethrow other errors
        }
        return { success: true, data: data as UserProfileSupabase };
    } catch (error: any) {
        console.error(`[Supabase Service Error] Error fetching user by ID ${userId}:`, error.message);
        return { success: false, message: error.message };
    }
}

/**
 * Updates a user's profile information by an administrator.
 * Requires admin privileges as it can change roles.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfileSupabase, 'name' | 'role'>>
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Admin Service - Users] updateUserProfile invoked for user: ${userId}`);

  if (!supabaseAdmin) {
    const errorMessage = `User service unavailable: Supabase admin client not initialized.`;
    return { success: false, message: errorMessage };
  }

  if (!userId) {
    return { success: false, message: 'User ID is required for update.' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    console.log(`[Supabase Admin Service - Users] User ${userId} profile updated successfully.`);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}/edit`);

    return { success: true };
  } catch (error: any) {
    console.error(`[Supabase Admin Service Error - Users] Error updating user profile:`, error.message);
    return { success: false, message: `Could not update user profile: ${error.message}` };
  }
}

/**
 * Deletes a user account from Supabase Auth.
 * The corresponding profile in the public 'users' table will be deleted automatically by the CASCADE rule.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Admin Service - Users] deleteUser invoked for user: ${userId}`);

  if (!supabaseAdmin) {
    return { success: false, message: `User service unavailable: Supabase admin client not initialized.` };
  }

  if (!userId) {
    return { success: false, message: 'User ID is required for deletion.' };
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    console.log(`[Supabase Admin Service - Users] User ${userId} deleted successfully from Auth.`);
    
    // No need to delete from public.users manually due to ON DELETE CASCADE
    
    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted successfully.' };
  } catch (error: any) {
    console.error(`[Supabase Admin Service Error - Users] Error deleting user:`, error.message);
    return { success: false, message: `Could not delete user: ${error.message}` };
  }
}
