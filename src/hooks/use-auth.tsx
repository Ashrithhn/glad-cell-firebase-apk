
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  const fetchUserProfile = useCallback(async (sbUser: SupabaseUser | null) => {
    // This function NO LONGER sets loading state for the main hook.
    // It's caller's responsibility.
    if (sbUser && supabase) {
      console.log('[useAuth] Fetching user profile for Supabase user:', sbUser.id);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('[useAuth] Error fetching user profile from Supabase:', error.message);
          setUserProfile(null);
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
            auth_provider: sbUser.app_metadata.provider || 'email',
            created_at: data.created_at,
            updated_at: data.updated_at,
            last_sign_in_at: sbUser.last_sign_in_at,
          });
        } else {
          setUserProfile(null);
          console.warn(`[useAuth] User profile not found in Supabase 'users' table for ID: ${sbUser.id}.`);
        }
      } catch (profileError: any) {
        console.error('[useAuth] Catch block error fetching user profile:', profileError.message);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);


  const processAuthStateChange = useCallback(async (session: Session | null) => {
    // This function is the core state updater. It ensures setLoading(false) is the final step.
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setUserId(currentUser?.id ?? null);

    const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsAdmin(adminLoggedIn);

    if (currentUser && !adminLoggedIn) { // Only fetch Supabase profile if it's a regular user
      await fetchUserProfile(currentUser);
    } else {
      setUserProfile(null); // Clear profile if no user or if it's an admin
    }
    
    setLoading(false); // Set loading to false AFTER all state updates for this auth event
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
  }, [fetchUserProfile]);
  
  const login = useCallback(async (session: Session | null) => {
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      return;
    }
    setLoading(true); 
    await processAuthStateChange(session);
  }, [processAuthStateChange, authError]);

  const logout = useCallback(async () => {
    setLoading(true); // Signal loading starts
    if (supabase && !authError) {
      try {
        await serverLogout(); // This calls supabase.auth.signOut() which triggers onAuthStateChange
      } catch (error) {
        console.error('Error during server logout for Supabase:', error);
        // If serverLogout fails, onAuthStateChange might not fire, so manually process null session.
        await processAuthStateChange(null);
      }
    } else {
        await processAuthStateChange(null); // Process as if logged out if supabase client error
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn'); // This should trigger handleExternalAuthChanges if it's still relevant
    }
    // processAuthStateChange (called by onAuthStateChange or directly) will set loading false.
    // Dispatch event for any other listeners.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
  }, [authError, processAuthStateChange]);


  useEffect(() => {
    setLoading(true);
    setAuthError(supabaseError);

    if (!supabase) {
      console.error('[useAuth] Supabase client is not available. Authentication will not work.');
      processAuthStateChange(null); // Treat as logged out, will set loading false
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // setLoading(true); // Already set at the start of useEffect
      await processAuthStateChange(session); 
    }).catch(error => {
      console.error("[useAuth] Error in initial getSession:", error);
      processAuthStateChange(null); // Treat as logged out on error, will set loading false
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] Supabase onAuthStateChange event:', _event, 'Session:', !!session);
      setLoading(true); 
      await processAuthStateChange(session);
    });

    const handleExternalAuthChanges = async () => {
      console.log("[useAuth] Storage or authChange event triggered, re-evaluating auth state.");
      setLoading(true); 
      if (!supabase) {
          console.warn("[useAuth] handleExternalAuthChanges: Supabase client not available for re-evaluation.");
          await processAuthStateChange(null); // Treat as logged out
          return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await processAuthStateChange(session);
      } catch (e) {
        console.error("[useAuth] Error in handleExternalAuthChanges during getSession:", e);
        await processAuthStateChange(null); // Treat as logged out on error
      }
    };

    window.addEventListener('storage', handleExternalAuthChanges);
    window.addEventListener('authChange', handleExternalAuthChanges);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleExternalAuthChanges);
      window.removeEventListener('authChange', handleExternalAuthChanges);
    };
  // processAuthStateChange and fetchUserProfile are stable callbacks.
  // supabaseError is stable after initial set.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Minimal dependencies to avoid re-running unnecessarily.

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
