
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Assuming a 'site_configuration' table with an 'id' (e.g., 'mainSettings') and a 'settings_data' (jsonb) column.

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface GeneralSiteSettings {
  siteName: string;
  allowRegistrations: boolean;
  // ... any other general settings
}

export interface NotificationSettings { // Added for completeness
    adminEmail: string;
    notifyOnNewUser: boolean;
}

export interface SiteSettingsData {
  maintenance: MaintenanceSettings;
  general: GeneralSiteSettings;
  notifications?: NotificationSettings; // Optional if not fully implemented yet
  last_updated_at?: string; // Supabase uses ISO strings
}

const SETTINGS_DOC_ID = 'mainSettings'; // Use a consistent ID for the single settings document/row

/**
 * Fetches the global site settings from the 'site_configuration' table.
 */
export async function getSiteSettings(): Promise<{ success: boolean; settings?: SiteSettingsData; message?: string }> {
  console.log('[Supabase Service - Settings] getSiteSettings invoked.');

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const { data: settingsData, error } = await supabase
      .from('site_configuration') // Your table name for settings
      .select('settings_data')    // The JSONB column holding all settings
      .eq('id', SETTINGS_DOC_ID) // Assuming a single row with this ID
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "Searched item was not found"
      console.error('[Supabase Service - Settings] Error fetching site settings:', error.message);
      throw error;
    }

    if (settingsData) {
      return { success: true, settings: settingsData.settings_data as SiteSettingsData };
    } else {
      // Return default settings if no record found
      const defaultSettings: SiteSettingsData = {
        maintenance: { enabled: false, message: 'Site is currently undergoing maintenance. Please check back soon.' },
        general: { siteName: 'GLAD CELL - GEC Mosalehosahalli', allowRegistrations: true },
        notifications: { adminEmail: '', notifyOnNewUser: false }
      };
      return { success: true, settings: defaultSettings, message: 'No settings found, returning defaults.' };
    }
  } catch (error: any) {
    console.error('[Supabase Service - Settings] Catch block error fetching site settings:', error.message, error.stack);
    return { success: false, message: `Failed to fetch site settings: ${error.message}` };
  }
}

/**
 * Updates the global site settings in the 'site_configuration' table.
 */
export async function updateSiteSettings(newSettings: Partial<SiteSettingsData>): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Service - Settings] updateSiteSettings invoked.');

  if (supabaseError || !supabase) {
    return { success: false, message: `Supabase client error: ${supabaseError?.message || 'Client not initialized'}` };
  }

  try {
    const dataToUpsert = {
      id: SETTINGS_DOC_ID,
      settings_data: newSettings, // Store the entire new settings object
      last_updated_at: new Date().toISOString(),
    };

    // Upsert the settings: update if 'mainSettings' row exists, insert if not.
    const { error } = await supabase
      .from('site_configuration')
      .upsert(dataToUpsert, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase Service - Settings] Error updating site settings:', error.message);
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/admin/settings'); // Or the specific admin settings page
    revalidatePath('/admin/dashboard'); // Settings might affect dashboard links/visibility
    revalidatePath('/login');
    revalidatePath('/register');

    return { success: true, message: 'Site settings updated successfully.' };
  } catch (error: any) {
    console.error('[Supabase Service - Settings] Catch block error updating site settings:', error.message, error.stack);
    return { success: false, message: `Failed to update site settings: ${error.message}` };
  }
}
