import type { APIRoute } from 'astro';
import { z } from 'zod';
import { logError, logInfo } from '@/lib/monitoring/logger';

export const prerender = false;

const ForgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RAW_SITE_URL = import.meta.env.PUBLIC_SITE_URL || '';
const IS_PROD = import.meta.env.PROD;

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
    return Response.json({ ok: true });
  }

  const parsed = ForgotSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: true });
  }

  const { email } = parsed.data;

  try {
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/redefinir-senha`,
    });
    if (error) {
      logError(error, { route: 'api/admin/auth/forgot' });
    } else {
      logInfo('admin_password_reset_requested', { email_hash: hashEmail(email) });
    }
  } catch (err) {
    logError(err, { route: 'api/admin/auth/forgot' });
  }

  // Anti-enumeration: always 200 regardless of outcome.
  return Response.json({ ok: true });
};

function hashEmail(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  return String(h >>> 0).padStart(10, '0');
}
