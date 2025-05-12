
'use server';

import { supabase, supabaseError } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Assuming your Supabase table for site content is named 'site_content'
// and has columns: 'id' (text, primary key, e.g., 'about', 'contact'), 'content_data' (jsonb), 'updated_at' (timestamptz)

export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
}

export interface SiteLinks {
  whatsappCommunity: string;
}

type ContentData = string | ContactInfo | SiteLinks;

/**
 * Fetches a specific content block from the 'site_content' table.
 */
export async function getContent(contentId: string): Promise<{ success: boolean; data?: ContentData; message?: string }> {
    console.log(`[Supabase Service - Content] getContent invoked for ID: ${contentId}`);

    if (supabaseError || !supabase) {
        const errorMessage = `Content service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Service Error - Content] getContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!contentId) {
        return { success: false, message: 'Content ID is required.' };
    }

    try {
        const { data: contentEntry, error } = await supabase
            .from('site_content') // Ensure this table exists in Supabase
            .select('content_data') // Select the JSONB column
            .eq('id', contentId)
            .single(); // Expects a single row or null

        if (error && error.code !== 'PGRST116') { // PGRST116: "Searched item was not found"
            console.error(`[Supabase Service Error - Content] Error fetching content for ID ${contentId}:`, error.message);
            throw error;
        }

        if (contentEntry) {
            console.log(`[Supabase Service - Content] Content found for ID: ${contentId}`);
            return { success: true, data: contentEntry.content_data as ContentData };
        } else {
            console.log(`[Supabase Service - Content] No content found for ID: ${contentId}. Returning default or undefined.`);
            if (contentId === 'contact') {
                 return { success: true, data: { address: 'GECM hassan', email: 'gladcell2019@gmail.com', phone: '7625026715, 8073682882, 9483901788' } as ContactInfo };
            }
            if (contentId === 'links') {
                return { success: true, data: { whatsappCommunity: '' } as SiteLinks };
            }
            // For 'about', 'privacy-policy', 'terms-and-conditions', return a default string if not found
            if (['about', 'privacy-policy', 'terms-and-conditions'].includes(contentId)) {
                 return { success: true, data: `Default content for ${contentId}. Please update via admin panel.` };
            }
            return { success: true, data: undefined };
        }
    } catch (error: any) {
        console.error(`[Supabase Service Error - Content] Catch block error fetching content for ID ${contentId}:`, error.message, error.stack);
        return { success: false, message: `Failed to fetch content: ${error.message || 'Unknown database error'}` };
    }
}

/**
 * Updates or creates a specific content block in the 'site_content' table.
 * Requires admin privileges (TODO: implement check via RLS policies in Supabase).
 */
export async function updateContent(contentId: string, data: ContentData): Promise<{ success: boolean; message?: string }> {
    console.log(`[Supabase Service - Content] updateContent invoked for ID: ${contentId}`);

     if (supabaseError || !supabase) {
        const errorMessage = `Content service unavailable: Supabase client error - ${supabaseError?.message || 'Client not initialized'}.`;
        console.error(`[Supabase Service Error - Content] updateContent: ${errorMessage}`);
        return { success: false, message: errorMessage };
    }

    if (!contentId) {
        return { success: false, message: 'Content ID is required.' };
    }
    if (data === undefined || data === null) {
         return { success: false, message: 'Content data cannot be empty.' };
    }

    try {
        // Upsert operation: update if exists, insert if not.
        // The 'id' column should be unique.
        const { error } = await supabase
            .from('site_content')
            .upsert({
                id: contentId,
                content_data: data, // Store the actual data in the jsonb column
                updated_at: new Date().toISOString(), // Supabase uses ISO strings for timestamps
            }, { onConflict: 'id' }); // Specify conflict resolution on 'id' column

        if (error) {
            console.error(`[Supabase Service Error - Content] Error updating content for ID ${contentId}:`, error.message);
            throw error;
        }

        console.log(`[Supabase Service - Content] Content updated successfully for ID: ${contentId}`);

        // Revalidate paths
        const pathsToRevalidate: Record<string, string[]> = {
            'about': ['/about', '/admin/content/about'],
            'contact': ['/contact', '/admin/content/contact'],
            'links': ['/', '/admin/content/links'], // Revalidate home for sidebar
            'privacy-policy': ['/privacy-policy', '/admin/content/privacy'],
            'terms-and-conditions': ['/terms-and-conditions', '/admin/content/terms'],
        };

        if (pathsToRevalidate[contentId]) {
            pathsToRevalidate[contentId].forEach(path => revalidatePath(path));
        } else {
            revalidatePath('/'); // Default revalidation
        }

        return { success: true };

    } catch (error: any) {
        console.error(`[Supabase Service Error - Content] Catch block error updating content for ID ${contentId}:`, error.message, error.stack);
        return { success: false, message: `Could not update content: ${error.message || 'Unknown database error'}` };
    }
}
