import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Official Bhoomiputra Foundation & MatsyaMart Supabase credentials
const DEFAULT_SUPABASE_URL = "https://kxxdfjkhwyfmpegyjgcr.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_G4bBn-YynQBCspBoC9tRrA_4cPb_uq7";

const getEnv = (key: string): string => {
  if (typeof process !== "undefined" && process?.env?.[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key] as string;
  }
  return "";
};

const supabaseUrl =
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("SUPABASE_URL") ||
  DEFAULT_SUPABASE_URL;

const supabaseKey =
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_ANON_KEY") ||
  DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
