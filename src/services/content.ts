'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

// TODO: Implement robust admin role checking for updateContent

/**
 * Defines the structure for contact information stored in Firestore.
 */
export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
}

/**
 * Defines the structure for site links stored in Firestore.
 * Add more link keys as needed.
 */
export interface SiteLinks {
  whatsappCommunity: string;
  // facebook?: string;
  // instagram?: string;
}

/**
 * Defines the structure for a specific homepage section image.
 */
export interface HomepageSectionImage {
  imageUrl: string;
  altText: string;
  storagePath: string; // Path in Firebase Storage for deletion
}


/**
 * Type for the data stored under a content ID.
 * Can be a simple string (e.g., for 'about' page) or an object (e.g., for 'contact', 'links', or 'HomepageSectionImage').
 */
type ContentData = string | ContactInfo | SiteLinks | HomepageSectionImage;

/**
 * Fetches a specific content block from the 'siteContent' collection.
 *
 * @param contentId - The ID of the content block to fetch (e.g., 'about', 'contact', 'links', 'homepage_image_explore_ideas').
 * @returns Promise resolving to the success status, fetched data, or an error message.
 */
export async function getContent(contentId: string): Promise<{ success: boolean; data?: ContentData; message?: string }> {
    console.log(`[Server Action] getContent invoked for ID: ${contentId}`);

    if (initializationError) {
        const errorMessage = `Content service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error] getContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!db) {
        const errorMessage = 'Content service unavailable: Firestore service instance missing.';
        console.error(`[Server Action Error] getContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!contentId) {
        return { success: false, message: 'Content ID is required.' };
    }

    try {
        const contentDocRef = doc(db, 'siteContent', contentId);
        const docSnap = await getDoc(contentDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data()?.content; // Content is stored under the 'content' field
            console.log(`[Server Action] Content found for ID: ${contentId}`);
            return { success: true, data: data as ContentData }; 
        } else {
            console.log(`[Server Action] No content found for ID: ${contentId}. Returning default.`);
            return { success: true, data: undefined };
        }
    } catch (error: any) {
        console.error(`[Server Action Error] Error fetching content for ID ${contentId}:`, error.message, error.stack);
        return { success: false, message: `Failed to fetch content: ${error.message || 'Unknown database error'}` };
    }
}


/**
 * Updates or creates a specific content block in the 'siteContent' collection.
 * Requires admin privileges (TODO: implement check).
 *
 * @param contentId - The ID of the content block to update (e.g., 'about', 'contact', 'links').
 * @param data - The new data for the content block (string or object).
 * @returns Promise resolving to the success status or an error message.
 */
export async function updateContent(contentId: string, data: ContentData): Promise<{ success: boolean; message?: string }> {
    console.log(`[Server Action] updateContent invoked for ID: ${contentId}`);

    if (initializationError) {
        const errorMessage = `Content service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error] updateContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!db) {
        const errorMessage = 'Content service unavailable: Firestore service instance missing.';
        console.error(`[Server Action Error] updateContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }


    if (!contentId) {
        return { success: false, message: 'Content ID is required.' };
    }
    if (data === undefined || data === null) {
         return { success: false, message: 'Content data cannot be empty.' };
    }


    try {
        const contentDocRef = doc(db, 'siteContent', contentId);
        await setDoc(contentDocRef, {
            content: data,
            updatedAt: serverTimestamp() as Timestamp
        }, { merge: true }); 

        console.log(`[Server Action] Content updated successfully for ID: ${contentId}`);

        // Revalidate paths related to the updated content
        if (contentId === 'about') {
            revalidatePath('/about');
            revalidatePath('/admin/content/about');
        } else if (contentId === 'contact') {
             revalidatePath('/contact');
             revalidatePath('/admin/content/contact');
        } else if (contentId === 'links') {
             revalidatePath('/'); 
             revalidatePath('/admin/content/links');
        } else if (contentId.startsWith('homepage_image_')) {
            revalidatePath('/'); // Revalidate homepage
            revalidatePath(`/admin/content/${contentId.replace('homepage_image_', 'edit-')}-image`); // e.g. /admin/content/edit-explore-ideas-image
        }
         else {
            revalidatePath('/'); 
        }


        return { success: true };

    } catch (error: any) {
        console.error(`[Server Action Error] Error updating content for ID ${contentId}:`, error.message, error.stack);
        return { success: false, message: `Could not update content: ${error.message || 'Unknown database error'}` };
    }
}
