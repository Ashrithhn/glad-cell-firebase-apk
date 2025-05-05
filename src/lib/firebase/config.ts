
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional

console.log("--- Firebase Config Loading ---"); // Log start of file execution

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Log the environment variable value being read *before* validation checks
// Sensitive keys should not be fully logged in production environments.
// Check if running on the server or client for appropriate logging
if (typeof window === 'undefined') {
    // Server-side logging (less verbose)
    console.log(`[Server] Reading NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Exists' : '**MISSING or UNDEFINED**'}`);
    console.log(`[Server] Reading NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '**MISSING or UNDEFINED**'}`);
}


let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let initializationError: Error | null = null;

// Check for required config values
if (!firebaseConfig.apiKey) {
    // Removed noisy client-side console.error logs
    initializationError = new Error("Firebase API Key is missing.");
} else {
     if (typeof window === 'undefined') console.log("[Server] ✅ Firebase Config: API Key environment variable found.");
}
if (!firebaseConfig.projectId) {
     // Removed noisy client-side console.error logs
    if (!initializationError) { // Don't overwrite the first error
        initializationError = new Error("Firebase Project ID is missing.");
    }
} else {
     if (typeof window === 'undefined') console.log("[Server] ✅ Firebase Config: Project ID found:", firebaseConfig.projectId);
}

// Attempt initialization only if required config seems present
if (!initializationError) {
    try {
      if (typeof window === 'undefined') console.log("[Server] Attempting Firebase initialization...");
      if (getApps().length === 0) {
         app = initializeApp(firebaseConfig);
         if (typeof window === 'undefined') console.log("[Server] Initialized new Firebase app.");
      } else {
         app = getApp();
         if (typeof window === 'undefined') console.log("[Server] Using existing Firebase app.");
      }
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
      // const analytics = getAnalytics(app); // Optional
      if (typeof window === 'undefined') console.log("[Server] ✅ Firebase services initialized successfully.");
    } catch (error) {
        console.error("🔴 Firebase initialization FAILED:", error);
        initializationError = error instanceof Error ? error : new Error(String(error));
        // Clear instances if initialization failed
        app = undefined;
        authInstance = undefined;
        dbInstance = undefined;
    }
} else {
     // Log why initialization is skipped (both server and client)
     console.error(`🔴 Skipping Firebase initialization due to missing configuration: ${initializationError.message}. Ensure required environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are set in .env.local and restart the server.`);
}

console.log("--- Firebase Config Finished ---"); // Log end of file execution

// Export the instances (they might be undefined if initialization failed or skipped)
// Modules importing these should check for undefined before use.
export { app, authInstance as auth, dbInstance as db, initializationError };
