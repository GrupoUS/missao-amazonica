# Routing Supplements — Missão Amazônica

> Loaded by `/prime` and `/implement` to extend the generic routing matrix with project-specific bindings.

## Extra rows for the routing matrix

| Task touches | Load | Implement in |
|---|---|---|
| Donation flow (intent → confirmed) | `.claude/rules/backend.md` + `.claude/rules/integrations.md` + `.claude/rules/database.md` | `src/pages/api/donations/{create,status}.ts`, `src/lib/payments/`, `confirm_donation()` plpgsql |
| Pix provider | `.claude/rules/integrations.md` | `src/lib/payments/providers/{bank-pix,manual,*-provider}.ts`, `src/lib/payments/registry.ts` |
| Pix BR-Code (EMV) | `.claude/rules/integrations.md` | `src/lib/payments/pix.ts` (pure function, CRC16/CCITT-FALSE) |
| Webhook bank-pix | `backend.md` + `integrations.md` + `database.md` | `src/pages/api/webhooks/bank-pix.ts` (HMAC verify → idempotent insert → confirm) |
| Manual confirm (admin) | `backend.md` + `integrations.md` | `src/pages/api/admin/manual-confirm.ts` (synthetic event id) |
| Public accountability | `backend.md` + `frontend.md` | `src/pages/prestacao-de-contas.astro` (rebuild on admin write), uses `accountability_entries` |
| Admin dashboard | `backend.md` + `frontend.md` | `src/pages/admin/**`, `src/components/admin/**`, `requireAdmin(Astro)` guard |
| Email templates | `.claude/rules/integrations.md` | `src/lib/email/templates/**.tsx` (React, rendered to HTML), `src/lib/email/resend.ts` wrapper |
| Audit logging | `.claude/rules/backend.md` + `.claude/rules/database.md` | `src/lib/audit/log.ts`, `audit_logs` table + DB triggers |
| Donation listing/detail | `frontend.md` + `backend.md` | `src/pages/doar/{index,[slug]}.astro`, `src/components/donation/**` |

## Generated types

After any schema change in `supabase/migrations/`:

```bash
bunx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Skipping this step → stale types → silent runtime errors on RLS-filtered queries.

## Tier 3 references

When commands need deeper context for this project:

- `docs/PROMPT.md` — canonical product spec
- `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md` — design tokens canon
- `docs/e-design-execute-o-glowing-crystal.md` — implementation plan
- `supabase/migrations/000{1..5}_*.sql` — schema source of truth
