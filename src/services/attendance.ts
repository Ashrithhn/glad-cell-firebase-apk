
'use server';

<<<<<<< HEAD
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
=======
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

interface AttendanceRecord {
  eventId: string;
  userId: string;
  orderId: string; // To link with payment/registration if needed
  attendedAt: Timestamp;
  scannedAt: Timestamp; // When this specific QR was scanned
}

/**
 * Marks attendance for a user at a specific event.
 * Checks if attendance has already been marked for the given userId and eventId.
 *
 * @param eventId - The ID of the event.
 * @param userId - The ID of the user.
 * @param orderId - The order ID from the QR code, used for cross-referencing.
 * @returns Promise resolving to success status and a message.
 */
export async function markAttendance(
  eventId: string,
  userId: string,
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  console.log(`[Server Action - Attendance] markAttendance invoked for Event: ${eventId}, User: ${userId}, Order: ${orderId}`);

  if (initializationError) {
    const msg = `Attendance service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error - Attendance] markAttendance: ${msg}`);
    return { success: false, message: msg };
  }
  if (!db) {
    const msg = 'Attendance service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Attendance] markAttendance: ${msg}`);
    return { success: false, message: msg };
  }

  if (!eventId || !userId || !orderId) {
    return { success: false, message: 'Event ID, User ID, and Order ID are required.' };
  }

  try {
    // Check if this specific QR (orderId for this event) has an attendance record
    // The primary key for an attendance entry could be a combination of eventId and userId (or even orderId if unique per event).
    // For simplicity, let's assume a 'participations' collection might hold an 'attendedAt' field.
    // Or, we can have a dedicated 'attendance' collection.
    
    // Let's assume 'participations' collection stores the initial registration
    // and we update that document with attendance info.
    const participationsRef = collection(db, 'participations');
    const q = query(
      participationsRef,
      where('eventId', '==', eventId),
      where('userId', '==', userId),
      where('paymentDetails.orderId', '==', orderId), // Assuming orderId is stored this way
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`[Server Action - Attendance] No participation record found for Event: ${eventId}, User: ${userId}, Order: ${orderId}. Cannot mark attendance.`);
      return { success: false, message: 'No valid participation record found for this QR code.' };
    }

    const participationDoc = querySnapshot.docs[0];
    const participationData = participationDoc.data();

    if (participationData.attendedAt) {
      console.log(`[Server Action - Attendance] User ${userId} already marked as attended for event ${eventId} on ${ (participationData.attendedAt as Timestamp).toDate().toLocaleString() }.`);
      return { success: false, message: `User already marked as attended on ${(participationData.attendedAt as Timestamp).toDate().toLocaleString()}.` };
    }

    // Mark attendance by updating the participation document
    await updateDoc(doc(db, 'participations', participationDoc.id), {
      attendedAt: serverTimestamp() as Timestamp,
      lastScannedAt: serverTimestamp() as Timestamp, // Could be useful for audit
    });

    console.log(`[Server Action - Attendance] Attendance marked for User: ${userId}, Event: ${eventId}, Order: ${orderId}`);
    
    // Optionally revalidate paths if attendance lists are shown publicly or in other admin views
    // revalidatePath(`/admin/events/${eventId}/attendance`);

    return { success: true, message: 'Attendance marked successfully.' };

  } catch (error: any) {
    console.error('[Server Action Error - Attendance] Error marking attendance:', error.message, error.stack);
    return { success: false, message: `Could not mark attendance: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Fetches all participants for a given event who have been marked as attended.
 * (Placeholder - actual implementation would depend on data structure)
 *
 * @param eventId - The ID of the event.
 * @returns Promise resolving to success status, participant data, or an error message.
 */
export async function getEventParticipants(
  eventId: string
): Promise<{ success: boolean; data?: any[]; message?: string }> {
  console.log(`[Server Action - Attendance] getEventParticipants invoked for Event: ${eventId}`);
    if (initializationError || !db) {
    const msg = `Service unavailable: Firebase issue - ${initializationError?.message || 'DB missing'}.`;
    return { success: false, message: msg };
  }

  if (!eventId) {
    return { success: false, message: 'Event ID is required.' };
  }

  try {
    // This query assumes you have an 'attendedAt' field in your 'participations' collection.
    const participantsQuery = query(
      collection(db, 'participations'),
      where('eventId', '==', eventId),
      where('attendedAt', '!=', null) // Only fetch those who have attended
      // orderBy('attendedAt', 'asc') // Optional: order by attendance time
    );

    const querySnapshot = await getDocs(participantsQuery);
    const participants: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      participants.push({
        id: docSnap.id,
        userId: data.userId,
        name: data.name, // Assuming name is stored in participation record
        email: data.email, // Assuming email is stored
        orderId: data.paymentDetails?.orderId,
        attendedAt: (data.attendedAt as Timestamp)?.toDate().toISOString(),
      });
    });

    console.log(`[Server Action - Attendance] Fetched ${participants.length} attended participants for Event: ${eventId}`);
    return { success: true, data: participants };

  } catch (error: any) {
    console.error('[Server Action Error - Attendance] Error fetching event participants:', error.message);
    return { success: false, message: `Could not fetch participants: ${error.message || 'Unknown database error'}` };
  }
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
}
