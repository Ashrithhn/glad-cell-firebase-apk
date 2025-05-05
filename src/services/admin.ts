
'use server';

import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
// TODO: Implement robust admin role checking here, e.g., using Firebase Custom Claims

/**
 * Adds a new event document to the 'events' collection in Firestore.
 * Basic validation included, assumes admin check happens before calling.
 */
export async function addEvent(eventData: {
    name: string;
    description: string;
    rules?: string;
    startDate: string; // ISO String format
    endDate: string; // ISO String format
    eventType: 'individual' | 'group';
    minTeamSize?: number;
    maxTeamSize?: number;
    fee: number; // Fee in Paisa
}): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Server Action - Admin] addEvent invoked.');

  // Check if Firestore service is available
  if (initializationError) {
      const errorMessage = `Admin service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error - Admin] addEvent: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Admin service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Admin] addEvent: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  // TODO: Add a server-side check to ensure the calling user has an admin role
  // Example (requires setup with custom claims):
  // const isAdmin = await verifyAdminRole(); // Implement this function
  // if (!isAdmin) {
  //   console.warn('[Server Action Error - Admin] addEvent: Unauthorized attempt.');
  //   return { success: false, message: "Unauthorized: You do not have permission to add events." };
  // }

  console.log('[Server Action - Admin] Attempting to add event to Firestore:', eventData.name);

  try {
    // Prepare data for Firestore
    const docData = {
        ...eventData,
        // Convert ISO date strings back to Firestore Timestamps
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        createdAt: serverTimestamp(), // Add creation timestamp
        // Ensure team sizes are only included for group events
        ...(eventData.eventType === 'individual' && { minTeamSize: null, maxTeamSize: null }),
    };

    // Remove undefined optional fields if necessary before saving
    if (docData.eventType === 'individual') {
        delete docData.minTeamSize;
        delete docData.maxTeamSize;
    }
    if (docData.rules === undefined || docData.rules === '') {
        delete docData.rules;
    }


    const docRef = await addDoc(collection(db, 'events'), docData);

    console.log('[Server Action - Admin] Event added successfully to Firestore with ID:', docRef.id);
    return { success: true, eventId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error adding event to Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not add event due to a database error: ${error.message || 'Unknown error'}` };
  }
}

// Placeholder for addProgram action if needed
// export async function addProgram(programData: any): Promise<{ success: boolean; programId?: string; message?: string }> { ... }

// Placeholder for verifying admin role (replace with actual implementation)
async function verifyAdminRole(): Promise<boolean> {
    // In a real app, this would involve checking Firebase Auth custom claims
    // or querying a secure admin collection.
    console.warn("verifyAdminRole: Placeholder function, returning false. Implement proper admin check!");
    return false; // Default to false for security
}
