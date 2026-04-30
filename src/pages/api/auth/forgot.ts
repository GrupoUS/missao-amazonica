import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createHmac } from 'node:crypto';
import { logError, logInfo } from '@/lib/monitoring/logger';

export const prerender = false;

const ForgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RAW_SITE_URL = import.meta.env.PUBLIC_SITE_URL || '';
const IS_PROD = import.meta.env.PROD;
const PEPPER = import.meta.env.EMAIL_HASH_PEPPER || 'sal-da-terra-pepper-fallback';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function ok() {
  return Response.json({ ok: true }, { headers: NO_STORE });
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  // Derive redirect from request origin when PUBLIC_SITE_URL is missing in prod —
  // never let recovery emails ship localhost links to deployed environments.
  const siteUrl = RAW_SITE_URL && !RAW_SITE_URL.includes('localhost')
    ? RAW_SITE_URL
    : (IS_PROD ? `${url.protocol}//${url.host}` : 'http://localhost:4321');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Anti-enumeration: still return ok so attacker cannot probe shape.
    return ok();
  }

  const parsed = ForgotSchema.safeParse(body);
  if (!parsed.success) {
    return ok();
  }

  const { email } = parsed.data;

  try {
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/redefinir-senha`,
    });
    if (error) {
      logError(error, { route: 'api/auth/forgot' });
    } else {
      logInfo('admin_password_reset_requested', { email_hash: hashEmail(email) });
    }
  } catch (err) {
    logError(err, { route: 'api/auth/forgot' });
  }

  // Anti-enumeration: always 200 regardless of outcome.
  // Per-email rate limit enforced upstream by Supabase Auth (default 1/min/email
  // on resetPasswordForEmail). For per-IP edge-level limiter, add Vercel KV /
  // Upstash store if abuse is observed.
  return ok();
};

function hashEmail(email: string): string {
  return createHmac('sha256', PEPPER).update(email).digest('hex').slice(0, 16);
}
