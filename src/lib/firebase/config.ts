
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional

// --- Firebase Configuration ---
// IMPORTANT: Reads from environment variables (.env.local)
// These MUST be prefixed with NEXT_PUBLIC_ to be available on the client-side.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
  // Note: FIREBASE_REALTIME_DB_URL is typically used server-side with Admin SDK,
  // not usually needed for client-side initialization if using Firestore.
};

// Declare variables that might be reassigned
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let initializationError: Error | null = null;

// --- Initialization ---
console.log("--- Firebase Config Loading ---");

// Check for ALL required client-side config values
const requiredConfigKeys: (keyof FirebaseOptions)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
    const errorMessage = `Firebase configuration is incomplete. Missing environment variables: ${missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`).join(', ')}.`;
    initializationError = new Error(errorMessage);

    // Log detailed error messages for each missing key
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error: Required environment variables are missing!");
    missingKeys.forEach(key => {
        const envVarName = `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`;
        console.error(`🔴 Missing Variable: ${envVarName}`);
        console.error(`   -> Check your .env.local file for '${envVarName}'.`);
    });
    console.error("🔴 IMPORTANT: You MUST restart your Next.js server (e.g., 'npm run dev') after creating or modifying the .env.local file.");
    console.error("-----------------------------------------------------");

} else {
    console.log("✅ Firebase Config: All required NEXT_PUBLIC_ environment variables seem to be present.");
}


// Proceed with initialization only if no critical errors found yet
if (!initializationError) {
  try {
    console.log("[Firebase] Attempting initialization...");

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] ✅ Initialized new Firebase app.");
    } else {
      app = getApp();
      console.log("[Firebase] ✅ Using existing Firebase app.");
    }

    // Get services only if app initialization succeeded
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    // const analytics = getAnalytics(app); // Optional

    console.log("[Firebase] ✅ Firebase services obtained successfully.");

  } catch (error) {
    // Capture any error during initializeApp or getAuth/getFirestore
    initializationError = error instanceof Error ? error : new Error(String(error));
    // Clear instances if initialization failed
    app = undefined;
    authInstance = undefined;
    dbInstance = undefined;

    console.error(`🔴 [Firebase] Initialization failed during setup: ${initializationError.message}`);
    console.error("   -> This might be due to an invalid value in your .env.local (even if present) or network issues.");
  }
} else {
     // Log why initialization is skipped (both server and client)
     // Use warn level for skipping, error level for the actual missing key message above
     console.warn(`🟠 Skipping Firebase initialization due to missing configuration: ${initializationError.message}`);
}


console.log("--- Firebase Config Finished ---"); // Log end of file execution

// Export the instances (they might be undefined) and the error status
// Renaming exports for clarity (authInstance -> auth, dbInstance -> db)
export { app, authInstance as auth, dbInstance as db, initializationError };
