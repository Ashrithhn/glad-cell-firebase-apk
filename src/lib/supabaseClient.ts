
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("🔴 Supabase Config Error: Supabase URL is MISSING.");
  console.error("🔴 Ensure 'NEXT_PUBLIC_SUPABASE_URL' is correctly set in your .env.local file.");
  console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
}

if (!supabaseAnonKey) {
  console.error("🔴 Supabase Config Error: Supabase Anon Key is MISSING.");
  console.error("🔴 Ensure 'NEXT_PUBLIC_SUPABASE_ANON_KEY' is correctly set in your .env.local file.");
  console.error("🔴 IMPORTANT: You MUST restart your Next.js server (npm run dev) after modifying .env.local.");
}

let supabaseInstance: SupabaseClient | null = null;
let supabaseInitializationError: Error | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client initialized successfully.");
  } catch (error) {
    supabaseInitializationError = error instanceof Error ? error : new Error(String(error));
    console.error(`🔴 Supabase client initialization failed: ${supabaseInitializationError.message}`);
  }
} else {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  supabaseInitializationError = new Error(`Supabase configuration is incomplete. Missing: ${missingVars.join(', ')}`);
  console.error(`🔴 Skipping Supabase client initialization due to missing configuration: ${supabaseInitializationError.message}`);
}


export const supabase = supabaseInstance;
export const supabaseError = supabaseInitializationError;
