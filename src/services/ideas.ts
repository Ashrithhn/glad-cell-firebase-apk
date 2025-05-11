
'use server';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface IdeaData {
  id?: string; // Firestore document ID
  title: string;
  description: string;
  submitterName?: string; // Optional: if submitted by a user or admin enters it
  submitterId?: string; // Optional: Firebase UID of the submitter if a registered user
  department?: string;
  tags?: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented'; // Status of the idea
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Adds a new idea to the 'ideas' collection in Firestore.
 */
export async function addIdea(
  ideaData: Omit<IdeaData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; ideaId?: string; message?: string }> {
  console.log('[Server Action - Ideas] addIdea invoked.');

  if (initializationError) {
    const errorMessage = `Idea service unavailable: Firebase initialization error - ${initializationError.message}.`;
    return { success: false, message: errorMessage };
  }
  if (!db) {
    return { success: false, message: 'Idea service unavailable: Firestore instance missing.' };
  }

  try {
    const docData = {
      ...ideaData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'ideas'), docData);
    console.log('[Server Action - Ideas] Idea added successfully with ID:', docRef.id);

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas'); // Revalidate user-facing ideas page

    return { success: true, ideaId: docRef.id };
  } catch (error: any) {
    console.error('[Server Action Error - Ideas] Error adding idea:', error.message, error.stack);
    return { success: false, message: `Could not add idea: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches all ideas from the 'ideas' collection, ordered by creation date.
 */
export async function getIdeas(): Promise<{ success: boolean; ideas?: IdeaData[]; message?: string }> {
  console.log('[Server Action - Ideas] getIdeas invoked.');

  if (initializationError) {
    const errorMessage = `Idea service unavailable: Firebase initialization error - ${initializationError.message}.`;
    return { success: false, message: errorMessage };
  }
  if (!db) {
    return { success: false, message: 'Idea service unavailable: Firestore instance missing.' };
  }

  try {
    const ideasQuery = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(ideasQuery);

    const ideas: IdeaData[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
        if (timestamp instanceof Timestamp) {
          return timestamp.toDate().toISOString();
        }
        return typeof timestamp === 'string' ? timestamp : null;
      };
      ideas.push({
        id: docSnap.id,
        title: data.title,
        description: data.description,
        submitterName: data.submitterName,
        submitterId: data.submitterId,
        department: data.department,
        tags: data.tags || [],
        status: data.status,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as IdeaData);
    });

    console.log(`[Server Action - Ideas] Fetched ${ideas.length} ideas.`);
    return { success: true, ideas };
  } catch (error: any) {
    console.error('[Server Action Error - Ideas] Error fetching ideas:', error.message, error.stack);
    return { success: false, message: `Could not fetch ideas: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches a single idea by its ID.
 */
export async function getIdeaById(ideaId: string): Promise<{ success: boolean; idea?: IdeaData; message?: string }> {
    console.log(`[Server Action - Ideas] getIdeaById invoked for ID: ${ideaId}`);
    if (initializationError) return { success: false, message: `Firebase error: ${initializationError.message}` };
    if (!db) return { success: false, message: 'Firestore instance missing.' };
    if (!ideaId) return { success: false, message: 'Idea ID is required.' };

    try {
        const ideaDocRef = doc(db, 'ideas', ideaId);
        const docSnap = await getDoc(ideaDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
                if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
                return typeof timestamp === 'string' ? timestamp : null;
            };
            const idea: IdeaData = {
                id: docSnap.id,
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: convertTimestamp(data.updatedAt),
            } as IdeaData;
            return { success: true, idea };
        } else {
            return { success: false, message: 'Idea not found.' };
        }
    } catch (error: any) {
        console.error(`[Server Action Error - Ideas] Error fetching idea ${ideaId}:`, error.message);
        return { success: false, message: `Failed to fetch idea: ${error.message}` };
    }
}


/**
 * Updates an existing idea in Firestore.
 */
export async function updateIdea(
  ideaId: string,
  ideaData: Partial<Omit<IdeaData, 'id' | 'createdAt'>>
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Server Action - Ideas] updateIdea invoked for ID: ${ideaId}`);

  if (initializationError) {
    return { success: false, message: `Firebase error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const ideaDocRef = doc(db, 'ideas', ideaId);
    const dataToUpdate = {
      ...ideaData,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await updateDoc(ideaDocRef, dataToUpdate);
    console.log(`[Server Action - Ideas] Idea ${ideaId} updated successfully.`);

    revalidatePath('/admin/ideas');
    revalidatePath(`/admin/ideas/edit/${ideaId}`);
    revalidatePath('/ideas');

    return { success: true };
  } catch (error: any) {
    console.error(`[Server Action Error - Ideas] Error updating idea ${ideaId}:`, error.message);
    return { success: false, message: `Could not update idea: ${error.message}` };
  }
}

/**
 * Deletes an idea from Firestore.
 */
export async function deleteIdea(ideaId: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[Server Action - Ideas] deleteIdea invoked for ID: ${ideaId}`);

  if (initializationError) {
    return { success: false, message: `Firebase error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const ideaDocRef = doc(db, 'ideas', ideaId);
    await deleteDoc(ideaDocRef);
    console.log(`[Server Action - Ideas] Idea ${ideaId} deleted successfully.`);

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');

    return { success: true };
  } catch (error: any) {
    console.error(`[Server Action Error - Ideas] Error deleting idea ${ideaId}:`, error.message);
    return { success: false, message: `Could not delete idea: ${error.message}` };
  }
}
