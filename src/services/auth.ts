
'use server';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut, // Rename to avoid conflict
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config'; // Import potentially undefined auth and db

/**
 * Registers a user with Firebase Authentication and stores profile data in Firestore.
 */
export async function registerUser(userData: any): Promise<{ success: boolean; userId?: string; message?: string }> {
  // Check if Firebase services are available
  if (!auth || !db) {
    console.error('Firebase Auth or Firestore service is not available. Check configuration.');
    return { success: false, message: 'Registration service unavailable. Please try again later.' };
  }

  const { email, password, name, branch, semester, registrationNumber, collegeName, city, pincode } = userData;
  console.log('Attempting Firebase registration for user:', email);

  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase Auth user created:', user.uid);

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
    console.log('User profile stored in Firestore for UID:', user.uid);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Firebase Registration Error:', error);
    // Provide more specific error messages based on Firebase error codes
    let message = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email address is already registered.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak. It should be at least 8 characters.';
    } else if (error.code === 'auth/invalid-api-key') {
        message = 'Invalid Firebase configuration. Please contact support.'; // More user-friendly message
    } else if (error.code === 'auth/configuration-not-found') {
        message = 'Firebase Authentication is not enabled for this project. Please contact support or check Firebase console setup.';
    } else if (error.code) {
        message = `Registration failed: ${error.code}`;
    }
    return { success: false, message: message };
  }
}

/**
 * Logs in a user using Firebase Authentication.
 */
export async function loginUser(credentials: any): Promise<{ success: boolean; userId?: string; message?: string }> {
   // Check if Firebase Auth service is available
  if (!auth) {
    console.error('Firebase Auth service is not available. Check configuration.');
    return { success: false, message: 'Login service unavailable. Please try again later.' };
  }

  const { email, password } = credentials;
  console.log('Attempting Firebase login for user:', email);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase Login Successful:', user.uid);
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Firebase Login Error:', error);
    let message = 'Login failed. Please check your credentials.';
     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
       message = 'Invalid email or password.';
     } else if (error.code === 'auth/invalid-api-key') {
         message = 'Invalid Firebase configuration. Please contact support.';
     } else if (error.code === 'auth/configuration-not-found') {
         message = 'Firebase Authentication is not enabled for this project. Please contact support or check Firebase console setup.';
     } else if (error.code) {
         message = `Login failed: ${error.code}`;
     }
    return { success: false, message: message };
  }
}

/**
 * Logs out the currently signed-in user using Firebase Authentication.
 */
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    // Check if Firebase Auth service is available
    if (!auth) {
        console.warn('[logoutUser] Firebase Auth service is not available. Skipping logout.'); // Changed to warn
        return { success: false, message: 'Logout service unavailable.' };
    }

    console.log('Attempting Firebase logout');
    try {
        // Use the imported firebaseSignOut function
        await firebaseSignOut(auth);
        console.log('Firebase Logout Successful');
        return { success: true };
    } catch (error: any) {
        console.error('Firebase Logout Error:', error);
        return { success: false, message: error.message || 'Logout failed.' };
    }
}


/**
 * Placeholder service for admin login - DOES NOT USE FIREBASE currently.
 * For a real app, use Firebase Custom Claims for role-based access control.
 */
export async function loginAdmin(credentials: any): Promise<{ success: boolean; message?: string }> {
  console.log('Attempting to login admin:', credentials.username);
  // Simulate admin credential check
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  // Example check - NEVER use plain text passwords like this in production
  if (credentials.username === 'admin' && credentials.password === 'adminpass') {
     return { success: true };
  } else {
     return { success: false, message: 'Invalid admin credentials.' };
  }
}

// Placeholder functions for Admin actions (implement similarly, potentially checking admin role)
export async function addProgram(programData: any): Promise<{ success: boolean; message?: string }> {
  console.log('Adding program:', programData);
  // TODO: Add check to ensure only admins can call this
  // TODO: Add check for db instance availability
  if (!db) {
    console.error('Firestore service is not available.');
    return { success: false, message: 'Database service unavailable.' };
  }
  // TODO: Implement database interaction (e.g., add to Firestore 'programs' collection)
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}

export async function addEvent(eventData: any): Promise<{ success: boolean; message?: string }> {
    console.log('Adding event:', eventData);
    // TODO: Add check to ensure only admins can call this
    // TODO: Add check for db instance availability
    if (!db) {
      console.error('Firestore service is not available.');
      return { success: false, message: 'Database service unavailable.' };
    }
    // TODO: Implement database interaction (e.g., add to Firestore 'events' collection)
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}
