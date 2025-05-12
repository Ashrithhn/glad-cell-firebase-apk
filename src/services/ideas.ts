
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Ensure your 'ideas' table in Supabase has columns matching this interface.
// Timestamps are stored as 'timestamptz' in Supabase and retrieved as ISO strings.
// Tags might be stored as an array of text (text[]) or jsonb. Assuming text[] for now.
export interface IdeaData {
  id?: string; // Supabase typically uses 'id' (UUID) as primary key, auto-generated
  title: string;
  description: string;
  submitter_name?: string | null;
  submitter_id?: string | null; // Foreign key to users.id if applicable
  department?: string | null;
  tags?: string[] | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  created_at?: string;
  updated_at?: string;
}

/**
 * Adds a new idea to the 'ideas' table in Supabase.
 */
export async function addIdea(
  ideaData: Omit<IdeaData, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; ideaId?: string; message?: string }> {
  console.log('[Supabase Service - Ideas] addIdea invoked.');

  if (supabaseError || !supabase) {
    const errorMessage = `Idea service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
    return { success: false, message: errorMessage };
  }

  try {
    const docData = {
      ...ideaData,
      // Supabase handles created_at and updated_at automatically if columns are configured with defaults like now()
    };

    const { data, error } = await supabase
      .from('ideas')
      .insert(docData)
      .select('id') // Select the ID of the newly inserted row
      .single(); // Expect a single row back

    if (error) {
      console.error('[Supabase Service Error - Ideas] Error adding idea:', error.message);
      throw error;
    }
    
    if (!data || !data.id) {
        console.error('[Supabase Service Error - Ideas] Idea added but no ID returned.');
        return { success: false, message: 'Idea added but failed to retrieve ID.' };
    }

    console.log('[Supabase Service - Ideas] Idea added successfully with ID:', data.id);

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');

    return { success: true, ideaId: data.id };
  } catch (error: any) {
    console.error('[Supabase Service Error - Ideas] Catch block error adding idea:', error.message, error.stack);
    return { success: false, message: `Could not add idea: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches all ideas from the 'ideas' table, ordered by creation date.
 */
export async function getIdeas(): Promise<{ success: boolean; ideas?: IdeaData[]; message?: string }> {
  console.log('[Supabase Service - Ideas] getIdeas invoked.');

  if (supabaseError || !supabase) {
    const errorMessage = `Idea service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
    return { success: false, message: errorMessage };
  }

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase Service Error - Ideas] Error fetching ideas:', error.message);
      throw error;
    }

    const ideas: IdeaData[] = data || [];
    console.log(`[Supabase Service - Ideas] Fetched ${ideas.length} ideas.`);
    return { success: true, ideas };
  } catch (error: any) {
    console.error('[Supabase Service Error - Ideas] Catch block error fetching ideas:', error.message, error.stack);
    return { success: false, message: `Could not fetch ideas: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches a single idea by its ID.
 */
export async function getIdeaById(ideaId: string): Promise<{ success: boolean; idea?: IdeaData; message?: string }> {
    console.log(`[Supabase Service - Ideas] getIdeaById invoked for ID: ${ideaId}`);
    if (supabaseError || !supabase) return { success: false, message: `Supabase error: ${supabaseError?.message || 'Client not initialized'}` };
    if (!ideaId) return { success: false, message: 'Idea ID is required.' };

    try {
        const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', ideaId)
            .single();

        if (error) {
             if (error.code === 'PGRST116') return { success: false, message: 'Idea not found.' }; // No rows found
            console.error(`[Supabase Service Error - Ideas] Error fetching idea ${ideaId}:`, error.message);
            throw error;
        }
        return { success: true, idea: data as IdeaData };
    } catch (error: any) {
        console.error(`[Supabase Service Error - Ideas] Catch block error fetching idea ${ideaId}:`, error.message);
        return { success: false, message: `Failed to fetch idea: ${error.message}` };
    }
}

/**
 * Updates an existing idea in the 'ideas' table.
 */
export async function updateIdea(
  ideaId: string,
  ideaData: Partial<Omit<IdeaData, 'id' | 'created_at'>> // `updated_at` will be set by Supabase trigger or here
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Service - Ideas] updateIdea invoked for ID: ${ideaId}`);

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const dataToUpdate = {
      ...ideaData,
      updated_at: new Date().toISOString(), // Manually set updated_at
    };
    const { error } = await supabase
      .from('ideas')
      .update(dataToUpdate)
      .eq('id', ideaId);

    if (error) {
      console.error(`[Supabase Service Error - Ideas] Error updating idea ${ideaId}:`, error.message);
      throw error;
    }
    console.log(`[Supabase Service - Ideas] Idea ${ideaId} updated successfully.`);

    revalidatePath('/admin/ideas');
    revalidatePath(`/admin/ideas/edit/${ideaId}`);
    revalidatePath('/ideas');

    return { success: true };
  } catch (error: any) {
    console.error(`[Supabase Service Error - Ideas] Catch block error updating idea ${ideaId}:`, error.message);
    return { success: false, message: `Could not update idea: ${error.message}` };
  }
}

/**
 * Deletes an idea from the 'ideas' table.
 */
export async function deleteIdea(ideaId: string): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Service - Ideas] deleteIdea invoked for ID: ${ideaId}`);

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);

    if (error) {
      console.error(`[Supabase Service Error - Ideas] Error deleting idea ${ideaId}:`, error.message);
      throw error;
    }
    console.log(`[Supabase Service - Ideas] Idea ${ideaId} deleted successfully.`);

    revalidatePath('/admin/ideas');
    revalidatePath('/ideas');

    return { success: true };
  } catch (error: any) {
    console.error(`[Supabase Service Error - Ideas] Catch block error deleting idea ${ideaId}:`, error.message);
    return { success: false, message: `Could not delete idea: ${error.message}` };
  }
}
