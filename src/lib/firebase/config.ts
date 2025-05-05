
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

console.log("--- Firebase Config Loading ---");

// --- Validation ---
if (!firebaseConfig.apiKey) {
  initializationError = new Error("Firebase API Key is missing.");
  console.error("🔴 Firebase Config Error: API Key MISSING. Check NEXT_PUBLIC_FIREBASE_API_KEY in .env.local and restart server.");
} else {
  if (typeof window === 'undefined') {
    console.log("[Server] ✅ Firebase Config: API Key found.");
  }
}

if (!firebaseConfig.projectId) {
  if (!initializationError) { // Don't overwrite the first error
    initializationError = new Error("Firebase Project ID is missing.");
  }
  console.error("🔴 Firebase Config Error: Project ID MISSING. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local and restart server.");
} else {
   if (typeof window === 'undefined') {
     console.log(`[Server] ✅ Firebase Config: Project ID found: ${firebaseConfig.projectId}`);
   }
}

// --- Initialization ---
if (!initializationError) {
  try {
    if (typeof window === 'undefined') {
        console.log("[Server] Attempting Firebase initialization...");
    }

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      if (typeof window === 'undefined') {
          console.log("[Server] Initialized new Firebase app.");
      }
    } else {
      app = getApp();
       if (typeof window === 'undefined') {
           console.log("[Server] Using existing Firebase app.");
       }
    }

    // Get services only if app initialization succeeded
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    // const analytics = getAnalytics(app); // Optional

    if (typeof window === 'undefined') {
        console.log("[Server] ✅ Firebase services initialized successfully.");
    }

  } catch (error) {
    const errorMessage = `Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`;
    if (typeof window === 'undefined') {
      console.error(`🔴 [Server] ${errorMessage}`);
    } else {
      // Log a single warning on the client for init failure
      console.warn(`[Client] ${errorMessage}`);
    }
    initializationError = error instanceof Error ? error : new Error(String(error));

    // Clear instances if initialization failed - These MUST be 'let' declarations
    app = undefined;
    authInstance = undefined;
    dbInstance = undefined;
  }
} else {
  // Log why initialization is skipped (only if an error was previously caught)
  const skipMessage = `🔴 Skipping Firebase initialization due to missing configuration: ${initializationError.message}. Ensure required environment variables (e.g., NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are set correctly in .env.local and restart the server.`;
   if (typeof window === 'undefined') {
       console.error(`[Server] ${skipMessage}`);
   } else {
       console.warn(`[Client] ${skipMessage}`); // Use warn on the client
   }
}

console.log("--- Firebase Config Finished ---");

// Export the instances (they might be undefined) and the error status
export { app, authInstance as auth, dbInstance as db, initializationError };
