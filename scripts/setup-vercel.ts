#!/usr/bin/env bun
/**
 * Bootstrap Vercel env from .env via CLI.
 *
 * Steps:
 *   1. Link project (if not linked).
 *   2. For each KEY in `KEYS_TO_PUSH`, push the value from process.env to Vercel
 *      across the requested environments (production, preview, development).
 *
 * Usage:
 *   bun run scripts/setup-vercel.ts                # push to production + preview + dev
 *   bun run scripts/setup-vercel.ts --prod-only    # push to production only
 *   bun run scripts/setup-vercel.ts --link-only    # only link, skip env push
 */

import { spawn } from 'node:child_process';

type Result = { ok: boolean; stdout: string; stderr: string; code: number };

const KEYS_TO_PUSH = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_SITE_URL',
  'PUBLIC_SITE_NAME',
  'PIX_KEY',
  'PIX_MERCHANT_NAME',
  'PIX_MERCHANT_CITY',
  'PIX_BANK_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SENTRY_DSN',
] as const;

async function run(
  cmd: string,
  args: string[],
  opts: { input?: string } = {},
): Promise<Result> {
  return await new Promise<Result>((resolve) => {
    const child = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: process.env,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    child.stderr?.on('data', (d) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });
    if (opts.input !== undefined) {
      child.stdin?.write(opts.input);
      child.stdin?.end();
    } else {
      child.stdin?.end();
    }
    child.on('close', (code) => {
      resolve({ ok: code === 0, stdout, stderr, code: code ?? -1 });
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const linkOnly = args.includes('--link-only');
  const prodOnly = args.includes('--prod-only');

  const token = process.env.VERCEL_TOKEN;
  const tokenArgs = token ? ['--token', token] : [];

  // Link
  console.log('▸ Linking Vercel project (yes to all)…');
  const link = await run('bunx', ['vercel', 'link', '--yes', ...tokenArgs]);
  if (!link.ok) {
    console.warn('⚠ vercel link failed (might need interactive auth). Run `bunx vercel login` then re-run.');
  }

  if (linkOnly) {
    console.log('✓ Link-only mode finished.');
    return;
  }

  const targets = prodOnly ? ['production'] : ['production', 'preview', 'development'];

  for (const key of KEYS_TO_PUSH) {
    const value = process.env[key];
    if (!value || value.includes('placeholder')) {
      console.log(`▸ Skipping ${key} (empty or placeholder).`);
      continue;
    }
    for (const target of targets) {
      console.log(`▸ Pushing ${key} → ${target}…`);
      // `vercel env rm` is interactive y/n; pass `--yes`.
      await run('bunx', ['vercel', 'env', 'rm', key, target, '--yes', ...tokenArgs]);
      const add = await run(
        'bunx',
        ['vercel', 'env', 'add', key, target, ...tokenArgs],
        { input: value + '\n' },
      );
      if (!add.ok) {
        console.warn(`⚠ Failed to push ${key} → ${target}. Continue.`);
      }
    }
  }

  console.log('\n✓ Vercel env sync complete.');
}

await main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
