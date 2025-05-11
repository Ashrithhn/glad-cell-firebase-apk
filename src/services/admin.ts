'use server';

import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache'; // Import revalidatePath
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';


// TODO: Implement robust admin role checking here, e.g., using Firebase Custom Claims

/**
 * Represents the structure of event data as it's stored in Firestore.
 * Dates are Firestore Timestamps.
 */
interface EventForFirestore {
    id?: string; // Added during retrieval, not stored
    name: string;
    description: string;
    venue: string;
    rules?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    registrationDeadline?: Timestamp | null;
    eventType: 'individual' | 'group';
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    fee: number; // Fee in Paisa
    imageUrl?: string | null; 
    imageStoragePath?: string | null; 
    createdAt: Timestamp; // Firestore server timestamp
}

/**
 * Defines the expected input structure for the addEvent server action.
 * Dates are expected as ISO strings. Fee is expected in Paisa.
 */
interface AddEventInput {
  name: string;
  description: string;
  venue: string;
  rules?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  registrationDeadline?: string; // Optional ISO string
  eventType: 'individual' | 'group';
  minTeamSize?: number;
  maxTeamSize?: number;
  fee: number; // Fee in Paisa (form should convert from Rupees if necessary)
  imageDataUri?: string | null; // For image upload
}


/**
 * Adds a new event document to the 'events' collection in Firestore.
 */
export async function addEvent(eventData: AddEventInput): Promise<{ success: boolean; eventId?: string; message?: string }> {
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
    let imageUrl: string | null = null;
    let imageStoragePath: string | null = null;

    if (eventData.imageDataUri) {
      const storage = getStorage();
      // Ensure imageDataUri is a string before processing
      if (typeof eventData.imageDataUri === 'string' && eventData.imageDataUri.startsWith('data:image/')) {
        const mimeType = eventData.imageDataUri.substring(eventData.imageDataUri.indexOf(':') + 1, eventData.imageDataUri.indexOf(';'));
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueId = doc(collection(db, '_placeholder')).id; 
        const filePath = `eventImages/${uniqueId}.${extension}`;
        const imageRef = ref(storage, filePath);

        await uploadString(imageRef, eventData.imageDataUri, 'data_url');
        imageUrl = await getDownloadURL(imageRef);
        imageStoragePath = filePath;
        console.log('[Server Action - Admin] Image uploaded to:', filePath);
      } else {
        console.warn('[Server Action - Admin] Invalid or missing imageDataUri for event:', eventData.name);
      }
    }


    // Prepare data for Firestore, converting string dates to Timestamps
    const docData: Omit<EventForFirestore, 'id'> = {
        name: eventData.name,
        description: eventData.description,
        venue: eventData.venue,
        rules: eventData.rules,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        registrationDeadline: eventData.registrationDeadline ? Timestamp.fromDate(new Date(eventData.registrationDeadline)) : null,
        eventType: eventData.eventType,
        minTeamSize: eventData.eventType === 'group' ? eventData.minTeamSize : null,
        maxTeamSize: eventData.eventType === 'group' ? eventData.maxTeamSize : null,
        fee: eventData.fee, // Assuming fee is already in Paisa from the form
        imageUrl: imageUrl,
        imageStoragePath: imageStoragePath,
        createdAt: serverTimestamp() as Timestamp,
    };

    // Remove optional fields if they are undefined or empty strings before saving
    if (!docData.rules) delete docData.rules;
    if (docData.minTeamSize === undefined) docData.minTeamSize = null; 
    if (docData.maxTeamSize === undefined) docData.maxTeamSize = null; 
    if (!docData.imageUrl) delete docData.imageUrl;
    if (!docData.imageStoragePath) delete docData.imageStoragePath;


    const docRef = await addDoc(collection(db, 'events'), docData);

    console.log('[Server Action - Admin] Item added successfully to Firestore with ID:', docRef.id);

    // Revalidate relevant paths after adding data
    revalidatePath('/admin/events');
    revalidatePath('/programs'); // Revalidate the public programs page
    revalidatePath('/'); // Revalidate the home page

    return { success: true, eventId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error adding item:', error.code, error.message, error.stack);
    let detailedMessage = `Could not add item: ${error.message || 'Unknown error'}`;
    if (error.code === 'storage/unknown') {
        detailedMessage = 'Failed to upload image to Firebase Storage. This often indicates a problem with your Storage security rules. Please ensure that authenticated users (admins) have write permission to the "eventImages/" path in your Firebase Storage rules. Original error: (storage/unknown)';
    } else if (error.code === 'storage/unauthenticated') {
        detailedMessage = 'Failed to upload image: User is not authenticated. Please ensure you are logged in as an admin. (storage/unauthenticated)';
    } else if (error.code === 'storage/unauthorized') {
        detailedMessage = 'Failed to upload image: User is not authorized to perform this action. Check Firebase Storage rules for the "eventImages/" path. (storage/unauthorized)';
    } else if (error.code && error.code.startsWith('storage/')) {
        detailedMessage = `Firebase Storage error: ${error.message} (Code: ${error.code})`;
    } else if (error.code) {
        detailedMessage = `Error adding item (Code: ${error.code}): ${error.message}`;
    }
    return { success: false, message: detailedMessage };
  }
}


/**
 * Deletes an event document from the 'events' collection in Firestore.
 * Also deletes the associated image from Firebase Storage if it exists.
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
    const eventDocSnap = await getDoc(eventDocRef);

    if (!eventDocSnap.exists()) {
        console.warn(`[Server Action - Admin] Event with ID ${eventId} not found for deletion.`);
        return { success: false, message: 'Event not found.' };
    }
    const eventDataFromDb = eventDocSnap.data() as EventForFirestore;


    await deleteDoc(eventDocRef);
    console.log('[Server Action - Admin] Item metadata deleted successfully from Firestore:', eventId);

    // Delete image from Firebase Storage if imageStoragePath exists
    if (eventDataFromDb.imageStoragePath) {
        const storage = getStorage();
        const imageRef = ref(storage, eventDataFromDb.imageStoragePath);
        try {
            await deleteObject(imageRef);
            console.log(`[Server Action - Admin] Image ${eventDataFromDb.imageStoragePath} deleted successfully from Storage.`);
        } catch (storageError: any) {
            if (storageError.code === 'storage/object-not-found') {
                console.warn(`[Server Action - Admin] Image ${eventDataFromDb.imageStoragePath} not found in Storage, skipping deletion.`);
            } else {
                console.error(`[Server Action - Admin] Error deleting image ${eventDataFromDb.imageStoragePath} from Storage:`, storageError);
                // Decide if this should be a critical error or just a warning.
                // For now, log and continue, as Firestore entry is deleted.
            }
        }
    }


     // Revalidate relevant paths after deleting data
    revalidatePath('/admin/events');
    revalidatePath('/programs'); // Revalidate the public programs page
    revalidatePath('/'); // Revalidate the home page

    return { success: true, message: 'Event and associated image (if any) deleted successfully.' };

  } catch (error: any)
 {
    console.error('[Server Action Error - Admin] Error deleting item from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not delete item due to a database error: ${error.message || 'Unknown error'}` };
  }
}


// Placeholder for verifying admin role (replace with actual implementation)
async function verifyAdminRole(): Promise<boolean> {
    // In a real app, this would involve checking Firebase Auth custom claims
    // or querying a secure admin collection.
    // console.warn("verifyAdminRole: Placeholder function, returning false. Implement proper admin check!");
    return true; // Temporarily true for development ease
}

