
'use server';

import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface EventData {
    id?: string; 
    name: string;
    description: string;
    venue: string; 
    rules?: string;
    startDate: Timestamp | string; 
    endDate: Timestamp | string;   
    registrationDeadline?: Timestamp | string | null; 
    eventType: 'individual' | 'group';
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    fee: number; 
    imageUrl?: string | null; // Modified to allow null
    createdAt?: Timestamp | string; 
}

export interface UserProfileData {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registrationNumber?: string | null;
  collegeName?: string | null;
  city?: string | null;
  pincode?: string | null;
  createdAt?: Timestamp | string | null; 
  authProvider?: string | null;
  emailVerified?: boolean | null;
  // Add other fields from your Firestore 'users' collection
}


export async function addEvent(eventData: Omit<EventData, 'id' | 'createdAt' | 'startDate' | 'endDate' | 'registrationDeadline' | 'imageUrl'> & { startDate: string, endDate: string, registrationDeadline?: string, imageFile?: string }): Promise<{ success: boolean; eventId?: string; message?: string }> {
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

  console.log('[Server Action - Admin] Attempting to add item to Firestore:', eventData.name);

  let imageUrl: string | null = null; // Initialize as null

  try {
    if (eventData.imageFile) {
      const storage = getStorage();
      // Expected format for imageFile (data URI): 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQA...'
      if (!eventData.imageFile.startsWith('data:image/')) {
        throw new Error('Invalid image data format. Expected Data URI.');
      }
      const mimeType = eventData.imageFile.substring(eventData.imageFile.indexOf(':') + 1, eventData.imageFile.indexOf(';'));
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `event_images/${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`;
      const imageStorageRef = storageRef(storage, fileName);
      
      const uploadResult = await uploadString(imageStorageRef, eventData.imageFile, 'data_url');
      imageUrl = await getDownloadURL(uploadResult.ref);
      console.log('[Server Action - Admin] Event image uploaded to:', imageUrl);
    }

    const docData: Omit<EventData, 'id'> = {
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
        fee: eventData.fee, // Assuming fee is already in paisa from form
        imageUrl: imageUrl, // Use the potentially null imageUrl
        createdAt: serverTimestamp() as Timestamp,
    };

    if (!docData.rules) delete docData.rules;
    if (docData.minTeamSize === undefined) delete docData.minTeamSize;
    if (docData.maxTeamSize === undefined) delete docData.maxTeamSize;
    // If imageUrl is null, it will be stored as null, which is acceptable by Firestore.
    // If it was undefined, it would cause an error or not be set.

    const docRef = await addDoc(collection(db, 'events'), docData);
    console.log('[Server Action - Admin] Item added successfully to Firestore with ID:', docRef.id);

    revalidatePath('/admin/events');
    revalidatePath('/programs'); 
    revalidatePath('/'); 

    return { success: true, eventId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error adding item to Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not add item due to a database error: ${error.message || 'Unknown error'}` };
  }
}


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

  console.log('[Server Action - Admin] Attempting to delete item from Firestore:', eventId);

  try {
    const eventDocRef = doc(db, 'events', eventId);
    const eventDocSnapshot = await getDoc(eventDocRef); // Fetch doc to get imageUrl

    if (eventDocSnapshot.exists()) {
      const eventData = eventDocSnapshot.data() as EventData;
      if (eventData.imageUrl) {
        try {
          const imageStorageRef = storageRef(getStorage(), eventData.imageUrl);
          await deleteObject(imageStorageRef);
          console.log('[Server Action - Admin] Associated event image deleted from Storage.');
        } catch (imgError: any) {
          console.error('[Server Action Error - Admin] Failed to delete event image from Storage:', imgError.message);
          // Continue with Firestore deletion even if image deletion fails, but log error.
        }
      }
    }
    
    await deleteDoc(eventDocRef);
    console.log('[Server Action - Admin] Item deleted successfully from Firestore:', eventId);

    revalidatePath('/admin/events');
    revalidatePath('/programs'); 
    revalidatePath('/'); 

    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error deleting item from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not delete item due to a database error: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Fetches all user profiles from the 'users' collection in Firestore.
 */
export async function getUsers(): Promise<{ success: boolean; users?: UserProfileData[]; message?: string }> {
  console.log('[Server Action - Admin] getUsers invoked.');

  if (initializationError) {
      const errorMessage = `Admin service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error - Admin] getUsers: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Admin service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Admin] getUsers: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc')); // Order by creation date
    const querySnapshot = await getDocs(usersQuery);

    const users: UserProfileData[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
      const data = docSnap.data();
      // Convert Timestamps to ISO strings
      const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
           if (timestamp instanceof Timestamp) {
              return timestamp.toDate().toISOString();
           }
           return typeof timestamp === 'string' ? timestamp : null;
      }
      users.push({
        uid: docSnap.id, // Use doc.id as uid, assuming uid is the document ID
        ...data,
        createdAt: convertTimestamp(data.createdAt),
      } as UserProfileData);
    });

    console.log(`[Server Action - Admin] getUsers: Fetched ${users.length} users.`);
    return { success: true, users };

  } catch (error: any)    {
    console.error('[Server Action Error - Admin] Error fetching users from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not fetch users due to a database error: ${error.message || 'Unknown error'}` };
  }
}

    