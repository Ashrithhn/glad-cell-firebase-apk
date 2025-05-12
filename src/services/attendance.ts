
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';

/**
 * Saves an attendance record by updating the 'attended_at' field in the 'participations' table.
 * Assumes 'orderId' is the primary key or a unique identifier for the participation record.
 */
export async function saveAttendanceRecord(orderId: string, eventId: string, userId: string, scannedData: string): Promise<{ success: boolean; message?: string }> {
    console.log('[Supabase Service] saveAttendanceRecord invoked for order:', orderId, 'event:', eventId, 'user:', userId);

    if (supabaseError || !supabase) {
        const errorMessage = `Attendance service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Service Error] saveAttendanceRecord: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        // Fetch the participation record. Assuming 'orderId' corresponds to the 'id' (or a unique 'order_id' column) in your 'participations' table.
        // If 'orderId' is not the PK, adjust the .eq() filter.
        const { data: participation, error: fetchError } = await supabase
            .from('participations')
            .select('*') // Select all to check existing data like attended_at, event_id, user_id
            .eq('id', orderId) // Or .eq('payment_details->>order_id', orderId) if orderId is in JSONB
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') { // No rows found
                 console.warn(`[Supabase Service] Attendance: No participation document found for order ID: ${orderId}`);
                 return { success: false, message: 'Invalid ticket. Could not find registration.' };
            }
            console.error(`[Supabase Service Error] Error fetching participation for order ID ${orderId}:`, fetchError.message);
            throw fetchError;
        }

        if (!participation) { // Should be caught by PGRST116, but good to double check
            console.warn(`[Supabase Service] Attendance: No participation document found for order ID: ${orderId}`);
            return { success: false, message: 'Invalid ticket. Could not find registration.' };
        }
        
        if (participation.attended_at) {
            console.warn(`[Supabase Service] Attendance: Ticket already used for order ID: ${orderId}`);
            return { success: false, message: 'This ticket has already been used.' };
        }

        // Verify event_id and user_id match (ensure these columns exist in your 'participations' table)
        if (participation.event_id !== eventId || participation.user_id !== userId) {
            console.warn(`[Supabase Service] Attendance: Event or user ID mismatch for order ID: ${orderId}. Expected E:${participation.event_id}/U:${participation.user_id}, Got E:${eventId}/U:${userId}`);
            return { success: false, message: 'This ticket is not valid for this event or user.' };
        }
        
        // Optional: verify scannedData if it's stored (e.g., against qr_code_data_uri)
        // if (participation.qr_code_data_uri !== scannedData) {
        //     console.warn(`[Supabase Service] Attendance: QR code data mismatch for order ID: ${orderId}.`);
        //     return { success: false, message: 'QR code mismatch. Ticket may be invalid.' };
        // }


        // Update the document to mark attendance
        const { error: updateError } = await supabase
            .from('participations')
            .update({ attended_at: new Date().toISOString() })
            .eq('id', orderId); // Or your PK for participations

        if (updateError) {
            console.error(`[Supabase Service Error] Error updating attendance for order ID ${orderId}:`, updateError.message);
            throw updateError;
        }

        console.log(`[Supabase Service] Attendance marked successfully for order: ${orderId}`);
        return { success: true };

    } catch (error: any) {
        console.error('[Supabase Service Error] Error marking attendance:', error.message, error.stack);
        return { success: false, message: `Could not mark attendance: ${error.message || 'Unknown database error'}` };
    }
}
