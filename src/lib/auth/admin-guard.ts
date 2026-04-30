import type { APIContext, AstroGlobal } from 'astro';

type GuardCtx = Pick<APIContext, 'locals' | 'redirect' | 'request'> | AstroGlobal;

/**
 * SSR helper — call at the top of admin .astro pages or admin API routes.
 * Returns { user } when authorized; otherwise returns a Response/redirect to /admin/login.
 *
 * Defense-in-depth alongside src/middleware.ts.
 */
export async function requireAdmin(ctx: GuardCtx): Promise<
  | { ok: true; user: NonNullable<App.Locals['user']> }
  | { ok: false; response: Response }
> {
  const { locals, redirect } = ctx as APIContext;
  const user = locals?.user ?? null;
  const isAdmin = locals?.isAdmin ?? false;

  if (!user) {
    return { ok: false, response: redirect('/admin/login', 302) };
  }
  if (!isAdmin) {
    return {
      ok: false,
      response: redirect('/admin/login?error=not_admin', 302),
    };
  }
  return { ok: true, user };
}
