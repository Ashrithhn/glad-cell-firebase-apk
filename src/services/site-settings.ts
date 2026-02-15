
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/server-utils';

// This is the "flat" structure expected by SiteSettingsManager and MaintenanceBanner
export interface SiteSettings {
  maintenanceMode: boolean;
  theme: string;
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  customDomain: string;
  allowRegistrations: boolean;
  allowIdeaSubmissions: boolean;
}

const SETTINGS_DOC_ID = 'mainSettings';

const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  theme: 'default',
  siteName: 'GLAD CELL - GEC Mosalehosahalli',
  allowRegistrations: true,
  allowIdeaSubmissions: true,
  seoTitle: 'GLAD CELL - GEC Mosalehosahalli CSE Dept.',
  seoDescription: 'An initiative by the Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli, to foster startup and ideathon concepts.',
  customDomain: '',
};

/**
 * Fetches the global site settings from the 'site_configuration' table.
 */
export async function getSiteSettings(): Promise<{ success: boolean; settings?: SiteSettings; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service - Settings] getSiteSettings invoked.');

  try {
    const { data, error } = await supabase
      .from('site_configuration')
      .select('settings_data')
      .eq('id', SETTINGS_DOC_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase Service - Settings] Error fetching site settings:', error.message);
      throw error;
    }

    if (data?.settings_data) {
      // Merge fetched settings with defaults to ensure all keys are present
      const settings = { ...DEFAULT_SETTINGS, ...data.settings_data };
      return { success: true, settings };
    } else {
      console.log('[Supabase Service - Settings] No settings found, returning defaults.');
      return { success: true, settings: DEFAULT_SETTINGS, message: 'No settings found, returning defaults.' };
    }
  } catch (error: any) {
    console.error('[Supabase Service - Settings] Catch block error fetching site settings:', error.message);
    return { success: false, message: `Failed to fetch site settings: ${error.message}`, settings: DEFAULT_SETTINGS };
  }
}

/**
 * Updates the global site settings in the 'site_configuration' table.
 */
export async function updateSiteSettings(newSettings: Partial<SiteSettings>): Promise<{ success: boolean; message?: string }> {
  const supabase = await createSupabaseServerClient();
  console.log('[Supabase Service - Settings] updateSiteSettings invoked.');

  try {
    const { data: currentSettingsData } = await supabase
      .from('site_configuration')
      .select('settings_data')
      .eq('id', SETTINGS_DOC_ID)
      .single();

    const currentSettings = currentSettingsData?.settings_data || {};
    const updatedSettings = { ...currentSettings, ...newSettings };

    const dataToUpsert = {
      id: SETTINGS_DOC_ID,
      settings_data: updatedSettings,
      last_updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_configuration')
      .upsert(dataToUpsert, { onConflict: 'id' });

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/dashboard');

    return { success: true, message: 'Site settings updated successfully.' };
  } catch (error: any) {
    console.error('[Supabase Service - Settings] Catch block error updating site settings:', error.message);
    return { success: false, message: `Failed to update site settings: ${error.message}` };
  }
}
