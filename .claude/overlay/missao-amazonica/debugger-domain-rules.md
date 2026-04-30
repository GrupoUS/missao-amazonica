# Consolidated Domain Rules

Merged from: frontend-rules, backend-design, clerk-neon-auth, super-audit, and webapp-testing (empty).

Use this file when a bug spans UI, API, auth, DB, and regression safety.

---

## Frontend Debug Rules

### Performance and React behavior

- Run independent async work in parallel (`Promise.all`) to avoid waterfalls.
- Prefer route-level and component-level lazy loading for heavy UI.
- Avoid namespace imports and barrel imports when bundle growth is suspected.
- Use query `select`, sensible `staleTime`, and optimistic updates only with rollback.
- Investigate re-renders before memoizing; memoize only expensive paths.

### UI integrity and accessibility checks

- Every interactive element must have visible focus (`focus-visible:*`).
- Inputs must have labels and correct type/autocomplete metadata.
- Avoid dead anchors (`href="#"`) for actions; use `<button>`.
- Keep image dimensions explicit to avoid CLS.
- For large lists, use virtualization.

### Design-system and component checks

- Prefer semantic tokens (`bg-primary`, `text-foreground`) over hardcoded values.
- Validate shadcn component usage before custom rewrites.
- If UI was generated with Stitch, verify auth/config first before blaming component code.

### Frontend anti-patterns to flag

- `transition: all`
- hardcoded hex colors instead of semantic tokens
- `outline-none` without focus replacement
- inline navigation handlers instead of links
- icon button without `aria-label`

### React Select controlled/uncontrolled warning

**Symptom:** `Warning: A component is changing an uncontrolled input to be controlled`

**Root Cause:** Select/Input value prop transitions from `undefined` to string.

**Fix Pattern:**

```typescript
// ❌ BEFORE: undefined -> string transition triggers warning
<Select value={field.value} />
<Select value={selectedPipeline ? selectedPipeline.id : undefined} />

// ✅ AFTER: Always string, never undefined
<Select value={field.value ?? ""} />
<Select value={selectedPipeline ? selectedPipeline.id : ""} />
```

**Why:** React treats `undefined` as uncontrolled and any string as controlled. When a form field initializes with `undefined` (no default) and receives a value on user input, React warns about the mode switch. Always provide empty string fallback.
---

## Backend Debug Rules

### Canonical request boundary

1. Parse request.
2. Apply abuse controls (rate/payload).
3. Resolve auth identity.
4. Compose typed context.
5. Enforce procedure authorization.
6. Execute service logic.
7. Persist through Drizzle.
8. Return stable response and structured logs.

### Procedure hierarchy

```text
publicProcedure
  -> protectedProcedure
      -> mentoradoProcedure
      -> adminProcedure
```

### Service and reliability checks

- Keep routers thin and business logic in services.
- Use deterministic retries/backoff in provider adapters.
- Verify webhook signatures before parsing trusted payload.
- Enforce idempotency for webhook/event ingestion.

### Common runbook classes

- auth/context drift
- webhook retry storms
- DB latency regression
- migration regression
- runtime regression after middleware/order changes

### LEVER merge policy

Score extension before creating new structures:

- reuse data structures (+3)
- reuse indexes/queries (+3)
- reuse >70% code (+5)
- circular dependency (-5)
- distinct domain (-3)

If score is greater than 5, extend existing structure.

---

## Auth and DB Debug Rules

### RBAC contract

- Roles: `admin`, `mentorado`, `clinica_owner`, `clinica_staff`, `pending`.
- Session metadata can be stale; sensitive authorization must use Neon effective state.
- Critical actions must never rely only on frontend role claims.

### Tenant isolation contract

- Non-admin queries must include tenant filters (`mentoradoId` or owner tenant field).
- Staff access must be scoped to owner tenant.
- Cross-tenant queries are admin-only and explicit.

### Data and schema safety

- Every FK needs an index.
- Avoid `SELECT *` in hot paths and API responses.
- Maintain webhook/event idempotency table for replay-safe ingestion.
- Use `neonctl` (not Neon MCP) for Neon operations.

### Neon driver transaction support

**Symptom:** `No transactions support in neon-http driver` error on `db.transaction()`

**Root Cause:** `drizzle-orm/neon-http` driver uses HTTP-based query execution which does NOT support transactions.

**Fix Pattern:**

```typescript
// ❌ BEFORE: neon-http driver (no transaction support)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
const sql = neon(connectionString);
return drizzle(sql, { schema });

// ✅ AFTER: neon-serverless with Pool (full transaction support)
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
const pool = new Pool({ connectionString });
return drizzle(pool, { schema });
```

**Why:** The neon-http driver sends each query as an independent HTTP request. Transactions require persistent connections. Use `neon-serverless` with `Pool` for `db.transaction()`.

### Drizzle returning() array access guard

**Symptom:** `Cannot read properties of undefined (reading 'id')` crashes

**Root Cause:** Accessing `.returning()[0]` without checking array length.

**Fix Pattern:**

```typescript
// ❌ BEFORE: Unguarded access crashes on empty array
const [inserted] = await db.insert(table).values(data).returning();
return inserted.id; // crashes if inserted is undefined

// ✅ AFTER: Guard with explicit TRPCError
const [inserted] = await db.insert(table).values(data).returning();
if (!inserted) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Falha ao criar registro",
  });
}
return inserted.id;
```

**Why:** `.returning()` returns `[]` on failure. Destructuring from empty array gives `undefined`.


### Billing and webhook lifecycle sanity

- verify Stripe webhook signature and deduplication
- handle out-of-order events safely
- persist critical state before acknowledging external events

---

## Systematic Audit Pack

### Audit execution order

1. Inventory all findings before fixing.
2. Classify severity (`P0` to `P3`).
3. Fix one issue at a time.
4. Re-run quality gates after each fix.
5. Run final full validation.

### Meta OAuth — `fallback_redirect_uri` causa duplo dialog

**Sintoma:** Dois dialogs OAuth idênticos do Facebook abrem simultaneamente ao clicar "Conectar Meta".

**Root Cause:** `window.FB.login({ fallback_redirect_uri: uri })` faz o SDK redirecionar o parent window. Se o código também chama `window.location.assign(uri)` no path `status=unknown`, dois redirects/dialogs disparam ao mesmo tempo.

**Fix:**
```typescript
// ❌ ERRADO: FB SDK + código ambos redirecionam
window.FB.login(cb, { scope, return_scopes: true, fallback_redirect_uri: uri });
// + no callback: window.location.assign(uri) → DUPLO DIALOG

// ✅ CORRETO: remover fallback_redirect_uri; assign() seguro pós-resolve
window.FB.login(cb, { scope, return_scopes: true });
// No callback status=unknown: window.location.assign(uri) → popup já fechou, ÚNICO redirect
```

**Regra:** Nunca usar `fallback_redirect_uri` em `FB.login()` options quando o código também trata o fallback manualmente.

---

### TanStack Query `useMutation` em `useEffect` dep array → loading eterno

**Sintoma:** Após chamada de mutation em useEffect, o estado de loading nunca é limpo (spinner eterno). Nenhum erro aparece.

**Root Cause:** Objetos `useMutation` do TanStack Query mudam referência quando o estado muda (`isPending: true`). Se o objeto mutation está na dep array com `isDisposed` pattern, o cleanup `isDisposed = true` dispara mid-flight. O `finally { if (!isDisposed) setLoading(false) }` nunca executa.

**Fix:**
```typescript
// ❌ ERRADO: mutation na dep array → isDisposed race condition
const mutation = trpc.instagram.exchangeCode.useMutation();
useEffect(() => {
  let isDisposed = false;
  const run = async () => {
    try {
      await mutation.mutateAsync(input); // mutation muda ref → cleanup!
    } finally {
      if (!isDisposed) setIsConnecting(false); // NUNCA EXECUTA
    }
  };
  run();
  return () => { isDisposed = true; };
}, [mutation]); // ← mutation aqui = bug

// ✅ CORRETO: ref estável para mutateAsync
const mutation = trpc.instagram.exchangeCode.useMutation();
const mutateRef = useRef(mutation.mutateAsync);
mutateRef.current = mutation.mutateAsync; // atualizado fora do effect
useEffect(() => {
  let isDisposed = false;
  const run = async () => {
    try {
      await mutateRef.current(input); // ref estável → sem re-run
    } finally {
      if (!isDisposed) setIsConnecting(false); // EXECUTA CORRETAMENTE
    }
  };
  run();
  return () => { isDisposed = true; };
}, []); // mutation excluída da dep array
```

**Regra:** Nunca incluir objetos `useMutation` diretamente em dep arrays de `useEffect` com `isDisposed` pattern. Usar `useRef` para estabilizar `mutateAsync`.

---

### High-signal checks

- missing imports and type errors
- public procedures exposing non-public data
- webhook handlers without signature verification
- `mutateAsync` without error handling
- `console.log` in production code
- hardcoded hex colors and dead links
- increased `as any` usage

### Final gates

```bash
bun run type-check
bun run lint:oxlint:check
bun run test
bun run build
```

---

## Quick Triage Matrix

| Symptom              | First Check                                       |
| -------------------- | ------------------------------------------------- |
| Hydration mismatch   | Browser console + server/client render divergence |
| Slow interaction     | Re-render hotspots + handler duration             |
| tRPC failure         | Procedure boundary + context/auth resolution      |
| Data leak risk       | Tenant filter and role validation                 |
| Regression after fix | Re-run all gates + focused flow retest            |
