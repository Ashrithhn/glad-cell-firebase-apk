
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// --- Firebase Configuration (DEPRECATED) ---
// This project has migrated to Supabase. This Firebase configuration is no longer actively used
// and is kept for historical reference or if a specific, isolated Firebase feature remains.
// New development should use Supabase.

console.log("--- Firebase Config Loading (DEPRECATED - Project Migrated to Supabase) ---");

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let initializationError: Error | null = null;

const requiredConfigKeys: (keyof FirebaseOptions)[] = [
    'apiKey', 'authDomain', 'projectId', // Minimal check for basic functionality if still used
];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
    const errorMessage = `Firebase configuration is incomplete for DEPRECATED setup. Missing: ${missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${String(key).toUpperCase()}`).join(', ')}. This may not be an issue if Firebase is fully unused.`;
    initializationError = new Error(errorMessage);
    console.warn(`🟠 ${errorMessage}`);
} else {
    console.log("✅ Firebase Config (DEPRECATED): Minimal required NEXT_PUBLIC_ environment variables for Firebase are present (if it were still in use).");
}

if (!initializationError && firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    console.log("[Firebase (DEPRECATED)] Attempting initialization (if config present)...");
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("[Firebase (DEPRECATED)] ✅ Initialized new Firebase app (if config valid).");
    } else {
      app = getApp();
      console.log("[Firebase (DEPRECATED)] ✅ Using existing Firebase app (if config valid).");
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    console.log("[Firebase (DEPRECATED)] ✅ Firebase services obtained (if config valid).");
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    app = undefined; authInstance = undefined; dbInstance = undefined;
    console.error(`🔴 [Firebase (DEPRECATED)] Initialization failed (if config was present): ${initializationError.message}`);
  }
} else {
     console.warn(`🟠 Skipping Firebase initialization (DEPRECATED) due to missing/incomplete configuration or previous error: ${initializationError?.message || 'Key/ProjectID missing'}`);
     initializationError = initializationError || new Error("Firebase config incomplete, not initializing (DEPRECATED).");
     app = undefined; authInstance = undefined; dbInstance = undefined;
}

console.log("--- Firebase Config Finished (DEPRECATED) ---");

// Export potentially undefined instances. Consumers must check for their existence.
export { app, authInstance as auth, dbInstance as db, initializationError };
