---
name: drizzle-neon-clerk-auth
description: Use for NeonDash database schema, tRPC procedures, Drizzle queries, Clerk auth, Stripe billing ownership, tenant routing, migrations, and API procedure design.
---

# Drizzle + Neon + Clerk — NeonDash Patterns

NeonDash stack: **Drizzle ORM** + **Neon Serverless Pool** + **Clerk** via **Hono** + **tRPC**.
NOT Next.js. No server actions. No `@clerk/nextjs`.

This skill is a mixed **Pattern + Reference**. Keep app auth/DB access in NeonDash as the runtime source of truth, and treat Stripe Billing as an external billing source that must be projected into local data intentionally.

---

## When to Use

- Changing schema, queries, routers, or auth resolution in `apps/api/src` or `apps/api/drizzle`
- Debugging `UNAUTHORIZED`, `FORBIDDEN`, stale Clerk metadata, or tenant ownership drift
- Designing or reviewing Stripe Checkout, subscription webhooks, plan mapping, or billing snapshots
- Deciding whether billing belongs to a single user, a tenant/workspace, or multiple Stripe accounts

**When NOT to use:** pure frontend styling, generic React component work, or non-NeonDash payment providers without Drizzle/Clerk interaction.

---

## Live Docs Lookup (Context7)

Before implementing queries, schema, or auth:

- `drizzle-orm` → resolve library ID, query for relational queries (`with:`), transactions, operators, prepared statements, upserts
- `@neondatabase/serverless` → Pool vs HTTP driver differences, WebSocket config, transaction support
- `@hono/clerk-auth` → `clerkMiddleware()`, `getAuth()`, context propagation to tRPC
- `stripe` / Stripe docs → Checkout Sessions, Customer/Subscription metadata, webhook retries, entitlements, multi-account modeling

---

## Reference Documents

| File                                        | Use When                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `references/stripe-billing-multitenancy.md` | Stripe Checkout, subscriptions, entitlements, user-billed vs tenant-billed, multi-account Stripe mapping |

---

## Stripe Billing Ownership Pattern

Read `references/stripe-billing-multitenancy.md` when a task touches Stripe. The short version:

- Reconcile Checkout with `client_reference_id`, top-level Checkout `metadata`, and `subscription_data.metadata`
- Treat webhooks as the billing source of truth; redirects are only UX confirmation
- Distinguish **who pays** from **who can use the product**: one paying owner can grant access to many users
- Use Stripe Entitlements or a local entitlement projection for feature gating; do not derive authorization from a frontend plan flag alone
- If multiple Stripe accounts or legal entities exist, persist `stripeAccountId` together with `stripeCustomerId` and `stripeSubscriptionId`

### NeonDash Implementation Learnings (2026-04)

- `packages/shared/src/plans.ts` is the billing source of truth for plan IDs, feature entitlements, monthly/annual cents, env var keys, and Stripe price-id resolution. Start there before touching API or UI.
- Any new Stripe recurring price must update **both** `getPriceEnvKey()` and `resolvePlanSelectionFromPriceId()`. Missing the reverse resolver breaks webhook plan detection, interval detection, and downgrade logic.
- Create the billing projection before opening Checkout, then set `client_reference_id` to `billing_account:{id}`. This gives webhooks a fallback owner lookup even when metadata is incomplete.
- Keep owner context redundant on `customer.metadata`, `checkout.session.metadata`, and `subscription_data.metadata`. NeonDash uses metadata first and `client_reference_id` second to avoid orphaned subscriptions.
- Persist `billingInterval` in the local projection and Clerk metadata. When changing plans mid-cycle, infer the interval from the current `price.id` instead of guessing from UI state.
- `billing.getSubscriptionStatus` is the canonical self-heal read path for missing or stale billing projections. Prefer repairing there instead of creating ad-hoc sync endpoints.
- Treat `mentorado_neon` as a special provisioned plan, not as a normal paid recurring catalog item.
- Read `references/stripe-billing-multitenancy.md` before using Stripe CLI. Price catalog changes are operationally sensitive and should follow immutable-price rules.

---

## DB Connection (`apps/api/src/db.ts`)

Uses `drizzle-orm/neon-serverless` with a connection pool — **not** the HTTP driver.

```typescript
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../drizzle/index";

function initializeDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === "development",
  });
}

export function getDb() {
  /* lazy singleton */
}
```

**Import rule:** Always `import { getDb } from "../db"` — never instantiate directly.

> `db.transaction()` requires the Pool driver (not the HTTP driver). Always guard `.returning()[0]` — empty `[]` is truthy.

### Multi-DB Routing (clinica/mentoria)

Three lazy-init singletons for tenant isolation. Route via context — never hard-code:

```typescript
import { getDbForContext } from "../db";

const db = getDbForContext(ctx.contexto); // "clinica" | "mentoria" | null → default
// Env: DATABASE_URL | DATABASE_URL_CLINICA | DATABASE_URL_MENTORIA
```

Use `getDb()` only when no `ctx.contexto` is available (e.g., health checks, admin-level ops).

---

## tRPC Procedure Hierarchy

```
publicProcedure    → Health checks only (unauthenticated)
protectedProcedure → ctx.user is guaranteed non-null
adminProcedure     → ctx.user.role === "admin" | "mentor"
mentoradoProcedure → ctx.user + ctx.mentorado both guaranteed non-null
```

**Selection rules:**

- Reading/mutating user's own data → `protectedProcedure`
- Admin/mentor-only operations → `adminProcedure` (never manual role check in `protectedProcedure`)
- Mentorado-specific data → `mentoradoProcedure`

```typescript
import {
  protectedProcedure,
  adminProcedure,
  mentoradoProcedure,
  router,
} from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { myTable } from "../../drizzle/schema";

export const myRouter = router({
  getOwn: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select({ id: myTable.id, name: myTable.name })
        .from(myTable)
        .where(eq(myTable.userId, ctx.user.id))
        .limit(100);
    }),

  listAll: adminProcedure.query(async () => {
    const db = getDb();
    return db
      .select({ id: myTable.id, name: myTable.name })
      .from(myTable)
      .limit(500);
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [updated] = await db
        .update(myTable)
        .set({ name: input.name })
        .where(eq(myTable.id, input.id) && eq(myTable.userId, ctx.user.id))
        .returning({ id: myTable.id, name: myTable.name });

      if (!updated)
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      return updated;
    }),
});
```

---

## Auth Context

Clerk auth flows through Hono middleware → tRPC context. Inside procedures:

```typescript
ctx.user; // User | null — always non-null in protectedProcedure+
ctx.user.id; // DB user ID (integer)
ctx.user.clerkId; // Clerk user ID string ("user_xxx")
ctx.mentorado; // Mentorado | null — non-null in mentoradoProcedure
ctx.orgId; // Clerk org ID | null
ctx.orgRole; // "admin" | "member" | null
```

Never call `getAuth(c)` directly inside a tRPC procedure — it's already resolved in `createContext`.

### Clerk Auth Resolution Priority

`createContext` resolves the user through a 5-tier chain (order matters):

1. **membershipByUserId** — active team member (highest priority; blocks own mentorado path)
2. **membershipByEmail** — pending invite; activates on first login
3. **ownerRows** — direct mentorado ownership (checks `ativo` + expiration)
4. **isPrivilegedRole** — admin/mentor flag (global, no mentorado required)
5. **autoLinkByEmail / autoCreate** — legacy link + billing-plan auto-create (lowest)

After any role change or mentorado creation, call `invalidateSession(clerkId)` — stale context persists without it.

---

## Relational Queries

Use `db.query.*` with `with:` to load related data without manual joins:

```typescript
const lead = await db.query.leads.findFirst({
  where: eq(leads.id, input.id),
  with: {
    interacoes: { limit: 10, orderBy: [desc(interacoes.createdAt)] },
    tasks: { where: eq(tasks.ativo, true) },
  },
});
```

Inside transactions, use `tx.query.*`:

```typescript
await db.transaction(async tx => {
  const user = await tx.query.users.findFirst({ where: eq(users.id, id) });
  await tx.update(users).set({ updatedAt: new Date() }).where(eq(users.id, id));
});
```

**Aggregations cannot be used inside `with:` blocks** — they fail silently. Use a separate `.select()`:

```typescript
// ❌ Wrong: aggregation inside with: — returns undefined
// ✅ Correct: separate SQL select
const [stats] = await db
  .select({
    count: sql<number>`count(*)`.mapWith(Number),
    total: sql<number>`sum(${table.amount})`.mapWith(Number),
  })
  .from(table)
  .where(eq(table.userId, userId));
```

---

## Query Patterns

### WHERE operators

```typescript
import {
  and,
  or,
  inArray,
  isNull,
  isNotNull,
  between,
  like,
  sql,
} from "drizzle-orm";

db.select()
  .from(t)
  .where(
    and(
      eq(t.status, "ativo"),
      or(isNull(t.expiresAt), between(t.expiresAt, start, end)),
      inArray(t.id, [1, 2, 3])
    )
  );
```

### Pagination (offset-based)

```typescript
const page = input.page ?? 1;
const limit = 25;
const rows = await db
  .select({ id: t.id, name: t.name })
  .from(t)
  .orderBy(desc(t.createdAt))
  .offset((page - 1) * limit)
  .limit(limit);
const hasNextPage = rows.length === limit;
```

### Upsert

```typescript
await db.insert(table)
  .values({ externalId: "abc", name: "x" })
  .onConflictDoUpdate({
    target: table.externalId,
    set: { name: sql`excluded.name`, updatedAt: new Date() },
  });
// Silently ignore duplicates:
await db.insert(table).values({ ... }).onConflictDoNothing();
```

### Batch loading (avoid N+1)

```typescript
// One query + Map — not a loop of per-row queries
const allTags = await db
  .select()
  .from(tags)
  .where(inArray(tags.leadId, leadIds));
const tagsByLead = allTags.reduce<Map<number, Tag[]>>((m, tag) => {
  m.set(tag.leadId, [...(m.get(tag.leadId) ?? []), tag]);
  return m;
}, new Map());
```

---

## Prepared Statements

Use only for hot paths called on every authenticated request (e.g., user lookup in `createContext`):

```typescript
import { placeholder } from "drizzle-orm";

let _stmt: ReturnType<typeof db.select> | null = null;
const getStmt = () => {
  if (!_stmt)
    _stmt = db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.clerkId, placeholder("clerkId")))
      .limit(1)
      .prepare("get_user_by_clerk_id");
  return _stmt;
};

const [user] = await getStmt().execute({ clerkId });
```

> Prepared statements are scoped to the root `db` instance. Do not reuse them inside `db.transaction()` — use a plain query inside `tx` instead.

---

## Schema Conventions (`apps/api/drizzle/schema*.ts`)

```typescript
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const myItems = pgTable(
  "my_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => [
    index("my_items_user_id_idx").on(table.userId), // every FK gets an index
  ]
);

export type MyItem = typeof myItems.$inferSelect;
export type InsertMyItem = typeof myItems.$inferInsert;
```

**Naming rules:**

- Export: `camelCase` (`myItems`, `leadInteractions`)
- DB table/columns: `snake_case` (`my_items`, `user_id`)
- Every FK column → matching `index("..._idx").on(table.fkCol)`

> Circular dependency between schema files: break the cycle by splitting shared types into `schema-core.ts` and importing from there.

---

## Schema Migration

```bash
bun run db:push   # Always use this — never npx drizzle-kit migrate
```

Never write manual SQL migrations. Schema is the source of truth at `apps/api/drizzle/schema.ts`.

---

## Critical Rules

| Rule                                            | Why                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| Guard `.returning()` with destructuring         | `const [row] = await ...returning()` then `if (!row)` — empty `[]` is truthy |
| `TRPCError` not `Error`                         | Gives proper HTTP codes; generic `Error` returns 500 with no context         |
| No `SELECT *`                                   | Specify `db.select({ col1, col2 })` — never `.select()` without columns      |
| `adminProcedure` for admin ops                  | Never use `protectedProcedure` with manual role checks                       |
| Zod schema at module level                      | Never define Zod schemas inside procedure handlers                           |
| Ownership filter in WHERE                       | `eq(table.userId, ctx.user.id)` on every mutation to prevent TOCTOU          |
| `.limit()` on list queries                      | Always add `.limit(N)` — unbounded queries crash on large datasets           |
| `invalidateSession(clerkId)` after role changes | Without it, stale auth context persists for active sessions                  |
| Aggregations in `.select()` only                | `count()`/`sum()` inside `with:` blocks fail silently                        |
| `onConflictDoUpdate` uses `sql\`excluded.col\`` | References the incoming value in the upsert SET clause                       |
| `getDbForContext(ctx.contexto)` for tenant data | Bare `getDb()` queries the default DB — wrong for clinica/mentoria           |

---

## Common Mistakes

| Symptom                                     | Fix                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `UNAUTHORIZED` on valid session             | Verify `protectedProcedure` is used, not `publicProcedure`              |
| `FORBIDDEN` even as admin                   | Use `adminProcedure`, not `protectedProcedure` with manual role check   |
| `.returning()` guard never fires            | `const [row] = ...` then `if (!row)` — never check the array itself     |
| `db.transaction()` hangs                    | Confirm Pool driver (`neon-serverless`), not HTTP driver                |
| Schema push fails                           | Run `bun run db:push`, not `npx drizzle-kit migrate`                    |
| FK column missing index                     | Add `index("table_fk_idx").on(table.fkCol)` in table definition         |
| Procedure not finding mentorado             | Use `mentoradoProcedure` — it resolves `ctx.mentorado` automatically    |
| Stale user role after change                | Call `invalidateSession(clerkId)` after any role or mentorado mutation  |
| Aggregation returns `undefined`             | Move `count()`/`sum()` out of `with:` into a separate `.select()` query |
| Wrong DB for clinica/mentoria               | Use `getDbForContext(ctx.contexto)`, not bare `getDb()`                 |
| Prepared statement fails inside transaction | Use plain query inside `tx` — prepared stmts are scoped to root `db`    |
| Circular import in schema                   | Extract shared types to `schema-core.ts`, import from there             |
