
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, supabaseError } from '@/lib/supabaseClient';
import { logoutUser as serverLogout } from '@/services/auth';

export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registration_number?: string | null;
  college_name?: string | null;
  college_id?: string | null;
  city?: string | null;
  auth_provider?: string | null;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  role?: 'Super Admin' | 'Admin' | 'Volunteer' | 'Participant' | 'Leader' | string | null; 
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

  const handleSession = useCallback(async (session: Session | null) => {
    setLoading(true);
    const sbUser = session?.user ?? null;
    setUser(sbUser);
    setUserId(sbUser?.id ?? null);
  
    if (sbUser && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .single();
  
        if (error && error.code !== 'PGRST116') {
          console.error('[useAuth] Error fetching user profile:', error.message);
          throw error;
        }
        
        if (data) {
          setUserProfile(data);
          // An admin is someone with the role 'Admin' OR 'Super Admin'
          setIsAdmin(data.role === 'Admin' || data.role === 'Super Admin');
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (e) {
        setUserProfile(null);
        setIsAdmin(false);
      }
    } else {
      setUserProfile(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setAuthError(supabaseError);

    if (!supabase) {
      console.error('[useAuth] Supabase client not available.');
      setLoading(false);
      return;
    }
    
    // Standard Supabase auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabaseError, handleSession]);


  const login = async (session: Session | null) => {
    await handleSession(session);
  };

  const logout = async () => {
    if (supabase && !authError) {
      await serverLogout();
    }
    setUser(null);
    setUserId(null);
    setUserProfile(null);
    setIsAdmin(false);
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
