import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const DEFAULT_SUPABASE_URL = "https://lyftfxlqngubskjqsbue.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnRmeGxxbmd1YnNranFzYnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjQ3NzQsImV4cCI6MjEwMzM0MDc3NH0.71W7a5oQnm5OrtouUjeo2lZ5yArRpC8eaDhzXTYpRJw";

const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.['VITE_SUPABASE_URL']) ||
  (typeof process !== "undefined"
    ? process.env?.['SUPABASE_URL'] || process.env?.['VITE_SUPABASE_URL']
    : undefined) ||
  DEFAULT_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.['VITE_SUPABASE_PUBLISHABLE_KEY'] || import.meta.env?.['VITE_SUPABASE_ANON_KEY'])) ||
  (typeof process !== "undefined"
    ? process.env?.['SUPABASE_PUBLISHABLE_KEY'] ||
      process.env?.['SUPABASE_ANON_KEY'] ||
      process.env?.['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
      process.env?.['VITE_SUPABASE_ANON_KEY']
    : undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const DEFAULT_SUPABASE_ANON_KEY = DEFAULT_SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_URL_VALUE = SUPABASE_URL;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});