'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface GeneralSiteSettings {
  siteName: string;
  allowRegistrations: boolean;
  // ... any other general settings
}

// Main structure for all site settings
export interface SiteSettingsData {
  maintenance: MaintenanceSettings;
  general: GeneralSiteSettings;
  // lastUpdated?: Timestamp; // Optional: to track when settings were last saved
}


const SETTINGS_COLLECTION_ID = 'siteConfiguration'; // Changed for clarity
const SETTINGS_DOC_ID = 'mainSettings'; // Single document for all site settings

/**
 * Fetches the global site settings from Firestore.
 */
export async function getSiteSettings(): Promise<{ success: boolean; settings?: SiteSettingsData; message?: string }> {
  console.log('[Service - Settings] getSiteSettings invoked.');

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const settingsDocRef = doc(db, SETTINGS_COLLECTION_ID, SETTINGS_DOC_ID);
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      // Convert Timestamps to ISO strings if necessary for client components
      const rawData = docSnap.data() as SiteSettingsData; // Assume it matches SiteSettingsData
      // Example if you had Timestamps in settings:
      // const settings: SiteSettingsData = {
      //   ...rawData,
      //   lastUpdated: rawData.lastUpdated instanceof Timestamp ? rawData.lastUpdated.toDate().toISOString() : rawData.lastUpdated,
      // };
      return { success: true, settings: rawData };
    } else {
      // Return default settings if document doesn't exist
      const defaultSettings: SiteSettingsData = {
        maintenance: { enabled: false, message: 'Site is currently undergoing maintenance. Please check back soon.' },
        general: { siteName: 'GLAD CELL - GEC Mosalehosahalli', allowRegistrations: true },
      };
      return { success: true, settings: defaultSettings, message: 'No settings found, returning defaults.' };
    }
  } catch (error: any) {
    console.error('[Service - Settings] Error fetching site settings:', error);
    return { success: false, message: `Failed to fetch site settings: ${error.message}` };
  }
}

/**
 * Updates the global site settings in Firestore.
 */
export async function updateSiteSettings(newSettings: Partial<SiteSettingsData>): Promise<{ success: boolean; message?: string }> {
  console.log('[Service - Settings] updateSiteSettings invoked.');

  if (initializationError) {
    return { success: false, message: `Firebase initialization error: ${initializationError.message}` };
  }
  if (!db) {
    return { success: false, message: 'Firestore instance missing.' };
  }

  try {
    const settingsDocRef = doc(db, SETTINGS_COLLECTION_ID, SETTINGS_DOC_ID);
    const dataToUpdate = {
      ...newSettings,
      lastUpdated: serverTimestamp() as Timestamp, // Add/update lastUpdated timestamp
    };

    await setDoc(settingsDocRef, dataToUpdate, { merge: true }); // Use setDoc with merge:true to create/update

    // Revalidate paths that might be affected by settings changes
    revalidatePath('/');
    revalidatePath('/admin/settings');
    revalidatePath('/login');
    revalidatePath('/register');
    // Revalidate any other paths that depend on these settings

    return { success: true, message: 'Site settings updated successfully.' };
  } catch (error: any) {
    console.error('[Service - Settings] Error updating site settings:', error);
    return { success: false, message: `Failed to update site settings: ${error.message}` };
  }
}
