'use server';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface HomepageImage {
  id?: string; // Firestore document ID
  imageUrl: string;
  altText: string;
  order: number; // For ordering images on the homepage
  isActive: boolean; // To control visibility
  createdAt?: Timestamp | string;
  storagePath: string; // Path in Firebase Storage for deletion
}

const HOMEPAGE_IMAGES_COLLECTION = 'homepageImages';

/**
 * Uploads a new image for the homepage.
 */
export async function uploadHomepageImage(
  imageDataUri: string, // Base64 data URI
  altText: string,
  order: number
): Promise<{ success: boolean; imageId?: string; message?: string }> {
  console.log('[Service - HomepageContent] uploadHomepageImage invoked.');

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  if (!imageDataUri.startsWith('data:image/')) {
    return { success: false, message: 'Invalid image data format. Expected Data URI.' };
  }

  try {
    const storage = getStorage();
    const mimeType = imageDataUri.substring(imageDataUri.indexOf(':') + 1, imageDataUri.indexOf(';'));
    const extension = mimeType.split('/')[1] || 'jpg';
    const uniqueId = doc(collection(db, '_placeholder')).id; // Generate a unique ID
    const storagePath = `homepageImages/${uniqueId}.${extension}`;
    const imageRef = ref(storage, storagePath);

    // Upload image to Firebase Storage
    await uploadString(imageRef, imageDataUri, 'data_url');
    const imageUrl = await getDownloadURL(imageRef);

    // Add image metadata to Firestore
    const docData = {
      imageUrl,
      altText,
      order,
      isActive: true,
      storagePath,
      createdAt: serverTimestamp() as Timestamp,
    };
    const docRef = await addDoc(collection(db, HOMEPAGE_IMAGES_COLLECTION), docData);

    revalidatePath('/'); // Revalidate home page
    revalidatePath('/admin/content/homepage-images'); // Revalidate admin page

    return { success: true, imageId: docRef.id, message: 'Image uploaded successfully.' };
  } catch (error: any) {
    console.error('[Service - HomepageContent] Error uploading image:', error);
    return { success: false, message: `Failed to upload image: ${error.message}` };
  }
}

/**
 * Fetches all homepage images, ordered by 'order' field.
 */
export async function getHomepageImages(): Promise<{ success: boolean; images?: HomepageImage[]; message?: string }> {
  console.log('[Service - HomepageContent] getHomepageImages invoked.');

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const q = query(collection(db, HOMEPAGE_IMAGES_COLLECTION), orderBy('order', 'asc'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const images: HomepageImage[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      images.push({
        id: docSnap.id,
        imageUrl: data.imageUrl,
        altText: data.altText,
        order: data.order,
        isActive: data.isActive,
        storagePath: data.storagePath,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as HomepageImage);
    });
    return { success: true, images };
  } catch (error: any) {
    console.error('[Service - HomepageContent] Error fetching images:', error);
    return { success: false, message: `Failed to fetch images: ${error.message}` };
  }
}

/**
 * Deletes a homepage image from Firestore and Firebase Storage.
 */
export async function deleteHomepageImage(imageId: string, storagePath: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[Service - HomepageContent] deleteHomepageImage invoked for ID: ${imageId}`);

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const storage = getStorage();

    // Delete from Firestore
    await deleteDoc(doc(db, HOMEPAGE_IMAGES_COLLECTION, imageId));

    // Delete from Storage
    if (storagePath) {
      const imageRef = ref(storage, storagePath);
      await deleteObject(imageRef);
    }

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, message: 'Image deleted successfully.' };
  } catch (error: any) {
    console.error(`[Service - HomepageContent] Error deleting image ${imageId}:`, error);
    // Check if storage error was object-not-found, which means it was already deleted or path was wrong
    if (error.code === 'storage/object-not-found') {
        console.warn(`[Service - HomepageContent] Storage object not found at path ${storagePath}, but Firestore entry deleted.`);
        revalidatePath('/');
        revalidatePath('/admin/content/homepage-images');
        return { success: true, message: 'Image metadata deleted. File not found in storage (might have been already removed).' };
    }
    return { success: false, message: `Failed to delete image: ${error.message}` };
  }
}

/**
 * Updates a homepage image's details (altText, order, isActive).
 */
export async function updateHomepageImageDetails(
  imageId: string,
  updates: Partial<Pick<HomepageImage, 'altText' | 'order' | 'isActive'>>
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Service - HomepageContent] updateHomepageImageDetails invoked for ID: ${imageId}`);

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const imageDocRef = doc(db, HOMEPAGE_IMAGES_COLLECTION, imageId);
    await updateDoc(imageDocRef, updates);

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, message: 'Image details updated successfully.' };
  } catch (error: any) {
    console.error(`[Service - HomepageContent] Error updating image details ${imageId}:`, error);
    return { success: false, message: `Failed to update image details: ${error.message}` };
  }
}
