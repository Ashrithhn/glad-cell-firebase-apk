
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdminClient'; // Use the admin client
import { createSupabaseServerClient } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

/**
 * Updates the user's profile picture in Supabase Storage and updates the 'photo_url' in the 'users' table.
 * Expects the image data as a Base64 encoded Data URI string.
 * This is intended to be called by the logged-in user for their own profile.
 */
export async function updateOwnProfilePicture(
    userId: string,
    imageDataUri: string // e.g., "data:image/jpeg;base64,/9j/4AAQSkZ..."
): Promise<{ success: boolean; photoURL?: string; message?: string }> {
    console.log('[Profile Service] updateOwnProfilePicture invoked for user:', userId);
    
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    if (!supabaseAdmin) {
        const errorMessage = `Profile service unavailable: Supabase admin client failed to initialize. Check server logs and .env.local for SUPABASE_SERVICE_ROLE_KEY.`;
        console.error(`[Profile Service Error] updateOwnProfilePicture: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
        return { success: false, message: 'Invalid image data format. Expected Data URI.' };
    }

    try {
        // Fetch the user's current profile to get the old photo path
        const { data: userProfile, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('photo_url')
            .eq('id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
             console.warn("[Profile Service] Could not get current profile to check for old photo:", fetchError.message);
        } else if (userProfile?.photo_url) {
             try {
                const url = new URL(userProfile.photo_url);
                const oldFileKey = url.pathname.split('/profile-pictures/')[1];
                if (oldFileKey) {
                    await supabaseAdmin.storage.from('profile-pictures').remove([oldFileKey]);
                }
             } catch(e) {
                 console.warn("[Profile Service] Could not parse or remove old photo URL:", userProfile.photo_url);
             }
        }
        
        const fetchRes = await fetch(imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const filePath = `${userId}/profile.${extension}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('profile-pictures')
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
                contentType: mimeType,
            });

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('profile-pictures')
            .getPublicUrl(uploadData.path);

        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for profile picture.');
        
        const newPhotoURL = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
        
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ photo_url: newPhotoURL, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) throw new Error(`Failed to update profile in database: ${updateError.message}`);
        
        revalidatePath('/profile');
        revalidatePath('/profile/edit');

        return { success: true, photoURL: newPhotoURL };

    } catch (error: any) {
        return { success: false, message: `Failed to update profile picture: ${error.message || 'Unknown error'}` };
    }
}

/**
 * Removes the user's profile picture from Supabase Storage and clears the 'photo_url' in the 'users' table.
 */
export async function removeOwnProfilePicture(userId: string): Promise<{ success: boolean; message?: string }> {
    console.log('[Profile Service] removeOwnProfilePicture invoked for user:', userId);

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return { success: false, message: 'Unauthorized.' };
    }

    if (!supabaseAdmin) {
      return { success: false, message: 'Profile service is currently unavailable.' };
    }

    try {
        const { data: userProfile, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('photo_url')
            .eq('id', userId)
            .single();

        if (fetchError) throw new Error('Could not retrieve user profile to remove picture.');
        
        if (userProfile.photo_url) {
            try {
                const url = new URL(userProfile.photo_url);
                const filePath = url.pathname.split('/profile-pictures/')[1];
                if (filePath) {
                    await supabaseAdmin.storage.from('profile-pictures').remove([filePath]);
                }
            } catch (e) {
                console.warn("Could not parse or delete file from storage:", userProfile.photo_url);
            }
        }
        
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ photo_url: null, updated_at: new Date().toISOString() })
            .eq('id', userId);
        
        if (updateError) throw new Error('Failed to update profile after removing picture.');

        revalidatePath('/profile');
        revalidatePath('/profile/edit');
        return { success: true, message: 'Profile picture removed.' };
    } catch (error: any) {
        return { success: false, message: `Failed to remove profile picture: ${error.message}` };
    }
}

/**
 * Updates a user's own profile data (name, phone, semester).
 */
export async function updateOwnUserProfile(
  userId: string,
  updates: { name: string; phone: string; semester: number }
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { success: false, message: 'Unauthorized.' };
  }

  const { error } = await supabase
    .from('users')
    .update({ 
      name: updates.name, 
      phone: updates.phone,
      semester: updates.semester,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error.message);
    return { success: false, message: `Failed to update profile: ${error.message}` };
  }
  
  revalidatePath('/profile');
  revalidatePath('/profile/edit');
  return { success: true, message: 'Profile updated successfully.' };
}
