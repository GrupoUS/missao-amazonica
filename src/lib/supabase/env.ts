/**
 * Resolve Supabase URL from PUBLIC_SUPABASE_URL or, as a fallback, from the
 * anon-key JWT's `ref` claim.
 *
 * Centralized so the rest of the codebase can rely on getSupabaseUrl().
 */

function decodeJwtRef(jwt: string | undefined): string | null {
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const obj = JSON.parse(decoded) as { ref?: string };
    return typeof obj.ref === 'string' ? obj.ref : null;
  } catch {
    return null;
  }
}

export function getSupabaseUrl(): string {
  const explicit = import.meta.env.PUBLIC_SUPABASE_URL;
  if (explicit && !explicit.includes('placeholder')) return explicit;

  const ref = decodeJwtRef(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
  if (ref) return `https://${ref}.supabase.co`;

  return 'http://localhost:54321';
}

export function getSupabaseAnonKey(): string {
  return import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? 'public-anon-placeholder';
}
