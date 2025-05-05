
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { logoutUser as serverLogout } from '@/services/auth'; // Import server-side logout

interface AuthContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  isAdmin: boolean; // Added isAdmin state
  login: (uid: string) => Promise<void>; // Simulate login state update
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Initialize admin state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setUserId(currentUser?.uid || null);

      // Placeholder: Check if user is admin (replace with actual logic, e.g., Custom Claims)
      // For demo, check if a local storage flag is set (insecure, use Custom Claims in production)
      if (typeof window !== 'undefined') {
          const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
          setIsAdmin(adminLoggedIn); // Update admin state based on localStorage flag
          if (currentUser && !adminLoggedIn) {
             localStorage.removeItem('isAdminLoggedIn'); // Clean up if user logs in normally
          }
      }

      setLoading(false);
      console.log('Auth State Changed:', currentUser?.uid || 'Logged out');

      // Dispatch authChange event for components using older localStorage method (like Header)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
      }
    });

    // Listen for admin login changes (from localStorage for demo)
    const handleStorageChange = () => {
        if (typeof window !== 'undefined') {
            const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
            setIsAdmin(adminLoggedIn);
            // Ensure regular user state is cleared if admin logs in
            if (adminLoggedIn && user) {
                setUser(null);
                setUserId(null);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also trigger on our custom event for immediate feedback
    window.addEventListener('authChange', handleStorageChange);


    // Cleanup subscription on unmount
    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authChange', handleStorageChange);
    }
  }, [user]); // Re-run effect if user state changes explicitly

  // Simulate client-side state update after successful server login
  const login = async (uid: string) => {
    // The actual Firebase login happens server-side (or via Firebase client SDK).
    // This function primarily updates the context state based on the server response.
    // For this hook, onAuthStateChanged handles the actual user object update.
    setUserId(uid);
    // Simulate admin check after login
     if (typeof window !== 'undefined') {
         const adminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
         setIsAdmin(adminLoggedIn);
         if(adminLoggedIn){
             // If logging in as admin, clear Firebase user state
             setUser(null);
             setUserId(null); // Keep userId null for admin for this demo setup
         } else {
            // If regular user login, ensure admin flag is false
            setIsAdmin(false);
            localStorage.removeItem('isAdminLoggedIn');
         }
         window.dispatchEvent(new Event('authChange')); // Notify header etc.
     }
    // No need to setUser here, onAuthStateChanged does it.
    console.log('Auth Context Login: User ID set to', uid);
  };

  const logout = async () => {
    setLoading(true);
    await serverLogout(); // Call the server action to sign out from Firebase
    // Clear admin flag on logout
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
    }
    // onAuthStateChanged will handle setting user and userId to null
    setIsAdmin(false);
    console.log('Auth Context Logout initiated');
     // Dispatch event immediately for faster UI update
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
    }
    // setLoading will be set to false by onAuthStateChanged
  };

  return (
    <AuthContext.Provider value={{ user, userId, loading, isAdmin, login, logout }}>
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
