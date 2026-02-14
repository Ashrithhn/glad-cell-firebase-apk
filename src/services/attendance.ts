
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import type { ParticipationData } from './events';

/**
 * Marks attendance for a user at a specific event.
 * Checks if attendance has already been marked for the given userId and eventId.
 *
 * @param eventId - The ID of the event from the QR code.
 * @param userId - The ID of the user from the QR code.
 * @param orderId - The order ID from the QR code, used for cross-referencing.
 * @returns Promise resolving to success status, a message, and participant data.
 */
export async function markAttendance(
  eventId: string,
  userId: string,
  orderId: string
): Promise<{ success: boolean; message?: string; participant?: ParticipationData }> {
  const supabase = createSupabaseServerClient();
  console.log(`[Supabase Service - Attendance] Marking attendance for Event: ${eventId}, User: ${userId}, Order: ${orderId}`);

  if (!eventId || !userId || !orderId) {
    return { success: false, message: 'Invalid QR Code: Event ID, User ID, and Order ID are required.' };
  }

  try {
    const { data: participation, error: fetchError } = await supabase
      .from('participations')
      .select('*') // Select all fields to return
      .eq('id', orderId)
      .single();

    if (fetchError || !participation) {
      if (fetchError && fetchError.code === 'PGRST116') { // No rows found
         console.warn(`[Supabase Service - Attendance] No participation record found for Order ID: ${orderId}.`);
         return { success: false, message: 'No valid participation record found for this QR code.' };
      }
      throw fetchError || new Error("Participation record not found.");
    }
    
    // Verify data from QR code matches the database record
    if (participation.event_id !== eventId || participation.user_id !== userId) {
        console.warn(`[Supabase Service - Attendance] Mismatch found for Order ID ${orderId}. DB (E: ${participation.event_id}, U: ${participation.user_id}) vs QR (E: ${eventId}, U: ${userId})`);
        return { success: false, message: 'QR code data does not match participation record. Invalid ticket.' };
    }

    if (participation.attended_at) {
      const attendedDate = new Date(participation.attended_at);
      const formattedDate = attendedDate.toLocaleString();
      console.log(`[Supabase Service - Attendance] User ${userId} already marked as attended for event ${eventId} on ${formattedDate}.`);
      return { success: false, message: `Already marked as attended on ${formattedDate}.`, participant: participation };
    }

    const attendedTimestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('participations')
      .update({ attended_at: attendedTimestamp })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    const updatedParticipant = { ...participation, attended_at: attendedTimestamp };

    console.log(`[Supabase Service - Attendance] Attendance marked for User: ${userId}, Event: ${eventId}, Order: ${orderId}`);
    return { success: true, message: `Welcome, ${updatedParticipant.user_name || 'Participant'}! Attendance marked.`, participant: updatedParticipant };

  } catch (error: any) {
    console.error('[Supabase Service Error - Attendance] Error marking attendance:', error.message, error.stack);
    return { success: false, message: `Could not mark attendance: ${error.message || 'Unknown database error'}` };
  }
}
