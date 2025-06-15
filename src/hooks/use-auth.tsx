
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
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(supabaseError);

  const fetchUserProfile = useCallback(async (sbUser: SupabaseUser | null) => {
    if (sbUser && supabase) {
      console.log('[useAuth fetchUserProfile] Fetching profile for Supabase user:', sbUser.id);
      try {
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[useAuth fetchUserProfile] Error fetching profile:', profileError.message);
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
          console.log('[useAuth fetchUserProfile] Profile set for:', sbUser.id);
        } else {
          setUserProfile(null);
          console.warn(`[useAuth fetchUserProfile] User profile not found for ID: ${sbUser.id}.`);
        }
      } catch (catchError: any) {
        console.error('[useAuth fetchUserProfile] Catch block error:', catchError.message);
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  const processAuthStateChange = useCallback(async (session: Session | null) => {
    setLoading(true); // Set loading true at the very beginning of processing
    console.log('[useAuth processAuthStateChange] Start. Session present:', !!session);
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setUserId(currentUser?.id ?? null);

    const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsAdmin(adminLoggedIn);
    console.log(`[useAuth processAuthStateChange] User: ${currentUser?.id}, Admin: ${adminLoggedIn}`);

    try {
      if (currentUser && !adminLoggedIn) {
        console.log('[useAuth processAuthStateChange] User is present and not admin, fetching profile for:', currentUser.id);
        await fetchUserProfile(currentUser); // Await profile fetching
      } else {
        console.log('[useAuth processAuthStateChange] No user or is admin, clearing profile.');
        setUserProfile(null); // Ensure profile is cleared if no user or if admin
      }
    } catch (error) {
        console.error('[useAuth processAuthStateChange] Error during profile fetch step (this should be caught by fetchUserProfile ideally):', error);
        setUserProfile(null); // Ensure profile is cleared on error
    } finally {
        setLoading(false); // Set loading false after all state updates, including profile
        console.log('[useAuth processAuthStateChange] End. Loading set to false.');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (session: Session | null) => {
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      // Ensure states are reset and loading is false if login can't proceed
      setUserProfile(null);
      setUser(null);
      setUserId(null);
      setIsAdmin(false);
      setLoading(false); // Critical: ensure loading is false if we abort
      return;
    }
    await processAuthStateChange(session); // processAuthStateChange now manages its own loading states
  }, [processAuthStateChange, authError]);

  const logout = useCallback(async () => {
    // processAuthStateChange will handle loading states when triggered by onAuthStateChange
    if (supabase && !authError) {
      try {
        await serverLogout(); // This calls supabase.auth.signOut()
      } catch (error) {
        console.error('[useAuth Logout] Error during server logout:', error);
        await processAuthStateChange(null); // Manually reset if serverLogout fails to trigger event
      }
    } else {
      await processAuthStateChange(null); // Manually reset if Supabase client isn't available
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
      // The processAuthStateChange call (either direct or via onAuthStateChange) will dispatch 'authChange'
    }
  }, [authError, processAuthStateChange]);

  useEffect(() => {
    setAuthError(supabaseError); // Set Supabase client error once on mount

    if (!supabase) {
      console.error('[useAuth Initial Effect] Supabase client NOT available. Auth will not work.');
      (async () => { // IIFE to call async function
        await processAuthStateChange(null); // This will set loading to false eventually
      })();
      return;
    }

    console.log('[useAuth Initial Effect] Subscribing to onAuthStateChange and fetching initial session.');
    
    const initialAuthSetup = async () => {
      // setLoading(true) is already true by default, but explicitly set here for clarity if called again.
      // processAuthStateChange will handle its own setLoading(true) at start and setLoading(false) at end.
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[useAuth Initial Effect] Initial getSession response. Session present:', !!session);
        await processAuthStateChange(session);
      } catch (error) {
        console.error("[useAuth Initial Effect] Error in initial getSession:", error);
        await processAuthStateChange(null);
      }
    };

    initialAuthSetup();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth onAuthStateChange] Event:', _event, 'Session present:', !!session);
      await processAuthStateChange(session);
    });

    const handleExternalAuthChanges = async () => {
      console.log("[useAuth handleExternalAuthChanges] Storage or authChange event triggered, re-evaluating auth state.");
      if (!supabase) {
          console.warn("[useAuth handleExternalAuthChanges] Supabase client not available for re-evaluation.");
          await processAuthStateChange(null);
          return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await processAuthStateChange(session);
      } catch (e) {
        console.error("[useAuth handleExternalAuthChanges] Error during getSession:", e);
        await processAuthStateChange(null);
      }
    };

    window.addEventListener('storage', handleExternalAuthChanges);
    window.addEventListener('authChange', handleExternalAuthChanges);

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      window.removeEventListener('storage', handleExternalAuthChanges);
      window.removeEventListener('authChange', handleExternalAuthChanges);
    };
  }, [processAuthStateChange, supabaseError]); // Added supabaseError

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

