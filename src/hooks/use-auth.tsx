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
  profileError: Error | null; // Added for specific profile fetch errors
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
  const [profileError, setProfileError] = useState<Error | null>(null); // New state

  const fetchUserProfile = useCallback(async (sbUser: SupabaseUser) => {
    if (!supabase) {
      console.error("[useAuth fetchUserProfile] Supabase client not available.");
      throw new Error("Supabase client not available for profile fetch.");
    }
    console.log('[useAuth fetchUserProfile] Fetching profile for Supabase user:', sbUser.id);
    // Clear previous profile error before attempting to fetch
    // setProfileError(null); // Let the caller manage this based on try/catch

    // try/catch is removed here; caller (processAuthStateChange) will handle it
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sbUser.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // Profile not found
            console.warn(`[useAuth fetchUserProfile] User profile not found for ID: ${sbUser.id}.`);
            setUserProfile(null); // Set profile to null if not found
            return; // Not a critical error to throw, just means no profile
        }
        // For other errors, throw them to be caught by the caller
        console.error('[useAuth fetchUserProfile] Error fetching profile:', error.message);
        throw error;
    }
    
    if (data) {
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
        console.warn(`[useAuth fetchUserProfile] No data returned for profile ID: ${sbUser.id}, setting profile to null.`);
        setUserProfile(null);
    }
  }, [supabase]); // Added supabase dependency

  const processAuthStateChange = useCallback(async (session: Session | null) => {
    console.log('[useAuth processAuthStateChange] Start. Session present:', !!session);
    setLoading(true);
    setProfileError(null); // Clear profile-specific error at the start

    const currentUser = session?.user ?? null;
    
    setUser(currentUser);
    setUserId(currentUser?.id ?? null);

    const adminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsAdmin(adminLoggedIn);
    console.log(`[useAuth processAuthStateChange] User: ${currentUser?.id}, Admin: ${adminLoggedIn}`);

    if (currentUser && !adminLoggedIn) {
      try {
        console.log('[useAuth processAuthStateChange] Attempting to fetch profile for:', currentUser.id);
        await fetchUserProfile(currentUser); // Await profile fetching
      } catch (errorFetchingProfile: any) {
        console.error('[useAuth processAuthStateChange] Error caught during profile fetch:', errorFetchingProfile.message);
        setUserProfile(null); // Ensure profile is null on error
        setProfileError(errorFetchingProfile instanceof Error ? errorFetchingProfile : new Error(String(errorFetchingProfile)));
      }
    } else {
      setUserProfile(null); // Ensure profile is cleared if no user or if admin
    }

    setLoading(false); // CRITICAL: Set loading false after ALL state updates for this auth event
    console.log('[useAuth processAuthStateChange] End. Loading set to false.');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
  }, [fetchUserProfile]);

  const login = useCallback(async (session: Session | null) => {
    if (authError || !supabase) {
      console.error("[useAuth Login] Cannot login, Supabase client error:", authError?.message);
      setUserProfile(null);
      setUser(null);
      setUserId(null);
      setIsAdmin(false);
      setLoading(false); // Ensure loading is false if we abort early
      return;
    }
    console.log('[useAuth login] Calling processAuthStateChange with session:', !!session);
    await processAuthStateChange(session);
    console.log('[useAuth login] processAuthStateChange completed.');
  }, [processAuthStateChange, authError, supabase]); // Added supabase dependency

  const logout = useCallback(async () => {
    if (supabase && !authError) {
      try {
        await serverLogout(); // This calls supabase.auth.signOut() which should trigger onAuthStateChange
      } catch (error) {
        console.error('[useAuth Logout] Error during server logout, manually resetting state:', error);
        await processAuthStateChange(null); // Manually reset if serverLogout fails or doesn't trigger event
      }
    } else {
      await processAuthStateChange(null); // Manually reset if Supabase client isn't available
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
      // The onAuthStateChange listener or the direct call to processAuthStateChange will handle UI updates
    }
  }, [authError, processAuthStateChange, supabase]); // Added supabase dependency

  useEffect(() => {
    setAuthError(supabaseError); // Set initial Supabase client error status

    if (!supabase) {
      console.error('[useAuth Initial Effect] Supabase client NOT available. Auth will not work.');
      processAuthStateChange(null).finally(() => {
         // setLoading(false) is handled by processAuthStateChange
      });
      return;
    }

    console.log('[useAuth Initial Effect] Subscribing to onAuthStateChange and fetching initial session.');
    
    const initialAuthSetup = async () => {
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
  }, [processAuthStateChange, supabaseError, supabase]); // Added supabase dependency

  return (
    <AuthContext.Provider value={{ user, userProfile, userId, loading, isAdmin, login, logout, authError, profileError }}>
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
