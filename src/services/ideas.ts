
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';


export interface IdeaData {
  id?: string;
  title: string;
  description: string;
  submitter_name?: string | null;
  submitter_id?: string | null;
  department?: string | null;
  tags?: string[] | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  college_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Adds a new idea to the 'ideas' table from a user submission.
 * This action securely identifies the user from their session on the server.
 */
export async function submitIdea(
  ideaData: Pick<IdeaData, 'title' | 'description' | 'tags'>
): Promise<{ success: boolean; ideaId?: string; message?: string }> {

  if (!supabaseAdmin) {
    console.error('Server Action Error: Supabase admin client is not initialized.');
    return { success: false, message: 'Idea service is not available. Please contact support.' };
  }

  const supabase = createSupabaseServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Server Action Error: Could not verify user.', authError?.message);
      return { success: false, message: "Authentication failed. Your profile could not be verified on the server." };
    }
    const userId = user.id;

    // Use the admin client to fetch profile and insert idea, bypassing RLS for robustness
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name, branch, college_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Server Action Error: Could not find user profile for ID:', userId, profileError?.message);
      return { success: false, message: "Authentication failed. Your profile could not be found." };
    }

    const dataToInsert = {
      ...ideaData,
      submitter_id: userId,
      submitter_name: profile.name,
      department: profile.branch,
      status: 'Pending' as const,
      college_id: profile.college_id,
    };

    const { data, error: insertError } = await supabaseAdmin
      .from('ideas')
      .insert(dataToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!data || !data.id) throw new Error('Idea added but no ID returned.');

    revalidatePath('/ideas');
    revalidatePath(`/profile/my-ideas`);

    return { success: true, ideaId: data.id };
  } catch (error: any) {
    console.error('Server Action Exception in submitIdea:', error.message);
    return { success: false, message: `A server error occurred: ${error.message}` };
  }
}


/**
 * Fetches all ideas from the 'ideas' table for the admin panel.
 * Scoped to the admin's college if the user is an 'Admin'.
 */
export async function getAllIdeas(): Promise<{ success: boolean; ideas?: IdeaData[]; message?: string }> {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUser();

  try {
    let query = supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile?.role === 'Admin' && profile.college_id) {
        query = query.eq('college_id', profile.college_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, ideas: data || [] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch ideas: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches only 'Approved' ideas for the public gallery.
 */
export async function getApprovedIdeas(): Promise<{ success: boolean; ideas?: IdeaData[]; message?: string }> {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, ideas: data || [] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch approved ideas: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Updates the status of an idea and sends a notification.
 */
export async function updateIdeaStatus(
  ideaId: string,
  status: IdeaData['status']
): Promise<{ success: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: idea, error: fetchError } = await supabase
        .from('ideas')
        .select('title, submitter_id')
        .eq('id', ideaId)
        .single();

    if (fetchError || !idea) {
        throw new Error('Could not find the idea to update.');
    }

    const { error } = await supabase
      .from('ideas')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', ideaId);

    if (error) throw error;

    if (idea.submitter_id) {
        await createNotification({
            user_id: idea.submitter_id,
            title: `Your idea status has been updated!`,
            message: `Your idea "${idea.title}" has been marked as ${status}.`,
            link: `/profile/my-ideas`
        });
    }
    
    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');
    if (idea.submitter_id) {
        revalidatePath(`/profile/my-ideas`);
    }


    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not update idea status: ${error.message}` };
  }
}


/**
 * Fetches a single idea by its ID.
 */
export async function getIdeaById(ideaId: string): Promise<{ success: boolean; idea?: IdeaData; message?: string }> {
    const supabase = createSupabaseServerClient();
    if (!ideaId) return { success: false, message: 'Idea ID is required.' };

    try {
        const { data, error } = await supabase.from('ideas').select('*').eq('id', ideaId).single();
        if (error) {
            if (error.code === 'PGRST116') return { success: false, message: 'Idea not found.' };
            throw error;
        }
        return { success: true, idea: data as IdeaData };
    } catch (error: any) {
        return { success: false, message: `Failed to fetch idea: ${error.message}` };
    }
}

/**
 * Fetches all ideas submitted by a specific user.
 */
export async function getIdeasByUserId(userId: string): Promise<{ success: boolean; ideas?: IdeaData[]; message?: string }> {
    const supabase = createSupabaseServerClient();
    if (!userId) return { success: false, message: 'User ID is required.' };
    
    try {
        const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('submitter_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, ideas: data || [] };
    } catch (error: any) {
        return { success: false, message: `Could not fetch user's ideas: ${error.message}` };
    }
}


/**
 * Updates an existing idea in the 'ideas' table.
 */
export async function updateIdea(
  ideaId: string,
  ideaData: Partial<Omit<IdeaData, 'id' | 'created_at' | 'submitter_id'>>
): Promise<{ success: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();

  try {
    const dataToUpdate = { ...ideaData, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('ideas').update(dataToUpdate).eq('id', ideaId);

    if (error) throw error;

    revalidatePath('/admin/ideas');
    revalidatePath(`/admin/ideas/edit/${ideaId}`);
    revalidatePath('/ideas');
    if (ideaData.submitter_id) {
        revalidatePath(`/profile/my-ideas`);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not update idea: ${error.message}` };
  }
}

/**
 * Deletes an idea from the 'ideas' table.
 */
export async function deleteIdea(ideaId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();

  try {
    const { error } = await supabase.from('ideas').delete().eq('id', ideaId);
    if (error) throw error;

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');

    return { success: true };
  } catch (error: any) {
    return { success: false, message: `Could not delete idea: ${error.message}` };
  }
}


/**
 * Manually adds an idea from the admin panel.
 */
export async function addIdea(
  ideaData: Omit<IdeaData, 'id' | 'created_at' | 'updated_at' | 'submitter_id' | 'college_id'>
): Promise<{ success: boolean; ideaId?: string; message?: string }> {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUser();
  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Super Admin')) {
    return { success: false, message: 'Unauthorized action.' };
  }

  const dataToInsert = {
      ...ideaData,
      college_id: profile.college_id,
  } as const;

  try {
    const { data, error } = await supabase
      .from('ideas')
      .insert(dataToInsert)
      .select('id')
      .single();

    if (error) throw error;
    if (!data || !data.id) throw new Error('Idea added but no ID returned.');

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');

    return { success: true, ideaId: data.id };
  } catch (error: any) {
    return { success: false, message: `Could not add idea: ${error.message || 'Unknown database error'}` };
  }
}
