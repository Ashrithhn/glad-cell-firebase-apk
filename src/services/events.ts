
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config'; // Import db and auth
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
  console.log('Attempting to record participation in Firestore for event:', participationData.eventId, 'by user:', participationData.userId);

  try {
    // Optional: Check if user is already registered for this event
    const participationQuery = query(
        collection(db, 'participations'),
        where('userId', '==', participationData.userId),
        where('eventId', '==', participationData.eventId),
        limit(1)
    );
    const querySnapshot = await getDocs(participationQuery);
    if (!querySnapshot.empty) {
        console.warn(`User ${participationData.userId} already registered for event ${participationData.eventId}`);
        return { success: false, message: 'You are already registered for this event.' };
    }

    // Add a new document to the 'participations' collection
    const docRef = await addDoc(collection(db, 'participations'), {
      ...participationData,
      participatedAt: serverTimestamp(), // Add a timestamp
    });

    console.log('Participation recorded in Firestore with ID:', docRef.id);
    return { success: true };

  } catch (error: any) {
    console.error('Error recording participation in Firestore:', error);
    return { success: false, message: 'Could not record participation due to a database error.' };
  }
}

/**
 * Fetches user profile data from Firestore.
 * Assumes the user is authenticated on the client.
 * Note: This function might be better placed in auth.ts or a dedicated user service.
 */
 export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: any; message?: string }> {
     if (!userId) {
         return { success: false, message: 'User ID is required.' };
     }
     console.log('Fetching profile for user:', userId);
     try {
         const userDocRef = doc(db, 'users', userId);
         const docSnap = await getDoc(userDocRef);

         if (docSnap.exists()) {
             console.log('User profile found:', docSnap.data());
             return { success: true, data: docSnap.data() };
         } else {
             console.warn('No profile document found for user:', userId);
             return { success: false, message: 'User profile not found.' };
         }
     } catch (error: any) {
         console.error('Error fetching user profile:', error);
         return { success: false, message: 'Failed to fetch user profile.' };
     }
 }
