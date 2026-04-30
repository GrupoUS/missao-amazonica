<!-- Agent instruction: Append a new entry whenever you fix a non-obvious bug
or discover a frontend pattern. Format: ## YYYY-MM-DD — [short title]
Describe: what happened, root cause, fix applied, how to avoid. -->

# Frontend Learnings — Reference Patterns

> Consolidated frontend implementation learnings for selective context loading.
> Source lineage: extracted from prior Tier 3 frontend learnings and relocated into `design-specs/` so frontend priming can load it only when relevant.

## Purpose

This document captures **high-value frontend bug patterns and implementation rules** that should be loaded **on demand**, not by default.

Use this file when working on:

- React rendering performance
- polling or SSE-driven UI
- virtualized lists or drag-and-drop surfaces
- mutation UX and optimistic updates
- rich text / HTML rendering
- camera, media, or browser API flows
- complex tab, panel, or workspace interactions

Do **not** auto-load this for every frontend task. Prefer loading only the sections relevant to the current change.

---

## 1. Referential Stability at Module Scope

### Rule

Do not create arrays, objects, `Intl` instances, or regexes inside render paths when they can be hoisted to module scope.

### Why

New references on every render break memoization, increase child re-renders, and degrade performance in polling-heavy screens.

### Wrong

```/dev/null/example.tsx#L1-7
function MyComponent() {
  const steps = [{ id: 1, label: "Step 1" }];
  const defaults = { nome: "", email: "" };
  const formatter = new Intl.NumberFormat("pt-BR");
  return null;
}
```

### Correct

```/dev/null/example.tsx#L1-8
const STEPS = [{ id: 1, label: "Step 1" }];
const DEFAULTS = { nome: "", email: "" };
const PT_BR_FORMATTER = new Intl.NumberFormat("pt-BR");

function MyComponent() {
  return null;
}
```

---

## 2. Conditional Queries Must Use `skipToken`

### Rule

When a query depends on an optional value, use `skipToken`. Never fake the input with `?? 0` plus `enabled: false`.

### Why

Fallback values pollute the cache with invalid keys and create hard-to-debug stale data behavior.

### Wrong

```/dev/null/example.ts#L1-8
const safeId = issueId ?? 0;

const query = trpc.workspace.issue.get.useQuery(
  { issueId: safeId },
  { enabled: issueId !== null }
);
```

### Correct

```/dev/null/example.ts#L1-7
import { skipToken } from "@tanstack/react-query";

const query = trpc.workspace.issue.get.useQuery(
  issueId !== null ? { issueId } : skipToken
);
```

---

## 3. Polling Requires Cache Symmetry

### Rule

Whenever a query uses `refetchInterval`, `staleTime` must be equal to it. `gcTime` must be greater than or equal to `staleTime`.

### Why

Without matching freshness windows, route changes or remounts trigger unnecessary duplicate fetches.

### Correct Pattern

```/dev/null/example.ts#L1-7
trpc.workspace.issue.list.useQuery(
  { channelId },
  {
    refetchInterval: 10_000,
    staleTime: 10_000,
  }
);
```

---

## 4. `React.memo` Is Mandatory in Hot List Surfaces

### Rule

Wrap components rendered inside virtualized lists, drag-and-drop lists, or frequently refreshed parents with `React.memo`.

### Why

If parent queries refresh from polling or SSE, non-memoized children re-render at scale even when unchanged.

### Required Targets

- virtualized row components
- kanban cards
- chat message bubbles
- droppable containers
- sortable list items

### Correct Pattern

```/dev/null/example.tsx#L1-3
export const MessageBubble = memo(function MessageBubble(props) {
  return <div />;
});
```

---

## 5. Debounce High-Frequency Mutations

### Rule

Do not fire mutations on every keystroke for typing indicators, autosave previews, or similar transient signals.

### Why

This floods the backend with low-value requests and destabilizes real-time features.

### Correct Pattern

```/dev/null/example.tsx#L1-15
const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

if (typingDebounceRef.current) {
  clearTimeout(typingDebounceRef.current);
}

typingDebounceRef.current = setTimeout(() => {
  startTyping.mutate({ channelId });
}, 300);

useEffect(() => {
  return () => {
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
  };
}, []);
```

---

## 6. Never Call `setState` in the Render Body

### Rule

Do not conditionally call state setters inside the component body. Use `useEffect`.

### Why

This creates render loops and unstable UI synchronization.

### Wrong

```/dev/null/example.tsx#L1-7
function PanelManager({ initialType }) {
  if (panels[0]?.type !== initialType) {
    setPanels(prev => [{ ...prev[0], type: initialType }, ...prev.slice(1)]);
  }

  return null;
}
```

### Correct

```/dev/null/example.tsx#L1-8
function PanelManager({ initialType }) {
  useEffect(() => {
    setPanels(prev => [{ ...prev[0], type: initialType }, ...prev.slice(1)]);
  }, [initialType]);

  return null;
}
```

---

## 7. Precompute Lookup Maps for Calendar and Grouped Views

### Rule

When grouping events by day or entity, build a memoized lookup map once instead of repeatedly filtering inside render loops.

### Why

This changes repeated `O(days × events)` work into `O(events)` preprocessing plus `O(1)` lookups.

### Correct Pattern

```/dev/null/example.tsx#L1-13
const EMPTY_EVENTS: Event[] = [];

const eventsByDay = useMemo(() => {
  const map = new Map<string, Event[]>();

  events.forEach((event) => {
    const key = event.date.split("T")[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(event);
  });

  return map;
}, [events]);
```

---

## 8. `dangerouslySetInnerHTML` Requires Sanitization

### Rule

Any HTML rendered through `dangerouslySetInnerHTML` must be sanitized first.

### Why

Unsanitized HTML is an XSS vector.

### Correct Pattern

```/dev/null/example.tsx#L1-6
const safeHtml = useMemo(() => DOMPurify.sanitize(rawHtml), [rawHtml]);

return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
```

---

## 9. Fetch Calls Need Timeouts

### Rule

Do not use naked `fetch()` in frontend code for important flows. Add a timeout using `AbortController`.

### Why

Network hangs otherwise become unbounded UX stalls.

### Correct Pattern

```/dev/null/example.ts#L1-13
async function fetchWithTimeout(input: RequestInfo | URL, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## 10. Consent and Compliance Fields Must Never Be Fabricated

### Rule

If a compliance-critical field such as LGPD consent is missing, fail explicitly. Never invent fallback timestamps or values.

### Why

A fabricated fallback creates false legal state.

### Correct Pattern

```/dev/null/example.ts#L1-3
if (!lgpdConsentAt) {
  throw new Error("LGPD consent missing");
}
```

---

## 11. Camera and Media Flows Need Explicit Cleanup

### Rule

Camera workflows must stop tracks, cancel animation frames, and validate video dimensions before capture.

### Why

Without cleanup, the browser may keep the camera active or attempt invalid canvas operations.

### Checklist

- stop all media tracks on cancel
- cancel any RAF loop before closing
- guard against `videoWidth` / `videoHeight` being zero
- only start detection loops after detector initialization succeeds

---

## 12. Tabs Need Explicit Scroll Ownership

### Rule

When a tab panel contains tall content, provide an internal scroll container where appropriate instead of letting content clip.

### Why

A full-height tab without internal overflow handling truncates content.

### Correct Pattern

```/dev/null/example.tsx#L1-5
<TabsContent className="m-0 h-full">
  <div className="h-full overflow-y-auto">
    <Component />
  </div>
</TabsContent>
```

---

## 13. Mutation Errors Must Clear on Success

### Rule

Any local mutation error state must be reset in `onSuccess` before subsequent success handling.

### Why

Otherwise a stale error banner can survive after the operation actually succeeds.

---

## 14. Selective Loading Guidance

Load this document only when the task includes one or more of these signals:

| Signal | Load Priority |
|---|---|
| polling, refetch, realtime, SSE | High |
| virtualized list, kanban, DnD, chat | High |
| memoization, rerender, performance | High |
| mutation UX, debounce, autosave | Medium |
| HTML rendering, sanitization | High |
| camera, media capture | High |
| tabs, panels, layout clipping | Medium |

For basic presentational tweaks, this file should remain unloaded to preserve context budget.

---

## 2026-04-28 — Frozen `useMemo([])` ranges break navigation-driven queries

**What happened:** `apps/web/src/pages/agenda.tsx` derived its event-fetch
range with `useMemo([])` against page-mount `now`. The range never updated
when the user navigated. Any view past the initial 4-month window came up
empty.

**Root cause:** Treating "the visible range" as a mount-time constant
instead of a function of the controlled view + date.

**Fix:** Control RBC's `view` and `date` props (`onView`, `onNavigate`)
and derive the range with a pure helper (`rangeForView` in
`apps/web/src/lib/agenda-time.ts`). Pad generously around the visible
window so navigation does not refetch every step but cannot fall outside
the window.

**Prevent:** Whenever a query depends on user navigation state, recompute
the query key from the navigation state — never freeze it at mount.

## 2026-04-28 — `toISOString().split("T")[0]` shifts the day across midnight UTC

**What happened:** Form-default values for `<input type="date">` used
`event.start.toISOString().split("T")[0]`. For users in non-UTC zones
near midnight, the displayed date was off by one.

**Fix:** New `toLocalDateString(date)` helper in `agenda-time.ts` that
formats the local date components directly. Same for time.

**Prevent:** Treat `toISOString()` as a UTC operation and never use it for
display strings tied to wall-clock dates. Use local-component formatters
or a TZ-aware library.

## 2026-04-28 — Branch on structured codes, not localized message substrings

**What happened:** Frontend recovered from auth errors by matching
substrings of Portuguese messages. A copy edit could silently break
recovery.

**Fix:** Backend now exposes `error.data.appCode` (typed). Frontend
branches on the code first; substring fallback retained for builds
during the rollout window.

**Prevent:** Never make user-recovery flow dependent on localized strings.
If the backend emits a structured error, the client must consume it
structurally.

---

## 2026-04-29 — Dead `raw.includes("CODE")` branches when server emits PT-BR

**What happened:** `ai-chat-widget.tsx` `onError` had branches like
`if (raw.includes("NO_IMAGE")) toast.error(...)` and
`if (raw.includes("AMBIGUOUS_REQUEST")) toast.error(...)`. The server
actually emits localized PT-BR messages (`"Anexe uma foto do paciente..."`),
never the bare codes — both branches were unreachable dead code that gave
false confidence the cases were handled.

**Fix:** Either (preferred) read `e.data.code` (TRPCError code, always typed)
or pass `cause: { code }` server-side and read `e.data.appCode` per the
existing tRPC error formatter pattern. Drop substring branches entirely:

```ts
// ❌ WRONG — server never emits the raw code in `message`
if (raw.includes("NO_IMAGE")) { ... }

// ✅ CORRECT — branch on structured fields
if (e.data?.code === "BAD_REQUEST" && /foto/i.test(raw)) { ... }
// or, with cause plumbed through:
if (e.data?.appCode === "NO_IMAGE") { ... }
```

**Prevent:** Before adding `raw.includes("X")` in any error handler, check
what the corresponding `throw new TRPCError({ code, message })` actually
sends. If the message is a localized human string, the substring branch is
dead. Read 13-backend-learnings.md (`Expose structured error codes via tRPC
errorFormatter`) for the canonical pattern.
