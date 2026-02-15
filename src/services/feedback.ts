
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';

export interface FeedbackData {
    id?: string;
    user_id?: string | null;
    author_name?: string | null;
    author_designation?: string | null; // New field for role/title
    message: string;
    is_approved: boolean;
    created_at?: string;
}

/**
 * Submits feedback from a user or admin.
 */
export async function submitFeedback(payload: Omit<FeedbackData, 'id' | 'created_at'>): Promise<{ success: boolean; feedback?: FeedbackData; message?: string }> {
  const supabase = supabaseAdmin; // Use admin client for all inserts

  if (!supabase) {
    return { success: false, message: 'Feedback service is unavailable.' };
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    
    revalidatePath('/admin/feedback');
    revalidatePath('/'); // Revalidate homepage to show new testimonial if approved

    return { success: true, feedback: data, message: 'Feedback submitted successfully.' };
  } catch (error: any) {
    return { success: false, message: `Could not submit feedback: ${error.message}` };
  }
}

/**
 * Fetches all feedback for the admin panel.
 * Requires super admin privileges.
 */
export async function getAllFeedback(): Promise<{ success: boolean; feedback?: FeedbackData[]; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: 'Admin service unavailable.' };
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, feedback: data || [] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch feedback: ${error.message}` };
  }
}

/**
 * Fetches approved feedback for the public homepage scroller.
 */
export async function getPublicFeedback(): Promise<{ success: boolean; feedback?: FeedbackData[]; message?: string }> {
    const supabase = await createSupabaseServerClient();
    try {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, feedback: data || [] };
    } catch (error: any) {
        return { success: false, message: `Could not fetch public feedback: ${error.message}` };
    }
}


/**
 * Updates a feedback item's approval status.
 * Requires super admin privileges.
 */
export async function updateFeedbackStatus(id: string, is_approved: boolean): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: 'Admin service unavailable.' };
  }
  try {
    const { error } = await supabaseAdmin
      .from('feedback')
      .update({ is_approved })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/feedback');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not update feedback status: ${error.message}` };
  }
}

/**
 * Deletes a feedback item.
 * Requires super admin privileges.
 */
export async function deleteFeedback(id: string): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: 'Admin service unavailable.' };
  }
  try {
    const { error } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/feedback');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not delete feedback: ${error.message}` };
  }
}
