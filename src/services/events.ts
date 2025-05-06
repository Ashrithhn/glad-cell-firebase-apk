
'use server';

import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, getDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config'; 

/**
 * Represents the structure of event/program data stored in Firestore.
 * Matches the structure defined in services/admin.ts
 */
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
    fee: number; // Fee in Paisa
    createdAt?: Timestamp | string;
}

interface UserProfileData {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registrationNumber?: string | null;
  collegeName?: string;
  city?: string;
  pincode?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  lastLoginAt?: Timestamp | string;
  authProvider?: string;
}


/**
 * Records event participation in Firestore.
 * Includes qrCodeDataUri for the event ticket.
 */
export async function participateInEvent(participationData: {
    userId: string; 
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
    };
    qrCodeDataUri?: string; 
}): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] participateInEvent invoked for event:', participationData.eventId, 'by user:', participationData.userId);

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

    // Use orderId from paymentDetails if available, otherwise generate one or use eventId+userId combination.
    // For Cashfree, the orderId used to create the payment link is a good candidate.
    const docId = participationData.paymentDetails?.orderId || `${participationData.eventId}-${participationData.userId}-${Date.now()}`;


    const docData = {
        ...participationData,
        participatedAt: serverTimestamp(), 
        qrCodeDataUri: participationData.qrCodeDataUri || null, 
    };
    // Use the specific docId for the document
    await addDoc(collection(db, 'participations'), docData);


    console.log('[Server Action] Participation recorded in Firestore with ID:', docId);
    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error] Error recording participation in Firestore:', error.code, error.message, error.stack); 
    return { success: false, message: `Could not record participation due to a database error: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Fetches user profile data from Firestore.
 */
 export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: UserProfileData; message?: string }> {
     console.log('[Server Action] getUserProfile invoked for user:', userId);

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
             console.log('[Server Action] User profile found for:', userId);
             const rawData = docSnap.data();
             
             if (!rawData) {
                const notFoundMessage = `User profile data is undefined for user: ${userId}`;
                console.warn(`[Server Action] getUserProfile: ${notFoundMessage}`);
                return { success: false, message: notFoundMessage };
             }

             const serializableData: UserProfileData = { ...rawData } as UserProfileData; 

             for (const key in serializableData) {
                if (serializableData.hasOwnProperty(key)) {
                    const value = (serializableData as any)[key];
                    if (value instanceof Timestamp) {
                        (serializableData as any)[key] = value.toDate().toISOString();
                    }
                }
            }
             return { success: true, data: serializableData };
         } else {
             const notFoundMessage = `User profile not found for user: ${userId}`;
             console.warn(`[Server Action] getUserProfile: ${notFoundMessage}`);
             return { success: false, message: notFoundMessage };
         }
     } catch (error: any) {
         console.error('[Server Action Error] Error fetching user profile:', error.code, error.message, error.stack);
         return { success: false, message: `Failed to fetch user profile: ${error.message || 'Unknown database error'}` };
     }
 }


/**
 * Fetches all events/programs from the 'events' collection in Firestore, ordered by creation date.
 */
export async function getEvents(): Promise<{ success: boolean; events?: EventData[]; message?: string }> {
    console.log('[Server Action] getEvents invoked.');

    if (initializationError) {
      const errorMessage = `Event service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error] getEvents: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
    if (!db) {
      const errorMessage = 'Event service unavailable: Firestore service instance missing.';
      console.error(`[Server Action Error] getEvents: ${errorMessage}`);
      return { success: false, message: errorMessage };
    }

    try {
        const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(eventsQuery);

        const events: EventData[] = [];
        querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
            const data = docSnap.data();

            const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
                 if (timestamp instanceof Timestamp) {
                    return timestamp.toDate().toISOString();
                 }
                 return typeof timestamp === 'string' ? timestamp : null;
            }

            events.push({
                id: docSnap.id, // Use docSnap.id here
                name: data.name,
                description: data.description,
                venue: data.venue,
                rules: data.rules,
                startDate: convertTimestamp(data.startDate)!, 
                endDate: convertTimestamp(data.endDate)!,     
                registrationDeadline: convertTimestamp(data.registrationDeadline),
                eventType: data.eventType,
                minTeamSize: data.minTeamSize,
                maxTeamSize: data.maxTeamSize,
                fee: data.fee,
                createdAt: convertTimestamp(data.createdAt),
            } as EventData); 
        });

        console.log(`[Server Action] getEvents: Fetched ${events.length} items.`);
        return { success: true, events };

    } catch (error: any) {
        console.error('[Server Action Error] Error fetching events from Firestore:', error.code, error.message, error.stack);
        return { success: false, message: `Could not fetch items due to a database error: ${error.message || 'Unknown error'}` };
    }
}

/**
 * Fetches participation data for a specific user.
 */
export async function getParticipationData(userId: string): Promise<{ success: boolean; participations?: any[]; message?: string }> {
  console.log('[Server Action] getParticipationData invoked for user:', userId);

  if (initializationError) {
    const errorMessage = `Participation data service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error] getParticipationData: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Participation data service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error] getParticipationData: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  if (!userId) {
    return { success: false, message: 'User ID is required.' };
  }

  try {
    const participationsQuery = query(collection(db, 'participations'), where('userId', '==', userId), orderBy('participatedAt', 'desc'));
    const querySnapshot = await getDocs(participationsQuery);

    const participations: any[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap
      const data = docSnap.data();
      const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
        if (timestamp instanceof Timestamp) {
          return timestamp.toDate().toISOString();
        }
        return typeof timestamp === 'string' ? timestamp : null;
      };
      participations.push({
        id: docSnap.id, // Use docSnap.id
        ...data,
        participatedAt: convertTimestamp(data.participatedAt),
      });
    });

    console.log(`[Server Action] getParticipationData: Fetched ${participations.length} participations for user ${userId}.`);
    return { success: true, participations };
  } catch (error: any) {
    console.error('[Server Action Error] Error fetching participations from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not fetch participation data: ${error.message || 'Unknown error'}` };
  }
}
