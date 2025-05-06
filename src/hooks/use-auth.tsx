
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'; // Renamed User to FirebaseUser
import { auth, initializationError } from '@/lib/firebase/config';
import { logoutUser as serverLogout } from '@/services/auth';
import { doc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore'; // Added onSnapshot
import { db } from '@/lib/firebase/config'; // Import db

// Define a more detailed User type for our context
interface UserProfile {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registrationNumber?: string | null;
  // Add other fields from your Firestore 'users' collection
}


interface AuthContextType {
  user: FirebaseUser | null; // Firebase auth user object
  userProfile: UserProfile | null; // User profile data from Firestore
  userId: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (uid: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(initializationError);

  useEffect(() => {
    setAuthError(initializationError);

    let unsubscribeAuth: (() => void) | undefined = undefined;
    let unsubscribeFirestore: (() => void) | undefined = undefined;

    if (auth && !initializationError) {
      console.log('[useAuth] Subscribing to auth state changes.');
      unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setUserId(currentUser?.uid || null);
        setIsAdmin(localStorage.getItem('isAdminLoggedIn') === 'true');

        if (currentUser) {
          // User is logged in, fetch/listen to their profile from Firestore
          if (db) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                const profile: UserProfile = {
                    uid: currentUser.uid,
                    email: data.email || currentUser.email,
                    name: data.name || currentUser.displayName,
                    photoURL: data.photoURL || currentUser.photoURL,
                    branch: data.branch,
                    semester: data.semester,
                    registrationNumber: data.registrationNumber,
                    // Map other fields
                };
                setUserProfile(profile);
              } else {
                // Profile might not exist yet if it's a new Google Sign-In
                // or if Firestore write failed/is delayed.
                setUserProfile({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                }); // Basic profile from auth
                console.warn(`[useAuth] User profile not found in Firestore for UID: ${currentUser.uid}. Using auth data as fallback.`);
              }
              setLoading(false);
            }, (error) => {
                console.error("[useAuth] Error fetching user profile from Firestore:", error);
                setUserProfile(null); // Clear profile on error
                setLoading(false);
            });
          } else {
             console.warn("[useAuth] Firestore instance (db) is not available. Cannot fetch user profile.");
             setUserProfile(null);
             setLoading(false);
          }
        } else {
          // User is logged out
          setUserProfile(null);
          setLoading(false);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChange'));
        }
      });
    } else {
      console.error(`[useAuth] Firebase initialization failed: ${initializationError?.message}. Cannot subscribe to auth state changes.`);
      setLoading(false);
    }

    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        setIsAdmin(adminLoggedIn);
        if (adminLoggedIn && user) {
          setUser(null);
          setUserId(null);
          setUserProfile(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, [user]); // Re-run on external user object change too

  const login = async (uid: string) => {
    if (authError) {
      console.error("[useAuth Login] Cannot login, Firebase auth error:", authError.message);
      return;
    }
    setUserId(uid); // onAuthStateChanged will handle the rest (setUser, fetch profile)
    console.log('Auth Context Login: User ID set for state update', uid);
    // Admin check logic is now within the onAuthStateChanged effect based on localStorage
    // to ensure consistency if admin logs in through a different mechanism.
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange')); // Trigger UI updates if needed
    }
  };

  const logout = async () => {
    setLoading(true);
    if (auth && !authError) {
      try {
        await serverLogout();
      } catch (error) {
        console.error('Error during server logout:', error);
      }
    } else {
      console.warn(`[useAuth Logout] Cannot logout. Firebase auth error: ${authError?.message} or auth instance missing.`);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminLoggedIn');
    }
    // onAuthStateChanged handles setting user, userId, userProfile to null
    // If auth failed initially, manually clear state
    if (!auth || authError) {
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
