import type { MiddlewareHandler } from 'astro';
import { defineMiddleware, sequence } from 'astro:middleware';
import { createSupabaseServer } from '@/lib/supabase/server';

/**
 * Hydrates Supabase session into Astro.locals on every request.
 * Guards /admin/** routes (except /admin/login) requiring authenticated admin.
 */
const supabaseSessionMiddleware: MiddlewareHandler = async (context, next) => {
  const supabase = createSupabaseServer({
    request: context.request,
    cookies: context.cookies,
  });

  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  context.locals.user = user;

  if (user) {
    try {
      // @ts-expect-error — @supabase/ssr generics on rpc args don't propagate cleanly across versions; the function is real and validated by RLS.
      const { data: isAdminData } = await supabase.rpc('is_admin', { uid: user.id });
      context.locals.isAdmin = Boolean(isAdminData);
    } catch {
      context.locals.isAdmin = false;
    }
  } else {
    context.locals.isAdmin = false;
  }

  return next();
};

const adminGuardMiddleware: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    return next();
  }
  // Public admin entry points (auth flow surfaces — recovery uses code-exchange,
  // not pre-existing session)
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/logout' ||
    pathname === '/admin/redefinir-senha'
  ) {
    return next();
  }

  if (!context.locals.user) {
    return context.redirect('/admin/login', 302);
  }
  if (!context.locals.isAdmin) {
    return context.redirect('/admin/login?error=not_admin', 302);
  }
  return next();
};

export const onRequest = sequence(
  defineMiddleware(supabaseSessionMiddleware),
  defineMiddleware(adminGuardMiddleware),
);
