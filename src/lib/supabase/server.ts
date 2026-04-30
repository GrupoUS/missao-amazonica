/**
 * Supabase server client — per-request, cookie-based session via @supabase/ssr.
 * Use from Astro pages (.astro frontmatter), API routes, middleware.
 *
 * Honors RLS via the user's JWT. For elevated operations, use admin.ts.
 */

import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './types';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

type AstroLikeContext = {
  request: Request;
  cookies: AstroCookies;
};

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export function createSupabaseServer({ request, cookies }: AstroLikeContext) {
  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        const header = request.headers.get('Cookie') ?? '';
        const parsed = parseCookieHeader(header);
        return parsed.map(({ name, value }) => ({ name, value: value ?? '' }));
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            path: '/',
            sameSite: 'lax',
            httpOnly: true,
            secure: import.meta.env.PROD,
            ...options,
          });
        }
      },
    },
  });
}

export type ServerSupabase = ReturnType<typeof createSupabaseServer>;
