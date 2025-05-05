'use server';

import { collection, addDoc, serverTimestamp, query, getDocs, orderBy } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import type { Timestamp } from 'firebase/firestore';

// Define the structure for Program data stored in Firestore
export interface ProgramData {
    id?: string; // Added during retrieval
    name: string;
    description: string;
    goals: string;
    duration?: string; // Optional field
    targetAudience?: string; // Optional field
    createdAt?: Timestamp | string; // Store as Timestamp, retrieve potentially as string
}


/**
 * Adds a new program document to the 'programs' collection in Firestore.
 * Basic validation included, assumes admin check happens before calling.
 */
export async function addProgram(programData: Omit<ProgramData, 'id' | 'createdAt'>): Promise<{ success: boolean; programId?: string; message?: string }> {
  console.log('[Server Action - Admin] addProgram invoked.');

  // Check if Firestore service is available
  if (initializationError) {
      const errorMessage = `Program service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error - Admin] addProgram: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Program service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Admin] addProgram: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  // TODO: Add a server-side check to ensure the calling user has an admin role

  console.log('[Server Action - Admin] Attempting to add program to Firestore:', programData.name);

  try {
    // Prepare data for Firestore
    const docData = {
        ...programData,
        createdAt: serverTimestamp(), // Add creation timestamp
    };

    const docRef = await addDoc(collection(db, 'programs'), docData);

    console.log('[Server Action - Admin] Program added successfully to Firestore with ID:', docRef.id);
    return { success: true, programId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Admin] Error adding program to Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not add program due to a database error: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Fetches all programs from the 'programs' collection in Firestore, ordered by creation date.
 */
export async function getPrograms(): Promise<{ success: boolean; programs?: ProgramData[]; message?: string }> {
    console.log('[Server Action] getPrograms invoked.');

    if (initializationError) {
      const errorMessage = `Program service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error] getPrograms: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
    if (!db) {
      const errorMessage = 'Program service unavailable: Firestore service instance missing.';
      console.error(`[Server Action Error] getPrograms: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }

    try {
        const programsQuery = query(collection(db, 'programs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(programsQuery);

        const programs: ProgramData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Convert Timestamp to ISO string for serialization
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;

            programs.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                goals: data.goals,
                duration: data.duration,
                targetAudience: data.targetAudience,
                createdAt: createdAt,
            });
        });

        console.log(`[Server Action] getPrograms: Fetched ${programs.length} programs.`);
        return { success: true, programs };

    } catch (error: any) {
        console.error('[Server Action Error] Error fetching programs from Firestore:', error.code, error.message, error.stack);
        return { success: false, message: `Could not fetch programs due to a database error: ${error.message || 'Unknown error'}` };
    }
}