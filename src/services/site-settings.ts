
'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface SiteSettings {
  maintenanceMode: boolean;
  theme?: string; // Example: 'light', 'dark', 'system' or specific theme names
  // Add other site-wide settings here
  // e.g., customDomain?: string;
  // e.g., seoTitle?: string;
}

const SITE_SETTINGS_DOC_ID = 'global'; // Single document to store all site settings

/**
 * Fetches the current site settings from Firestore.
 * @returns Promise resolving to the success status, settings data, or an error message.
 */
export async function getSiteSettings(): Promise<{ success: boolean; settings?: SiteSettings; message?: string }> {
  console.log('[Server Action] getSiteSettings invoked.');

  if (initializationError) {
    const errorMessage = `Site settings service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error] getSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Site settings service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error] getSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID); // Using a dedicated collection 'siteConfiguration'
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettings;
      console.log('[Server Action] Site settings found.');
      return { success: true, settings: data };
    } else {
      console.log('[Server Action] No site settings found. Returning defaults.');
      // Return default settings if document doesn't exist
      return { success: true, settings: { maintenanceMode: false, theme: 'default' } };
    }
  } catch (error: any) {
    console.error('[Server Action Error] Error fetching site settings:', error.message, error.stack);
    return { success: false, message: `Failed to fetch site settings: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * Updates the site settings in Firestore.
 * Requires admin privileges (TODO: implement check).
 *
 * @param newSettings - The new settings object to save.
 * @returns Promise resolving to the success status or an error message.
 */
export async function updateSiteSettings(newSettings: SiteSettings): Promise<{ success: boolean; message?: string }> {
  console.log('[Server Action] updateSiteSettings invoked.');

  if (initializationError) {
    const errorMessage = `Site settings service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error] updateSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Site settings service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error] updateSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  // TODO: Add a server-side check here to ensure the user calling this is an admin.

  if (newSettings === undefined || newSettings === null) {
    return { success: false, message: 'Settings data cannot be empty.' };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, {
      ...newSettings,
      updatedAt: serverTimestamp() as Timestamp,
    }, { merge: true }); // Use merge true to update existing fields or create if not exists

    console.log('[Server Action] Site settings updated successfully.');

    // Revalidate paths that might be affected by site settings changes
    revalidatePath('/'); // Revalidate home page (e.g., for maintenance mode banner)
    revalidatePath('/admin/dashboard'); // Revalidate admin dashboard where settings are managed
    // Add more specific paths if settings affect other areas

    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error] Error updating site settings:', error.message, error.stack);
    return { success: false, message: `Could not update site settings: ${error.message || 'Unknown database error'}` };
  }
}
