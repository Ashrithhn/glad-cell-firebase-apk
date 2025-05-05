
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config'; // Import potentially undefined db and error
import type { User } from 'firebase/auth';

/**
 * Records event participation in Firestore.
 * Assumes the user performing the action is the one logged in via Firebase Auth on the client.
 */
export async function participateInEvent(participationData: {
    userId: string; // Firebase Auth User ID
    eventId: string;
    eventName: string;
    name: string;
    email: string;
    phone: string;
    branch: string;
    semester: number;
    registrationNumber: string;
    paymentDetails?: {
        orderId: string;
        paymentId: string;
        method: string;
        // Add more fields as needed
    };
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] participateInEvent invoked for event:', participationData.eventId, 'by user:', participationData.userId);

  // Check if Firestore service is available
  if (initializationError) {
      const errorMessage = `Participation service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error] participateInEvent: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Participation service unavailable: Firestore service instance missing. Check configuration.';
    console.error(`[Server Action Error] participateInEvent: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  console.log('[Server Action] Attempting to record participation in Firestore for event:', participationData.eventId, 'by user:', participationData.userId);

  try {
    // Optional: Check if user is already registered for this event
    console.log('[Server Action] Checking existing participation...');
    const participationQuery = query(
        collection(db, 'participations'),
        where('userId', '==', participationData.userId),
        where('eventId', '==', participationData.eventId),
        limit(1)
    );
    const querySnapshot = await getDocs(participationQuery);
    if (!querySnapshot.empty) {
        const existingDocId = querySnapshot.docs[0].id;
        console.warn(`[Server Action] User ${participationData.userId} already registered for event ${participationData.eventId} (Doc ID: ${existingDocId})`);
        return { success: false, message: 'You are already registered for this event.' };
    }
    console.log('[Server Action] No existing participation found. Proceeding to add...');

    // Add a new document to the 'participations' collection
    const docData = {
        ...participationData,
        participatedAt: serverTimestamp(), // Add a timestamp
    };
    const docRef = await addDoc(collection(db, 'participations'), docData);

    console.log('[Server Action] Participation recorded in Firestore with ID:', docRef.id);
    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error] Error recording participation in Firestore:', error.code, error.message, error.stack); // Log more details
    return { success: false, message: `Could not record participation due to a database error: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Fetches user profile data from Firestore.
 * Assumes the user is authenticated on the client.
 * Note: This function might be better placed in auth.ts or a dedicated user service.
 */
 export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
     console.log('[Server Action] getUserProfile invoked for user:', userId);

     // Check if Firestore service is available
     if (initializationError) {
         const errorMessage = `Profile service unavailable: Firebase initialization error - ${initializationError.message}.`;
         console.error(`[Server Action Error] getUserProfile: ${errorMessage}`);
         return { success: false, message: errorMessage };
     }
     if (!db) {
         const errorMessage = 'Profile service unavailable: Firestore service instance missing.';
         console.error(`[Server Action Error] getUserProfile: ${errorMessage}`);
         return { success: false, message: errorMessage };
     }

     if (!userId) {
         const errorMessage = 'User ID is required to fetch profile.';
         console.error(`[Server Action Error] getUserProfile: ${errorMessage}`);
         return { success: false, message: errorMessage };
     }
     console.log('[Server Action] Fetching profile for user:', userId);
     try {
         const userDocRef = doc(db, 'users', userId);
         const docSnap = await getDoc(userDocRef);

         if (docSnap.exists()) {
             console.log('[Server Action] User profile found for:', userId); // Don't log data itself by default
             return { success: true, data: docSnap.data() };
         } else {
             const notFoundMessage = `User profile not found for user: ${userId}`;
             console.warn(`[Server Action] getUserProfile: ${notFoundMessage}`);
             return { success: false, message: notFoundMessage };
         }
     } catch (error: any) {
         console.error('[Server Action Error] Error fetching user profile:', error.code, error.message, error.stack); // Log more details
         return { success: false, message: `Failed to fetch user profile: ${error.message || 'Unknown database error'}` };
     }
 }
