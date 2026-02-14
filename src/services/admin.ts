
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';
import type { EventData } from './events';
import { getCurrentUser } from '@/lib/server-utils';
import { createNotification } from './notifications';

const EVENTS_BUCKET = 'event-images';
const RULES_BUCKET = 'event-rules';

export interface AddEventInput {
  name: string;
  description: string;
  venue: string;
  rules?: string | null;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  event_type: 'individual' | 'group';
  min_team_size?: number | null;
  max_team_size?: number | null;
  fee: number; // Fee in Paisa
  imageDataUri?: string | null;
  rulesPdfDataUri?: string | null;
  college_name?: string | null;
  college_id?: string | null;
}

export type UpdateEventInput = Partial<Omit<AddEventInput, 'college_name' | 'college_id'>>;


/**
 * Adds a new event to the 'events' table and uploads image and rules PDF to Supabase Storage.
 * College details are automatically attached based on the logged-in admin's profile.
 */
export async function addEvent(eventData: Omit<AddEventInput, 'college_id' | 'college_name'>): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Supabase Admin Service] addEvent invoked.');

  const { profile } = await getCurrentUser();
  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Super Admin')) {
    return { success: false, message: 'Unauthorized: You must be an administrator to add events.' };
  }
  
  if (!supabaseAdmin) {
    const errorMessage = `Admin service unavailable: Supabase admin client not initialized. Check server logs for SUPABASE_SERVICE_ROLE_KEY.`;
    return { success: false, message: errorMessage };
  }

  let imageUrl: string | null = null;
  let imageStoragePath: string | null = null;
  let rulesPdfUrl: string | null = null;
  let rulesPdfStoragePath: string | null = null;

  try {
    // Handle image upload
    if (eventData.imageDataUri) {
      if (typeof eventData.imageDataUri === 'string' && eventData.imageDataUri.startsWith('data:image/')) {
        const fetchRes = await fetch(eventData.imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.${extension}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(EVENTS_BUCKET)
          .upload(storagePath, blob, { contentType: mimeType, upsert: false });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabaseAdmin.storage.from(EVENTS_BUCKET).getPublicUrl(uploadData.path);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for event image.');
        
        imageUrl = publicUrlData.publicUrl;
        imageStoragePath = uploadData.path;
      }
    }
    
    // Handle PDF rulebook upload
    if (eventData.rulesPdfDataUri) {
      if (typeof eventData.rulesPdfDataUri === 'string' && eventData.rulesPdfDataUri.startsWith('data:application/pdf')) {
        const fetchRes = await fetch(eventData.rulesPdfDataUri);
        const blob = await fetchRes.blob();
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.pdf`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(RULES_BUCKET)
          .upload(storagePath, blob, { contentType: 'application/pdf', upsert: false });
        
        if (uploadError) throw new Error(`PDF upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabaseAdmin.storage.from(RULES_BUCKET).getPublicUrl(uploadData.path);
        if(!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for rules PDF.');

        rulesPdfUrl = publicUrlData.publicUrl;
        rulesPdfStoragePath = uploadData.path;
      }
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
      college_id: profile.college_id,
      college_name: profile.college_name,
      status: 'Active',
    };

    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('events')
      .insert(docDataToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newEvent?.id) throw new Error('Event created but ID not returned.');

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    // Broadcast notification to all users about the new event
    try {
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id');

        if (usersError) {
            console.warn('[Admin Service - addEvent] Could not fetch users for notification broadcast:', usersError.message);
        } else if (users) {
            const notifications = users.map(user => ({
                user_id: user.id,
                title: 'New Event Announced!',
                message: `Check out the new event: "${eventData.name}". Register now!`,
                link: '/programs'
            }));

            if (notifications.length > 0) {
                const { error: notificationError } = await supabaseAdmin
                    .from('notifications')
                    .insert(notifications);
                
                if (notificationError) {
                     console.warn('[Admin Service - addEvent] Failed to insert broadcast notifications:', notificationError.message);
                } else {
                     console.log(`[Admin Service - addEvent] Broadcasted notification to ${users.length} users.`);
                }
            }
        }
    } catch (broadcastError: any) {
        // Log this but don't fail the entire addEvent operation
        console.warn(`[Admin Service - addEvent] Notification broadcast failed: ${broadcastError.message}`);
    }


    return { success: true, eventId: newEvent.id };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error] Error adding event:', error.message, error.stack);
    return { success: false, message: `Could not add event: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Updates an existing event, including optionally replacing its image or PDF.
 */
export async function updateEvent(eventId: string, eventData: UpdateEventInput): Promise<{ success: boolean; message?: string }> {
  console.log(`[Supabase Admin Service] updateEvent invoked for ID: ${eventId}`);
  if (!supabaseAdmin) {
    return { success: false, message: `Admin service unavailable: Supabase admin client not initialized.` };
  }

  try {
    const updates: Partial<EventData> = { ...eventData };
    delete (updates as any).imageDataUri;
    delete (updates as any).rulesPdfDataUri;

    const { data: existingEvent, error: fetchError } = await supabaseAdmin.from('events').select('image_storage_path, rules_pdf_storage_path').eq('id', eventId).single();
    if (fetchError) throw new Error(`Could not fetch existing event to replace files: ${fetchError.message}`);

    // Handle image replacement
    if (eventData.imageDataUri) {
        const fetchRes = await fetch(eventData.imageDataUri);
        const blob = await fetchRes.blob();
        const newStoragePath = `public/${crypto.randomUUID()}.${blob.type.split('/')[1] || 'jpg'}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(EVENTS_BUCKET).upload(newStoragePath, blob, { contentType: blob.type, upsert: false });
        if (uploadError) throw uploadError;
        updates.image_url = supabaseAdmin.storage.from(EVENTS_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
        updates.image_storage_path = uploadData.path;
        if (existingEvent?.image_storage_path) {
            await supabaseAdmin.storage.from(EVENTS_BUCKET).remove([existingEvent.image_storage_path]);
        }
    }
    
    // Handle PDF replacement
    if (eventData.rulesPdfDataUri) {
        const fetchRes = await fetch(eventData.rulesPdfDataUri);
        const blob = await fetchRes.blob();
        const newStoragePath = `public/${crypto.randomUUID()}.pdf`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage.from(RULES_BUCKET).upload(newStoragePath, blob, { contentType: 'application/pdf', upsert: false });
        if (uploadError) throw uploadError;
        updates.rules_pdf_url = supabaseAdmin.storage.from(RULES_BUCKET).getPublicUrl(uploadData.path).data.publicUrl;
        updates.rules_pdf_storage_path = uploadData.path;
        if (existingEvent?.rules_pdf_storage_path) {
            await supabaseAdmin.storage.from(RULES_BUCKET).remove([existingEvent.rules_pdf_storage_path]);
        }
    }


    const { error: updateError } = await supabaseAdmin.from('events').update(updates).eq('id', eventId);
    if (updateError) throw updateError;

    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${eventId}/edit`);
    revalidatePath('/programs');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(`[Supabase Admin Service Error] Error updating event ${eventId}:`, error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Archives an event by setting its status to 'Archived'. Does not delete the record.
 */
export async function archiveEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Admin Service] archiveEvent invoked for ID:', eventId);

  if (!supabaseAdmin) {
    const errorMessage = `Admin service unavailable: Supabase admin client not initialized.`;
    return { success: false, message: errorMessage };
  }
  if (!eventId) return { success: false, message: 'Event ID is required for archiving.' };

  try {
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ status: 'Archived' })
      .eq('id', eventId);

    if (updateError) throw updateError;
    
    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');

    return { success: true };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error] Error archiving event:', error.message, error.stack);
    return { success: false, message: `Could not archive event: ${error.message || 'Unknown error'}` };
  }
}
