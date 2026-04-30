#!/usr/bin/env bun
/**
 * Bootstrap Supabase via CLI using credentials from .env.
 * Bun loads .env automatically when running `bun run scripts/setup-supabase.ts`.
 *
 * Steps:
 *   1. Extract project ref from PUBLIC_SUPABASE_URL.
 *   2. Login (uses SUPABASE_ACCESS_TOKEN if present, otherwise opens browser).
 *   3. Link project.
 *   4. Push migrations.
 *   5. Apply seed (optional via --seed flag).
 *   6. Generate TypeScript types.
 */

import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

type Result = { ok: boolean; stdout: string; stderr: string; code: number };

async function run(cmd: string, args: string[], opts: { input?: string; env?: Record<string, string> } = {}): Promise<Result> {
  return await new Promise<Result>((resolve) => {
    const child = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: { ...process.env, ...(opts.env ?? {}) },
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
    if (opts.input) {
      child.stdin?.write(opts.input);
      child.stdin?.end();
    }
    child.on('close', (code) => {
      resolve({ ok: code === 0, stdout, stderr, code: code ?? -1 });
    });
  });
}

function extractProjectRef(url: string): string | null {
  // https://<ref>.supabase.co  →  <ref>
  const match = url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

async function main() {
  const args = process.argv.slice(2);
  const skipSeed = args.includes('--no-seed');
  const skipPush = args.includes('--no-push');

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error('✗ PUBLIC_SUPABASE_URL is missing or still a placeholder. Edit .env first.');
    process.exit(1);
  }

  const projectRef = extractProjectRef(supabaseUrl);
  if (!projectRef) {
    console.error(`✗ Could not extract project ref from PUBLIC_SUPABASE_URL=${supabaseUrl}`);
    process.exit(1);
  }
  console.log(`▸ Project ref: ${projectRef}`);

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  // Login
  if (accessToken) {
    console.log('▸ Logging in via SUPABASE_ACCESS_TOKEN…');
    const r = await run('bunx', ['supabase', 'login', '--token', accessToken]);
    if (!r.ok) {
      console.error('✗ supabase login failed.');
      process.exit(r.code);
    }
  } else {
    console.log('▸ No SUPABASE_ACCESS_TOKEN. Run `bunx supabase login` manually first if needed.');
  }

  // Link
  console.log(`▸ Linking project ${projectRef}…`);
  const linkArgs = ['supabase', 'link', '--project-ref', projectRef];
  if (dbPassword) linkArgs.push('-p', dbPassword);
  const linkResult = await run('bunx', linkArgs);
  if (!linkResult.ok) {
    console.error('✗ supabase link failed. If interactive password prompt blocked, set SUPABASE_DB_PASSWORD in .env.');
    process.exit(linkResult.code);
  }

  // Push migrations
  if (!skipPush) {
    console.log('▸ Pushing migrations…');
    await wait(500);
    const pushArgs = ['supabase', 'db', 'push'];
    if (dbPassword) pushArgs.push('-p', dbPassword);
    pushArgs.push('--include-all');
    const pushResult = await run('bunx', pushArgs);
    if (!pushResult.ok) {
      console.error('✗ supabase db push failed.');
      process.exit(pushResult.code);
    }
  }

  // Apply seed (idempotent)
  if (!skipSeed) {
    console.log('▸ Applying seed.sql…');
    const seedArgs = ['supabase', 'db', 'execute', '--file', 'supabase/seed.sql'];
    if (dbPassword) seedArgs.push('-p', dbPassword);
    const seedResult = await run('bunx', seedArgs);
    if (!seedResult.ok) {
      console.warn('⚠ Seed apply via execute failed. Falling back to db reset --linked --seed (DESTRUCTIVE — skipped). Run manually if needed.');
    }
  }

  // Generate types
  console.log('▸ Generating TypeScript types…');
  const types = await run('bunx', ['supabase', 'gen', 'types', 'typescript', '--linked']);
  if (types.ok) {
    await Bun.write('src/lib/supabase/types.ts', types.stdout);
    console.log('✓ src/lib/supabase/types.ts updated.');
  } else {
    console.warn('⚠ gen types failed; keeping hand-rolled types.');
  }

  console.log('\n✓ Supabase setup complete.');
}

await main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
