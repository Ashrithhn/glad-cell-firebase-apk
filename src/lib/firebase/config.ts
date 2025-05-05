import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Check if essential config values are present before initialization
if (!firebaseConfig.apiKey) {
    console.error("-----------------------------------------------------");
    console.error("Firebase Config Error: API Key is MISSING.");
    console.error("Ensure 'NEXT_PUBLIC_FIREBASE_API_KEY' is correctly set in your environment variables (.env.local).");
    console.error("If running server-side actions, ensure the server process can access this variable.");
    console.error("-----------------------------------------------------");
    // Throwing an error might be too disruptive in dev, but is recommended for production builds.
    // throw new Error("Firebase API Key is missing in environment configuration.");
} else {
    console.log("Firebase Config: API Key found (starts with:", firebaseConfig.apiKey.substring(0, 5) + "...)");
}
if (!firebaseConfig.projectId) {
    console.error("-----------------------------------------------------");
    console.error("Firebase Config Error: Project ID is MISSING.");
    console.error("Ensure 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' is set in your environment variables (.env.local).");
    console.error("-----------------------------------------------------");
} else {
    console.log("Firebase Config: Project ID found:", firebaseConfig.projectId);
}
// Add more checks as needed (e.g., authDomain)


let app: FirebaseApp;
let authInstance: Auth; // Renamed to avoid conflict with exported 'auth'
let dbInstance: Firestore; // Renamed to avoid conflict with exported 'db'

try {
  // Initialize Firebase
  console.log("Attempting Firebase initialization..."); // Log before init
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  // const analytics = getAnalytics(app); // Optional
  console.log("Firebase initialized successfully."); // Add log for confirmation
} catch (error) {
    console.error("-----------------------------------------------------");
    console.error("Firebase initialization FAILED:", error);
    console.error("-----------------------------------------------------");
    // Depending on the app structure, you might want to throw the error
    // or provide dummy/fallback instances if parts of the app can run without Firebase.
    // Re-throwing to make the error clear during development.
    throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : String(error)}`);
}

// Export the initialized instances
export { app, authInstance as auth, dbInstance as db };
