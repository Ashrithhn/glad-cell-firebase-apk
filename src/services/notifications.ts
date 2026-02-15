
'use server';

import { createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { revalidatePath } from 'next/cache';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationPayload {
  user_id: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * Creates a new notification for a user.
 */
export async function createNotification(payload: CreateNotificationPayload): Promise<{ success: boolean; notificationId?: string; message?: string }> {
  const supabase = supabaseAdmin;

  if (!supabase) {
    console.error('[Notification Service] Supabase admin client not initialized.');
    return { success: false, message: 'Notification service is unavailable.' };
  }
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select('id')
      .single();

    if (error) throw error;
    
    // We don't revalidate paths here as this should be a live update via the client,
    // but this could be used if there's a static notifications page.

    return { success: true, notificationId: data.id };
  } catch (error: any) {
    console.error(`[Notification Service] Failed to create notification for user ${payload.user_id}:`, error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Fetches notifications for a specific user.
 */
export async function getNotificationsForUser(userId: string): Promise<{ success: boolean; notifications?: Notification[]; message?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!userId) return { success: false, message: 'User ID is required.' };

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to a reasonable number

    if (error) throw error;

    return { success: true, notifications: data as Notification[] };
  } catch (error: any) {
    console.error(`[Notification Service] Failed to fetch notifications for user ${userId}:`, error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Marks a list of notifications as read for the current user.
 */
export async function markNotificationsAsRead(notificationIds: string[]): Promise<{ success: boolean; message?: string }> {
  const supabase = await createSupabaseServerClient();
  if (!notificationIds || notificationIds.length === 0) {
    return { success: true, message: 'No notifications to mark as read.' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error(`[Notification Service] Failed to mark notifications as read:`, error.message);
    return { success: false, message: error.message };
  }
}
