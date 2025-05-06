
'use server';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut, // Rename to avoid conflict
    sendPasswordResetEmail, // Import Firebase function
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore'; // Added getDocs, query, where, limit
import { auth, db, initializationError } from '@/lib/firebase/config';

/**
 * Registers a user with Firebase Authentication and stores profile data in Firestore.
 */
export async function registerUser(userData: any): Promise<{ success: boolean; userId?: string; message?: string }> {
  console.log('[Server Action] registerUser invoked.');

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
    // Check if registration number already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("registrationNumber", "==", registrationNumber), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.warn('[Server Action] Registration number already exists:', registrationNumber);
      return { success: false, message: 'This registration number is already in use. Please use a different one.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('[Server Action] Firebase Auth user created:', user.uid);

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
      createdAt: serverTimestamp() as Timestamp,
      authProvider: 'email/password', // Track auth provider
    });
    console.log('[Server Action] User profile stored in Firestore for UID:', user.uid);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('[Server Action Error] Firebase Registration Error:', error.code, error.message);
    let message = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'This email address is already registered.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak. It should be at least 8 characters long.';
    } else if (error.code === 'auth/invalid-api-key') {
        message = 'Invalid Firebase configuration (API Key). Please contact support.';
    } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        message = 'Registration failed: Email/Password sign-in is not enabled for this project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
    } else if (error.code) {
        message = `Registration failed: ${error.code}`;
    } else {
        message = `Registration failed: ${error.message || 'An unknown error occurred.'}`;
    }
    return { success: false, message: message };
  }
}

/**
 * Logs in a user using Firebase Authentication.
 */
export async function loginUser(credentials: any): Promise<{ success: boolean; userId?: string; message?: string }> {
   console.log('[Server Action] loginUser invoked.');

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
    console.error('[Server Action Error] Firebase Login Error:', error.code, error.message);
    let message = 'Login failed. Please check your credentials.';
     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
       message = 'Invalid email or password.';
     } else if (error.code === 'auth/invalid-api-key') {
         message = 'Invalid Firebase configuration (API Key). Please contact support.';
     } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
         message = 'Login failed: Email/Password sign-in is not enabled for this project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
     } else if (error.code) {
         message = `Login failed: ${error.code}`;
     } else {
         message = `Login failed: ${error.message || 'An unknown error occurred.'}`;
     }
    return { success: false, message: message };
  }
}

/**
 * Handles user data from Google Sign-In, creates or updates user in Firestore.
 */
export async function handleGoogleSignInUserData(googleUserData: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<{ success: boolean; userId?: string; message?: string }> {
  console.log('[Server Action] handleGoogleSignInUserData invoked for UID:', googleUserData.uid);

  if (initializationError) {
    const errorMessage = `Google Sign-In service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error] handleGoogleSignInUserData: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Google Sign-In service unavailable: Firestore instance missing.';
    console.error(`[Server Action Error] handleGoogleSignInUserData: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  const { uid, email, displayName, photoURL } = googleUserData;

  if (!uid || !email) {
    return { success: false, message: 'Google Sign-In failed: Missing UID or email.' };
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // User exists, update their profile with latest Google info (if needed)
      await setDoc(userDocRef, {
        name: displayName || userDocSnap.data()?.name || 'N/A', // Keep existing name if Google's is null
        photoURL: photoURL || userDocSnap.data()?.photoURL, // Keep existing photoURL if Google's is null
        lastLoginAt: serverTimestamp() as Timestamp,
        authProvider: 'google.com', // Update auth provider
      }, { merge: true });
      console.log('[Server Action] Existing Google user profile updated in Firestore:', uid);
    } else {
      // New user, create profile
      // For Google Sign-In, some fields like branch, semester might be missing.
      // The user might need to fill these in later via a profile completion step.
      await setDoc(userDocRef, {
        uid: uid,
        email: email,
        name: displayName || 'N/A',
        photoURL: photoURL,
        branch: '', // Placeholder, user to update
        semester: '', // Placeholder
        registrationNumber: `GOOGLE_${uid.substring(0,10)}`, // Create a unique placeholder for Google users
        collegeName: '', // Placeholder, user to update
        city: '', // Placeholder
        pincode: '', // Placeholder
        createdAt: serverTimestamp() as Timestamp,
        lastLoginAt: serverTimestamp() as Timestamp,
        authProvider: 'google.com', // Track auth provider
      });
      console.log('[Server Action] New Google user profile created in Firestore:', uid);
    }

    return { success: true, userId: uid };
  } catch (error: any) {
    console.error('[Server Action Error] Error handling Google Sign-In user data in Firestore:', error.message, error.stack);
    return { success: false, message: `Server error during Google Sign-In: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Logs out the currently signed-in user using Firebase Authentication.
 */
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    console.log('[Server Action] logoutUser invoked.');

    if (initializationError) {
        const errorMessage = `Logout service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.warn(`[Server Action Warning] logoutUser: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!auth) {
        const errorMessage = 'Logout service unavailable: Firebase Auth service instance missing.';
        console.warn(`[Server Action Warning] logoutUser: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }


    console.log('[Server Action] Attempting Firebase logout');
    try {
        await firebaseSignOut(auth);
        console.log('[Server Action] Firebase Logout Successful');
        return { success: true };
    } catch (error: any) {
        console.error('[Server Action Error] Firebase Logout Error:', error.code, error.message);
        return { success: false, message: error.message || 'Logout failed.' };
    }
}


/**
 * Placeholder service for admin login.
 */
export async function loginAdmin(credentials: any): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] loginAdmin invoked.');
  console.log('[Server Action] Attempting to login admin:', credentials.username);
  await new Promise(resolve => setTimeout(resolve, 500));

  if (credentials.username === 'admin' && credentials.password === 'adminpass') {
     console.log('[Server Action] Admin login successful (placeholder).');
     return { success: true };
  } else {
     console.warn('[Server Action] Admin login failed (placeholder): Invalid credentials.');
     return { success: false, message: 'Invalid admin credentials.' };
  }
}

/**
 * Sends a password reset email to the given email address.
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    console.log('[Server Action] sendPasswordReset invoked for email:', email);

    if (initializationError) {
        const errorMessage = `Password reset service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error] sendPasswordReset: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!auth) {
        const errorMessage = 'Password reset service unavailable: Firebase Auth instance missing.';
        console.error(`[Server Action Error] sendPasswordReset: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        await sendPasswordResetEmail(auth, email);
        console.log('[Server Action] Password reset email sent to:', email);
        return { success: true, message: 'If an account exists for this email, a password reset link has been sent.' };
    } catch (error: any) {
        console.error('[Server Action Error] Error sending password reset email:', error.code, error.message);
        let message = 'Failed to send password reset email. Please try again.';
        if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address format.';
        } else if (error.code === 'auth/user-not-found') {
            message = 'No user found with this email address.';
        } else if (error.code === 'auth/missing-ios-bundle-id' || error.code === 'auth/missing-continue-uri') {
            message = 'Password reset configuration error. Please contact support.';
        } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
             message = 'Password reset failed: Email/Password sign-in or password reset is not enabled for this project. Please enable it in the Firebase Console (Authentication > Sign-in method).';
        } else if (error.code) {
            message = `Password reset failed: ${error.code}`;
        } else {
            message = `Password reset failed: ${error.message || 'An unknown error occurred.'}`;
        }
        return { success: false, message };
    }
}
