#!/usr/bin/env bun
/**
 * Configure Supabase Auth via Management API.
 *
 * Sets:
 *   - site_url  → PUBLIC_SITE_URL
 *   - uri_allow_list → production + preview pattern + localhost
 *   - mailer_subjects.recovery / mailer_templates.recovery (optional, only if RESEND_FROM_EMAIL set)
 *
 * Requires SUPABASE_ACCESS_TOKEN (Personal Access Token from
 * https://supabase.com/dashboard/account/tokens).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx bun run scripts/setup-supabase-auth.ts
 */

const PROJECT_REF = 'tlhcklvmeyxkorwuuzfg';
const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://missaoamazonica.org';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN.');
  console.error('Get one at: https://supabase.com/dashboard/account/tokens');
  console.error('Then re-run: SUPABASE_ACCESS_TOKEN=sbp_xxx bun run scripts/setup-supabase-auth.ts');
  process.exit(1);
}

const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const allowList = [
  `${SITE_URL}/admin/redefinir-senha`,
  `${SITE_URL}/admin/login`,
  `${SITE_URL}/admin`,
  // preview deployments
  'https://missao-amazonica-*.vercel.app/admin/redefinir-senha',
  'https://missao-amazonica-*.vercel.app/admin/login',
  'https://missao-amazonica-*.vercel.app/admin',
  // local dev
  'http://localhost:4321/admin/redefinir-senha',
  'http://localhost:4321/admin/login',
  'http://localhost:4321/admin',
].join(',');

const body = {
  site_url: SITE_URL,
  uri_allow_list: allowList,
  // Reasonable security defaults for an admin-only auth surface
  password_min_length: 8,
  jwt_exp: 3600, // 1h
};

console.log(`▸ Configuring Auth on project ${PROJECT_REF}…`);
console.log(`  site_url       = ${SITE_URL}`);
console.log(`  uri_allow_list = ${allowList.split(',').length} entries`);
console.log(`  password_min   = 8`);
console.log(`  jwt_exp        = 3600s`);

const res = await fetch(API, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`✗ Auth config failed (HTTP ${res.status})`);
  console.error(text);
  process.exit(1);
}

console.log('✓ Supabase Auth configured.');
console.log('');
console.log('Next manual steps in dashboard:');
console.log('  1. SMTP — Auth → SMTP Settings: configure Resend or your provider');
console.log('     - Host: smtp.resend.com  Port: 465  User: resend  Pass: <RESEND_API_KEY>');
console.log('     - Sender email: same as RESEND_FROM_EMAIL in .env');
console.log('  2. Email template — Auth → Email Templates → Reset Password');
console.log('     Adjust copy + branding if desired (default works).');
