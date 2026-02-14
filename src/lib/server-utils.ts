
import { createServerClient as createClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { UserProfileSupabase } from '@/services/auth';

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * This is essential for securely accessing the user's session from server-side code.
 */
export function createSupabaseServerClient() {
    const cookieStore = cookies()
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Retrieves the current authenticated user's session and profile from the server side.
 * @returns An object containing the user session, the user's profile, and any potential error.
 */
export async function getCurrentUser() {
    const supabase = createSupabaseServerClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        console.warn('[Server-Utils] No active session found.', sessionError?.message);
        return { user: null, profile: null, error: sessionError };
    }

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (profileError) {
        console.error('[Server-Utils] Error fetching user profile:', profileError.message);
        return { user: session.user, profile: null, error: profileError };
    }
    
    return { user: session.user, profile: profile as UserProfileSupabase, error: null };
}
