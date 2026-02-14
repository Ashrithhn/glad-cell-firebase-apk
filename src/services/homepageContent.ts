
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';

export type HomepageImageSection = 'carousel' | 'exploreIdeas' | 'latestEventPromo';

export interface HomepageImage {
  id?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  section: HomepageImageSection;
  link?: string | null;
  name?: string | null;
  created_at?: string;
  storage_path: string;
  updated_at?: string;
}

const HOMEPAGE_IMAGES_BUCKET = 'homepage-images';

export async function uploadHomepageImage(
  imageDataUri: string,
  altText: string,
  order: number,
  section: HomepageImageSection,
  link?: string,
  name?: string
): Promise<{ success: boolean; imageId?: string; message?: string }> {
  console.log('[Supabase Admin Service - HomepageContent] uploadHomepageImage invoked.');

  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable: Supabase admin client not initialized.` };
  }

  if (!imageDataUri.startsWith('data:image/')) {
    return { success: false, message: 'Invalid image data format. Expected Data URI.' };
  }

  try {
    const fetchRes = await fetch(imageDataUri);
    const blob = await fetchRes.blob();
    const mimeType = blob.type;
    const extension = mimeType.split('/')[1] || 'jpg';
    const uniqueId = crypto.randomUUID();
    const storagePath = `public/${section}/${uniqueId}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(HOMEPAGE_IMAGES_BUCKET)
      .upload(storagePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      });

    if (uploadError) throw uploadError;
    
    const { data: publicUrlData } = supabaseAdmin.storage
        .from(HOMEPAGE_IMAGES_BUCKET)
        .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for uploaded image.');
    
    const imageUrl = publicUrlData.publicUrl;

    const docData: Omit<HomepageImage, 'id' | 'created_at' | 'updated_at'> = {
      image_url: imageUrl,
      alt_text: altText,
      display_order: order,
      is_active: true,
      storage_path: uploadData.path,
      section: section,
      link: link || null,
      name: name || altText.substring(0, 50),
    };
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('homepage_images')
      .insert(docData)
      .select('id')
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from(HOMEPAGE_IMAGES_BUCKET).remove([uploadData.path]);
      throw dbError;
    }

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');

    return { success: true, imageId: dbData.id, message: 'Image uploaded successfully.' };
  } catch (error: any) {
    return { success: false, message: `Failed to upload image: ${error.message}` };
  }
}

export async function getHomepageImages(): Promise<{ success: boolean; images?: HomepageImage[]; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable: Supabase admin client not initialized.` };
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_images')
      .select('*')
      .order('section', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, images: data as HomepageImage[] || [] };
  } catch (error: any) {
    return { success: false, message: `Failed to fetch images: ${error.message}` };
  }
}

export async function deleteHomepageImage(imageId: string, storagePath: string): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable: Supabase admin client not initialized.` };
  }
  try {
    const { error: dbError } = await supabaseAdmin
      .from('homepage_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    if (storagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(HOMEPAGE_IMAGES_BUCKET)
        .remove([storagePath]);
      if (storageError) {
        console.warn(`Error deleting image from storage path ${storagePath}:`, storageError.message);
      }
    }
    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');
    return { success: true, message: 'Image deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: `Failed to delete image: ${error.message}` };
  }
}

export async function updateHomepageImageDetails(
  imageId: string,
  updates: Partial<Pick<HomepageImage, 'alt_text' | 'display_order' | 'is_active' | 'section' | 'link' | 'name'>>
): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable: Supabase admin client not initialized.` };
  }
  try {
    const dataToUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('homepage_images')
      .update(dataToUpdate)
      .eq('id', imageId);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/content/homepage-images');
    return { success: true, message: 'Image details updated successfully.' };
  } catch (error: any) {
    return { success: false, message: `Failed to update image details: ${error.message}` };
  }
}
