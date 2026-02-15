
// This file is new
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/server-utils';

export interface CustomPage {
  id: string;
  title: string;
  slug: string; // This will be the URL path, e.g., 'about-us'
  content: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  college_id?: string | null;
}

/**
 * Fetches all custom pages. Admin scoped.
 */
export async function getCustomPages(): Promise<{ success: boolean; pages?: CustomPage[]; message?: string }> {
  const { profile } = await getCurrentUser();
  if (!profile || profile.role !== 'Super Admin') {
    return { success: false, message: 'Unauthorized' };
  }
  const supabase = await createSupabaseServerClient();
  try {
    let query = supabase.from('custom_pages').select('*').order('created_at', { ascending: false });
    // if (profile.role === 'Admin' && profile.college_id) {
    //   query = query.eq('college_id', profile.college_id);
    // }
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, pages: data };
  } catch (error: any) {
    return { success: false, message: `Could not fetch pages: ${error.message}` };
  }
}

/**
 * Fetches a single published custom page by its slug. For public consumption.
 */
export async function getPublishedPageBySlug(slug: string): Promise<{ success: boolean; page?: CustomPage; message?: string }> {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error(`Error fetching page with slug ${slug}:`, error);
        }
        return { success: false, message: 'Page not found.' };
    }
    return { success: true, page: data };
  } catch (error: any) {
    return { success: false, message: `Could not fetch page: ${error.message}` };
  }
}

/**
 * Creates a new custom page.
 */
export async function createCustomPage(pageData: Pick<CustomPage, 'title' | 'slug' | 'content'>): Promise<{ success: boolean; pageId?: string; message?: string }> {
    const { profile } = await getCurrentUser();
    if (!profile || profile.role !== 'Super Admin') {
      return { success: false, message: 'Unauthorized' };
    }
  
    if (!supabaseAdmin) return { success: false, message: 'Service unavailable' };

    try {
        const { error } = await supabaseAdmin.from('custom_pages').insert({
            ...pageData,
            college_id: profile.college_id,
        });

        if (error) throw error;
        
        revalidatePath('/admin/pages');
        revalidatePath(`/${pageData.slug}`);

        return { success: true, message: "Page created successfully." };

    } catch(error: any) {
        if (error.code === '23505') { // Unique constraint violation
            return { success: false, message: 'This page URL (slug) is already in use. Please choose another.' };
        }
        return { success: false, message: `Could not create page: ${error.message}` };
    }
}

/**
 * Updates a custom page.
 */
export async function updateCustomPage(pageId: string, pageData: Partial<Pick<CustomPage, 'title' | 'slug' | 'content' | 'is_published'>>): Promise<{ success: boolean; message?: string }> {
    if (!supabaseAdmin) return { success: false, message: 'Service unavailable' };
    try {
        const { error } = await supabaseAdmin.from('custom_pages').update({
            ...pageData,
            updated_at: new Date().toISOString()
        }).eq('id', pageId);

        if (error) throw error;
        
        revalidatePath('/admin/pages');
        if (pageData.slug) {
            revalidatePath(`/${pageData.slug}`);
        }

        return { success: true, message: "Page updated." };
    } catch(error: any) {
        if (error.code === '23505') { // Unique constraint violation
            return { success: false, message: 'This page URL (slug) is already in use. Please choose another.' };
        }
        return { success: false, message: `Could not update page: ${error.message}` };
    }
}


/**
 * Deletes a custom page.
 */
export async function deleteCustomPage(pageId: string): Promise<{ success: boolean; message?: string }> {
    if (!supabaseAdmin) return { success: false, message: 'Service unavailable' };
    try {
        const { error } = await supabaseAdmin.from('custom_pages').delete().eq('id', pageId);
        if (error) throw error;
        revalidatePath('/admin/pages');
        // We don't know the slug to revalidate, but it will 404 now anyway.
        return { success: true, message: 'Page deleted.' };
    } catch (error: any) {
        return { success: false, message: `Could not delete page: ${error.message}` };
    }
}
