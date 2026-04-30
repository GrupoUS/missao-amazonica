/**
 * Supabase service-role client — SERVER ONLY.
 *
 * Throws at import time if reached from a browser context.
 * Use only inside:
 *   - /api/webhooks/**
 *   - admin-action endpoints invoking confirm_donation()
 *   - middleware that needs to read RLS-bypassing data (rare)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseUrl } from './env';

if (typeof window !== 'undefined') {
  throw new Error(
    '[supabase/admin] Service-role client cannot be imported in a browser context.',
  );
}

const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  if (!SERVICE_ROLE_KEY || url.includes('localhost')) {
    throw new Error(
      '[supabase/admin] Missing SUPABASE_SERVICE_ROLE_KEY or unable to resolve project URL.',
    );
  }
  if (!adminClient) {
    adminClient = createClient<Database>(url, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-application-name': 'missao-amazonica-admin',
        },
      },
    });
  }
  return adminClient;
}
