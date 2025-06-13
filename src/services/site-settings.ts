
'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface SiteSettings_DEPRECATED {
  maintenanceMode: boolean;
  theme?: string;
}

const SITE_SETTINGS_DOC_ID = 'global';

/**
 * DEPRECATED: Fetches the current site settings from Firestore.
 * @returns Promise resolving to the success status, settings data, or an error message.
 */
export async function getSiteSettings_DEPRECATED(): Promise<{ success: boolean; settings?: SiteSettings_DEPRECATED; message?: string }> {
  console.warn('[Server Action DEPRECATED Firebase] getSiteSettings_DEPRECATED invoked.');

  if (initializationError) {
    const errorMessage = `Site settings service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error DEPRECATED Firebase] getSiteSettings_DEPRECATED: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Site settings service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error DEPRECATED Firebase] getSiteSettings_DEPRECATED: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID);
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettings_DEPRECATED;
      console.log('[Server Action DEPRECATED Firebase] Site settings found.');
      return { success: true, settings: data };
    } else {
      console.log('[Server Action DEPRECATED Firebase] No site settings found. Returning defaults.');
      return { success: true, settings: { maintenanceMode: false, theme: 'default' } };
    }
  } catch (error: any) {
    console.error('[Server Action Error DEPRECATED Firebase] Error fetching site settings:', error.message, error.stack);
    return { success: false, message: `Failed to fetch site settings: ${error.message || 'Unknown database error'}` };
  }
}

/**
 * DEPRECATED: Updates the site settings in Firestore.
 * Requires admin privileges (TODO: implement check).
 *
 * @param newSettings - The new settings object to save.
 * @returns Promise resolving to the success status or an error message.
 */
export async function updateSiteSettings_DEPRECATED(newSettings: SiteSettings_DEPRECATED): Promise<{ success: boolean; message?: string }> {
  console.warn('[Server Action DEPRECATED Firebase] updateSiteSettings_DEPRECATED invoked.');

  if (initializationError) {
    const errorMessage = `Site settings service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error DEPRECATED Firebase] updateSiteSettings_DEPRECATED: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Site settings service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error DEPRECATED Firebase] updateSiteSettings_DEPRECATED: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }


  if (newSettings === undefined || newSettings === null) {
    return { success: false, message: 'Settings data cannot be empty.' };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, {
      ...newSettings,
      updatedAt: serverTimestamp() as Timestamp,
    }, { merge: true });

    console.log('[Server Action DEPRECATED Firebase] Site settings updated successfully.');

    revalidatePath('/');
    revalidatePath('/admin/dashboard');

    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error DEPRECATED Firebase] Error updating site settings:', error.message, error.stack);
    return { success: false, message: `Could not update site settings: ${error.message || 'Unknown database error'}` };
  }
}
