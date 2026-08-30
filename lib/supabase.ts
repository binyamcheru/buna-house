import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clients are null when env vars are missing so `next build` (which evaluates route modules) doesn't crash.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set');
}

// Client-side Supabase client (safe for frontend)
// Uses anon key with Row Level Security (RLS) enforced
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Server-side Supabase client (for API routes only)
// Uses service role key - bypasses RLS, has admin access
// NEVER use this in client components
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;
