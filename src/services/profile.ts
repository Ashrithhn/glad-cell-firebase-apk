
'use server';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

/**
 * Updates the user's profile picture in Firebase Storage and Firestore.
 * Expects the image data as a Base64 encoded Data URI string.
 */
export async function updateProfilePicture(
    userId: string,
    imageDataUri: string // e.g., "data:image/jpeg;base64,/9j/4AAQSkZ..."
): Promise<{ success: boolean; photoURL?: string; message?: string }> {
    console.log('[Server Action] updateProfilePicture invoked for user:', userId);

    if (initializationError) {
        const errorMessage = `Profile service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error] updateProfilePicture: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!db) {
        const errorMessage = 'Profile service unavailable: Firestore/Storage service instance missing.';
        console.error(`[Server Action Error] updateProfilePicture: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!userId) {
        return { success: false, message: 'User ID is required.' };
    }
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
        return { success: false, message: 'Invalid image data format. Expected Data URI.' };
    }

    try {
        const storage = getStorage();
        const userDocRef = doc(db, 'users', userId);

        // 1. Get current profile to check for existing picture
        let oldPhotoPath: string | null = null;
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const currentData = userDocSnap.data();
                if (currentData?.photoURL) {
                     // Extract path from URL (basic extraction, might need refinement)
                     const url = new URL(currentData.photoURL);
                     // Path usually starts after /o/ and before ?alt=media
                     const pathStartIndex = url.pathname.indexOf('/o/') + 3;
                     const pathEndIndex = url.pathname.indexOf('?');
                     if (pathStartIndex > 2 && pathEndIndex > pathStartIndex) {
                         oldPhotoPath = decodeURIComponent(url.pathname.substring(pathStartIndex, pathEndIndex));
                         console.log(`[Server Action] Found old photo path: ${oldPhotoPath}`);
                     }
                }
            }
        } catch (e) {
            console.warn("[Server Action] Could not get current profile to check for old photo:", e);
            // Continue upload even if checking old photo fails
        }


        // 2. Define storage path and upload new image
        // Extract MIME type for file extension
        const mimeType = imageDataUri.substring(imageDataUri.indexOf(':') + 1, imageDataUri.indexOf(';'));
        const extension = mimeType.split('/')[1] || 'jpg'; // Default to jpg if extraction fails
        const filePath = `profilePictures/${userId}/profile.${extension}`;
        const storageRef = ref(storage, filePath);

        console.log(`[Server Action] Uploading new profile picture to: ${filePath}`);
        // Use uploadString with 'data_url' format
        const snapshot = await uploadString(storageRef, imageDataUri, 'data_url');
        console.log('[Server Action] Image uploaded successfully.');

        // 3. Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('[Server Action] Download URL obtained:', downloadURL);

        // 4. Update Firestore document
        await updateDoc(userDocRef, {
            photoURL: downloadURL
        });
        console.log('[Server Action] Firestore profile updated with new photoURL.');

        // 5. Delete old profile picture (if exists and different path)
        if (oldPhotoPath && oldPhotoPath !== filePath) {
            console.log(`[Server Action] Deleting old profile picture from: ${oldPhotoPath}`);
             try {
                const oldStorageRef = ref(storage, oldPhotoPath);
                await deleteObject(oldStorageRef);
                console.log("[Server Action] Old profile picture deleted successfully.");
             } catch(deleteError: any) {
                 // Log deletion error but don't fail the whole operation
                 if (deleteError.code === 'storage/object-not-found') {
                    console.log("[Server Action] Old profile picture not found, skipping deletion.");
                 } else {
                    console.error("[Server Action Error] Failed to delete old profile picture:", deleteError);
                 }
             }
        } else if (oldPhotoPath === filePath) {
             console.log("[Server Action] New path is same as old, skipping deletion.");
        }

        // Revalidate the profile page path
        revalidatePath('/profile');

        return { success: true, photoURL: downloadURL };

    } catch (error: any) {
        console.error('[Server Action Error] Error updating profile picture:', error);
        return { success: false, message: `Failed to update profile picture: ${error.message || 'Unknown error'}` };
    }
}
