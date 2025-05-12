
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import type { UserProfileSupabase } from './auth'; // Import the Supabase user profile type

/**
 * Fetches all user profiles from the 'users' table in Supabase.
 * Orders users by creation date (newest first).
 */
export async function getAllUsers(): Promise<{ success: boolean; users?: UserProfileSupabase[]; message?: string }> {
    console.log('[Supabase Server Action - Admin] getAllUsers invoked.');

    if (supabaseError || !supabase) {
        const errorMessage = `User service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Server Action Error - Admin] getAllUsers: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        const { data, error } = await supabase
            .from('users') // Assuming your table is named 'users'
            .select('*')
            .order('created_at', { ascending: false });

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


// Example function to get user profile data (which you might already have in useAuth)
export async function getUserProfileById(userId: string): Promise<{ success: boolean; data?: UserProfileSupabase; message?: string }> {
    if (supabaseError || !supabase) {
        return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}.` };
    }
    if (!userId) return { success: false, message: 'User ID is required.' };

    const { data, error } = await supabase
        .from('users') // Your public profiles table
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data: data as UserProfileSupabase };
}


// Placeholder for future admin actions like:
// - updateUserRole(userId: string, newRole: string) // Requires custom role management in Supabase
// - deleteUserAccount(userId: string) // Involves deleting from auth.users and your public users table
// - suspendUserAccount(userId: string) // Requires custom logic, e.g., setting an 'is_suspended' flag
