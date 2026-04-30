/**
 * Supabase browser client — for React island components only.
 * Uses anon key. RLS enforces auth.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowser() {
  if (cached) return cached;
  cached = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return cached;
}
