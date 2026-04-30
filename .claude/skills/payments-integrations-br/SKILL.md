---
name: payments-integrations-br
description: Use for Brazilian payment gateways, digital product platforms, Asaas, Kiwify, Hubla, PIX, boleto, fiscal documents, NFe, NFSe, webhooks, and payment API errors.
---

# Brazilian Payments & Fiscal Integration Skill

Canonical reference for integrating Asaas (payment gateway), Kiwify (digital products), Hubla (digital products), and Nuvem Fiscal (NFe/NFSe emission) in the NeonDash backend.

## When to Use

- Adding or modifying Asaas payment/subscription webhook handlers
- Integrating Kiwify or Hubla digital product sale events
- Emitting NFe or NFSe via Nuvem Fiscal
- Debugging webhook duplicate delivery or idempotency failures
- Debugging OAuth token expiry (Kiwify 401)
- Debugging SEFAZ rejection codes (Nuvem Fiscal)

**When NOT to use:** Meta/WhatsApp webhooks → `meta-api-integration`. Baileys sessions → `baileys-integration`.

---

## Architecture Overview

```
Inbound Webhooks                 Outbound API Calls
──────────────────               ──────────────────
Asaas  → /webhooks/asaas    →   Idempotency check (event.id UNIQUE)
Kiwify → /webhooks/kiwify   →   OAuth refresh (24h token)
Hubla  → /webhooks/hubla    →   HMAC-SHA256 verify (assumed)
                                 → 200 OK within 10s → async process

Nuvem Fiscal (outbound only):
  Our API → Nuvem Fiscal → SEFAZ homologacao/producao
           → store chaveAcesso immediately
```

---

## Quick Reference

| Platform | Auth | Webhook Security | Idempotency Key | Timeout |
|----------|------|-----------------|-----------------|---------|
| Asaas | `Authorization: Bearer <key>` | HTTPS only (no HMAC) | `event.id` (UNIQUE) | 10s |
| Kiwify | OAuth 2.0 Bearer (24h JWT) | No HMAC — IP whitelist | `order.id` (UNIQUE) | N/A |
| Hubla | Bearer token (dashboard) | HMAC-SHA256 assumed | `event.id` assumed | N/A |
| Nuvem Fiscal | `Authorization: Bearer <token>` | N/A (outbound) | Internal doc number | N/A |

---

## Critical Rules (All Platforms)

1. Respond to inbound webhooks with HTTP 200 within **10 seconds** — process async
2. Guard against duplicate delivery: store idempotency key in DB with UNIQUE constraint; early-return on conflict
3. Separate env vars for sandbox and production tokens — **never mix environments**
4. Validate all payloads with Zod before processing
5. Use `AbortSignal.timeout(10_000)` on every outbound API call
6. Log full raw payload at `debug` level for all webhook receipts

---

## Reference Documents

| File | Content |
|------|---------|
| `references/asaas.md` | Auth, webhooks, idempotency, rate limits, event types |
| `references/kiwify.md` | OAuth flow, token refresh, webhook events |
| `references/hubla.md` | Best-effort patterns (official docs require dashboard access) |
| `references/nuvem-fiscal.md` | NFe/NFSe emission, SEFAZ codes, chaveAcesso, sandbox |

---

## Troubleshooting Quick Reference

| Symptom | Platform | Cause | Fix |
|---------|----------|-------|-----|
| Duplicate payment processing | Asaas | No idempotency guard | Add `asaas_webhook_events` table + UNIQUE on `event_id` |
| 401 on API call | Kiwify | Token expired (24h) | Detect 401 → re-auth via POST `/v1/oauth/token` |
| Webhook never received | Asaas | Queue paused after repeated failures | Reactivate in Asaas dashboard → Configurações → Webhooks |
| SEFAZ rejeição 539 | Nuvem Fiscal | CNPJ inválido | Validate CNPJ/CPF + address before emission |
| NFe re-emitted duplicate | Nuvem Fiscal | No idempotency check | Check for existing `chaveAcesso` before emit |
| Hubla 401/403 | Hubla | Signature mismatch | Verify `HUBLA_WEBHOOK_SECRET` + raw body bytes |
| 429 Too Many Requests | Asaas | Quota exceeded (25k/12h) | Exponential backoff: 250ms → 500ms → 1000ms |
