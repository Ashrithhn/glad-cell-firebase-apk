
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
console.log(`Reading NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Exists' : '**MISSING or UNDEFINED**'}`);
console.log(`Reading NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '**MISSING or UNDEFINED**'}`);


let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let initializationError: Error | null = null;

// Check for required config values
if (!firebaseConfig.apiKey) {
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error: API Key is MISSING or invalid.");
    console.error("🔴 Ensure 'NEXT_PUBLIC_FIREBASE_API_KEY' is correctly set in your .env.local file.");
    console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
    console.error("-----------------------------------------------------");
    initializationError = new Error("Firebase API Key is missing.");
} else {
    console.log("✅ Firebase Config: API Key environment variable found.");
}
if (!firebaseConfig.projectId) {
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error: Project ID is MISSING or invalid.");
    console.error("🔴 Ensure 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' is set in your .env.local file.");
    console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
    console.error("-----------------------------------------------------");
    if (!initializationError) { // Don't overwrite the first error
        initializationError = new Error("Firebase Project ID is missing.");
    }
} else {
    console.log("✅ Firebase Config: Project ID found:", firebaseConfig.projectId);
}

// Attempt initialization only if required config seems present
if (!initializationError) {
    try {
      console.log("Attempting Firebase initialization...");
      if (getApps().length === 0) {
         app = initializeApp(firebaseConfig);
         console.log("Initialized new Firebase app.");
      } else {
         app = getApp();
         console.log("Using existing Firebase app.");
      }
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
      // const analytics = getAnalytics(app); // Optional
      console.log("✅ Firebase services initialized successfully.");
    } catch (error) {
        console.error("-----------------------------------------------------");
        console.error("🔴 Firebase initialization FAILED:", error);
        console.error("🔴 This often happens if the config values are incorrect even if present.");
        console.error("🔴 Double-check the values in Firebase Console -> Project Settings.");
        console.error("-----------------------------------------------------");
        initializationError = error instanceof Error ? error : new Error(String(error));
        // Clear instances if initialization failed
        app = undefined;
        authInstance = undefined;
        dbInstance = undefined;
    }
} else {
     console.error(`🔴 Skipping Firebase initialization due to missing configuration: ${initializationError.message}`);
}


console.log("--- Firebase Config Finished ---"); // Log end of file execution

// Export the instances (they might be undefined if initialization failed or skipped)
// Modules importing these should check for undefined before use.
export { app, authInstance as auth, dbInstance as db, initializationError };
