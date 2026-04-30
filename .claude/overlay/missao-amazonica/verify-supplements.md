# Verify Supplements — Missão Amazônica

> Loaded by `/verify` to add project-specific smoke tests on top of the generic verification matrix.

## Required smoke tests

### Webhook idempotency

```bash
# Same body twice → only one confirmation
curl -X POST $STAGING_URL/api/webhooks/bank-pix \
  -H "x-signature: <valid-hmac>" \
  -H "Content-Type: application/json" \
  -d @fixtures/webhook-confirmed.json

curl -X POST $STAGING_URL/api/webhooks/bank-pix \
  -H "x-signature: <valid-hmac>" \
  -H "Content-Type: application/json" \
  -d @fixtures/webhook-confirmed.json

# Verify only one row in payment_events with that bank_end_to_end_id
psql $DATABASE_URL -c "select count(*) from payment_events where bank_end_to_end_id = 'E2E-FIXTURE-001'"
# expect: 1
```

### Excess-to-reserve

```bash
# Confirm intent with amount > target
# Verify: row inserted in global_reserve_entries with the overage
psql $DATABASE_URL -c "select * from global_reserve_entries order by created_at desc limit 1"
```

### RLS anonymous deny

```bash
# anon session must not be able to select donor PII
psql "$ANON_URL" -c "select donor_email from donation_intents limit 1"
# expect: error or empty (RLS blocks)

psql "$ANON_URL" -c "select * from payment_events limit 1"
# expect: error (RLS blocks anon)

psql "$ANON_URL" -c "select * from audit_logs limit 1"
# expect: error (RLS blocks anon)
```

### public_donor_list privacy

```bash
# Insert intent with is_anonymous=true OR display_name_publicly=false
# Verify it does NOT appear in public_donor_list view
psql "$ANON_URL" -c "select donor_name from public_donor_list where item_id = '<test-item>'"
# expect: only consented + non-anonymous rows
```

### Manual confirm path

```bash
# Admin POST to /api/admin/manual-confirm
# Verify: payment_events row with provider='manual' and bank_end_to_end_id='MAN-<intent_id>'
# Verify: audit_logs row with action='manual_confirm'
```

### Lighthouse gates (project-specific routes)

Run Lighthouse against:
- `/` (landing)
- `/doar` (listing)
- `/doar/<slug>` (detail SSR)
- `/prestacao-de-contas` (accountability)

Each must score ≥ 95 on Performance / Accessibility / Best Practices / SEO. LCP < 2.5s. CLS = 0.

### Lucide-only icon enforcement

```bash
# zero hits expected
grep -r "material-symbols\|<i class=\"fa\|emoji" src/ --include="*.astro" --include="*.tsx" --include="*.ts"
```

### Hybrid render mode

```bash
# Every page declares prerender; api/ + admin/ are false; public is true
grep -L "export const prerender" src/pages/**/*.astro src/pages/**/*.ts
# expect: empty (every page declares it)
```

## Pre-deploy checklist (Missão Amazônica specific)

- [ ] All FKs have indexes: `grep "create index" supabase/migrations/`
- [ ] Vercel env configured: `bunx vercel env ls production`
- [ ] `.env.example` includes every key referenced in code
- [ ] Production smoke: `/`, `/doar/<slug>`, `/admin/login`
- [ ] `bunx supabase db lint` clean
- [ ] Generated types regenerated: `bunx supabase gen types typescript --linked > src/lib/supabase/types.ts`
