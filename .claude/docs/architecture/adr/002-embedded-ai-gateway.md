# ADR-002: Embed AI Gateway in API Process Rather Than Deploying as Microservice

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash needed to deploy 6 AI agents (SDR, Marketing, Patient, Financial, Severino, Widget). Three deployment options were evaluated: (A) separate microservice with its own container and scaling, (B) embedded Hono sub-app within the main API process, (C) serverless functions per agent on a platform like Cloudflare Workers.

## Decision

AI Gateway is implemented as an embedded Hono sub-app (`@neondash/ai-gateway` package) mounted at `/api/ai` within the main API process. It can also run standalone for local development via its own entry point.

## Consequences

**Positive:**
- Zero operational overhead -- no separate service to deploy, monitor, or scale
- Shared Clerk auth context eliminates a second JWT verification layer
- Direct function calls for host adapters (no HTTP round-trips for WhatsApp/email)
- Standalone mode available for isolated local development and testing
- Feature flags allow per-agent enable/disable without redeployment

**Negative / Trade-offs:**
- AI Gateway crashes or memory pressure directly affect the main API
- Cannot scale AI Gateway independently from the API process
- Tighter coupling requires care when upgrading either component

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Separate microservice | Independent scaling, fault isolation | Extra container, second JWT layer, HTTP round-trips for adapters | Rejected: operational overhead |
| B — Embedded Hono sub-app | Shared auth context, direct function calls, zero extra infra | AI crashes affect main API, no independent scaling | **Chosen** |
| C — Serverless functions per agent | Pay-per-use, infinite scale | Cold starts, no persistent connections, hard to share state | Rejected: cold start latency unacceptable for chat |

## Related ADRs

- [ADR-005](005-single-process-deployment.md) — AI Gateway runs embedded in the single Bun process
- [ADR-007](007-redis-dual-purpose.md) — Redis pub/sub used for inter-agent communication
- [ADR-019](019-sse-realtime.md) — Agent responses streamed via SSE to the frontend
- [ADR-021](021-gemini-ai-provider.md) — Google Gemini powers all 6 agent types in this gateway
