
'use server';

<<<<<<< HEAD
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { EventData } from './events'; // Using the Supabase-compatible EventData type

const EVENTS_BUCKET = 'event-images';
const EVENT_RULES_PDF_BUCKET = 'event-rules-pdfs'; // Bucket for PDF rules

// Input type for adding an event
export interface AddEventInput {
  name: string;
  description: string;
  venue: string;
  rules?: string | null;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  registration_deadline?: string | null; // Optional ISO string
  event_type: 'individual' | 'group';
  min_team_size?: number | null;
  max_team_size?: number | null;
  fee: number; // Fee in Paisa
  imageDataUri?: string | null; // For event image
  rulesPdfDataUri?: string | null; // For rules PDF
}

// Admin-specific Supabase client using the service_role key
let adminSupabase: SupabaseClient | null = null;
let adminSupabaseError: string | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  adminSupabaseError = 'Supabase URL or Service Role Key is missing for admin actions. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local. Admin actions will fail.';
  console.error(`🔴 [CRITICAL ADMIN SERVICE ERROR] Initialization failed: ${adminSupabaseError}`);
} else {
  try {
    adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    if (adminSupabase) {
        console.log('✅ [Admin Service] Supabase client for admin actions initialized successfully with service_role key.');
    } else {
        throw new Error("createClient returned null for adminSupabase unexpectedly.");
    }
  } catch (e: any) {
    adminSupabaseError = `Failed to create admin Supabase client: ${e.message}`;
    console.error(`🔴 [CRITICAL ADMIN SERVICE ERROR] Client creation failed: ${adminSupabaseError}`);
    adminSupabase = null;
  }
}

/**
 * Adds a new event to the 'events' table and uploads image/PDF to Supabase Storage.
 * Uses admin client with service_role key to bypass RLS.
 */
export async function addEvent(eventData: AddEventInput): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Supabase Admin Service - Service Role] addEvent invoked.');
=======
import { collection, addDoc, serverTimestamp, Timestamp, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, initializationError } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export interface EventData {
    id?: string; 
    name: string;
    description: string;
    venue: string; 
    rules?: string;
    startDate: Timestamp | string; 
    endDate: Timestamp | string;   
    registrationDeadline?: Timestamp | string | null; 
    eventType: 'individual' | 'group';
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    fee: number; 
    imageUrl?: string; // Added imageUrl
    createdAt?: Timestamp | string; 
}

export interface UserProfileData {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  branch?: string | null;
  semester?: number | string | null;
  registrationNumber?: string | null;
  collegeName?: string | null;
  city?: string | null;
  pincode?: string | null;
  createdAt?: Timestamp | string | null; 
  authProvider?: string | null;
  emailVerified?: boolean | null;
  // Add other fields from your Firestore 'users' collection
}


export async function addEvent(eventData: Omit<EventData, 'id' | 'createdAt' | 'startDate' | 'endDate' | 'registrationDeadline'> & { startDate: string, endDate: string, registrationDeadline?: string, imageFile?: string }): Promise<{ success: boolean; eventId?: string; message?: string }> {
  console.log('[Server Action - Admin] addEvent invoked.');
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

  if (adminSupabaseError || !adminSupabase) {
    const errorMessage = `Admin service unavailable: ${adminSupabaseError || 'Admin Supabase client not initialized due to missing/invalid SERVICE_ROLE_KEY or URL.'}.`;
    console.error(`[Admin Service Error - addEvent]: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

<<<<<<< HEAD
  try {
    let imageUrl: string | null = null;
    let imageStoragePath: string | null = null;
    let rulesPdfUrl: string | null = null;
    let rulesPdfStoragePath: string | null = null;

    // Handle Image Upload
    if (eventData.imageDataUri && eventData.imageDataUri.startsWith('data:image/')) {
        const fetchRes = await fetch(eventData.imageDataUri);
        const blob = await fetchRes.blob();
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.${extension}`;

        const { data: uploadData, error: uploadError } = await adminSupabase.storage
          .from(EVENTS_BUCKET)
          .upload(storagePath, blob, { contentType: mimeType, upsert: false });

        if (uploadError) throw new Error(`Event image upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = adminSupabase.storage.from(EVENTS_BUCKET).getPublicUrl(uploadData.path);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL for event image.');
        
        imageUrl = publicUrlData.publicUrl;
        imageStoragePath = uploadData.path;
        console.log('[Supabase Admin Service - Service Role] Event image uploaded to:', imageStoragePath);
    }

    // Handle PDF Rules Upload
    if (eventData.rulesPdfDataUri && eventData.rulesPdfDataUri.startsWith('data:application/pdf')) {
        const fetchRes = await fetch(eventData.rulesPdfDataUri);
        const blob = await fetchRes.blob();
        const uniqueId = crypto.randomUUID();
        const storagePath = `public/${uniqueId}.pdf`;

        const { data: pdfUploadData, error: pdfUploadError } = await adminSupabase.storage
            .from(EVENT_RULES_PDF_BUCKET) // Use the new bucket
            .upload(storagePath, blob, { contentType: 'application/pdf', upsert: false });

        if (pdfUploadError) throw new Error(`Rules PDF upload failed: ${pdfUploadError.message}`);

        const { data: pdfPublicUrlData } = adminSupabase.storage.from(EVENT_RULES_PDF_BUCKET).getPublicUrl(pdfUploadData.path);
        if (!pdfPublicUrlData?.publicUrl) throw new Error('Failed to get public URL for rules PDF.');
        
        rulesPdfUrl = pdfPublicUrlData.publicUrl;
        rulesPdfStoragePath = pdfUploadData.path;
        console.log('[Supabase Admin Service - Service Role] Rules PDF uploaded to:', rulesPdfStoragePath);
    }


    const docDataToInsert: Omit<EventData, 'id' | 'created_at'> = {
      name: eventData.name,
      description: eventData.description,
      venue: eventData.venue,
      rules: eventData.rules,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      registration_deadline: eventData.registration_deadline,
      event_type: eventData.event_type,
      min_team_size: eventData.event_type === 'group' ? eventData.min_team_size : null,
      max_team_size: eventData.event_type === 'group' ? eventData.max_team_size : null,
      fee: eventData.fee,
      image_url: imageUrl,
      image_storage_path: imageStoragePath,
      rules_pdf_url: rulesPdfUrl,
      rules_pdf_storage_path: rulesPdfStoragePath,
    };

    const { data: newEvent, error: insertError } = await adminSupabase
      .from('events')
      .insert(docDataToInsert)
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!newEvent?.id) throw new Error('Event created but ID not returned.');

    console.log('[Supabase Admin Service - Service Role] Event added successfully to table with ID:', newEvent.id);

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');
=======
  console.log('[Server Action - Admin] Attempting to add item to Firestore:', eventData.name);

  let imageUrl: string | undefined = undefined;

  try {
    if (eventData.imageFile) {
      const storage = getStorage();
      // Expected format for imageFile (data URI): 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQA...'
      if (!eventData.imageFile.startsWith('data:image/')) {
        throw new Error('Invalid image data format. Expected Data URI.');
      }
      const mimeType = eventData.imageFile.substring(eventData.imageFile.indexOf(':') + 1, eventData.imageFile.indexOf(';'));
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `event_images/${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`;
      const imageStorageRef = storageRef(storage, fileName);
      
      const uploadResult = await uploadString(imageStorageRef, eventData.imageFile, 'data_url');
      imageUrl = await getDownloadURL(uploadResult.ref);
      console.log('[Server Action - Admin] Event image uploaded to:', imageUrl);
    }

    const docData: Omit<EventData, 'id'> = {
        name: eventData.name,
        description: eventData.description,
        venue: eventData.venue,
        rules: eventData.rules,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        registrationDeadline: eventData.registrationDeadline ? Timestamp.fromDate(new Date(eventData.registrationDeadline)) : null,
        eventType: eventData.eventType,
        minTeamSize: eventData.eventType === 'group' ? eventData.minTeamSize : null,
        maxTeamSize: eventData.eventType === 'group' ? eventData.maxTeamSize : null,
        fee: Math.round(eventData.fee * 100), 
        imageUrl: imageUrl, // Add the image URL
        createdAt: serverTimestamp() as Timestamp,
    };

    if (!docData.rules) delete docData.rules;
    if (docData.minTeamSize === undefined) delete docData.minTeamSize;
    if (docData.maxTeamSize === undefined) delete docData.maxTeamSize;

    const docRef = await addDoc(collection(db, 'events'), docData);
    console.log('[Server Action - Admin] Item added successfully to Firestore with ID:', docRef.id);

    revalidatePath('/admin/events');
    revalidatePath('/programs'); 
    revalidatePath('/'); 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

    return { success: true, eventId: newEvent.id };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error - Service Role] Error adding event:', error.message, error.stack);
    let detailedMessage = `Could not add event: ${error.message || 'Unknown error'}`;
    return { success: false, message: detailedMessage };
  }
}

<<<<<<< HEAD
/**
 * Deletes an event from the 'events' table and its associated image/PDF from Supabase Storage.
 * Uses admin client with service_role key to bypass RLS.
 */
=======

>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
export async function deleteEvent(eventId: string): Promise<{ success: boolean; message?: string }> {
  console.log('[Supabase Admin Service - Service Role] deleteEvent invoked for ID:', eventId);

  if (adminSupabaseError || !adminSupabase) {
    const errorMessage = `Admin service unavailable: ${adminSupabaseError || 'Admin Supabase client not initialized.'}.`;
    console.error(`[Admin Service Error - deleteEvent]: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
<<<<<<< HEAD
  if (!eventId) return { success: false, message: 'Event ID is required for deletion.' };

  try {
    const { data: eventToDelete, error: fetchError } = await adminSupabase
      .from('events')
      .select('image_storage_path, rules_pdf_storage_path')
      .eq('id', eventId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const { error: deleteDbError } = await adminSupabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteDbError) throw deleteDbError;
    console.log('[Supabase Admin Service - Service Role] Event metadata deleted successfully from table:', eventId);

    if (eventToDelete?.image_storage_path) {
      const { error: storageError } = await adminSupabase.storage
        .from(EVENTS_BUCKET)
        .remove([eventToDelete.image_storage_path]);
      if (storageError) console.warn(`[Supabase Admin Service] Error deleting image ${eventToDelete.image_storage_path}:`, storageError.message);
      else console.log(`[Supabase Admin Service] Image ${eventToDelete.image_storage_path} deleted.`);
    }
    
    if (eventToDelete?.rules_pdf_storage_path) {
      const { error: pdfStorageError } = await adminSupabase.storage
        .from(EVENT_RULES_PDF_BUCKET)
        .remove([eventToDelete.rules_pdf_storage_path]);
      if (pdfStorageError) console.warn(`[Supabase Admin Service] Error deleting PDF ${eventToDelete.rules_pdf_storage_path}:`, pdfStorageError.message);
      else console.log(`[Supabase Admin Service] PDF ${eventToDelete.rules_pdf_storage_path} deleted.`);
    }

    revalidatePath('/admin/events');
    revalidatePath('/programs');
    revalidatePath('/');
=======

   if (!eventId) {
       return { success: false, message: 'Event ID is required for deletion.' };
   }

  console.log('[Server Action - Admin] Attempting to delete item from Firestore:', eventId);

  try {
    const eventDocRef = doc(db, 'events', eventId);
    // Optionally, delete associated image from Storage if imageUrl exists
    const eventDoc = await getDocs(query(collection(db, 'events'), where('__name__', '==', eventId))); // Fetch doc to get imageUrl
    if (!eventDoc.empty) {
      const eventData = eventDoc.docs[0].data() as EventData;
      if (eventData.imageUrl) {
        try {
          const imageStorageRef = storageRef(getStorage(), eventData.imageUrl);
          await deleteObject(imageStorageRef);
          console.log('[Server Action - Admin] Associated event image deleted from Storage.');
        } catch (imgError: any) {
          console.error('[Server Action Error - Admin] Failed to delete event image from Storage:', imgError.message);
          // Continue with Firestore deletion even if image deletion fails, but log error.
        }
      }
    }
    
    await deleteDoc(eventDocRef);
    console.log('[Server Action - Admin] Item deleted successfully from Firestore:', eventId);

    revalidatePath('/admin/events');
    revalidatePath('/programs'); 
    revalidatePath('/'); 
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

    return { success: true, message: 'Event and associated files deleted successfully.' };

  } catch (error: any) {
    console.error('[Supabase Admin Service Error - Service Role] Error deleting event:', error.message, error.stack);
    return { success: false, message: `Could not delete event: ${error.message || 'Unknown error'}` };
  }
}
<<<<<<< HEAD
=======

/**
 * Fetches all user profiles from the 'users' collection in Firestore.
 */
export async function getUsers(): Promise<{ success: boolean; users?: UserProfileData[]; message?: string }> {
  console.log('[Server Action - Admin] getUsers invoked.');

  if (initializationError) {
      const errorMessage = `Admin service unavailable: Firebase initialization error - ${initializationError.message}.`;
      console.error(`[Server Action Error - Admin] getUsers: ${errorMessage}`);
      return { success: false, message: errorMessage };
  }
  if (!db) {
    const errorMessage = 'Admin service unavailable: Firestore service instance missing.';
    console.error(`[Server Action Error - Admin] getUsers: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }

  try {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc')); // Order by creation date
    const querySnapshot = await getDocs(usersQuery);

    const users: UserProfileData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Timestamps to ISO strings
      const convertTimestamp = (timestamp: Timestamp | string | null | undefined): string | null => {
           if (timestamp instanceof Timestamp) {
              return timestamp.toDate().toISOString();
           }
           return typeof timestamp === 'string' ? timestamp : null;
      }
      users.push({
        uid: doc.id, // Use doc.id as uid, assuming uid is the document ID
        ...data,
        createdAt: convertTimestamp(data.createdAt),
      } as UserProfileData);
    });

    console.log(`[Server Action - Admin] getUsers: Fetched ${users.length} users.`);
    return { success: true, users };

  } catch (error: any)    {
    console.error('[Server Action Error - Admin] Error fetching users from Firestore:', error.code, error.message, error.stack);
    return { success: false, message: `Could not fetch users due to a database error: ${error.message || 'Unknown error'}` };
  }
}
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
