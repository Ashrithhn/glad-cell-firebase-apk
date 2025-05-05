
'use server';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut, // Rename to avoid conflict
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, initializationError } from '@/lib/firebase/config'; // Import potentially undefined auth, db, and error

/**
 * Registers a user with Firebase Authentication and stores profile data in Firestore.
 */
export async function registerUser(userData: any): Promise<{ success: boolean; userId?: string; message?: string }> {
  console.log('[Server Action] registerUser invoked.'); // Add invocation log

  // Check if Firebase services are initialized correctly
  if (initializationError) {
    const errorMessage = `Registration service unavailable: Firebase initialization error - ${initializationError.message}. Check setup.`;
    console.error(`[Server Action Error] registerUser: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!auth || !db) {
    const errorMessage = 'Registration service temporarily unavailable: Firebase Auth or Firestore service instance missing. Check configuration.';
    console.error(`[Server Action Error] registerUser: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }


  const { email, password, name, branch, semester, registrationNumber, collegeName, city, pincode } = userData;
  console.log('[Server Action] Attempting Firebase registration for user:', email);

  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('[Server Action] Firebase Auth user created:', user.uid);

    // 2. Store additional user details in Firestore 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: name,
      branch: branch,
      semester: semester,
      registrationNumber: registrationNumber,
      collegeName: collegeName,
      city: city,
      pincode: pincode,
      createdAt: serverTimestamp(),
      // Add any other relevant fields, like roles if needed later
    });
    console.log('[Server Action] User profile stored in Firestore for UID:', user.uid);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('[Server Action Error] Firebase Registration Error:', error.code, error.message); // Log code and message
    // Provide more specific error messages based on Firebase error codes
    let message = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email address is already registered.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak. It should be at least 8 characters.';
    } else if (error.code === 'auth/invalid-api-key') {
        message = 'Invalid Firebase configuration (API Key). Please contact support.'; // More user-friendly message
    } else if (error.code === 'auth/configuration-not-found') {
        // Specific message guiding the user to enable the sign-in method
        message = 'Registration failed: Email/Password sign-in is not enabled for this project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
    } else if (error.code) {
        message = `Registration failed: ${error.code}`; // Include error code if available
    } else {
        message = `Registration failed: ${error.message || 'An unknown error occurred.'}`; // Fallback message
    }
    return { success: false, message: message };
  }
}

/**
 * Logs in a user using Firebase Authentication.
 */
export async function loginUser(credentials: any): Promise<{ success: boolean; userId?: string; message?: string }> {
   console.log('[Server Action] loginUser invoked.'); // Add invocation log

   // Check if Firebase services are initialized correctly
   if (initializationError) {
    const errorMessage = `Login service unavailable: Firebase initialization error - ${initializationError.message}. Check setup.`;
    console.error(`[Server Action Error] loginUser: ${errorMessage}`);
    return { success: false, message: errorMessage };
   }
   if (!auth) {
     const errorMessage = 'Login service temporarily unavailable: Firebase Auth service instance missing. Check configuration.';
     console.error(`[Server Action Error] loginUser: ${errorMessage}`);
     return { success: false, message: errorMessage };
   }

  const { email, password } = credentials;
  console.log('[Server Action] Attempting Firebase login for user:', email);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('[Server Action] Firebase Login Successful:', user.uid);
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('[Server Action Error] Firebase Login Error:', error.code, error.message); // Log code and message
    let message = 'Login failed. Please check your credentials.';
     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
       message = 'Invalid email or password.';
     } else if (error.code === 'auth/invalid-api-key') {
         message = 'Invalid Firebase configuration (API Key). Please contact support.';
     } else if (error.code === 'auth/configuration-not-found') {
         // Specific message guiding the user to enable the sign-in method
         message = 'Login failed: Email/Password sign-in is not enabled for this project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
     } else if (error.code) {
         message = `Login failed: ${error.code}`; // Include error code if available
     } else {
         message = `Login failed: ${error.message || 'An unknown error occurred.'}`; // Fallback message
     }
    return { success: false, message: message };
  }
}

/**
 * Logs out the currently signed-in user using Firebase Authentication.
 */
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    console.log('[Server Action] logoutUser invoked.'); // Add invocation log

    // Check if Firebase services are initialized correctly
    if (initializationError) {
        const errorMessage = `Logout service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.warn(`[Server Action Warning] logoutUser: ${errorMessage}`); // Use warn as it might not be critical
        return { success: false, message: errorMessage };
    }
    if (!auth) {
        const errorMessage = 'Logout service unavailable: Firebase Auth service instance missing.';
        console.warn(`[Server Action Warning] logoutUser: ${errorMessage}`); // Use warn
        return { success: false, message: errorMessage };
    }


    console.log('[Server Action] Attempting Firebase logout');
    try {
        // Use the imported firebaseSignOut function
        await firebaseSignOut(auth);
        console.log('[Server Action] Firebase Logout Successful');
        return { success: true };
    } catch (error: any) {
        console.error('[Server Action Error] Firebase Logout Error:', error.code, error.message); // Log code and message
        return { success: false, message: error.message || 'Logout failed.' };
    }
}


/**
 * Placeholder service for admin login - DOES NOT USE FIREBASE currently.
 * For a real app, use Firebase Custom Claims for role-based access control.
 */
export async function loginAdmin(credentials: any): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] loginAdmin invoked.'); // Add invocation log
  console.log('[Server Action] Attempting to login admin:', credentials.username);
  // Simulate admin credential check
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  // Example check - NEVER use plain text passwords like this in production
  if (credentials.username === 'admin' && credentials.password === 'adminpass') {
     console.log('[Server Action] Admin login successful (placeholder).');
     return { success: true };
  } else {
     console.warn('[Server Action] Admin login failed (placeholder): Invalid credentials.');
     return { success: false, message: 'Invalid admin credentials.' };
  }
}
