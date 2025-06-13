'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, supabaseError } from '@/lib/supabaseClient';
import { logoutUser as serverLogout } from '@/services/auth';

export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  photo_url?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registration_number?: string | null;
  college_name?: string | null;
  city?: string | null;
  pincode?: string | null;
  auth_provider?: string | null;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  userId: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (session: Session | null) => Promise<void>;
  logout: () => Promise<void>;
  authError: Error | null;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(supabaseError);

  const fetchUserProfile = async (sbUser: SupabaseUser | null) => {
    if (sbUser && supabase) {
      console.log('[useAuth] Fetching user profile for Supabase user:', sbUser.id);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: No rows found, not necessarily an "error" for profile
          console.error('[useAuth] Error fetching user profile from Supabase:', error.message);
          setUserProfile(null);
          // Potentially set authError if profile is critical and missing
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
            auth_provider: sbUser.app_metadata.provider || 'email', // Default to email if provider is undefined
            created_at: data.created_at,
            updated_at: data.updated_at,
            last_sign_in_at: sbUser.last_sign_in_at,
          });
        } else {
          setUserProfile(null);
          console.warn(`[useAuth] User profile not found in Supabase for ID: ${sbUser.id}. This may be normal if it's a new user yet to complete profile setup, or if the user is an admin without a 'users' table entry.`);
        }
      } catch (profileError: any) {
        console.error('[useAuth] Catch block error fetching user profile:', profileError.message);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    setAuthError(supabaseError);

    if (!supabase) {
      console.error('[useAuth] Supabase client is not available. Authentication will not work.');
      setLoading(false);
      return;
    }

    const processAuthStateChange = async (session: Session | null) => {
      setLoading(true); // Set loading true at the beginning of processing
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      await fetchUserProfile(currentUser);
      
      const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsAdmin(adminLoggedIn);

      if (adminLoggedIn && currentUser) {
        // If admin is logged in via localStorage flag, ensure regular user state is cleared
        // This handles cases where an admin might have also logged in as a regular user previously
        // or if a regular user logs in, then an admin logs in on the same browser.
        // However, proper admin role via Supabase Auth is preferred.
        console.log("[useAuth] Admin is logged in (localStorage). Clearing regular user if any was set from session.");
        // setUser(null); // Keep admin user if they are a Supabase user
        // setUserId(null);
        // setUserProfile(null);
      }
      
      setLoading(false); // Set loading false after all processing is done
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    };
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await processAuthStateChange(session);
    }).catch(error => {
      console.error("[useAuth] Error in initial getSession:", error);
      setLoading(false); // Ensure loading is false even on error
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] Supabase onAuthStateChange event:', _event, 'Session:', !!session);
      await processAuthStateChange(session);
    });

    const handleStorageChange = async () => {
      console.log("[useAuth] Storage or authChange event triggered.");
      setLoading(true);
      const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsAdmin(adminLoggedIn);
      
      // Re-fetch current session to ensure user state is consistent with admin flag
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (adminLoggedIn && currentUser) {
         // If an admin is logged in, and there's a Supabase session,
         // we might want to decide if this Supabase user IS the admin.
         // For now, the localStorage flag takes precedence for isAdmin.
      } else if (!adminLoggedIn && currentUser) {
        // If admin logs out, but a Supabase session exists, ensure user state is set
        setUser(currentUser);
        setUserId(currentUser.id);
        await fetchUserProfile(currentUser);
      } else if (!adminLoggedIn && !currentUser) {
        // No admin, no user
        setUser(null);
        setUserId(null);
        setUserProfile(null);
      }
      setLoading(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []); // Removed supabaseError from dependency array to avoid re-triggering on initial non-error

  const login = async (session: Session | null) => {
    setLoading(true);
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      setLoading(false);
      return;
    }
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setUserId(currentUser?.id ?? null);
    await fetchUserProfile(currentUser);
    setIsAdmin(typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true');
    setLoading(false);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
  };

  const logout = async () => {
    setLoading(true);
    if (supabase && !authError) {
      try {
        await serverLogout(); // This calls supabase.auth.signOut()
      } catch (error) {
        console.error('Error during server logout for Supabase:', error);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
    }
    // onAuthStateChange will handle setting user, userId, userProfile to null & isAdmin to false
    // and setLoading to false.
    // Dispatch event just in case for immediate UI updates elsewhere.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    // If onAuthStateChange is slow or doesn't fire, explicitly clear:
    // setUser(null); setUserId(null); setUserProfile(null); setIsAdmin(false); setLoading(false);
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