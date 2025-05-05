
'use server';

import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache'; // Import revalidatePath

// TODO: Implement robust admin role checking here, e.g., using Firebase Custom Claims

/**
 * Represents the structure of event data stored in Firestore.
 * Includes added fields: venue and registrationDeadline.
 */
export interface EventData {
    id?: string; // Added during retrieval
    name: string;
    description: string;
    venue: string; // Added venue
    rules?: string;
    startDate: Timestamp | string; // Store as Timestamp, handle ISO string input/output
    endDate: Timestamp | string;   // Store as Timestamp, handle ISO string input/output
    registrationDeadline?: Timestamp | string | null; // Added optional deadline
    eventType: 'individual' | 'group';
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    fee: number; // Fee in Paisa
    createdAt?: Timestamp | string; // Store as Timestamp, retrieve potentially as string
}

/**
 * Adds a new event document to the 'events' collection in Firestore.
 * Includes new fields: venue and registrationDeadline.
 */
export async function addEvent(eventData: Omit<EventData, 'id' | 'createdAt' | 'startDate' | 'endDate' | 'registrationDeadline'> & { startDate: string, endDate: string, registrationDeadline?: string }): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Server Action - Admin] addEvent invoked.');

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

  console.log('[Server Action - Admin] Attempting to add item to Firestore:', eventData.name);

  try {
    // Prepare data for Firestore
    const docData: Omit<EventData, 'id'> = {
        ...eventData,
        // Convert ISO date strings back to Firestore Timestamps
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        // Convert optional deadline ISO string to Timestamp or null
        registrationDeadline: eventData.registrationDeadline ? Timestamp.fromDate(new Date(eventData.registrationDeadline)) : null,
        createdAt: serverTimestamp() as Timestamp, // Add creation timestamp
        // Ensure team sizes are only included for group events, otherwise set to null
        minTeamSize: eventData.eventType === 'group' ? eventData.minTeamSize : null,
        maxTeamSize: eventData.eventType === 'group' ? eventData.maxTeamSize : null,
    };

    // Remove optional fields if they are empty strings or undefined before saving
    if (!docData.rules) delete docData.rules;
    if (docData.minTeamSize === undefined) delete docData.minTeamSize;
    if (docData.maxTeamSize === undefined) delete docData.maxTeamSize;
    // No need to delete registrationDeadline if null, Firestore handles it

    const docRef = await addDoc(collection(db, 'events'), docData);

    console.log('[Server Action - Admin] Item added successfully to Firestore with ID:', docRef.id);

    // Revalidate relevant paths after adding data
    revalidatePath('/admin/events');
    revalidatePath('/programs'); // Revalidate the public programs page
    revalidatePath('/'); // Revalidate the home page

    return { success: true, eventId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error adding item to Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not add item due to a database error: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Deletes an event document from the 'events' collection in Firestore.
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action - Admin] deleteEvent invoked for ID:', eventId);

  if (initializationError) {
      const errorMessage = `Admin service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error - Admin] deleteEvent: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Admin service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Admin] deleteEvent: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

   if (!eventId) {
       return { success: false, message: 'Event ID is required for deletion.' };
   }

  // TODO: Add a server-side check to ensure the calling user has an admin role

  console.log('[Server Action - Admin] Attempting to delete item from Firestore:', eventId);

  try {
    const eventDocRef = doc(db, 'events', eventId);
    await deleteDoc(eventDocRef);

    console.log('[Server Action - Admin] Item deleted successfully from Firestore:', eventId);

     // Revalidate relevant paths after deleting data
    revalidatePath('/admin/events');
    revalidatePath('/programs'); // Revalidate the public programs page
    revalidatePath('/'); // Revalidate the home page

    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error deleting item from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not delete item due to a database error: ${error.message || 'Unknown error'}` };
  }
}


// Placeholder for verifying admin role (replace with actual implementation)
async function verifyAdminRole(): Promise<boolean> {
    // In a real app, this would involve checking Firebase Auth custom claims
    // or querying a secure admin collection.
    console.warn("verifyAdminRole: Placeholder function, returning false. Implement proper admin check!");
    return false; // Default to false for security
}
