
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
    setLoading(true);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setUserId(currentUser?.id ?? null);

    if (currentUser) {
      await fetchUserProfile(currentUser);
    } else {
      setUserProfile(null); // No user, so no profile
    }
    
    const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsAdmin(adminLoggedIn);
    
    setLoading(false); // Set loading to false AFTER all state updates for this cycle
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
  }, [fetchUserProfile]);
  
  const login = useCallback(async (session: Session | null) => {
    // This function is primarily a wrapper around processAuthStateChange for explicit login calls
    // The actual state update logic is centralized in processAuthStateChange
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      return;
    }
    await processAuthStateChange(session);
  }, [processAuthStateChange, authError]);

  const logout = useCallback(async () => {
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
    // onAuthStateChange (via processAuthStateChange) will handle resetting user, userId, profile, and isAdmin.
    // It will also set setLoading(false).
    // We explicitly dispatch an event to ensure any listeners (like storage handler) react.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    // If onAuthStateChange is somehow delayed, ensure loading is false.
    // But generally, processAuthStateChange should handle this.
    // The call to serverLogout() should trigger onAuthStateChange which calls processAuthStateChange.
    // If not, we might need to call processAuthStateChange(null) here explicitly.
    // For now, let's rely on onAuthStateChange.
  }, [authError]);


  useEffect(() => {
    setLoading(true);
    setAuthError(supabaseError);

    if (!supabase) {
      console.error('[useAuth] Supabase client is not available. Authentication will not work.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await processAuthStateChange(session);
    }).catch(error => {
      console.error("[useAuth] Error in initial getSession:", error);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] Supabase onAuthStateChange event:', _event, 'Session:', !!session);
      await processAuthStateChange(session);
    });

    // This listener handles admin login/logout via localStorage and general auth state sync.
    const handleExternalAuthChanges = async () => {
      console.log("[useAuth] Storage or authChange event triggered, re-evaluating auth state.");
      setLoading(true);
      const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsAdmin(adminLoggedIn); // Update admin status first based on localStorage

      const { data: { session } } = await supabase.auth.getSession(); // Re-fetch current Supabase session
      const currentUser = session?.user ?? null;
      
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };

    window.addEventListener('storage', handleExternalAuthChanges);
    window.addEventListener('authChange', handleExternalAuthChanges);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleExternalAuthChanges);
      window.removeEventListener('authChange', handleExternalAuthChanges);
    };
  }, [processAuthStateChange, fetchUserProfile]);


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

    