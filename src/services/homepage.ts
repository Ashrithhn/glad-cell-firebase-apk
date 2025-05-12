'use server';

import { collection, addDoc, serverTimestamp, Timestamp, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface HomepageImage {
  id?: string;
  name: string; // e.g., "Carousel Slide 1", "Explore Ideas Section Image"
  imageUrl: string;
  altText: string;
  link?: string; // Optional link for the image
  order: number; // For ordering images if multiple (e.g., in a carousel)
  section: 'carousel' | 'exploreIdeas' | 'latestEventPromo'; // To categorize images
  isActive: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Adds a new image for the homepage to Firestore and Firebase Storage.
 */
export async function addHomepageImage(
  imageData: Omit<HomepageImage, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'> & { imageFile: string }
): Promise<{ success: boolean; imageId?: string; message?: string }> {
  console.log('[Server Action - Homepage] addHomepageImage invoked.');

  if (initializationError || !db) {
    const msg = `Service unavailable: Firebase issue - ${initializationError?.message || 'DB missing'}.`;
    console.error(`[Server Action Error - Homepage] addHomepageImage: ${msg}`);
    return { success: false, message: msg };
  }

  try {
    const storage = getStorage();
    if (!imageData.imageFile.startsWith('data:image/')) {
      throw new Error('Invalid image data format. Expected Data URI.');
    }
    const mimeType = imageData.imageFile.substring(imageData.imageFile.indexOf(':') + 1, imageData.imageFile.indexOf(';'));
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `homepage_images/${imageData.section}/${Date.now()}_${imageData.name.replace(/\s+/g, '_')}.${extension}`;
    const imageStorageRef = storageRef(storage, fileName);
    
    const uploadResult = await uploadString(imageStorageRef, imageData.imageFile, 'data_url');
    const imageUrl = await getDownloadURL(uploadResult.ref);
    console.log('[Server Action - Homepage] Image uploaded to:', imageUrl);

    const docData: Omit<HomepageImage, 'id'> = {
      ...imageData, // Spread existing validated fields
      imageUrl: imageUrl, // Add the uploaded image URL
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    // Remove imageFile as it's not stored in Firestore
    // delete (docData as any).imageFile;


    const docRef = await addDoc(collection(db, 'homepageImages'), docData);
    console.log('[Server Action - Homepage] Image metadata added to Firestore with ID:', docRef.id);

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');
    return { success: true, imageId: docRef.id };

  } catch (error: any) {
    console.error('[Server Action Error - Homepage] Error adding homepage image:', error.message, error.stack);
    return { success: false, message: `Could not add image: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Fetches all homepage images from Firestore, ordered by 'order'.
 * NOTE: The original query also ordered by 'createdAt' desc, which requires a composite index.
 * This has been simplified to potentially avoid the immediate error.
 * For correct and optimal sorting (order ASC, createdAt DESC), create the index in Firebase using the link from the error.
 */
export async function getHomepageImages(): Promise<{ success: boolean; images?: HomepageImage[]; message?: string }> {
  console.log('[Server Action - Homepage] getHomepageImages invoked.');
  if (initializationError || !db) {
    const msg = `Service unavailable: Firebase issue - ${initializationError?.message || 'DB missing'}.`;
    console.error(`[Server Action Error - Homepage] getHomepageImages: ${msg}`);
    return { success: false, message: msg };
  }

  try {
    // Simplified query: only order by 'order'.
    // Original: query(collection(db, 'homepageImages'), orderBy('order'), orderBy('createdAt', 'desc'))
    const imagesQuery = query(collection(db, 'homepageImages'), orderBy('order'));
    const querySnapshot = await getDocs(imagesQuery);
    const images: HomepageImage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const convertTimestamp = (ts: any) => (ts instanceof Timestamp ? ts.toDate().toISOString() : ts);
      images.push({
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as HomepageImage);
    });
    console.log(`[Server Action - Homepage] Fetched ${images.length} homepage images.`);
    return { success: true, images };
  } catch (error: any) {
    console.error('[Server Action Error - Homepage] Error fetching homepage images:', error.message);
    // Include the original error message if it's the index error, so the user sees the link.
    if (error.message?.includes("query requires an index")) {
        return { success: false, message: `Failed to fetch images: ${error.message}` };
    }
    return { success: false, message: `Failed to fetch images: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Updates an existing homepage image's details in Firestore.
 * Does not handle image file replacement; for that, delete and add a new one.
 */
export async function updateHomepageImage(
  imageId: string,
  updateData: Partial<Omit<HomepageImage, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'>>
): Promise<{ success: boolean; message?: string }> {
   console.log('[Server Action - Homepage] updateHomepageImage invoked for ID:', imageId);
    if (initializationError || !db) {
        const msg = `Service unavailable: Firebase issue - ${initializationError?.message || 'DB missing'}.`;
        console.error(`[Server Action Error - Homepage] updateHomepageImage: ${msg}`);
        return { success: false, message: msg };
    }

    try {
        const imageDocRef = doc(db, 'homepageImages', imageId);
        await updateDoc(imageDocRef, {
            ...updateData,
            updatedAt: serverTimestamp() as Timestamp,
        });
        console.log('[Server Action - Homepage] Image details updated in Firestore for ID:', imageId);
        revalidatePath('/');
        revalidatePath('/admin/content/homepage-images');
        return { success: true };
    } catch (error: any) {
        console.error('[Server Action Error - Homepage] Error updating homepage image details:', error.message);
        return { success: false, message: `Failed to update image details: ${error.message}` };
    }
}


/**
 * Deletes a homepage image from Firestore and Firebase Storage.
 */
export async function deleteHomepageImage(imageId: string, imageUrl: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action - Homepage] deleteHomepageImage invoked for ID:', imageId);
   if (initializationError || !db) {
        const msg = `Service unavailable: Firebase issue - ${initializationError?.message || 'DB missing'}.`;
        console.error(`[Server Action Error - Homepage] deleteHomepageImage: ${msg}`);
        return { success: false, message: msg };
    }

  try {
    // Delete from Firestore
    const imageDocRef = doc(db, 'homepageImages', imageId);
    await deleteDoc(imageDocRef);
    console.log('[Server Action - Homepage] Image metadata deleted from Firestore.');

    // Delete from Storage
    if (imageUrl) {
      try {
        const storage = getStorage();
        // Create a ref from the HTTPS URL
        const imageStorageRef = storageRef(storage, imageUrl);
        await deleteObject(imageStorageRef);
        console.log('[Server Action - Homepage] Image file deleted from Storage.');
      } catch (storageError: any) {
         if (storageError.code === 'storage/object-not-found') {
            console.warn('[Server Action - Homepage] Image file not found in Storage, skipping deletion from Storage for URL:', imageUrl);
        } else {
            console.error('[Server Action Error - Homepage] Error deleting image from Storage:', storageError.message);
            // Potentially return a partial success or warning, but for now, consider Firestore deletion primary
        }
      }
    }
    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');
    return { success: true };
  } catch (error: any) {
    console.error('[Server Action Error - Homepage] Error deleting homepage image:', error.message);
    return { success: false, message: `Failed to delete image: ${error.message}` };
  }
}