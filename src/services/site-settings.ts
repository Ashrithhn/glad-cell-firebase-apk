
'use server';

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface SiteSettings_DEPRECATED {
  maintenanceMode: boolean;
<<<<<<< HEAD
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
=======
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
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

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


  if (newSettings === undefined || newSettings === null || Object.keys(newSettings).length === 0) {
    return { success: false, message: 'Settings data cannot be empty.' };
  }

  try {
    const settingsDocRef = doc(db, 'siteConfiguration', SITE_SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, {
      ...newSettings, // Apply partial updates
      updatedAt: serverTimestamp() as Timestamp,
<<<<<<< HEAD
    }, { merge: true });
=======
    }, { merge: true }); 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

    console.log('[Server Action DEPRECATED Firebase] Site settings updated successfully.');

<<<<<<< HEAD
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
=======
    revalidatePath('/'); 
    revalidatePath('/admin/dashboard'); 
    // Revalidate any page that might use these settings, e.g., for dynamic titles/descriptions
    // This can be broad, or specific if you know which pages use which settings.
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/programs');
    revalidatePath('/ideas');

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

    return { success: true };

  } catch (error: any) {
    console.error('[Server Action Error DEPRECATED Firebase] Error updating site settings:', error.message, error.stack);
    return { success: false, message: `Could not update site settings: ${error.message || 'Unknown database error'}` };
  }
}
