
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// DEPRECATED: This project is migrating to Supabase.
// This configuration is kept temporarily for reference or if some parts still use Firebase.
// Ensure all Firebase related code is refactored or removed.

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

console.log("--- Firebase Config Loading (DEPRECATED - Migrating to Supabase) ---");

const requiredConfigKeys: (keyof FirebaseOptions)[] = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
    const errorMessage = `Firebase configuration is incomplete. Missing environment variables: ${missingKeys.map(key => `NEXT_PUBLIC_FIREBASE_${String(key).toUpperCase()}`).join(', ')}. This configuration is deprecated.`;
    initializationError = new Error(errorMessage);
    console.error("-----------------------------------------------------");
    console.error("🔴 Firebase Config Error (DEPRECATED): Required environment variables are missing!");
    missingKeys.forEach(key => {
        const envVarName = `NEXT_PUBLIC_FIREBASE_${String(key).toUpperCase()}`;
        console.error(`🔴 Missing Variable: ${envVarName}`);
    });
    console.error("🔴 Ensure these are set if Firebase is still partially used, or remove Firebase dependencies if fully migrated to Supabase.");
    console.error("-----------------------------------------------------");
} else {
    console.log("✅ Firebase Config (DEPRECATED): All required NEXT_PUBLIC_ environment variables for Firebase seem to be present.");
}

if (!initializationError) {
  try {
    console.log("[Firebase (DEPRECATED)] Attempting initialization...");
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log("[Firebase (DEPRECATED)] ✅ Initialized new Firebase app.");
    } else {
      app = getApp();
      console.log("[Firebase (DEPRECATED)] ✅ Using existing Firebase app.");
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    console.log("[Firebase (DEPRECATED)] ✅ Firebase services obtained successfully.");
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    app = undefined; authInstance = undefined; dbInstance = undefined;
    console.error(`🔴 [Firebase (DEPRECATED)] Initialization failed: ${initializationError.message}`);
  }
} else {
     console.warn(`🟠 Skipping Firebase initialization (DEPRECATED) due to missing configuration: ${initializationError.message}`);
}

console.log("--- Firebase Config Finished (DEPRECATED) ---");

export { app, authInstance as auth, dbInstance as db, initializationError };
