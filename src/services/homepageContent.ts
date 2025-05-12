
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Ensure your 'homepage_images' table in Supabase has these columns:
// id (uuid, primary key), image_url (text), alt_text (text), display_order (integer), is_active (boolean), storage_path (text), created_at (timestamptz)
export interface HomepageImage {
  id?: string;
  image_url: string;
  alt_text: string;
  display_order: number; // Renamed from 'order' to avoid SQL keyword conflict
  is_active: boolean;
  created_at?: string; // ISO string
  storage_path: string; // Path in Supabase Storage
}

const HOMEPAGE_IMAGES_BUCKET = 'homepage-images'; // Define your Supabase Storage bucket name

/**
 * Uploads a new image for the homepage to Supabase Storage and 'homepage_images' table.
 */
export async function uploadHomepageImage(
  imageDataUri: string, // Base64 data URI
  altText: string,
  order: number
): Promise<{ success: boolean; imageId?: string; message?: string }> {
  console.log('[Supabase Service - HomepageContent] uploadHomepageImage invoked.');

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  if (!imageDataUri.startsWith('data:image/')) {
    return { success: false, message: 'Invalid image data format. Expected Data URI.' };
  }

  try {
    // Convert Data URI to Blob/File
    const fetchRes = await fetch(imageDataUri);
    const blob = await fetchRes.blob();
    const mimeType = blob.type;
    const extension = mimeType.split('/')[1] || 'jpg';
    // Generate a unique path for storage
    const uniqueId = crypto.randomUUID();
    const storagePath = `public/${uniqueId}.${extension}`; // Store in a 'public' folder within the bucket

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(HOMEPAGE_IMAGES_BUCKET)
      .upload(storagePath, blob, {
        cacheControl: '3600',
        upsert: false, // Don't upsert, generate unique name
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('[Supabase Service - HomepageContent] Storage upload error:', uploadError.message);
      throw uploadError;
    }
    
    const { data: publicUrlData } = supabase.storage
        .from(HOMEPAGE_IMAGES_BUCKET)
        .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image.');
    }
    const imageUrl = publicUrlData.publicUrl;

    // Add image metadata to 'homepage_images' table
    const docData = {
      image_url: imageUrl,
      alt_text: altText,
      display_order: order,
      is_active: true,
      storage_path: uploadData.path, // Store the path returned by storage
      // created_at is usually handled by Supabase default value (now())
    };
    const { data: dbData, error: dbError } = await supabase
      .from('homepage_images')
      .insert(docData)
      .select('id')
      .single();

    if (dbError) {
      console.error('[Supabase Service - HomepageContent] Database insert error:', dbError.message);
      // If DB insert fails, try to delete the uploaded image from storage to avoid orphans
      await supabase.storage.from(HOMEPAGE_IMAGES_BUCKET).remove([uploadData.path]);
      throw dbError;
    }

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, imageId: dbData.id, message: 'Image uploaded successfully.' };
  } catch (error: any) {
    console.error('[Supabase Service - HomepageContent] Error uploading image:', error.message);
    return { success: false, message: `Failed to upload image: ${error.message}` };
  }
}

/**
 * Fetches all homepage images, ordered by 'display_order'.
 */
export async function getHomepageImages(): Promise<{ success: boolean; images?: HomepageImage[]; message?: string }> {
  console.log('[Supabase Service - HomepageContent] getHomepageImages invoked.');

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const { data, error } = await supabase
      .from('homepage_images')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }); // Secondary sort

    if (error) {
      console.error('[Supabase Service - HomepageContent] Error fetching images:', error.message);
      throw error;
    }
    return { success: true, images: data as HomepageImage[] || [] };
  } catch (error: any) {
    console.error('[Supabase Service - HomepageContent] Catch block error fetching images:', error.message);
    return { success: false, message: `Failed to fetch images: ${error.message}` };
  }
}

/**
 * Deletes a homepage image from the 'homepage_images' table and Supabase Storage.
 */
export async function deleteHomepageImage(imageId: string, storagePath: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Service - HomepageContent] deleteHomepageImage invoked for ID: ${imageId}`);

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    // Delete from 'homepage_images' table
    const { error: dbError } = await supabase
      .from('homepage_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error(`[Supabase Service - HomepageContent] Error deleting image metadata ${imageId}:`, dbError.message);
      throw dbError;
    }

    // Delete from Supabase Storage
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(HOMEPAGE_IMAGES_BUCKET)
        .remove([storagePath]);
      if (storageError) {
        // Log error but consider the operation partially successful if DB entry was removed
        console.warn(`[Supabase Service - HomepageContent] Error deleting image from storage path ${storagePath}:`, storageError.message);
      } else {
        console.log(`[Supabase Service - HomepageContent] Image ${storagePath} deleted successfully from Storage.`);
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, message: 'Image deleted successfully.' };
  } catch (error: any) {
    console.error(`[Supabase Service - HomepageContent] Catch block error deleting image ${imageId}:`, error.message);
    return { success: false, message: `Failed to delete image: ${error.message}` };
  }
}

/**
 * Updates a homepage image's details (alt_text, display_order, is_active).
 */
export async function updateHomepageImageDetails(
  imageId: string,
  updates: Partial<Pick<HomepageImage, 'alt_text' | 'display_order' | 'is_active'>>
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Service - HomepageContent] updateHomepageImageDetails invoked for ID: ${imageId}`);

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const dataToUpdate = {
        ...updates,
        updated_at: new Date().toISOString(), // Manually set updated_at if your table doesn't auto-update it
    };

    const { error } = await supabase
      .from('homepage_images')
      .update(dataToUpdate)
      .eq('id', imageId);

    if (error) {
      console.error(`[Supabase Service - HomepageContent] Error updating image details ${imageId}:`, error.message);
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, message: 'Image details updated successfully.' };
  } catch (error: any) {
    console.error(`[Supabase Service - HomepageContent] Catch block error updating image details ${imageId}:`, error.message);
    return { success: false, message: `Failed to update image details: ${error.message}` };
  }
}
