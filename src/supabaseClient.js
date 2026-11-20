import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Exports the Supabase Client if keys are present, or null for fallback mode.
export const supabase = (supabaseUrl.trim() && supabaseAnonKey.trim())
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to determine if we are running in active Supabase backend mode
export const isSupabaseConfigured = () => {
  return supabase !== null;
};
