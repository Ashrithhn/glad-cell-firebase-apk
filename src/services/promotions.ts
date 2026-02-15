
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/server-utils';

export interface Promotion {
  id?: string;
  title: string;
  description: string;
  image_url?: string | null;
  image_storage_path?: string | null;
  cta_link?: string | null;
  cta_text?: string | null;
  is_active: boolean;
  display_order: number;
  college_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

const PROMOTIONS_BUCKET = 'homepage-images';

/**
 * Creates a new promotion, including uploading an image if provided.
 */
export async function createPromotion(
  promoData: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'college_id' | 'image_url' | 'image_storage_path'> & { imageDataUri?: string }
): Promise<{ success: boolean; promotionId?: string; message?: string }> {
  const { profile } = await getCurrentUser();
  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Super Admin')) {
    return { success: false, message: 'Unauthorized: You must be an administrator.' };
  }
  
  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable.` };
  }

  const { imageDataUri, ...data } = promoData;
  let imageUrl: string | null = null;
  let imageStoragePath: string | null = null;

  try {
    if (imageDataUri) {
      const fetchRes = await fetch(imageDataUri);
      const blob = await fetchRes.blob();
      const mimeType = blob.type;
      const extension = mimeType.split('/')[1] || 'jpg';
      const uniqueId = crypto.randomUUID();
      const storagePath = `public/promotions/${uniqueId}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(PROMOTIONS_BUCKET)
        .upload(storagePath, blob, { contentType: mimeType, upsert: false });

      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      
      const { data: publicUrlData } = supabaseAdmin.storage.from(PROMOTIONS_BUCKET).getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
      imageStoragePath = uploadData.path;
    }

    const docToInsert = {
      ...data,
      image_url: imageUrl,
      image_storage_path: imageStoragePath,
      college_id: profile.college_id,
    };

    const { data: newPromo, error: insertError } = await supabaseAdmin
      .from('promotions')
      .insert(docToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newPromo?.id) throw new Error('Promotion created but ID not returned.');

    revalidatePath('/admin/promotions');
    revalidatePath('/');

    return { success: true, promotionId: newPromo.id };

  } catch (error: any) {
    return { success: false, message: `Could not create promotion: ${error.message}` };
  }
}

/**
 * Updates an existing promotion's details (does not handle image replacement).
 */
export async function updatePromotion(
    promotionId: string, 
    updates: Partial<Omit<Promotion, 'id' | 'image_url' | 'image_storage_path'>>
): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) return { success: false, message: 'Admin service unavailable.' };
  try {
    const { error } = await supabaseAdmin
      .from('promotions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', promotionId);
    if (error) throw error;
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not update promotion: ${error.message}` };
  }
}

/**
 * Deletes a promotion and its associated image from storage.
 */
export async function deletePromotion(promotionId: string, storagePath: string | null | undefined): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) return { success: false, message: 'Admin service unavailable.' };
  try {
    const { error: dbError } = await supabaseAdmin.from('promotions').delete().eq('id', promotionId);
    if (dbError) throw dbError;
    if (storagePath) {
      await supabaseAdmin.storage.from(PROMOTIONS_BUCKET).remove([storagePath]);
    }
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not delete promotion: ${error.message}` };
  }
}

/**
 * Fetches promotions for the admin panel, scoped by college for Admins.
 */
export async function getAdminPromotions(): Promise<{ success: boolean; promotions?: Promotion[]; message?: string }> {
  const { profile } = await getCurrentUser();
  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Super Admin')) {
    return { success: false, message: 'Unauthorized' };
  }
  const supabase = await createSupabaseServerClient();
  try {
    let query = supabase.from('promotions').select('*').order('display_order', { ascending: true });
    if (profile.role === 'Admin' && profile.college_id) {
      query = query.eq('college_id', profile.college_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, promotions: data || [] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch promotions: ${error.message}` };
  }
}

/**
 * Fetches a single promotion by its ID.
 */
export async function getPromotionById(id: string): Promise<{ success: boolean; promotion?: Promotion; message?: string }> {
    const supabase = await createSupabaseServerClient();
    try {
        const { data, error } = await supabase.from('promotions').select('*').eq('id', id).single();
        if (error) throw error;
        return { success: true, promotion: data };
    } catch (error: any) {
        return { success: false, message: `Could not fetch promotion: ${error.message}` };
    }
}


/**
 * Fetches active promotions for the public homepage.
 */
export async function getActivePublicPromotions(): Promise<{ success: boolean; promotions?: Promotion[]; message?: string }> {
    const supabase = await createSupabaseServerClient();
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
        if (error) throw error;
        return { success: true, promotions: data || [] };
    } catch (error: any) {
        return { success: false, message: `Could not fetch promotions: ${error.message}` };
    }
}
