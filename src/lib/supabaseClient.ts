
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Correctly use NEXT_PUBLIC_ prefixed environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;
let supabaseInitializationError: Error | null = null;

console.log("--- Supabase Config Loading ---");

if (!supabaseUrl) {
  const msg = "🔴 Supabase Config Error: Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is MISSING.";
  console.error(msg);
  if (!supabaseInitializationError) supabaseInitializationError = new Error(msg);
} else {
  console.log("✅ Supabase Config: NEXT_PUBLIC_SUPABASE_URL found.");
}

if (!supabaseAnonKey) {
  const msg = "🔴 Supabase Config Error: Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is MISSING.";
  console.error(msg);
  if (!supabaseInitializationError) supabaseInitializationError = new Error(msg);
} else {
  console.log("✅ Supabase Config: NEXT_PUBLIC_SUPABASE_ANON_KEY found.");
}

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client initialized successfully.");
  } catch (error) {
    supabaseInitializationError = error instanceof Error ? error : new Error(String(error));
    console.error(`🔴 Supabase client initialization failed: ${supabaseInitializationError.message}`);
    supabaseInstance = null; // Ensure instance is null on error
  }
} else {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const errorMsg = `Supabase configuration is incomplete. Missing: ${missingVars.join(', ')}. Client will not be initialized.`;
  console.error(`🔴 ${errorMsg}`);
  if (!supabaseInitializationError) { // Set error if not already set by more specific checks
      supabaseInitializationError = new Error(errorMsg);
  }
  supabaseInstance = null; // Ensure instance is null if config is missing
}

console.log("--- Supabase Config Finished ---");

export const supabase = supabaseInstance;
export const supabaseError = supabaseInitializationError;
