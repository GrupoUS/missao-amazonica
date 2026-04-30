# ADR-007: Use Redis for Both Session Cache and AI Inter-Agent Communication

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

Two separate needs arose: (1) reduce Clerk API calls for session validation, (2) enable AI agents to communicate with each other for coordinated workflows. Redis was already being evaluated for session caching. Using a single Redis instance for both avoids an additional infrastructure dependency.

## Decision

Redis serves dual purpose: (1) session cache with 1-hour TTL reducing Clerk API calls by ~80%, (2) pub/sub bus for AI inter-agent communication with hop-count guards (max 5) against infinite loops. Both functions have in-memory fallbacks when Redis is unavailable.

## Consequences

**Positive:**
- Single operational dependency (one Redis instance for two purposes)
- In-memory fallback means Redis unavailability degrades gracefully, not catastrophically
- Redis pub/sub is well-suited for fire-and-forget inter-agent messages
- Hop-count guards prevent infinite message loops between agents

**Negative / Trade-offs:**
- Redis outage simultaneously degrades both session caching and AI inter-agent communication
- Two conceptually different use cases in one service (harder to reason about independently)
- Pub/sub messages are ephemeral -- messages in-flight during Redis restart are lost
- Redis memory limit (256M) must accommodate both workloads

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Two separate Redis instances | Clean separation of concerns, independent failure domains | Double the infrastructure cost and operational overhead | Rejected: over-engineering |
| B — Single Redis for both session cache + pub/sub | One instance to manage, cost-efficient, in-memory fallback available | Outage affects both session caching and inter-agent comms simultaneously | **Chosen** |
| C — In-memory only (no Redis) | Zero infra dependency | Resets on deploy, no cross-process sharing, no pub/sub | Rejected: session data lost on restart |
| D — Redis for cache only, separate message broker | Clean separation | Extra broker infra (Kafka, RabbitMQ) is overkill for 6 agents | Rejected: unnecessary complexity |

## Related ADRs

- [ADR-002](002-embedded-ai-gateway.md) — AI Gateway uses Redis pub/sub for inter-agent communication
- [ADR-011](011-clerk-authentication.md) — Session cache reduces Clerk API calls by ~80%
- [ADR-021](021-gemini-ai-provider.md) — Gemini agents communicate via this Redis pub/sub channel
