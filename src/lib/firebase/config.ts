
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase configuration
// It's recommended to use environment variables for sensitive data like API keys.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Declare variables that might be reassigned
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let initializationError: Error | null = null;

// --- Initialization ---
console.log("--- Firebase Config Loading ---"); // Log start of file execution

// Check for required config values
if (!firebaseConfig.apiKey) {
    initializationError = new Error("Firebase API Key is missing.");
    // Log detailed error for developer, especially on server
    if (typeof window === 'undefined') {
        console.error("-----------------------------------------------------");
        console.error("🔴 [Server] Firebase Config Error: API Key is MISSING or invalid.");
        console.error("🔴 [Server] Ensure 'NEXT_PUBLIC_FIREBASE_API_KEY' is correctly set in your .env.local file.");
        console.error("🔴 [Server] IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
        console.error("-----------------------------------------------------");
    }
} else {
    if (typeof window === 'undefined') {
        console.log("[Server] ✅ Firebase Config: API Key environment variable found.");
    }
}

if (!firebaseConfig.projectId) {
    if (!initializationError) { // Don't overwrite the first error
        initializationError = new Error("Firebase Project ID is missing.");
    }
     if (typeof window === 'undefined') {
        console.error("-----------------------------------------------------");
        console.error("🔴 [Server] Firebase Config Error: Project ID is MISSING or invalid.");
        console.error("🔴 [Server] Ensure 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' is set in your .env.local file.");
        console.error("🔴 [Server] IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
        console.error("-----------------------------------------------------");
    }
} else {
     if (typeof window === 'undefined') {
        console.log(`[Server] ✅ Firebase Config: Project ID environment variable found: ${firebaseConfig.projectId}`);
     }
}


// Proceed with initialization only if no critical errors found yet
if (!initializationError) {
  try {
    if (typeof window === 'undefined') {
        console.log("[Server] Attempting Firebase initialization...");
    }

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
       if (typeof window === 'undefined') {
         console.log("[Server] ✅ Initialized new Firebase app.");
       }
    } else {
      app = getApp();
       if (typeof window === 'undefined') {
          console.log("[Server] ✅ Using existing Firebase app.");
       }
    }

    // Get services only if app initialization succeeded
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    // const analytics = getAnalytics(app); // Optional

    if (typeof window === 'undefined') {
        console.log("[Server] ✅ Firebase services obtained successfully.");
    }

  } catch (error) {
    // Capture any error during initializeApp or getAuth/getFirestore
    initializationError = error instanceof Error ? error : new Error(String(error));
    // Clear instances if initialization failed
    app = undefined;
    authInstance = undefined;
    dbInstance = undefined;

    // Log detailed error during initialization attempt
    if (typeof window === 'undefined') {
        console.error(`🔴 [Server] Firebase initialization failed during setup: ${initializationError.message}`);
    }
  }
} else {
     // Log why initialization is skipped (both server and client)
     // Keep this single error log to inform the developer.
     console.error(`🔴 Skipping Firebase initialization due to missing configuration: ${initializationError.message}. Ensure required environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are set in .env.local and restart the server.`);
}


console.log("--- Firebase Config Finished ---"); // Log end of file execution

// Export the instances (they might be undefined) and the error status
// Renaming exports for clarity (authInstance -> auth, dbInstance -> db)
export { app, authInstance as auth, dbInstance as db, initializationError };
