/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_SITE_NAME: string;
  readonly PIX_KEY: string;
  readonly PIX_MERCHANT_NAME: string;
  readonly PIX_MERCHANT_CITY: string;
  readonly PIX_BANK_WEBHOOK_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly RESEND_FROM_EMAIL: string;
  readonly SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    supabase: ReturnType<
      typeof import('@/lib/supabase/server').createSupabaseServer
    >;
    user: import('@supabase/supabase-js').User | null;
    isAdmin: boolean;
  }
}
