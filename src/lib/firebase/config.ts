
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
console.log(`Reading NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `Starts with '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 5)}...'` : '**MISSING or UNDEFINED**'}`);
console.log(`Reading NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '**MISSING or UNDEFINED**'}`);

// Check if essential config values are present before initialization
let hasError = false;
if (!firebaseConfig.apiKey) {
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error: API Key is MISSING or invalid.");
    console.error("🔴 Ensure 'NEXT_PUBLIC_FIREBASE_API_KEY' is correctly set in your .env.local file.");
    console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
    console.error("-----------------------------------------------------");
    hasError = true;
} else {
    console.log("✅ Firebase Config: API Key found.");
}
if (!firebaseConfig.projectId) {
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error: Project ID is MISSING or invalid.");
    console.error("🔴 Ensure 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' is set in your .env.local file.");
    console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
    console.error("-----------------------------------------------------");
    hasError = true;
} else {
    console.log("✅ Firebase Config: Project ID found:", firebaseConfig.projectId);
}
// Add more checks as needed (e.g., authDomain)

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined; // Use undefined initially
let dbInstance: Firestore | undefined; // Use undefined initially

if (!hasError) {
    try {
      // Initialize Firebase
      console.log("Attempting Firebase initialization...");
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
      // const analytics = getAnalytics(app); // Optional
      console.log("✅ Firebase initialized successfully.");
    } catch (error) {
        console.error("-----------------------------------------------------");
        console.error("🔴 Firebase initialization FAILED:", error);
        console.error("🔴 This often happens if the API Key is incorrect even if present.");
        console.error("🔴 Double-check the key value in Firebase Console -> Project Settings.");
        console.error("-----------------------------------------------------");
        // We will still export potentially undefined instances, but the error is logged.
        // Re-throwing might stop the server entirely, logging is often better for diagnosis.
        // throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        hasError = true; // Mark that initialization failed
    }
} else {
     console.error("🔴 Skipping Firebase initialization due to missing configuration.");
}

console.log("--- Firebase Config Finished ---"); // Log end of file execution

// Export the instances (they might be undefined if initialization failed)
// Consumers of these exports should handle the possibility of them being undefined.
export { app, authInstance as auth, dbInstance as db };
