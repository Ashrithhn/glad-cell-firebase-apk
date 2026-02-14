import { createClient, SupabaseClient } from '@supabase/supabase-js';

// This client is for server-side use only with elevated privileges.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdminInstance: SupabaseClient | null = null;
let supabaseAdminInitializationError: Error | null = null;

if (!supabaseUrl) {
  const msg = "🔴 Supabase Admin Config Error: Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is MISSING.";
  console.error(msg);
  if (!supabaseAdminInitializationError) supabaseAdminInitializationError = new Error(msg);
}

if (!supabaseServiceRoleKey) {
  const msg = "🔴 Supabase Admin Config Error: Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY) is MISSING. This key is required for admin-level server actions.";
  console.error(msg);
  if (!supabaseAdminInitializationError) supabaseAdminInitializationError = new Error(msg);
}

if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    // Initialize the admin client with the service_role key
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    supabaseAdminInitializationError = error instanceof Error ? error : new Error(String(error));
    console.error(`🔴 Supabase Admin Client Initialization Error: ${supabaseAdminInitializationError.message}`);
    supabaseAdminInstance = null;
  }
} else {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  const errorMsg = `Supabase admin configuration is incomplete. Missing: ${missingVars.join(', ')}. Admin client will not be initialized.`;
  if (!supabaseAdminInitializationError) {
      supabaseAdminInitializationError = new Error(errorMsg);
  }
  console.error(`🔴 ${errorMsg}`);
  supabaseAdminInstance = null;
}

export const supabaseAdmin = supabaseAdminInstance;
