# Integration Rules (Tier 2 — Generic Template)

> Replace placeholders with project specifics, or override entirely via `${overlay}/rules/integrations.md`.

## Purpose

Operational guardrails for external providers — payments, email, monitoring, real-time, deploy.

---

## Universal rules

- Every external API call has a timeout. Default 5s for synchronous, 30s for batch.
- Webhooks ack quickly (200) and process side effects safely. Long work goes to a queue.
- **Idempotency mandatory** on every webhook ingestion path.
- Treat provider payloads as untrusted. Validate with schema library (Zod / Valibot / equivalent) before downstream use.
- Log integration failures with structured context: `provider`, `route`, `txid` / external_id.
- Secrets only via env. Never inline. Never commit `.env`.
- No hardcoded provider versions, base URLs, or credentials.

---

## Provider abstraction pattern

When the project supports multiple providers for the same role (multiple payment processors, email vendors, etc.):

```ts
export interface PaymentProvider {
  id: 'provider_a' | 'provider_b' | 'manual';
  createIntent(args): Promise<{ payload, qrDataUrl?, txid, expiresAt }>;
  verifyWebhook?(req): Promise<{ valid: boolean; event?: ParsedEvent }>;
  queryStatus?(txid): Promise<'pending' | 'confirmed' | 'failed'>;
}
```

A `registry.ts` (`getProvider(client)`) reads the active provider from settings/config, returns the right implementation. Disabled providers stay as `*.disabled.ts` stubs that throw `not_implemented` — keeps the call site stable when toggling later.

---

## Webhook handling

```ts
export const POST: Handler = async ({ request }) => {
  // 1. Verify signature (constant-time comparison)
  const sig = request.headers.get('x-signature');
  if (!verifyHmac(sig, body, SECRET)) {
    return Response.json({ error, code: 'webhook_invalid_signature' }, { status: 401 });
  }

  // 2. Idempotent insert
  const { id } = await db.insert(events).values(parsed).onConflictDoNothing({ target: ['provider', 'external_id'] }).returning({ id });
  if (!id) return new Response(null, { status: 200 }); // already processed

  // 3. Process side effects via canonical procedure
  await db.execute(sql`SELECT confirm_<action>(${parsed.intent_id}, ${id}, ${parsed.amount})`);

  // 4. Notify (best-effort, non-blocking — caught + logged)
  void sendNotification(...).catch(captureException);

  return new Response(null, { status: 200 });
};
```

If the provider's secret is undefined → return `501 webhook_disabled` instead of crashing.

---

## Email wrapper

`${paths.libRoot}/email/<provider>.ts` exposes `sendEmail({ to, subject, body })`. Must:
- Log a structured warn and return `{ skipped: true }` when the API key is undefined — never throw.
- Never block the calling endpoint on slow provider responses.
- Never include PII in subject lines.
- Treat 5xx as retryable (single retry with backoff). Treat 4xx as terminal (log + skip).

Templates in `${paths.libRoot}/email/templates/` are framework-rendered (React / Astro / handlebars).

---

## Monitoring

- Configure error tracking (Sentry / Datadog / Bugsnag / equivalent) via init guard — only enable when DSN is set.
- Tags: `route`, `provider`, `request_id`, relevant entity ids.
- `captureException(err, { tags })` for errors.
- `captureMessage(text, { level: 'info', extra })` for notable events.
- Never log raw PII. Strip via `beforeSend` hook if needed.

---

## Real-time / pub-sub

- Subscribe only on surfaces that actually need it (detail pages, dashboards). Lists/landings rebuild on cron or admin-write — real-time there is overkill.
- Always tear down subscriptions on component unmount.
- Channel names: `<entity>:<id>` for per-entity, `<entity>:all` for admin global feeds.

---

## Deploy / infra

- Env management via deployer CLI (`vercel env add`, `fly secrets set`, `railway variables set`, etc.). Never commit env files.
- Adapter chosen for each framework (Vercel adapter, Node adapter, Cloudflare adapter).
- Cold-start mitigation: keep critical handlers light (no JIT-heavy libs); inline cheap work; avoid heavy WASM at cold-path.
- Edge runtime: only when provider compatibility verified. Default to Node serverless.
- ISR / on-demand revalidation triggered from admin actions when content changes.

---

## Stability checklist (integrations subset)

- All webhooks: signature verify → idempotent insert → process → 200
- All external calls: timeout + structured error → monitoring → safe fallback
- All credentials: env-only; rotate via deployer CLI
- Provider type unions stay closed (`'provider_a' | 'provider_b' | 'manual'`); never widen to `string`
- Sandbox vs production: distinct env keys

---

## When to load more

| Need | Load |
|---|---|
| API route patterns | `backend.md` |
| Schema for events, audit_logs | `database.md` |
| UI for integration flows | `frontend.md` |
| Universal stability checklist | `stability.md` |

---

## Project-specific authority

If `${overlay}/rules/integrations.md` exists, prefer it — it captures the project's actual providers (payment, email, monitoring, deploy) and their concrete signature/idempotency contracts.
