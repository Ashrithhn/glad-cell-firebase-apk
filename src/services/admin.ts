
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { EventData } from './events'; // Using the Supabase-compatible EventData type

const EVENTS_BUCKET = 'event-images'; // Define your Supabase Storage bucket name for event images

// Input type for adding an event, dates are ISO strings, fee in Paisa.
// imageDataUri is for uploading image.
interface AddEventInput {
  name: string;
  description: string;
  venue: string;
  rules?: string | null;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  registration_deadline?: string | null; // Optional ISO string
  event_type: 'individual' | 'group';
  min_team_size?: number | null;
  max_team_size?: number | null;
  fee: number; // Fee in Paisa
  imageDataUri?: string | null;
}

/**
 * Adds a new event to the 'events' table and uploads image to Supabase Storage.
 */
export async function addEvent(eventData: AddEventInput): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Supabase Admin Service] addEvent invoked.');

  if (supabaseError || !supabase) {
    const errorMessage = `Admin service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
    return { success: false, message: errorMessage };
  }

  // TODO: Add robust server-side admin role check using Supabase Auth context if available
  // For now, assuming this action is protected by route-level middleware or similar.

  try {
    let imageUrl: string | null = null;
    let imageStoragePath: string | null = null;

    if (eventData.imageDataUri) {
      if (typeof eventData.imageDataUri === 'string' && eventData.imageDataUri.startsWith('data:image/')) {
        const fetchRes = await fetch(eventData.imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.${extension}`; // Path within the bucket

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(EVENTS_BUCKET) // Ensure this bucket exists
          .upload(storagePath, blob, { contentType: mimeType, upsert: false });

        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from(EVENTS_BUCKET).getPublicUrl(uploadData.path);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for event image.');
        
        imageUrl = publicUrlData.publicUrl;
        imageStoragePath = uploadData.path;
        console.log('[Supabase Admin Service] Event image uploaded to:', imageStoragePath);
      } else {
        console.warn('[Supabase Admin Service] Invalid or missing imageDataUri for event:', eventData.name);
      }
    }

    const docDataToInsert: Omit<EventData, 'id' | 'created_at'> = {
      name: eventData.name,
      description: eventData.description,
      venue: eventData.venue,
      rules: eventData.rules,
      start_date: eventData.start_date, // Assumes already ISO string
      end_date: eventData.end_date,     // Assumes already ISO string
      registration_deadline: eventData.registration_deadline,
      event_type: eventData.event_type,
      min_team_size: eventData.event_type === 'group' ? eventData.min_team_size : null,
      max_team_size: eventData.event_type === 'group' ? eventData.max_team_size : null,
      fee: eventData.fee,
      image_url: imageUrl,
      image_storage_path: imageStoragePath,
      // created_at will be set by Supabase (default now())
    };

    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert(docDataToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newEvent?.id) throw new Error('Event created but ID not returned.');

    console.log('[Supabase Admin Service] Event added successfully to table with ID:', newEvent.id);

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    return { success: true, eventId: newEvent.id };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error] Error adding event:', error.message, error.stack);
    let detailedMessage = `Could not add event: ${error.message || 'Unknown error'}`;
    // Add more specific error handling for storage or DB errors if needed
    return { success: false, message: detailedMessage };
  }
}

/**
 * Deletes an event from the 'events' table and its associated image from Supabase Storage.
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Admin Service] deleteEvent invoked for ID:', eventId);

  if (supabaseError || !supabase) {
    const errorMessage = `Admin service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
    return { success: false, message: errorMessage };
  }
  if (!eventId) return { success: false, message: 'Event ID is required for deletion.' };

  // TODO: Add robust server-side admin role check

  try {
    // First, get event details to find image_storage_path
    const { data: eventToDelete, error: fetchError } = await supabase
      .from('events')
      .select('image_storage_path')
      .eq('id', eventId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // PGRST116: no rows found

    // Delete from 'events' table
    const { error: deleteDbError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteDbError) throw deleteDbError;
    console.log('[Supabase Admin Service] Event metadata deleted successfully from table:', eventId);

    // Delete image from Supabase Storage if path exists
    if (eventToDelete?.image_storage_path) {
      const { error: storageError } = await supabase.storage
        .from(EVENTS_BUCKET)
        .remove([eventToDelete.image_storage_path]);
      if (storageError) {
        console.warn(`[Supabase Admin Service] Error deleting image ${eventToDelete.image_storage_path} from Storage:`, storageError.message);
        // Decide if this is critical or a warning. For now, proceed.
      } else {
        console.log(`[Supabase Admin Service] Image ${eventToDelete.image_storage_path} deleted successfully from Storage.`);
      }
    }

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    return { success: true, message: 'Event and associated image (if any) deleted successfully.' };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error] Error deleting event:', error.message, error.stack);
    return { success: false, message: `Could not delete event: ${error.message || 'Unknown error'}` };
  }
}
