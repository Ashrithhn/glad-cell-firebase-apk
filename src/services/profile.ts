
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Updates the user's profile picture in Supabase Storage and updates the 'photo_url' in the 'users' table.
 * Expects the image data as a Base64 encoded Data URI string.
 */
export async function updateProfilePicture(
    userId: string,
    imageDataUri: string // e.g., "data:image/jpeg;base64,/9j/4AAQSkZ..."
): Promise<{ success: boolean; photoURL?: string; message?: string }> {
    console.log('[Supabase Server Action] updateProfilePicture invoked for user:', userId);

    if (supabaseError || !supabase) {
        const errorMessage = `Profile service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Server Action Error] updateProfilePicture: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!userId) {
        return { success: false, message: 'User ID is required.' };
    }
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
        return { success: false, message: 'Invalid image data format. Expected Data URI.' };
    }

    try {
        // 1. Get current profile to check for existing picture path for deletion
        let oldFileKey: string | null = null;
        const { data: userProfile, error: fetchError } = await supabase
            .from('users')
            .select('photo_url')
            .eq('id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found
            console.warn("[Supabase Server Action] Could not get current profile to check for old photo:", fetchError.message);
        } else if (userProfile?.photo_url) {
            try {
                // Supabase storage URLs are typically like: SUPABASE_URL/storage/v1/object/public/BUCKET_NAME/FILE_PATH
                const urlParts = new URL(userProfile.photo_url);
                const pathParts = urlParts.pathname.split('/');
                // Assuming path is like /storage/v1/object/public/profile-pictures/user-id/profile.jpg
                // The key would be 'user-id/profile.jpg' if bucket is 'profile-pictures'
                // This parsing is brittle and depends on your storage URL structure and bucket name.
                // A more robust way is to store the file key/path separately in your users table if needed for deletion.
                // For simplicity, let's assume the path part after the bucket name is the key.
                // You'll need to adjust this based on your bucket and file naming strategy.
                // Example: if URL is .../profile-pictures/user123/avatar.png, key is user123/avatar.png
                const bucketName = 'profile-pictures'; // Replace with your actual bucket name
                const pathAfterBucket = pathParts.slice(pathParts.indexOf(bucketName) + 1).join('/');
                if (pathAfterBucket) {
                    oldFileKey = pathAfterBucket;
                    console.log(`[Supabase Server Action] Found old photo path (key): ${oldFileKey}`);
                }
            } catch(e) {
                console.warn("[Supabase Server Action] Could not parse old photo URL:", userProfile.photo_url);
            }
        }

        // Convert Data URI to Blob/File
        const fetchRes = await fetch(imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const fileName = `profile.${extension}`;
        const filePath = `${userId}/${fileName}`; // Store in a folder named by user ID

        console.log(`[Supabase Server Action] Uploading new profile picture to: profile-pictures/${filePath}`);

        // 2. Upload new image to Supabase Storage (bucket: 'profile-pictures')
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-pictures') // Ensure this bucket exists and has correct RLS policies
            .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true, // Overwrite if exists
                contentType: mimeType,
            });

        if (uploadError) {
            console.error('[Supabase Server Action Error] Supabase Storage upload error:', uploadError.message);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }
        console.log('[Supabase Server Action] Image uploaded successfully to Supabase Storage:', uploadData.path);

        // 3. Get public URL for the new image
        const { data: publicUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(uploadData.path);

        if (!publicUrlData?.publicUrl) {
            console.error('[Supabase Server Action Error] Could not get public URL for uploaded image.');
            throw new Error('Failed to get public URL for profile picture.');
        }
        const newPhotoURL = publicUrlData.publicUrl;
        console.log('[Supabase Server Action] Public URL obtained:', newPhotoURL);

        // 4. Update 'users' table with the new photo_url
        const { error: updateError } = await supabase
            .from('users')
            .update({ photo_url: newPhotoURL, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) {
            console.error('[Supabase Server Action Error] Error updating user profile in table:', updateError.message);
            throw new Error(`Failed to update profile in database: ${updateError.message}`);
        }
        console.log('[Supabase Server Action] User table updated with new photo_url.');

        // 5. Delete old profile picture from Storage (if exists and path is different)
        if (oldFileKey && oldFileKey !== uploadData.path) {
            console.log(`[Supabase Server Action] Deleting old profile picture from Storage key: ${oldFileKey}`);
            const { error: deleteError } = await supabase.storage
                .from('profile-pictures')
                .remove([oldFileKey]); // remove takes an array of keys

            if (deleteError) {
                console.error("[Supabase Server Action Error] Failed to delete old profile picture from Storage:", deleteError.message);
                // Log deletion error but don't fail the whole operation
            } else {
                console.log("[Supabase Server Action] Old profile picture deleted successfully from Storage.");
            }
        }

        revalidatePath('/profile');

        return { success: true, photoURL: newPhotoURL };

    } catch (error: any) {
        console.error('[Supabase Server Action Error] Error updating profile picture:', error.message, error.stack);
        return { success: false, message: `Failed to update profile picture: ${error.message || 'Unknown error'}` };
    }
}
