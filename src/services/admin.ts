
'use server';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { EventData } from './events'; // Using the Supabase-compatible EventData type

const EVENTS_BUCKET = 'event-images';
const EVENT_RULES_PDF_BUCKET = 'event-rules-pdfs'; // Bucket for PDF rules

// Input type for adding an event
export interface AddEventInput {
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
  imageDataUri?: string | null; // For event image
  rulesPdfDataUri?: string | null; // For rules PDF
}

// Admin-specific Supabase client using the service_role key
let adminSupabase: SupabaseClient | null = null;
let adminSupabaseError: string | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  adminSupabaseError = 'Supabase URL or Service Role Key is missing for admin actions. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local. Admin actions will fail.';
  console.error(`🔴 [CRITICAL ADMIN SERVICE ERROR] Initialization failed: ${adminSupabaseError}`);
} else {
  try {
    adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    if (adminSupabase) {
        console.log('✅ [Admin Service] Supabase client for admin actions initialized successfully with service_role key.');
    } else {
        throw new Error("createClient returned null for adminSupabase unexpectedly.");
    }
  } catch (e: any) {
    adminSupabaseError = `Failed to create admin Supabase client: ${e.message}`;
    console.error(`🔴 [CRITICAL ADMIN SERVICE ERROR] Client creation failed: ${adminSupabaseError}`);
    adminSupabase = null;
  }
}

/**
 * Adds a new event to the 'events' table and uploads image/PDF to Supabase Storage.
 * Uses admin client with service_role key to bypass RLS.
 */
export async function addEvent(eventData: AddEventInput): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Supabase Admin Service - Service Role] addEvent invoked.');

  if (adminSupabaseError || !adminSupabase) {
    const errorMessage = `Admin service unavailable: ${adminSupabaseError || 'Admin Supabase client not initialized due to missing/invalid SERVICE_ROLE_KEY or URL.'}.`;
    console.error(`[Admin Service Error - addEvent]: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  try {
    let imageUrl: string | null = null;
    let imageStoragePath: string | null = null;
    let rulesPdfUrl: string | null = null;
    let rulesPdfStoragePath: string | null = null;

    // Handle Image Upload
    if (eventData.imageDataUri && eventData.imageDataUri.startsWith('data:image/')) {
        const fetchRes = await fetch(eventData.imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.${extension}`;

        const { data: uploadData, error: uploadError } = await adminSupabase.storage
          .from(EVENTS_BUCKET)
          .upload(storagePath, blob, { contentType: mimeType, upsert: false });

        if (uploadError) throw new Error(`Event image upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = adminSupabase.storage.from(EVENTS_BUCKET).getPublicUrl(uploadData.path);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for event image.');
        
        imageUrl = publicUrlData.publicUrl;
        imageStoragePath = uploadData.path;
        console.log('[Supabase Admin Service - Service Role] Event image uploaded to:', imageStoragePath);
    }

    // Handle PDF Rules Upload
    if (eventData.rulesPdfDataUri && eventData.rulesPdfDataUri.startsWith('data:application/pdf')) {
        const fetchRes = await fetch(eventData.rulesPdfDataUri);
        const blob = await fetchRes.blob();
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.pdf`;

        const { data: pdfUploadData, error: pdfUploadError } = await adminSupabase.storage
            .from(EVENT_RULES_PDF_BUCKET) // Use the new bucket
            .upload(storagePath, blob, { contentType: 'application/pdf', upsert: false });

        if (pdfUploadError) throw new Error(`Rules PDF upload failed: ${pdfUploadError.message}`);

        const { data: pdfPublicUrlData } = adminSupabase.storage.from(EVENT_RULES_PDF_BUCKET).getPublicUrl(pdfUploadData.path);
        if (!pdfPublicUrlData?.publicUrl) throw new Error('Failed to get public URL for rules PDF.');
        
        rulesPdfUrl = pdfPublicUrlData.publicUrl;
        rulesPdfStoragePath = pdfUploadData.path;
        console.log('[Supabase Admin Service - Service Role] Rules PDF uploaded to:', rulesPdfStoragePath);
    }


    const docDataToInsert: Omit<EventData, 'id' | 'created_at'> = {
      name: eventData.name,
      description: eventData.description,
      venue: eventData.venue,
      rules: eventData.rules,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      registration_deadline: eventData.registration_deadline,
      event_type: eventData.event_type,
      min_team_size: eventData.event_type === 'group' ? eventData.min_team_size : null,
      max_team_size: eventData.event_type === 'group' ? eventData.max_team_size : null,
      fee: eventData.fee,
      image_url: imageUrl,
      image_storage_path: imageStoragePath,
      rules_pdf_url: rulesPdfUrl,
      rules_pdf_storage_path: rulesPdfStoragePath,
    };

    const { data: newEvent, error: insertError } = await adminSupabase
      .from('events')
      .insert(docDataToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newEvent?.id) throw new Error('Event created but ID not returned.');

    console.log('[Supabase Admin Service - Service Role] Event added successfully to table with ID:', newEvent.id);

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    return { success: true, eventId: newEvent.id };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error - Service Role] Error adding event:', error.message, error.stack);
    let detailedMessage = `Could not add event: ${error.message || 'Unknown error'}`;
    return { success: false, message: detailedMessage };
  }
}

/**
 * Deletes an event from the 'events' table and its associated image/PDF from Supabase Storage.
 * Uses admin client with service_role key to bypass RLS.
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Admin Service - Service Role] deleteEvent invoked for ID:', eventId);

  if (adminSupabaseError || !adminSupabase) {
    const errorMessage = `Admin service unavailable: ${adminSupabaseError || 'Admin Supabase client not initialized.'}.`;
    console.error(`[Admin Service Error - deleteEvent]: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!eventId) return { success: false, message: 'Event ID is required for deletion.' };

  try {
    const { data: eventToDelete, error: fetchError } = await adminSupabase
      .from('events')
      .select('image_storage_path, rules_pdf_storage_path')
      .eq('id', eventId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const { error: deleteDbError } = await adminSupabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteDbError) throw deleteDbError;
    console.log('[Supabase Admin Service - Service Role] Event metadata deleted successfully from table:', eventId);

    if (eventToDelete?.image_storage_path) {
      const { error: storageError } = await adminSupabase.storage
        .from(EVENTS_BUCKET)
        .remove([eventToDelete.image_storage_path]);
      if (storageError) console.warn(`[Supabase Admin Service] Error deleting image ${eventToDelete.image_storage_path}:`, storageError.message);
      else console.log(`[Supabase Admin Service] Image ${eventToDelete.image_storage_path} deleted.`);
    }
    
    if (eventToDelete?.rules_pdf_storage_path) {
      const { error: pdfStorageError } = await adminSupabase.storage
        .from(EVENT_RULES_PDF_BUCKET)
        .remove([eventToDelete.rules_pdf_storage_path]);
      if (pdfStorageError) console.warn(`[Supabase Admin Service] Error deleting PDF ${eventToDelete.rules_pdf_storage_path}:`, pdfStorageError.message);
      else console.log(`[Supabase Admin Service] PDF ${eventToDelete.rules_pdf_storage_path} deleted.`);
    }

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    return { success: true, message: 'Event and associated files deleted successfully.' };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error - Service Role] Error deleting event:', error.message, error.stack);
    return { success: false, message: `Could not delete event: ${error.message || 'Unknown error'}` };
  }
}
