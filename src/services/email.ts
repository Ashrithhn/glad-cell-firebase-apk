
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import { format, parseISO } from 'date-fns';

interface EmailPayload {
    to: string;
    participantName: string;
    eventName: string;
    teamName: string;
    venue: string;
    startDate: string;
}

/**
 * Sends a team registration confirmation email by invoking a Supabase Edge Function.
 * This function prepares the data and calls the function, but the actual email sending
 * logic resides within the Supabase Edge Function itself.
 * 
 * @param payload - The data required to construct the confirmation email.
 */
export async function sendTeamConfirmationEmail(payload: EmailPayload): Promise<{ success: boolean; message?: string }> {
  const supabase = createSupabaseServerClient();
  console.log(`[Email Service] Preparing to send confirmation email to: ${payload.to}`);

  try {
    const formattedDate = format(parseISO(payload.startDate), 'MMMM d, yyyy');
    const subject = `Confirmation for Event: ${payload.eventName}`;

    // Constructing a simple but formal HTML body for the email
    const body = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Greetings from GEC Mosalehosahalli,</h2>
        <p>Dear ${payload.participantName},</p>
        <p>This email confirms your successful registration for the upcoming event, <strong>${payload.eventName}</strong>, as part of team <strong>"${payload.teamName}"</strong>.</p>
        <p>Please find the event details below:</p>
        <ul>
          <li><strong>Event:</strong> ${payload.eventName}</li>
          <li><strong>Date & Time:</strong> Starting on ${formattedDate}</li>
          <li><strong>Venue:</strong> ${payload.venue}</li>
        </ul>
        <p>Your participation is valuable to us, and we are excited to have you on board. Please ensure you have your event ticket (QR code) accessible from your profile on our portal.</p>
        <p>Best regards,</p>
        <p><strong>The GLAD CELL Team</strong><br>GEC Mosalehosahalli</p>
      </div>
    `;

    // Invoke the Supabase Edge Function to send the email
    // NOTE: This assumes you have an Edge Function named 'send-transactional-email' deployed.
    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        to: payload.to,
        subject,
        html: body,
      },
    });

    if (error) {
      throw new Error(`Edge Function invocation failed: ${error.message}`);
    }

    console.log(`[Email Service] Successfully invoked email function for ${payload.to}`);
    return { success: true, message: 'Email function invoked successfully.' };
  } catch (error: any) {
    console.error(`[Email Service] Error sending confirmation email:`, error.message);
    // This error should be logged but not block the main registration flow.
    return { success: false, message: `Could not send confirmation email: ${error.message}` };
  }
}
