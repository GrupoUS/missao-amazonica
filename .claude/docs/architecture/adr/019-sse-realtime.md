# ADR-019: Server-Sent Events (SSE) for Real-Time Chat and WhatsApp Updates

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash needs real-time push updates for AI agent chat responses and incoming WhatsApp messages. Options considered: (A) WebSocket (bidirectional), (B) Long polling, (C) Server-Sent Events (HTTP, server-to-client unidirectional).

Note: Baileys ALREADY uses WebSocket to connect to WhatsApp servers — this is not a choice, it's the WhatsApp protocol. This ADR covers the server-to-browser communication channel.

## Decision

Use SSE at `/api/chat/events` for all real-time browser updates (AI chat tokens, WhatsApp message notifications). WebSocket is used only for Baileys (external WhatsApp protocol requirement — not a design choice).

Traefik requires `flushinterval=-1` on SSE responses to prevent buffering. Frontend uses EventSource API with reconnect logic.

## Consequences

**Positive:**
- SSE is HTTP-native — works through Traefik reverse proxy without WebSocket upgrade complications
- Stateless: each SSE connection is a regular HTTP request with Clerk auth validation
- No WebSocket upgrade handshake or sticky session requirements
- Browser EventSource API provides automatic reconnection

**Negative / Trade-offs:**
- Unidirectional only — client must use separate tRPC mutations for sending messages
- SSE connections hold open TCP connections (manageable with Traefik connection limits)
- `flushinterval=-1` is a Traefik-specific config requirement — easy to miss in new environments

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — WebSocket | Bidirectional, low latency | Requires upgrade protocol, sticky sessions for horizontal scaling, more complex auth | Rejected: operational complexity |
| B — Long polling | Simple, no persistent connection | High latency, server overhead from repeated requests | Rejected: latency unacceptable for chat |
| C — SSE | HTTP-native, stateless, proxy-friendly, automatic reconnect | Unidirectional (acceptable — mutations handle client-to-server) | **Chosen** |

## Related ADRs

- [ADR-002](002-embedded-ai-gateway.md) — AI Gateway streams agent responses via this SSE endpoint
- [ADR-003](003-multi-whatsapp-providers.md) — WhatsApp message notifications pushed via SSE; Baileys uses WebSocket to WhatsApp servers (separate concern)
