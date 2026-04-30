import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import sentry from '@sentry/astro';

const SENTRY_DSN = process.env.SENTRY_DSN;
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site: PUBLIC_SITE_URL,
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: false,
  }),
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/api'),
    }),
    ...(SENTRY_DSN
      ? [
          sentry({
            dsn: SENTRY_DSN,
            sourceMapsUploadOptions: {
              telemetry: false,
            },
          }),
        ]
      : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 4321,
  },
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
});
