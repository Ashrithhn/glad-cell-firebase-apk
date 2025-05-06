
'use server';

import { collection, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';

// Re-defining UserProfileData here to avoid circular dependencies if imported from events.ts or useAuth.tsx
// Ensure this is consistent with the structure in Firestore and other parts of the app.
export interface UserProfileData {
    uid: string;
    email?: string | null;
    name?: string | null;
    photoURL?: string | null;
    branch?: string | null;
    semester?: number | string | null; // Can be string or number from form/Firestore
    registrationNumber?: string | null;
    collegeName?: string | null;
    city?: string | null;
    pincode?: string | null;
    createdAt?: string | Timestamp; // Stored as Timestamp, retrieved as string after serialization
    updatedAt?: string | Timestamp;
    lastLoginAt?: string | Timestamp;
    authProvider?: string;
    emailVerified?: boolean;
}

/**
 * Fetches all user profiles from the 'users' collection in Firestore.
 * Orders users by creation date (newest first).
 */
export async function getAllUsers(): Promise<{ success: boolean; users?: UserProfileData[]; message?: string }> {
    console.log('[Server Action - Admin] getAllUsers invoked.');

    if (initializationError) {
        const errorMessage = `User service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error - Admin] getAllUsers: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!db) {
        const errorMessage = 'User service unavailable: Firestore service instance missing.';
        console.error(`[Server Action Error - Admin] getAllUsers: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(usersQuery);

        const users: UserProfileData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Helper to convert Timestamp to ISO string or return string/null
            const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
                if (timestamp instanceof Timestamp) {
                    return timestamp.toDate().toISOString();
                }
                return typeof timestamp === 'string' ? timestamp : null;
            };
            
            // Construct the user object, ensuring all fields are correctly typed
            const userProfile: UserProfileData = {
                uid: data.uid,
                email: data.email || null,
                name: data.name || null,
                photoURL: data.photoURL || null,
                branch: data.branch || null,
                // Semester can be stored as string or number, handle appropriately
                semester: data.semester !== undefined ? String(data.semester) : null, 
                registrationNumber: data.registrationNumber || null,
                collegeName: data.collegeName || null,
                city: data.city || null,
                pincode: data.pincode || null,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: convertTimestamp(data.updatedAt),
                lastLoginAt: convertTimestamp(data.lastLoginAt),
                authProvider: data.authProvider || null,
                emailVerified: typeof data.emailVerified === 'boolean' ? data.emailVerified : false,
            };
            users.push(userProfile);
        });

        console.log(`[Server Action - Admin] getAllUsers: Fetched ${users.length} users.`);
        return { success: true, users };

    } catch (error: any) {
        console.error('[Server Action Error - Admin] Error fetching users from Firestore:', error.code, error.message, error.stack);
        return { success: false, message: `Could not fetch users due to a database error: ${error.message || 'Unknown error'}` };
    }
}

// Placeholder for future admin actions like:
// - updateUserRole(userId: string, newRole: string)
// - deleteUserAccount(userId: string)
// - suspendUserAccount(userId: string)
// - etc.
