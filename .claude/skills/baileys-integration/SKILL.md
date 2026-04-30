---
name: baileys-integration
description: Use when diagnosing Baileys disconnect loops, reconnect storms, stale QR/session state, message delivery latency, auth state corruption, 405/428 rate-limit errors, QR never reappears, UUID path infinite spinner, SSE not receiving events, syncConversations 502 crash, missing history after reconnect, or when implementing any WhatsApp realtime/session/webhook change in baileys-service.ts or baileys-auth-state.ts. Always use this skill before touching any file under apps/api/src/services/ that mentions Baileys or WhatsApp.
---

# Baileys Integration Skill

Operate Baileys in production with explicit disconnect handling, durable auth persistence, controlled reconnect policy, and realtime-first delivery.

## When to Use

Use this skill when:

- Editing any Baileys backend file under `apps/api/src/services`, `apps/api/src`, or `apps/api/src/webhooks`
- Investigating session drops after page refresh/navigation
- Hardening reconnection strategy, socket configuration, or auth persistence
- Implementing/validating realtime delivery paths for Baileys chat events
- Running provider transition work involving Baileys compatibility
- Implementing or debugging history sync (`messaging-history.set`, `shouldSyncHistoryMessage`)
- Optimizing conversation list queries or message pagination (`getAllConversations`, `getMessages`, `fetchOlderMessages`)
- Diagnosing missing/duplicate messages after reconnect or initial sync

Do not use this skill for Meta Cloud API-only work or Z-API-only work.

## Mandatory References

Always load:

- `.claude/skills/baileys-integration/references/architecture.md`
- `.claude/skills/baileys-integration/references/best-practices.md`

Load on demand:

- `.claude/skills/baileys-integration/references/implementation-patterns.md` — socket config, reconnect strategy, dual-path patterns, all troubleshooting code
- `.claude/skills/baileys-integration/references/consolidation-roadmap.md`

## Live Docs Lookup (Context7)

Before implementing Baileys changes, fetch live docs:

- `@whiskeysockets/baileys` → resolve library ID, query for socket config, auth state, message handling, reconnect patterns

## Quick Reference

| Symptom | Load |
|---------|------|
| Disconnect loops / reconnect storms | `implementation-patterns.md` → Reconnection Strategy |
| 405 / 428 rate-limit, QR never reappears | `implementation-patterns.md` → QR Timer Race Condition |
| UUID path infinite spinner / QR never appears | `implementation-patterns.md` → UUID Path Infinite Spinner |
| SSE not receiving events (CORS) | `implementation-patterns.md` → SSE Not Receiving Events |
| Server crash on syncConversations (502) | `implementation-patterns.md` → syncConversations Crashing Server |
| Missing history after reconnect | `implementation-patterns.md` → History Sync Implementation |
| Conversation list performance / O(n) memory | `implementation-patterns.md` → Conversation Performance |
| Auth state corruption / badSession loop | `best-practices.md` → Auth State Management |
| Architecture / file inventory / data flow | `architecture.md` |
| CRM lead phone normalization (9th digit) | `best-practices.md` → CRM Lead Phone Normalization |
| VPS RAM climbing / heap growth across reconnects | `best-practices.md` → Resource Budget; verify group metadata cache bounded, saveCreds debounced |
| Initial history sync burst / 502 storm on fresh pair | `implementation-patterns.md` → Socket Configuration Baseline; tune `BAILEYS_HISTORY_WINDOW_DAYS` |
| WA 428 after ~24h idle | Check `keepAliveIntervalMs: 25_000` (not 60s) |
| Group message delay / repeated iq stanzas | Verify `cachedGroupMetadata` wired + `groups.update` invalidates cache |

## Critical Rules (Non-Negotiable)

**Connection stability:**

| Reason | Code | Action |
| --- | --- | --- |
| `loggedOut` | 401 | Clear session state, require re-auth |
| `restartRequired` | 515 | Recreate socket asynchronously (`setTimeout(..., 0)`) |
| `connectionClosed` | 428 | Rate-limit backoff (5 min) + clear qrTimer |
| `connectionLost` / `timedOut` | 408 | Exponential backoff with jitter |
| `badSession` | 500 | Clear session state, force re-auth |
| `connectionReplaced` | 440 | Clear/recover session, force re-auth |
| `multideviceMismatch` | 411 | Clear session state, force re-auth |
| `forbidden` | 403 | Controlled backoff + operational alert |
| `unavailableService` | 503 | Controlled backoff + operational alert |
| HTTP rejection (IP rate-limit) | 405 | Rate-limit backoff (5 min) + clear qrTimer |

Rules:
- Never reconnect blindly in a tight loop.
- Track reconnect attempts and reset the counter on stable `open`.
- Do not call connect synchronously inside `connection.update`.
- Remove socket listeners before replacing socket instances.
- In UUID path: every `clearAuth` handler MUST also schedule auto-reconnect to trigger new QR.

**Session persistence:**
- Never use `useMultiFileAuthState` in production — use PostgreSQL-backed auth state.
- Persist creds and keys atomically; fail loudly on unrecoverable write errors.
- Dual-write migration policy: write both formats → read snapshot first, fallback to legacy → cut over after validation.
- Preserve `whatsapp_messages` history during session recovery.

**Dual-path rule:**
- The codebase has TWO co-existing paths: legacy (`mentoradoId`) and UUID (`connectionId`).
- Every endpoint that touches connection state MUST handle both paths.
- Load `implementation-patterns.md` → Dual-Path Architecture for helper method signatures.

**History sync:**
- `shouldSyncHistoryMessage` present in all `makeWASocket` call sites. v2 sync-loop uses windowed filter (`BAILEYS_HISTORY_WINDOW_DAYS`, default 30); v2 auth-flow disables (sync-loop takes over post-pair); v1 uses windowed filter on the chunk's `oldestMsgInChunkTimestampSec`.
- `messaging-history.set` handler MUST be registered on ALL socket paths. Missing from any → that path silently skips history.

**VPS resource rules (2-4GB Vultr, Alpine Docker):**
- Never call `fetchLatestWaWebVersion` directly — use `getCachedWaVersion()` from `baileys-cache-helpers.ts` (1h TTL, stale-on-failure).
- Never register an uncached `cachedGroupMetadata` — group-heavy tenants will hammer `iq` stanzas. Use `createGroupMetadataCache()` (bounded LRU, invalidated on `groups.update`).
- Wrap `saveCreds` in `createDebouncedSave(..., 300)`. Force-flush on `connection.update === "open"` and `"close"`.
- `keepAliveIntervalMs: 25_000`. Lower risks WS chatter on idle; higher lets NAT drops slip past ping (WA 428 after 24h idle).
- `emitOwnEvents: true` (REQUIRED — captures messages sent from user's mobile device). Flipping to false will break outbound mobile sync.
- `fireInitQueries: false` and `generateHighQualityLinkPreview: false` — not consumed by product, save ~200-500ms per connect + per-outbound CPU.

## Engine Architecture

- **Engine v2** (`BAILEYS_ENGINE_V2=true` in staging + prod): `baileys-runtime.ts` (lifecycle) → `baileys-engine.ts` (state machine) → `baileys-auth-flow.ts` (QR) → `baileys-sync-loop.ts` (long-running socket). Shared caches in `baileys-cache-helpers.ts`. Router: `baileys-v2-router.ts`.
- **Engine v1** (`BAILEYS_ENGINE_V2=false` fallback, DEPRECATED): `baileys-service.ts` singleton. Scheduled for removal Sprint 7b — new code must not import from it.

## File Map

**Engine v2 (primary):**

| File | Purpose |
| --- | --- |
| `apps/api/src/services/baileys-runtime.ts` | Lifecycle (connect/disconnect/forceLogout) per connectionId |
| `apps/api/src/services/baileys-engine.ts` | Connection state machine |
| `apps/api/src/services/baileys-auth-flow.ts` | QR pairing — exits after `open` |
| `apps/api/src/services/baileys-sync-loop.ts` | Long-running sync daemon — owns socket lifetime |
| `apps/api/src/services/baileys-cache-helpers.ts` | WA version TTL cache, group metadata LRU, debounced save, history window |
| `apps/api/src/baileys-v2-router.ts` | tRPC procedures |

**Legacy v1 (fallback):**

| File | Purpose |
| --- | --- |
| `apps/api/src/services/baileys-service.ts` | Deprecated singleton |
| `apps/api/src/services/baileys-session-manager.ts` | Legacy session manager |
| `apps/api/src/baileys-router.ts` | Legacy tRPC procedures |

**Shared across both paths:**

| File | Purpose |
| --- | --- |
| `apps/api/src/services/baileys-auth-state.ts` | PostgreSQL auth state — creds + per-category signal key writes |
| `apps/api/src/webhooks/baileys-webhook.ts` | Persists events, broadcasts realtime via SSE |
| `apps/api/drizzle/schema-baileys.ts` | `baileys_sessions` schema |
| `apps/web/src/components/whatsapp/baileys-connection-card.tsx` | QR flow UI |
| `apps/web/src/hooks/use-whats-app-provider.ts` | Provider selection + polling (60s conv / 30s msg — SSE is primary) |

Multi-provider priority (runtime): `baileys` → `zapi` → `meta` (admin only).

## References

- [Baileys Connecting Docs](https://baileys.wiki/docs/socket/connecting/)
- [Baileys DisconnectReason API](https://baileys.wiki/docs/api/enumerations/DisconnectReason/)
- [Baileys Defaults Source](https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/index.ts)
- [Architecture Map](references/architecture.md)
- [Best Practices](references/best-practices.md)
- [Implementation Patterns](references/implementation-patterns.md)
- [Consolidation Roadmap](references/consolidation-roadmap.md)
