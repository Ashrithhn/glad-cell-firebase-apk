'use server';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';


export async function saveAttendanceRecord(orderId: string, eventId: string, userId: string, scannedData: string): Promise<{ success: boolean; message?: string }> {
    console.log('[Server Action] saveAttendanceRecord invoked for order:', orderId, 'event:', eventId, 'user:', userId);

    if (initializationError) {
        const errorMessage = `Attendance service unavailable: Firebase initialization error - ${initializationError.message}.`;
        console.error(`[Server Action Error] saveAttendanceRecord: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }
    if (!db) {
        const errorMessage = 'Attendance service unavailable: Firestore service instance missing.';
        console.error(`[Server Action Error] saveAttendanceRecord: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    try {
        const participationDocRef = doc(db, 'participations', orderId); // Assuming orderId is the document ID
        const docSnap = await getDoc(participationDocRef);

        if (!docSnap.exists()) {
            console.warn(`[Server Action] Attendance: No participation document found for order ID: ${orderId}`);
            return { success: false, message: 'Invalid ticket. Could not find registration.' };
        }

        const docData = docSnap.data();

        if (docData.attendedAt) {
            console.warn(`[Server Action] Attendance: Ticket already used for order ID: ${orderId}`);
            return { success: false, message: 'This ticket has already been used.' };
        }

         // Verify that the event ID and user ID in the scanned data match the document
         if (docData.eventId !== eventId || docData.userId !== userId) {
            console.warn(`[Server Action] Attendance: Event or user ID mismatch for order ID: ${orderId}.`);
            return { success: false, message: 'This ticket is not valid for this event or user.' };
        }

        // In a real-world scenario, you might verify the scanned data against the stored QR code data or some other unique identifier
        // before marking attendance. For simplicity, we'll skip the QR code check for now.

        // Update the document to mark attendance
        await updateDoc(participationDocRef, {
            attendedAt: new Date(),
        });

        console.log(`[Server Action] Attendance marked successfully for order:', ${orderId}`);
        return { success: true };

    } catch (error: any) {
        console.error('[Server Action Error] Error marking attendance:', error.code, error.message, error.stack);
        return { success: false, message: `Could not mark attendance due to a database error: ${error.message || 'Unknown error'}` };
    }
}
