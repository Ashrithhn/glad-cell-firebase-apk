
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, supabaseError } from '@/lib/supabaseClient'; // Import Supabase client
import { logoutUser as serverLogout } from '@/services/auth'; // Server action for logout

// Define a more detailed User type for our context
export interface UserProfile {
  id: string; // Supabase uses 'id' for user UID
  email?: string | null;
  name?: string | null;
  photo_url?: string | null; // Supabase typically uses snake_case for columns
  branch?: string | null;
  semester?: number | string | null;
  registration_number?: string | null; // snake_case
  // Add other fields from your Supabase 'users' table (or 'profiles' table)
  college_name?: string | null;
  city?: string | null;
  pincode?: string | null;
  auth_provider?: string | null;
  created_at?: string; // Timestamps from Supabase are usually ISO strings
  updated_at?: string;
  last_sign_in_at?: string;
}


interface AuthContextType {
  user: SupabaseUser | null; // Supabase auth user object
  userProfile: UserProfile | null; // User profile data from Supabase table
  userId: string | null; // Supabase user ID
  loading: boolean;
  isAdmin: boolean; // Keep admin logic for now, may need rework with Supabase roles
  login: (session: Session | null) => Promise<void>; // Adjusted for Supabase session
  logout: () => Promise<void>;
  authError: Error | null; // For Supabase client init errors or auth errors
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // This needs a Supabase-specific implementation
  const [authError, setAuthError] = useState<Error | null>(supabaseError);

  useEffect(() => {
    setAuthError(supabaseError); // Set initial error state from Supabase client

    if (!supabase) {
      console.error('[useAuth] Supabase client is not available. Authentication will not work.');
      setLoading(false);
      return;
    }

    let profileListener: any = null;

    const fetchUserProfile = async (sbUser: SupabaseUser | null) => {
      if (sbUser && supabase) {
        console.log('[useAuth] Fetching user profile for Supabase user:', sbUser.id);
        const { data, error } = await supabase
          .from('users') // Assuming your profiles table is named 'users'
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (error) {
          console.error('[useAuth] Error fetching user profile from Supabase:', error.message);
          setUserProfile(null);
          // You might want to set an authError here if profile fetching is critical
        } else if (data) {
          setUserProfile({
            id: data.id,
            email: data.email || sbUser.email,
            name: data.name || data.user_metadata?.full_name || sbUser.user_metadata?.full_name,
            photo_url: data.photo_url || data.user_metadata?.avatar_url || sbUser.user_metadata?.avatar_url,
            branch: data.branch,
            semester: data.semester,
            registration_number: data.registration_number,
            college_name: data.college_name,
            city: data.city,
            pincode: data.pincode,
            auth_provider: sbUser.app_metadata.provider,
            created_at: data.created_at,
            updated_at: data.updated_at,
            last_sign_in_at: sbUser.last_sign_in_at,
          });

          // Listen for changes to the user's profile (optional, if needed for real-time updates)
          // profileListener = supabase
          //   .channel(`public:users:id=eq.${sbUser.id}`)
          //   .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${sbUser.id}` }, payload => {
          //     console.log('[useAuth] Profile change received:', payload);
          //     if (payload.new) {
          //       setUserProfile(payload.new as UserProfile);
          //     }
          //   })
          //   .subscribe();

        } else {
          setUserProfile(null);
           console.warn(`[useAuth] User profile not found in Supabase for ID: ${sbUser.id}.`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      fetchUserProfile(session?.user ?? null);
      setIsAdmin(localStorage.getItem('isAdminLoggedIn') === 'true'); // Still using localStorage for admin demo
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    });


    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] Supabase onAuthStateChange event:', _event, 'Session:', !!session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      await fetchUserProfile(currentUser);
      // Admin state based on localStorage - for demo purposes. Replace with Supabase roles.
      setIsAdmin(localStorage.getItem('isAdminLoggedIn') === 'true');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    });

    // For admin flag based on localStorage (demo)
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        setIsAdmin(adminLoggedIn);
        if (adminLoggedIn && user) { // If admin logs in, clear regular user session
          setUser(null);
          setUserId(null);
          setUserProfile(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange); // Custom event

    return () => {
      authListener?.subscription.unsubscribe();
      if (profileListener) {
        supabase.removeChannel(profileListener);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, [supabaseError]); // Rerun if supabaseError changes (e.g., from null to an error)


  const login = async (session: Session | null) => {
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      return;
    }
    // Supabase onAuthStateChange will handle setting user and profile
    console.log('[useAuth Login] Auth state will be updated by Supabase listener.');
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
    }
  };

  const logout = async () => {
    setLoading(true);
    if (supabase && !authError) {
      try {
        await serverLogout(); // Call server action which should call supabase.auth.signOut()
      } catch (error) {
        console.error('Error during server logout for Supabase:', error);
      }
    } else {
      console.warn(`[useAuth Logout] Cannot logout. Supabase client error: ${authError?.message} or client instance missing.`);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
    }
    // onAuthStateChange handles setting user, userId, userProfile to null
    if (!supabase || authError) {
        setUser(null);
        setUserId(null);
        setUserProfile(null);
        setLoading(false);
    }
    setIsAdmin(false);
     if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, userId, loading, isAdmin, login, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
