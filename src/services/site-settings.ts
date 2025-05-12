
'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface SiteSettings {
  maintenanceMode: boolean;
  theme?: string; 
  seoTitle?: string;
  seoDescription?: string;
  customDomain?: string;
  // analyticsId?: string; // Example for future
  // ipRestrictions?: string[]; // Example for future
}

const SITE_SETTINGS_DOC_ID = 'global'; 
const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  theme: 'default',
  seoTitle: 'GLAD CELL - GEC Mosalehosahalli',
  seoDescription: 'Fostering innovation and startup culture at GEC Mosalehosahalli.',
  customDomain: '',
};

export async function getSiteSettings(): Promise<{ success: boolean; settings?: SiteSettings; message?: string }> {
  console.log('[Server Action] getSiteSettings invoked.');

  if (initializationError) {
    const errorMessage = `Site settings service unavailable: Firebase initialization error - ${initializationError.message}.`;
    console.error(`[Server Action Error] getSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage, settings: DEFAULT_SETTINGS }; // Return default on error
  }
  if (!db) {
    const errorMessage = 'Site settings service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error] getSiteSettings: ${errorMessage}`);
    return { success: false, message: errorMessage, settings: DEFAULT_SETTINGS }; // Return default on error
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID); 
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[Server Action] Site settings found.');
      // Merge with defaults to ensure all keys are present
      return { success: true, settings: { ...DEFAULT_SETTINGS, ...data } as SiteSettings };
    } else {
      console.log('[Server Action] No site settings found. Returning defaults.');
      return { success: true, settings: DEFAULT_SETTINGS };
    }
  } catch (error: any) {
    console.error('[Server Action Error] Error fetching site settings:', error.message, error.stack);
    return { success: false, message: `Failed to fetch site settings: ${error.message || 'Unknown database error'}`, settings: DEFAULT_SETTINGS };
  }
}

export async function updateSiteSettings(newSettings: Partial<SiteSettings>): Promise<{ success: boolean; message?: string }> {
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


  if (newSettings === undefined || newSettings === null || Object.keys(newSettings).length === 0) {
    return { success: false, message: 'Settings data cannot be empty.' };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, {
      ...newSettings, // Apply partial updates
      updatedAt: serverTimestamp() as Timestamp,
    }, { merge: true }); 

    console.log('[Server Action] Site settings updated successfully.');

    revalidatePath('/'); 
    revalidatePath('/admin/dashboard'); 
    // Revalidate any page that might use these settings, e.g., for dynamic titles/descriptions
    // This can be broad, or specific if you know which pages use which settings.
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/programs');
    revalidatePath('/ideas');


    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error] Error updating site settings:', error.message, error.stack);
    return { success: false, message: `Could not update site settings: ${error.message || 'Unknown database error'}` };
  }
}
