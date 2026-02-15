
'use server';

import type { UserProfileSupabase } from './auth'; // Use the Supabase profile type
import { revalidatePath } from 'next/cache';
import { getCurrentUser, createSupabaseServerClient } from '@/lib/server-utils';

export interface EventData {
  id?: string;
  name: string;
  description: string;
  venue: string;
  rules?: string | null;
  rules_pdf_url?: string | null;
  rules_pdf_storage_path?: string | null;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  event_type: 'individual' | 'group';
  min_team_size?: number | null;
  max_team_size?: number | null;
  fee: number; // Fee in Paisa
  image_url?: string | null;
  image_storage_path?: string | null;
  college_id?: string | null; // For multi-tenancy
  college_name?: string | null; // Denormalized for easy display
  status: 'Active' | 'Archived' | 'Cancelled';
  created_at?: string;
}

export interface ParticipationData {
  id: string; // ID is now required
  ticket_id?: string | null;
  user_id: string;
  event_id: string;
  event_name: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_branch: string;
  user_semester: number;
  user_registration_number: string;
  payment_details?: {
    order_id: string;
    payment_id: string;
    method: string;
  } | null;
  qr_code_data_uri?: string | null;
  participated_at?: string;
  attended_at?: string | null;
}


/**
 * Records event participation in the 'participations' table.
 */
export async function participateInEvent(participationData: Omit<ParticipationData, 'participated_at' | 'attended_at'>): Promise<{ success: boolean; participationId?: string; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] participateInEvent invoked for event:', participationData.event_id, 'by user:', participationData.user_id);

  try {
    // Check if user is already registered for the event
    const { data: existingParticipation, error: checkError } = await supabase
      .from('participations')
      .select('id')
      .eq('user_id', participationData.user_id)
      .eq('event_id', participationData.event_id)
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116: "Searched item was not found"
      throw checkError;
    }
    if (existingParticipation) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    const docDataToInsert = {
      ...participationData,
      participated_at: new Date().toISOString(),
    };

    // Insert the record with the provided ID
    const { error: insertError } = await supabase
      .from('participations')
      .insert(docDataToInsert);

    if (insertError) throw insertError;

    console.log('[Supabase Service] Participation recorded with ID:', participationData.id);
    revalidatePath('/profile'); // Ensure the user's profile page shows the new ticket
    return { success: true, participationId: participationData.id };

  } catch (error: any) {
    console.error('[Supabase Service Error] Error recording participation:', error.message, error.stack);
    return { success: false, message: `Could not record participation: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches user profile data from the 'users' table.
 */
export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: UserProfileSupabase; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] getUserProfile invoked for user:', userId);

  if (!userId) return { success: false, message: 'User ID is required.' };

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: false, message: `User profile not found for user: ${userId}` };
      throw error;
    }
    return { success: true, data: data as UserProfileSupabase };

  } catch (error: any) {
    console.error('[Supabase Service Error] Error fetching user profile:', error.message, error.stack);
    return { success: false, message: `Failed to fetch user profile: ${error.message || 'Unknown database error'}` };
  }
}


/**
 * Fetches all events/programs for the admin panel, respecting user roles.
 * Scoped to the admin's college if the user is an 'Admin'.
 */
export async function getAdminEvents(): Promise<{ success: boolean; events?: EventData[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] getAdminEvents invoked.');

  const { profile, error: profileError } = await getCurrentUser();

  if (profileError || !profile) {
    console.error('[Supabase Service Error] getAdminEvents profile fetch error:', profileError?.message);
    return { success: false, message: 'Unauthorized: Could not retrieve user profile.' };
  }

  if (profile.role !== 'Admin' && profile.role !== 'Super Admin') {
    console.warn(`[Supabase Service] getAdminEvents: User ${profile.id} with role '${profile.role}' attempted to access admin events.`);
    return { success: false, message: 'Unauthorized' };
  }

  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile.role === 'Admin' && profile.college_id) {
      console.log(`[Supabase Service] Scoping events for Admin of college ID: ${profile.college_id}`);
      query = query.eq('college_id', profile.college_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const events: EventData[] = data || [];
    console.log(`[Supabase Service] getAdminEvents: Fetched ${events.length} items.`);
    return { success: true, events };

  } catch (error: any) {
    console.error('[Supabase Service Error] Error fetching admin events:', error.message, error.stack);
    return { success: false, message: `Could not fetch items: ${error.message || 'Unknown database error'}` };
  }
}


/**
 * Fetches active events for the public-facing pages.
 */
export async function getPublicActiveEvents(): Promise<{ success: boolean; events?: EventData[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] getPublicActiveEvents invoked.');
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      // .eq('status', 'Active') // Column missing in DB
      .order('start_date', { ascending: true });

    if (error) throw error;

    const events: EventData[] = data || [];
    return { success: true, events };
  } catch (error: any) {
    console.error('[Supabase Service Error] Error fetching public events:', error.message);
    return { success: false, message: `Could not fetch public events: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Fetches archived events for the public-facing pages.
 */
export async function getPublicArchivedEvents(): Promise<{ success: boolean; events?: EventData[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] getPublicArchivedEvents invoked.');
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      // .eq('status', 'Archived') // Column missing in DB
      .order('start_date', { ascending: false }); // Show most recent archived first

    if (error) throw error;

    const events: EventData[] = data || [];
    return { success: true, events };
  } catch (error: any) {
    console.error('[Supabase Service Error] Error fetching archived events:', error.message);
    return { success: false, message: `Could not fetch archived events: ${error.message || 'Unknown error'}` };
  }
}


/**
 * Fetches participation data for a specific user from the 'participations' table.
 */
export async function getParticipationData(userId: string): Promise<{ success: boolean; participations?: ParticipationData[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service] getParticipationData invoked for user:', userId);

  if (!userId) return { success: false, message: 'User ID is required.' };

  try {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('user_id', userId)
      .order('participated_at', { ascending: false });

    if (error) throw error;

    const participations: ParticipationData[] = data || [];
    console.log(`[Supabase Service] getParticipationData: Fetched ${participations.length} participations for user ${userId}.`);
    return { success: true, participations };
  } catch (error: any) {
    console.error('[Supabase Service Error] Error fetching participations:', error.message, error.stack);
    return { success: false, message: `Could not fetch participation data: ${error.message || 'Unknown error'}` };
  }
}

/**
 * Fetches all participants for a given event.
 */
export async function getParticipantsForEvent(eventId: string): Promise<{ success: boolean; participants?: ParticipationData[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log(`[Supabase Service] getParticipantsForEvent invoked for Event ID: ${eventId}`);

  if (!eventId) return { success: false, message: 'Event ID is required.' };

  try {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('event_id', eventId)
      .order('user_name', { ascending: true });

    if (error) throw error;

    const participants: ParticipationData[] = data || [];
    console.log(`[Supabase Service] getParticipantsForEvent: Fetched ${participants.length} participants for event ${eventId}.`);
    return { success: true, participants };
  } catch (error: any) {
    console.error(`[Supabase Service Error] Error fetching participants for event ${eventId}:`, error.message);
    return { success: false, message: `Could not fetch participants: ${error.message}` };
  }
}

/**
 * Fetches a single event by its ID.
 */
export async function getEventById(eventId: string): Promise<{ success: boolean; event?: EventData; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log(`[Supabase Service] getEventById invoked for ID: ${eventId}`);

  if (!eventId) return { success: false, message: 'Event ID is required.' };

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: false, message: `Event with ID ${eventId} not found.` };
      throw error;
    }

    return { success: true, event: data as EventData };
  } catch (error: any) {
    console.error(`[Supabase Service Error] Error fetching event by ID ${eventId}:`, error.message);
    return { success: false, message: `Could not fetch event details: ${error.message}` };
  }
}
