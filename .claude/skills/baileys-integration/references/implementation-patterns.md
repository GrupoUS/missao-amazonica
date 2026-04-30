# Baileys Implementation Patterns

> Detailed implementation patterns, code blocks, troubleshooting flows, and runtime baselines.
> Load this file when implementing new Baileys features, debugging specific error patterns, or reviewing code correctness.

---

## Socket Configuration Baseline (Post-Hardening 2026-04)

Actual settings in use across all three `makeWASocket` call sites. Deviations here = bug or regression.

```ts
keepAliveIntervalMs: 25_000           // Lowered from 60s — detects NAT/WS drops before WA 428
connectTimeoutMs: 60_000
defaultQueryTimeoutMs: 60_000
retryRequestDelayMs: 1_000..3_000     // Randomized to avoid WA 428 "Too Many Reconnect Attempts"
maxMsgRetryCount: 5
markOnlineOnConnect: false            // Avoid presence storms + mobile battery notifications
browser: Browsers.macOS("NeonDash")
syncFullHistory: false
shouldSyncHistoryMessage: windowed    // See baileys-cache-helpers.ts — BAILEYS_HISTORY_WINDOW_DAYS (default 30)
emitOwnEvents: true                   // REQUIRED — captures messages sent from user's mobile device
fireInitQueries: false                // Skip blocklist/privacy/groups metadata at connect
generateHighQualityLinkPreview: false // Not consumed by UI; saves CPU/bandwidth
cachedGroupMetadata: BoundedLRU       // 500 entries, 1h TTL — via createGroupMetadataCache()
auth.keys: makeCacheableSignalKeyStore(state.keys, logger)
getMessage: DB-backed (v1) | proto.Message.fromObject({}) (v2)
```

**Version resolution:** Always use `getCachedWaVersion()` from `baileys-cache-helpers.ts` — 1h TTL, stale-on-failure. Never call `fetchLatestWaWebVersion` directly.

**Auth write batching:** Wrap `saveCreds` in `createDebouncedSave(saveCreds, 300)`. Force-flush on `connection.update === "open"` and `"close"`. Never skip force-flush — pending keys are lost on crash.

**Notes:**
- `shouldSyncHistoryMessage` must be present in BOTH makeWASocket call sites (legacy v1 + v2 sync-loop). v2 auth-flow intentionally disables history (`() => false`) because sync-loop takes over after pair-success.
- `emitOwnEvents: false` BREAKS mobile-device outbound sync. Do not flip without rewriting the webhook's fromMe handler.

---

## Reconnection Strategy

Use exponential backoff with jitter:

- `baseDelayMs = 1000`
- `multiplier = 2`
- `maxDelayMs = 30000`
- `maxAttempts = 10`
- `jitterMs = random(0..1000)`

Formula:

```text
delay = min(baseDelayMs * (multiplier ^ attempt) + jitterMs, maxDelayMs)
```

Rules:

- Reset attempts on successful and stable `open`.
- After `maxAttempts`, emit terminal failure event and require manual re-auth.
- Add reason-aware behavior (`loggedOut` and `restartRequired` are not treated as generic retries).

**DisconnectReason 405 (HTTP WebSocket rejection / IP rate-limit):**
- 405 = WhatsApp rejected the WebSocket upgrade — most common cause: VPS IP rate-limited
- Use `RATE_LIMIT_BACKOFF_MS = 5 * 60 * 1000` (5-minute) for 405 and 428
- Use `fetchLatestWaWebVersion({})` + `Browsers.macOS("Chrome")` to reduce 405 probability
- Suppress "Reconectar" button for BOTH 405 and 428 during backoff, not just 428

---

## QR Timer Race Condition (CRITICAL)

The `qrTimer` (90-second timeout) MUST be cleared in 405/428 disconnect handlers.

**Problem**: When 405/428 fires, the handler schedules a 5-minute backoff reconnect. The `qrTimer` was set earlier when the socket was created. 90 seconds later, `qrTimer` fires, sets `shouldRun = false`, and the pending backoff checks `!current?.shouldRun` → bails → **connection dies permanently**.

**Sequence**:
```
connect() → socket created → qrTimer starts (90s)
→ 405 received → 5-min backoff scheduled → qrTimer fires at 90s
→ qrTimer sets shouldRun=false → backoff checks shouldRun → returns early
→ no more reconnect attempts ever
```

**Fix**: Call `clearQrTimer(active)` in ALL 405/428 handlers (legacy AND UUID paths):

```typescript
// ❌ WRONG: qrTimer kills the 5-min backoff
private scheduleRateLimitRecovery(mentoradoId: number, session: SessionRuntime): void {
  this.clearReconnectTimer(session);
  // qrTimer NOT cleared → will fire 90s later → kills backoff
  session.reconnectTimer = setTimeout(async () => { ... }, RATE_LIMIT_BACKOFF_MS);
}

// ✅ CORRECT: clear qrTimer before scheduling backoff
private scheduleRateLimitRecovery(mentoradoId: number, session: SessionRuntime): void {
  this.clearReconnectTimer(session);
  this.clearQrTimer(session);  // ← CRITICAL: prevent qr_timeout from setting shouldRun=false
  session.reconnectTimer = setTimeout(async () => { ... }, RATE_LIMIT_BACKOFF_MS);
}
```

Same pattern needed in the UUID path (`createConnectionByUUID`'s 405/428 handlers).

---

## Dual-Path Architecture

The codebase has **two co-existing connection paths**. Every endpoint must handle BOTH.

| Path | Session key | In-memory Map | DB record |
|------|-------------|---------------|-----------|
| Legacy | `mentoradoId` (number) | `sessions: Map<number, SessionRuntime>` | `mentorados.baileysPhone` |
| UUID | `connectionId` (UUID string) | `connectionSessions: Map<string, BaileysConnectionSession>` | `whatsappConnections` table |

**Required helper methods** (add to `BaileysService`):

```typescript
// Returns connected status + phone for first active UUID session
getActiveUUIDStatus(connectionIds: string[]): { connected: boolean; phone?: string } {
  for (const connId of connectionIds) {
    const session = this.connectionSessions.get(connId);
    if (session?.status === "connected") {
      return { connected: true, phone: session.phone };
    }
  }
  return { connected: false };
}

// Returns connectionId of first active UUID session
findActiveUUIDConnectionId(connectionIds: string[]): string | null {
  for (const connId of connectionIds) {
    const session = this.connectionSessions.get(connId);
    if (session?.status === "connected") { return connId; }
  }
  return null;
}
```

**Affected endpoints** — all require UUID fallback:

| Endpoint | Pattern |
|----------|---------|
| `getStatus` tRPC | Query `whatsappConnections` from DB → `getActiveUUIDStatus(ids)` |
| `sendMessage` tRPC | try legacy `sendMessage()` → catch → `sendMessageByConnectionId()` |
| `syncConversations` tRPC | Check UUID status in gate; pass `uuidConnectionIds` to `getProfilePictureUrl` |
| `getProfilePictureUrl` | Accept optional `uuidConnectionIds?: string[]`; fallback to UUID socket |

**Frontend — TanStack Query cache staleness**:

```typescript
// ❌ WRONG: Only getSessions invalidated — chat page gate stays closed
if (payload.status === "connected") {
  utils.baileys.getSessions.invalidate();
}

// ✅ CORRECT: Invalidate getStatus too — unlocks chat page gate
if (payload.status === "connected") {
  utils.baileys.getSessions.invalidate();
  utils.baileys.getStatus.invalidate();  // ← required for useWhatsAppProvider()
}
```

---

## Disconnect Reason Persistence

`lastDisconnectReason` must persist across session deletions.

**Problem**: When `disconnect()` is called, the session is deleted from memory. If `getSessionStatusSync()` is called afterward (e.g., when user clicks "Gerar QR Code"), it returns status WITHOUT `lastDisconnectReason`, preventing proper reset detection.

**Solution**: Use a separate `persistentLastDisconnectReason` Map that survives session deletions:

```typescript
class BaileysService {
  private readonly persistentLastDisconnectReason = new Map<number, string>();

  // In disconnect():
  if (session.lastDisconnectReason) {
    this.persistentLastDisconnectReason.set(mentoradoId, session.lastDisconnectReason);
  }
  if (options?.clearAuth) {
    this.persistentLastDisconnectReason.delete(mentoradoId);
  }

  // In getSessionStatusSync():
  if (!session) {
    const persistedReason = this.persistentLastDisconnectReason.get(mentoradoId);
    return { ..., lastDisconnectReason: persistedReason };
  }

  // On successful connection ("open"):
  this.persistentLastDisconnectReason.delete(mentoradoId);
}
```

**Why this matters**: The `shouldResetAuthBeforeConnect` check in `baileys-router.ts` relies on `lastDisconnectReason` to decide whether to clear stale auth state before reconnecting. Without persistence, this check fails and stale auth causes reconnect loops.

---

## Realtime Frontend Strategy

- Primary channel: WebSocket for Baileys events.
- Fallback channel: SSE when WS is unavailable.

Event contract (target):
- `message:new`
- `connection:status`
- `connection:qr`
- `connection:error`

Rules:
- Keep existing message payload shape to avoid UI/API regressions.
- Frontend realtime reconnect is independent from Baileys socket reconnect.
- Debounce high-frequency presence/typing events to avoid UI thrash.

---

## Health Monitoring Policy

- Ping/pong cycle every 60s.
- Consider socket unhealthy if no pong within 5s.
- On unhealthy socket, recycle socket and enter reconnect flow.
- Track: `lastMessageAt`, `lastConnectedAt`, `reconnectCount`, `currentStatus`.
- Expose health endpoint (target): `/api/whatsapp/health`.
- Alert when reconnect count exceeds threshold in short window (e.g., >3 in 5 min).

---

## Setup and Runtime Baseline

1. Confirm `@whiskeysockets/baileys` dependency in `package.json`.
2. Confirm `baileys_sessions` schema is present and exported.
3. Start backend with Bun and verify no startup errors.
4. Connect one mentorado at a time during first auth.
5. Confirm reconnect and message flow before enabling broader traffic.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BAILEYS_ENABLE_LOGGING` | `false` | Toggle structured Baileys logger |
| `BAILEYS_LOG_LEVEL` | `warn`/`silent` | Controls pino verbosity |

---

## Troubleshooting: SSE Not Receiving Events

**Root Cause**: SSE requires `withCredentials: true` for authenticated requests, but CORS wildcard (`origin: "*"`) silently disables credentials.

**Symptoms**: No explicit browser console error, SSE connection closes immediately or returns 401/403, QR never appears, `onStatusUpdate` never fires.

**Diagnosis**:
1. Check backend startup logs for: `"cors_wildcard_origin"`, `"Credentials disabled"`
2. Verify container env: `docker inspect <container> --format '{{range .Config.Env}}{{println .}}{{end}}' | grep CORS`
3. Test SSE endpoint directly:
   ```bash
   curl -I -H "Origin: https://your-domain.com" https://your-domain.com/api/chat/events
   # Should return:
   # access-control-allow-credentials: true
   # access-control-allow-origin: https://your-domain.com
   ```

**Fix**:
1. Add `CORS_ORIGIN=https://your-domain.com` to `.env`
2. Ensure `docker-compose.deploy.yml` includes `CORS_ORIGIN: ${CORS_ORIGIN}`
3. Recreate container: `docker compose -f docker-compose.deploy.yml up -d --force-recreate app`

**Code Reference** (`apps/api/src/_core/index.ts`):
```typescript
const configuredCorsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",").map((o) => o.trim()).filter((o) => o.length > 0);
const useWildcardCors = configuredCorsOrigins.length === 0 || configuredCorsOrigins.includes("*");

app.use("*", cors(
  useWildcardCors
    ? { origin: "*", credentials: false }   // ← Problem: credentials disabled
    : { origin: configuredCorsOrigins, credentials: true }
));
```

**Prevention**: Never use `CORS_ORIGIN=*` in production. Always set exact frontend domain.

---

## Troubleshooting: UUID Path Infinite Spinner

**Root Cause**: `createConnectionByUUID` has incomplete `DisconnectReason` handlers. If only `loggedOut` and `restartRequired` are handled, corrupted/stale sessions clear auth but **never reconnect**.

**Symptoms**: UI shows "Conectando..." indefinitely, QR never appears, restart or delete+re-add fixes temporarily, backend logs show `disconnect:500` or `disconnect:411` with no subsequent reconnect.

**Diagnosis**:
```bash
docker logs app --tail 100 | grep -E 'disconnect:|baileys\[uuid\]'
# badSession/multideviceMismatch/loggedOut without 'Generating QR' after → UUID handler missing
```

**Fix**: Ensure `createConnectionByUUID`'s `if (connection === "close")` block handles all reasons:

```typescript
// ❌ WRONG: clearAuth without auto-reconnect — user stuck forever
if (statusCode === DisconnectReason.loggedOut) {
  this.disconnectByConnectionId(connectionId, { clearAuth: true }).catch(() => {});
  return;  // ← never reconnects! user must delete and re-add
}

// ✅ CORRECT: clearAuth + auto-reconnect → triggers new QR
if (statusCode === DisconnectReason.loggedOut) {
  this.disconnectByConnectionId(connectionId, { clearAuth: true }).catch(() => {});
  setTimeout(() => {
    this.connectByConnectionId(connectionId, mentoradoId).catch(() => {});
  }, 1000);
  return;
}
// Same pattern for: badSession (500), multideviceMismatch (411)
// Plus: 428 → rate-limit backoff, 405 → connectionReplaced, 408 → timedOut,
//       503 → extended backoff, 403 → disconnect without clearAuth
```

**Reference**: `apps/api/src/services/baileys-service.ts` — legacy `createConnection` (mentoradoId path) is the correct template.

---

## Troubleshooting: syncConversations Crashing Server

**Root Cause Pattern**: `syncConversations` calls `getProfilePictureUrl` (network I/O) for every contact in a loop. Three bugs cause server crashes:
1. No per-iteration error handling → one Baileys socket error → unhandled rejection → `process.exit(1)`
2. Unbounded loop → hundreds of contacts × network round-trips → gateway timeout → 502
3. `linkOrphanMessages` without try/catch → DB error aborts entire sync before loop starts

**Symptoms**: User opens chat page → `syncConversations` starts → `502` → `ERR_HTTP2_PROTOCOL_ERROR` on SSE → server restarts → `404` on all API routes for several seconds.

```typescript
// ❌ WRONG: No guards, no cap
for (const phone of uniquePhones) {
  const picUrl = await baileysService.getProfilePictureUrl(mentoradoId, phone);
  await db.update(whatsappContacts).set({ profilePicUrl: picUrl }).where(...);
}

// ✅ CORRECT: Cap + per-iteration try/catch + linkOrphanMessages guard
const MAX_SYNC_CONTACTS = 50;
try { await linkOrphanMessages(mentoradoId); } catch (err) { logger.warn("linkOrphanMessages failed", err); }

for (const phone of uniquePhones.slice(0, MAX_SYNC_CONTACTS)) {
  try {
    const picUrl = await baileysService.getProfilePictureUrl(mentoradoId, phone, uuidConnectionIds);
    if (picUrl) {
      await db.update(whatsappContacts).set({ profilePicUrl: picUrl }).where(...);
    }
  } catch (err) {
    logger.warn({ phone }, "getProfilePictureUrl failed — skipping contact");
  }
}
```

**Rule**: Any loop calling `getProfilePictureUrl` or any Baileys socket method MUST be individually wrapped in try/catch AND have a cap (≤50 items per sync invocation).

---

## Troubleshooting: SSE QR Payload Missing connectionId

**Root Cause**: When `BaileysQrEventPayload` and the SSE `status_update` broadcast omit `connectionId`, the frontend cannot optimistically update the TanStack Query cache and must wait for `invalidate()` + refetch round-trip.

**Fix**: Propagate `connectionId` through the entire chain:

```typescript
// 1. baileys-service.ts — add connectionId to BaileysQrEventPayload interface
export interface BaileysQrEventPayload {
  connectionId?: string;  // ← add this
  qr: string;
}

// 2. baileys-webhook.ts — include connectionId in SSE broadcast
baileysSessionManager.on("qr", ({ mentoradoId, qr, status, connected, connectionId }) => {
  sseService.broadcast(mentoradoId, "status_update", {
    status, connected, qr, connectionId, provider: "baileys",
  });
});

// 3. use-s-s-e.ts — extend ChatSSEStatusUpdatePayload
export interface ChatSSEStatusUpdatePayload {
  connectionId?: string;  // ← add this
  qr?: string;
}

// 4. handleStatusUpdate — optimistic cache update
if (payload.qr && payload.connectionId) {
  utils.baileys.getSessions.setData(undefined, (prev) => {
    if (!prev) return prev;
    return prev.map((conn) =>
      conn.id === payload.connectionId
        ? { ...conn, qr: payload.qr ?? undefined, status: "connecting" as const }
        : conn,
    );
  });
}
utils.baileys.getSessions.invalidate();
```

---

## History Sync Implementation

History sync delivers past messages on reconnect via `messaging-history.set`. Baileys silently skips it without explicit configuration.

### makeWASocket Config (Both Paths Required)

```typescript
// ✅ CORRECT — add to BOTH legacy AND UUID makeWASocket calls
const socket = makeWASocket({
  syncFullHistory: false,                   // old API, no-op in v6+ — keep for compat
  shouldSyncHistoryMessage: () => true,     // ← CRITICAL: without this, history never fires
});

// ❌ WRONG — history silently skipped
const socket = makeWASocket({
  syncFullHistory: false,
  // shouldSyncHistoryMessage missing
});
```

### Event Handlers (Both Paths Required)

Register on BOTH `createConnection` (legacy) and `createConnectionByUUID` (UUID):

```typescript
socket.ev.on("messaging-history.set", ({ chats, contacts, messages, isLatest }) => {
  this.emit("history", { mentoradoId, messages, contacts, chats, isLatest });
});
socket.ev.on("chats.upsert", (chats) => {
  this.emit("chats-upsert", { mentoradoId, chats });
});
```

### Persisting History (baileys-webhook.ts)

```typescript
baileysSessionManager.on("history", async ({ mentoradoId, messages, contacts, isLatest }) => {
  // 1. INSERT contacts in chunks of 100 with onConflictDoNothing()
  for (const chunk of chunkArray(contacts, 100)) {
    try {
      await db.insert(whatsappContacts).values(chunk).onConflictDoNothing();
    } catch (err) { logger.warn({ err }, "history: contacts chunk failed"); }
  }

  // 2. Pre-fetch existing zapiMessageIds in batches of 200 to build dedup Set
  //    (zapiMessageId has an index but NOT a UNIQUE constraint — onConflictDoNothing with target won't work)
  const allZapiIds = messages.map((m) => m.zapiMessageId).filter(Boolean);
  const existingIds = new Set<string>();
  for (const batch of chunkArray(allZapiIds, 200)) {
    const rows = await db.select({ id: whatsappMessages.zapiMessageId })
      .from(whatsappMessages)
      .where(and(
        eq(whatsappMessages.mentoradoId, mentoradoId),
        inArray(whatsappMessages.zapiMessageId, batch),
      ));
    for (const r of rows) { if (r.id) existingIds.add(r.id); }
  }

  // 3. INSERT only new messages in chunks of 100
  const newMessages = messages.filter((m) => !m.zapiMessageId || !existingIds.has(m.zapiMessageId));
  for (const chunk of chunkArray(newMessages, 100)) {
    try {
      await db.insert(whatsappMessages).values(chunk);
    } catch (err) { logger.warn({ err }, "history: messages chunk failed"); }
  }
});
```

**Key rules:**
- Pre-fetch dedup set BEFORE the insert loop — not inside it (avoids N+1 queries)
- Each chunk in its own try/catch — one bad chunk must not abort remaining chunks
- Never use `onConflictDoNothing()` with a target column that lacks a UNIQUE constraint

### fetchOlderMessages Pattern (Cursor + Baileys Fallback)

```typescript
// 1. Try DB first (cursor-based, fast)
const dbMessages = await db.select()
  .from(whatsappMessages)
  .where(and(
    eq(whatsappMessages.mentoradoId, mentoradoId),
    eq(whatsappMessages.phone, phone),
    lt(whatsappMessages.id, input.oldestMessageId),  // cursor
  ))
  .orderBy(desc(whatsappMessages.id))
  .limit(input.count);

if (dbMessages.length >= input.count) {
  return { messages: dbMessages.toReversed(), source: "db" };
}

// 2. DB exhausted → fetch from Baileys (triggers messaging-history.set → webhook persists)
const oldest = dbMessages.at(-1) ?? null;
await baileysService.fetchMessageHistory(
  mentoradoId,
  input.count - dbMessages.length,
  oldest ? { id: oldest.zapiMessageId!, remoteJid: jid } : undefined,
  oldest ? Math.floor(new Date(oldest.createdAt).getTime() / 1000) : undefined,
);

// 3. Wait for webhook to persist (fire-and-forget with 2s settling window)
await new Promise((resolve) => setTimeout(resolve, 2000));

// 4. Re-query DB for newly persisted messages
const freshMessages = await db.select()...
return { messages: freshMessages.toReversed(), source: "baileys" };
```

**Composite index required** on `whatsapp_messages`:
```typescript
index("whatsapp_messages_mentorado_phone_created_idx").on(
  table.mentoradoId, table.phone, table.createdAt
)
```

---

## Conversation Performance

### getAllConversations — SQL Aggregation (Not JS Map)

```typescript
// ❌ WRONG: loads ALL messages into memory, O(n) no LIMIT, aggregates in JS
const allMessages = await db.select().from(whatsappMessages).where(...);
const map = new Map<string, ConversationData>();
for (const msg of allMessages) {
  const existing = map.get(msg.phone) ?? { messageCount: 0 };
  map.set(msg.phone, { ...existing, messageCount: existing.messageCount + 1 });
}
// Also WRONG: calling linkOrphanMessages() inside a read query

// ✅ CORRECT: aggregate at SQL level — O(1) memory, leverages index
const conversations = await db
  .select({
    phone: whatsappMessages.phone,
    messageCount: count(),
    unreadCount: sql<number>`count(*) filter (where direction = 'inbound' and status != 'read')`,
    lastMessageAt: max(whatsappMessages.createdAt),
    lastMessage: sql<string>`(
      SELECT content FROM whatsapp_messages m2
      WHERE m2.mentorado_id = ${mentoradoId} AND m2.phone = whatsapp_messages.phone
      ORDER BY m2.id DESC LIMIT 1
    )`,
  })
  .from(whatsappMessages)
  .where(eq(whatsappMessages.mentoradoId, mentoradoId))
  .groupBy(whatsappMessages.phone)
  .orderBy(desc(max(whatsappMessages.createdAt)));
```

**Rules:**
- Never call `linkOrphanMessages()` inside a query — it's a write op, call it separately with try/catch
- Use `COUNT(*) FILTER (WHERE ...)` instead of JS filtering for unread counts

### Connection-Aware Conversation Filtering (Multi-Number Support)

`getAllConversations` must filter by `senderConnectionName` when a mentorado has multiple connections:

```typescript
// Accept optional filter
getAllConversations: protectedProcedure
  .input(z.object({ connectionName: z.string().optional() }).optional())
  .query(async ({ ctx, input }) => {
    db.select().from(whatsappMessages)
      .where(
        input?.connectionName
          ? and(
              eq(whatsappMessages.mentoradoId, mentoradoId),
              eq(whatsappMessages.senderConnectionName, input.connectionName)
            )
          : eq(whatsappMessages.mentoradoId, mentoradoId)
      )
  })
```

**Data integrity**: `senderConnectionName` must be set on ALL messages:
1. Webhook (inbound + outbound echo): set via `senderConnectionName` from event payload
2. `sendMessage` router (outbound direct): explicitly set `senderConnectionName: activeConn?.displayName ?? null`
3. Webhook outbound early-return: backfill `senderConnectionName` if null

**Frontend**: `ConnectionSelector` component above conversation list; auto-selects first connected session. Hook: `useWhatsAppConversations` accepts `connectionName` option.

### ConversationItem Memoization

```typescript
// ✅ CORRECT: React.memo with custom comparator — prevents re-renders on every SSE typing event
export const ConversationItem = React.memo(
  function ConversationItem({ conversation, isSelected, ... }: Props) { ... },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.conversation.phone === next.conversation.phone &&
    prev.conversation.lastMessage === next.conversation.lastMessage &&
    prev.conversation.lastMessageAt === next.conversation.lastMessageAt &&
    prev.conversation.unreadCount === next.conversation.unreadCount &&
    prev.isTyping === next.isTyping &&
    prev.isOnline === next.isOnline,
);

// ❌ WRONG: no memo — all items re-render on every SSE typing/presence event
export function ConversationItem({ ... }: Props) { ... }
```

### Status Query staleTime

```typescript
// ✅ CORRECT: prevent unnecessary refetches
const baileysStatus = trpc.baileys.getStatus.useQuery(undefined, {
  staleTime: 30_000,   // treat data as fresh for 30s
  gcTime: 5 * 60_000,
  refetchInterval: (query) => query.state.data?.connected ? 30_000 : 5_000,
});
```

### motion/react — LazyMotion vs Tailwind

| Approach | When to use | Bundle impact |
|----------|-------------|---------------|
| `Tailwind animate-in/fade-in` | Simple enter animations (opacity, translate) | ~0 KB |
| `LazyMotion + domAnimation + m.*` | Complex gestures, spring physics, layout animations | ~17 KB (lazy) |
| `motion.*` (full) | Avoid — loads full 27 KB bundle eagerly | ~27 KB |

```typescript
// ✅ LazyMotion
import { LazyMotion, domAnimation, m } from "motion/react";
<LazyMotion features={domAnimation}>
  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</m.div>
</LazyMotion>

// ✅ Tailwind (simplest)
<div className="animate-in fade-in slide-in-from-bottom-2 duration-200">...</div>
```

---

## Before Merge Checklist

- [ ] Paths and architecture references match current repo layout (`apps/...`)
- [ ] Provider priority documented as `Baileys > Z-API > Meta (admin)`
- [ ] Full disconnect reason matrix documented (401, 408, 411, 428, 440, 500, 503, 515)
- [ ] Session persistence policy includes dual-write progressive rollout
- [ ] Realtime policy documents WS-first with SSE fallback
- [ ] Health monitoring section includes ping/pong + reconnect counters
- [ ] Troubleshooting avoids destructive cleanup guidance
- [ ] `shouldSyncHistoryMessage: () => true` present in BOTH `makeWASocket` calls (legacy + UUID)
- [ ] `messaging-history.set` handler registered on BOTH legacy and UUID connection paths
- [ ] History persistence in `baileys-webhook.ts` uses pre-fetch dedup (not onConflictDoNothing with target)
- [ ] `getAllConversations` uses SQL GROUP BY aggregation (not JS Map over full result set)
- [ ] `ConversationItem` wrapped in `React.memo` with custom comparator
- [ ] Composite index `(mentorado_id, phone, created_at)` on `whatsapp_messages` applied
- [ ] `python3 .claude/skills/skill-creator/scripts/quick_validate.py .claude/skills/baileys-integration` passes

---

## Anti-Patterns Reference

| Anti-Pattern | Why |
| --- | --- |
| Reconnect loops without capped backoff | Causes bans and instability |
| Direct filesystem auth in production | Unsafe in distributed runtime |
| Silent auth write failures | Corrupts session recovery |
| Deleting session rows without backup | Irreversible auth loss |
| Bypassing session manager layer | Breaks centralized lifecycle control |
| Registering duplicate socket listeners | Leads to leaks and duplicated events |
| Breaking payload contracts during realtime migration | Causes frontend regressions |
| UUID path with partial DisconnectReason handlers | Stale sessions clear auth but never reconnect — infinite spinner |
| clearAuth without auto-reconnect in UUID path | User stuck, must delete+re-add connection |
| SSE status_update without connectionId | Frontend cannot target correct connection in optimistic update |
| Not clearing qrTimer in 405/428 handlers | qrTimer fires at 90s → sets shouldRun=false → kills 5-min backoff |
| "Reconectar" button visible during 405 backoff | User clicks → immediate retry → 428 → loop |
| getStatus only checking legacy sessions Map | UUID connections always show "disconnected" |
| getStatus cache not invalidated on SSE connected | Chat page gate stays closed after QR scan |
| sendMessage only using legacy sessions Map | UUID connections can't send messages |
| syncConversations loop without per-iteration try/catch | One error → unhandled rejection → process.exit(1) → 502 |
| syncConversations loop without contact cap | Hundreds × network I/O → gateway timeout → 502 |
| getAllConversations without connection filter | Old disconnected number's conversations mix with new number's |
| senderConnectionName not set in sendMessage router | Outbound messages invisible when filtering by connection |
| Missing `shouldSyncHistoryMessage` in makeWASocket | `messaging-history.set` never fires — history silently skipped |
| `messaging-history.set` handler on only one path | UUID or legacy path misses all history on reconnect |
| History dedup with `onConflictDoNothing()` without UNIQUE constraint | zapiMessageId lacks UNIQUE — must pre-fetch existing IDs into Set |
| `getAllConversations` aggregating in JS Map | O(n) memory, no LIMIT; use SQL GROUP BY instead |
| `linkOrphanMessages()` inside a read query | Write operation — call separately with try/catch |
| ConversationItem without React.memo | All items re-render on every SSE typing/presence event |
| Raw `new EventSource(...)` in chat components | Bypasses `useSSE` hook — duplicates listeners, no cleanup |
| Status queries without `staleTime` | Unnecessary refetches; set `staleTime: 30_000` |
| `motion.*` (full import) in chat components | Loads full 27 KB framer-motion eagerly |
