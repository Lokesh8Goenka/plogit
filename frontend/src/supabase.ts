import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public client config — safe to ship in the frontend (protected by RLS).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once the project is configured; the app can run offline without it. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
