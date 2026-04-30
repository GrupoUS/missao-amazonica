# ADR-003: Support Three WhatsApp Providers Simultaneously (Z-API, Baileys, Meta Cloud API)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash started with Z-API (third-party hosted) for WhatsApp integration. Baileys (direct WebSocket to WhatsApp) was added for lower cost and more control. Meta WhatsApp Cloud API (official) was added for compliance and reliability. Each provider has different characteristics regarding pricing, reliability, and regulatory compliance.

## Decision

All three providers are maintained simultaneously. Each mentorado configures their preferred provider. Routers are separated by provider: `zapi-router.ts`, `baileys-router.ts`, `meta-api-router.ts`. Service logic is co-located with each router.

## Consequences

**Positive:**
- Migration path: mentorados can switch providers without data loss
- Risk diversification: if one provider has downtime, others continue operating
- Different providers suit different use cases (cost vs reliability vs compliance)
- Z-API supports legacy mentorados without forcing migration disruption

**Negative / Trade-offs:**
- 3x the code to maintain for WhatsApp features
- Feature parity is difficult -- new features must be implemented 3 times or limited to one provider
- Increased test surface area across all three integrations
- Operational complexity when diagnosing which provider a support issue affects

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Z-API only | Managed service, no self-hosting | Monthly cost per instance, third-party reliability risk | Rejected: cost and lock-in |
| B — Baileys only | Free, direct WebSocket, full control | Requires self-managed sessions, complex reconnect logic | Rejected: not all mentorados want self-hosted |
| C — Meta Cloud API only | Official, most reliable, compliance-ready | No QR auth, requires business verification, API rate limits | Rejected: migration disruption for existing users |
| D — All three simultaneously | Migration path, risk diversification, provider-per-use-case | 3x code maintenance, feature parity challenge | **Chosen** |

## Related ADRs

- [ADR-005](005-single-process-deployment.md) — All three providers run within the single Bun process
- [ADR-019](019-sse-realtime.md) — Baileys uses WebSocket (exception to SSE-first policy) for WhatsApp protocol
