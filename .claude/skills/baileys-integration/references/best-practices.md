# Baileys Best Practices

> Official patterns from `@whiskeysockets/baileys` documentation + project-specific patterns.

---

## Official Baileys Patterns

### 1. Auth State Management

**Official**: Use `useMultiFileAuthState()` for file-based storage.
**Project**: Uses custom `usePostgresAuthState()` in `baileysAuthState.ts` — stores all auth data in PostgreSQL `baileys_sessions` table. This is the correct approach for multi-instance deployments.

```typescript
// ✅ Project pattern (PostgreSQL)
const { state, saveCreds } = await usePostgresAuthState(mentoradoId);
const sock = makeWASocket({ auth: state });
sock.ev.on('creds.update', saveCreds);
```

### 2. Cacheable Signal Key Store

**Status**: ✅ Implemented in all three `makeWASocket` call sites (`baileys-sync-loop.ts`, `baileys-auth-flow.ts`, `baileys-service.ts`).

```typescript
const sock = makeWASocket({
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
});
```

**Impact**: Reduces DB reads during message decryption. The PostgreSQL signal key store is still the source of truth (`baileys-auth-state.ts`); the cache layer fronts it.

### 3. Browser Identity

Set consistent browser identity to avoid session conflicts and improve stability:

```typescript
import { Browsers } from '@whiskeysockets/baileys';

const sock = makeWASocket({
  browser: Browsers.macOS('Desktop'),
  markOnlineOnConnect: false,
  syncFullHistory: false, // true only if you need historical messages
});
```

### 4. Batch Event Processing

**Status**: ⚠️ v1 (`baileys-service.ts`) uses `sock.ev.process()`. v2 (`baileys-sync-loop.ts`) registers discrete `sock.ev.on(...)` handlers per event — acceptable because v2 owns one socket per connection so there is no cross-session race to batch.

Instead of individual `sock.ev.on()` calls, use `ev.process()`:

```typescript
sock.ev.process(async (events) => {
  if (events['connection.update']) { /* ... */ }
  if (events['creds.update']) { await saveCreds(); }
  if (events['messages.upsert']) { /* ... */ }
  if (events['contacts.update']) { /* ... */ }
  if (events['messaging-history.set']) { /* bulk import */ }
});
```

**Benefits**: Atomic batch processing, fewer race conditions, cleaner code.

### 5. `getMessage()` Callback

Required for poll vote decryption and resending missing messages:

```typescript
const sock = makeWASocket({
  getMessage: async (key) => {
    // Retrieve from your database
    return { conversation: 'fallback content' };
  }
});
```

### 6. Reconnection Pattern

Official recommended pattern with `DisconnectReason`:

```typescript
sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'close') {
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
    if (shouldReconnect) {
      // Reconnect with exponential backoff
    }
  }
});
```

### 7. Pairing Code Authentication

Alternative to QR code — user enters a code in WhatsApp:

```typescript
if (qr && !sock.authState.creds.registered) {
  const code = await sock.requestPairingCode(phoneNumber);
  // Display code to user
}
```

---

## Project-Specific Patterns

### Singleton Service Pattern

`baileysService` is a singleton exported from `baileysService.ts`:

```typescript
// ✅ Always import the singleton
import { baileysService } from './services/baileysService';

// ❌ Never instantiate a new BaileysService
```

### Session Manager Layer

Always use `BaileysSessionManager` (not `BaileysService` directly) from router/webhook code:

```typescript
// ✅ Correct
import { baileysSessionManager } from './services/baileysSessionManager';
await baileysSessionManager.connect(mentoradoId);

// ❌ Incorrect — bypasses session tracking
import { baileysService } from './services/baileysService';
await baileysService.connect(mentoradoId);
```

### Phone Number Normalization

Always use `baileysService.normalizePhone()` for comparison and `baileysService.normalizeJid()` for sending:

```typescript
// For DB storage and comparison
const phone = baileysService.normalizePhone(rawPhoneOrJid);

// For sending messages via WhatsApp
const jid = baileysService.normalizeJid(phone);
```

### Event-Driven Architecture

Baileys events flow through:
1. `BaileysService` (emits typed events via `EventEmitter`)
2. `BaileysSessionManager` (proxies events with type-safe generics)
3. `baileysWebhook.ts` (listens and persists to DB)

Never bypass this chain by registering listeners directly on the WASocket.

### Message Content Extraction

Use `BaileysService.extractTextContent()` to safely extract text from any message type:

```typescript
const content = baileysService.extractTextContent(message.message);
// Handles: conversation, extendedTextMessage, imageMessage.caption,
// videoMessage.caption, documentMessage.caption, buttonsResponseMessage,
// listResponseMessage, templateButtonReplyMessage
```

---

---

## History Sync Pattern (2026-02-27)

### Enabling Full History Sync on Connect

Baileys will NOT send historical messages unless `shouldSyncHistoryMessage` is explicitly set:

```typescript
// ✅ CORRECT: Add to BOTH makeWASocket() calls (legacy + UUID path)
const socket = makeWASocket({
  // ... other config
  syncFullHistory: false,           // old API, no-op in v6+ — keep for compat
  shouldSyncHistoryMessage: () => true,  // ← CRITICAL: tells Baileys to deliver history
});
```

```typescript
// ❌ WRONG: Missing shouldSyncHistoryMessage — messaging-history.set never fires
const socket = makeWASocket({
  syncFullHistory: false,
  // shouldSyncHistoryMessage missing → history silently skipped
});
```

### Registering History Handlers (Both Paths Required)

```typescript
// ✅ Register in BOTH createConnection (legacy) AND createConnectionByUUID (UUID):
socket.ev.on("messaging-history.set", ({ chats, contacts, messages, isLatest }) => {
  this.emit("history", { mentoradoId, messages, contacts, chats, isLatest });
});
socket.ev.on("chats.upsert", (chats) => {
  this.emit("chats-upsert", { mentoradoId, chats });
});
```

### Persisting History Messages (baileys-webhook.ts)

Listen on `baileysSessionManager.on("history", ...)` and batch-insert with deduplication:

```typescript
baileysSessionManager.on("history", async ({ mentoradoId, messages, contacts }) => {
  // 1. Pre-fetch existing zapiMessageIds in batches of 200 to build dedup set
  // 2. INSERT contacts in chunks of 100 with onConflictDoNothing()
  // 3. INSERT only new messages (not in dedup set) in chunks of 100
  // Each chunk in try/catch — server stays alive even on DB transient errors
});
```

**Key deduplication logic:** Use `zapiMessageId` (stores Baileys `key.id`) for dedup — query existing IDs in batches before INSERT loop.

### getAllConversations — SQL Aggregation (Not JS Map)

**Anti-pattern (O(n) memory, no LIMIT):**
```typescript
// ❌ WRONG: loads ALL messages into memory, aggregates in JS
const allMessages = await db.select().from(whatsappMessages).where(...);
const map = new Map<string, ConversationData>();
for (const msg of allMessages) { /* aggregate */ }
```

**Correct pattern (SQL GROUP BY):**
```typescript
// ✅ CORRECT: aggregate at SQL level
const conversations = await db
  .select({
    phone: whatsappMessages.phone,
    messageCount: count(),
    unreadCount: sql<number>`count(*) filter (where direction = 'inbound' and status != 'read')`,
    lastMessageAt: max(whatsappMessages.createdAt),
    // correlated subquery for lastMessage content
  })
  .from(whatsappMessages)
  .where(eq(whatsappMessages.mentoradoId, mentoradoId))
  .groupBy(whatsappMessages.phone)
  .orderBy(desc(max(whatsappMessages.createdAt)));
```

**Also:** never call `linkOrphanMessages()` inside a read query — it's a write operation.

### fetchOlderMessages — Cursor + Baileys Fallback

```typescript
// 1. Try DB first (cursor-based)
const dbMessages = await db.select()...
  .where(and(..., lt(whatsappMessages.id, input.oldestMessageId)))
  .orderBy(desc(whatsappMessages.id))
  .limit(count);

// 2. If DB exhausted, call baileysService.fetchMessageHistory() which triggers
//    messaging-history.set → webhook persists → re-query DB
```

---

## CRM Lead Phone Normalization (2026-02-27)

### Problem

WhatsApp JIDs brasileiros podem vir em dois formatos:
- 12 dígitos: `551199999999` (sem 9o dígito — formato antigo)
- 13 dígitos: `5511999999999` (com 9o dígito — formato moderno)

Ao criar leads automaticamente via webhook, armazenar o telefone sem normalizar resulta em:
1. **Links `wa.me` quebrados** — `wa.me/551199999999` não abre o contato no WhatsApp
2. **Leads duplicados** — mesmo número aparece com e sem 9o dígito

### Anti-Patterns Identificados

```typescript
// ❌ ERRADO em findLeadByPhone (baileys-webhook.ts)
// Comparação exata — cria duplicado quando número muda de formato
return baileysService.normalizePhone(lead.telefone) === baileysService.normalizePhone(phone);

// ❌ ERRADO em findLeadByPhone (meta-webhook.ts)
// Last-8 sem DDD — false-match entre DDDs distintos (ex: 11 e 21)
return leadPhone.slice(-8) === normalizedPhone.slice(-8);

// ❌ ERRADO em findOrCreateLead
// Armazena telefone sem normalizar — wa.me link quebrado
telefone: phone,  // pode ser 12 dígitos sem 9o
```

### Solução Correta

```typescript
import { ensureBrazilian9thDigit, phonesMatch } from "../services/whatsapp-shared";

// ✅ CORRETO: findLeadByPhone — usa phonesMatch (DDD + last-8)
async function findLeadByPhone(mentoradoId: number, phone: string) {
  const allLeads = await db.select().from(leads).where(eq(leads.mentoradoId, mentoradoId));
  return allLeads.find((lead) => lead.telefone && phonesMatch(lead.telefone, phone)) ?? null;
}

// ✅ CORRETO: findOrCreateLead — normaliza antes de INSERT
async function findOrCreateLead(mentoradoId: number, phone: string, pushName?: string | null) {
  const existing = await findLeadByPhone(mentoradoId, phone);
  if (existing) return existing;

  const normalizedPhone = ensureBrazilian9thDigit(phone); // 12→13 dígitos
  const [created] = await db.insert(leads).values({
    telefone: normalizedPhone,   // ← sempre 13 dígitos para mobile BR
    email: `${normalizedPhone}@whatsapp.local`,
    // ...
  }).returning();
  return created ?? null;
}
```

### Onde Aplicar

| Arquivo | Função | Fix |
|---------|--------|-----|
| `baileys-webhook.ts` | `findLeadByPhone` | `phonesMatch()` |
| `baileys-webhook.ts` | `findOrCreateLead` | `ensureBrazilian9thDigit()` antes do INSERT |
| `meta-webhook.ts` | `findLeadByPhone` | `phonesMatch()` |
| `meta-webhook.ts` | `findOrCreateLead` | `ensureBrazilian9thDigit()` antes do INSERT |

Ambos os utilitários estão em `apps/api/src/services/whatsapp-shared.ts`.

---

## Improvement Roadmap (Post-Hardening 2026-04)

| Status | Improvement | Location |
|--------|-------------|----------|
| ✅ Done | `makeCacheableSignalKeyStore` across all sockets | sync-loop, auth-flow, service |
| ✅ Done | `getMessage()` callback — DB-backed in v1, `proto.Message.fromObject({})` in v2 | baileys-service.ts, baileys-sync-loop.ts |
| ✅ Done | `Browsers.macOS("NeonDash")` consistent | all sockets |
| ✅ Done | `keepAliveIntervalMs: 25_000` (down from 60s) | baileys-sync-loop.ts, baileys-service.ts |
| ✅ Done | `fireInitQueries: false`, `generateHighQualityLinkPreview: false` | all sockets |
| ✅ Done | `cachedGroupMetadata` with bounded LRU (500 entries, 1h TTL) | baileys-cache-helpers.ts |
| ✅ Done | Shared WA version TTL cache (1h, stale-on-failure) | baileys-cache-helpers.ts |
| ✅ Done | Windowed `shouldSyncHistoryMessage` via `BAILEYS_HISTORY_WINDOW_DAYS` (default 30d, `0` = unbounded) | baileys-cache-helpers.ts |
| ✅ Done | Debounced `saveCreds` (300ms trailing, flush on open/close) | baileys-sync-loop.ts |
| ✅ Done | FE polling: conversations 10s→60s, messages 5s→30s (SSE is the primary delivery path) | apps/web/src/hooks/use-whats-app-provider.ts |
| 🕒 Deferred | Pairing-code auth option | baileysRouter.ts + BaileysConnectionCard.tsx |
| 🕒 Deferred | Retire v1 singleton entirely | Sprint 7b cleanup |

## Resource Budget on VPS (Vultr 2-4GB RAM, Alpine Docker)

| Metric | Target | Notes |
|--------|--------|-------|
| Heap per active session | < 150 MB steady state | Measured via `process.memoryUsage().heapUsed` |
| Total API RSS with 2 active sessions | < 600 MB | Observed via `ps -o rss` on VPS |
| Initial history sync burst | < 30 days of messages | Tunable via `BAILEYS_HISTORY_WINDOW_DAYS` |
| Group metadata cache | max 500 entries, 1h TTL | Global — jids are globally unique |
| WA version cache TTL | 1h | Stale value preserved on fetch failure |
| creds.update debounce | 300ms trailing | Force-flushed on `open`/`close` |
| SSE heartbeat | 30s | Dead-client eviction |
| FE polling fallbacks | conversations 60s, messages 30s | Reconcile safety net over SSE |
