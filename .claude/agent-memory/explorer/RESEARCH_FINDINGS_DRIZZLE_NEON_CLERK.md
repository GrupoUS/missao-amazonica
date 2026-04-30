---
name: NeonDash Drizzle-Neon-Clerk-tRPC Pattern Audit
description: Comprehensive codebase audit of ORM, database, auth, and tRPC patterns with skill documentation gaps
type: reference
---

# Drizzle ORM, Neon Pool, Clerk Auth, tRPC Pattern Audit

## Research Findings Table

| # | Pattern | File | Line | Confidence | Skill Gap? | Details |
|---|---------|------|------|------------|-----------|---------|
| 1 | Neon Pool Config: `new Pool({ max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 })` | `apps/api/src/db.ts` | 29-34 | 5 | **YES** | Pool sizing and timeout config not detailed in skill. Critical for Neon serverless scaling. |
| 2 | Multi-DB Singleton: `getDb()` with lazy init + context-aware `getDbForContext(contexto)` | `apps/api/src/db.ts` | 18-86 | 5 | **YES** | Supports DATABASE_URL, DATABASE_URL_CLINICA, DATABASE_URL_MENTORIA for tenant isolation. Not in skill. |
| 3 | Prepared Statement Hot-Path: `getUserByClerkId()` with `placeholder()` + `.prepare()` | `apps/api/src/db.ts` | 200-236 | 5 | **PARTIAL** | Mentioned in AGENTS.md but pattern not fully shown. Critical for auth on every request. |
| 4 | DB Health Check: `sql\`SELECT 1\`` via `db.execute()` | `apps/api/src/db.ts` | 159-167 | 5 | **YES** | Not in skill; simple probe pattern for health checks. |
| 5 | pgEnum with Type Exports: `pgEnum("role", [...])` + `type User = typeof users.$inferSelect` | `apps/api/drizzle/schema-core.ts` | 31-104 | 5 | **NO** | Pattern well-established and matches schema AGENTS.md. |
| 6 | Schema Circular Dep Breaking: `schema-core.ts` exports core tables + enums; sub-schemas import from it | `apps/api/drizzle/schema-core.ts` | 1-11 | 5 | **PARTIAL** | Documented in file comments but not referenced in skill. |
| 7 | Clerk User Upsert: `onConflictDoUpdate()` with role elevation logic | `apps/api/src/db.ts` | 360-376 | 5 | **PARTIAL** | Pattern exists; skill mentions upserts but not the role-merging strategy. |
| 8 | Case-Insensitive Email: `sql\`lower(${users.email}) = ${normalized}\`` | `apps/api/src/db.ts` | 255-259 | 5 | **YES** | SQL template with toLowerCase; not shown in skill examples. |
| 9 | Prepared Statement Caching: Static `_getUserByClerkIdStmt` mutable cache | `apps/api/src/db.ts` | 198 | 5 | **YES** | Manual cache pattern; no utility for re-use; codebase has no prepared statement helpers. |
| 10 | Transaction with TX parameter: `db.transaction(async (tx) => { tx.insert(...) })` | `apps/api/src/leads-router.ts` | 600+ | 5 | **NO** | Pattern well-documented in AGENTS.md; 12+ uses confirmed. |
| 11 | leftJoin() with Select Object: `.leftJoin(users, eq(...)).select({ lead: leads, name: users.name })` | `apps/api/src/leads-router.ts` | 464-469 | 5 | **NO** | Standard Drizzle join syntax; well-documented. |
| 12 | RelationalQueries API: `db.query.leadTags.findMany({ where: inArray(...), with: { tag: true } })` | `apps/api/src/leads-router.ts` | 479-492 | 5 | **YES** | `db.query.*` (findFirst, findMany) with `with` for relations not shown in skill. Only 6 uses (minor adoption). |
| 13 | Batch Loading Pattern: Query + map-reduce to avoid N+1 | `apps/api/src/leads-router.ts` | 475-492 | 5 | **PARTIAL** | Common pattern; skill mentions batching but not the separate query + map pattern shown. |
| 14 | Cursor + Offset Pagination: `offset(cursor ?? (page-1)*limit).limit(limit)` + nextCursor calc | `apps/api/src/leads-router.ts` | 469-472 | 5 | **YES** | Hybrid pagination not fully shown in skill; cursor logic is custom. |
| 15 | where() with and()/or(): `.where(and(eq(...), inArray(...), isNull(...)))` | `apps/api/src/leads-router.ts` | 52 | 5 | **NO** | Standard Drizzle; well-documented. |
| 16 | where() with sql``: `.where(sql\`...\` condition)` | `apps/api/src/db.ts` | 258 | 5 | **NO** | Standard; documented in drizzle guides. |
| 17 | inArray() filter: `.where(inArray(users.id, ids))` | `apps/api/src/leads-router.ts` | 52 | 5 | **NO** | Standard; well-documented. |
| 18 | isNull() / isNotNull(): `.where(isNull(leads.leadId))` | `apps/api/src/interacoes-router.ts` | 21 | 5 | **NO** | Standard; documented. |
| 19 | SQL Aggregations: `sql<number>\`count(*) filter (where ...)\`` | `apps/api/src/AGENTS.md` | 120-121 | 4 | **YES** | Advanced SQL patterns (FILTER, COALESCE) documented in AGENTS but not in skill reference. |
| 20 | onConflictDoUpdate() Pattern: `.onConflictDoUpdate({ target: column, set: {...} })` | `apps/api/src/db.ts` | 363-373 | 5 | **YES** | Used 12+ times; pattern not detailed in skill (only mentioned). |
| 21 | onConflictDoNothing() Pattern: `.onConflictDoNothing()` for safe batch upserts | `apps/api/src/financeiro-router.ts` | 1027+ | 5 | **YES** | Race condition aware; pattern with re-fetch documented in AGENTS.md but not skill. |
| 22 | groupBy() Aggregation: `.groupBy(table.col1, table.col2)` | `apps/api/src/clientes-router.ts` | 1414+ | 4 | **NO** | Standard; documented in Drizzle guides. |
| 23 | Clerk Team Membership Priority: userId > email > owner > auto-link > auto-create | `apps/api/src/_core/context.ts` | 207-343 | 5 | **YES** | Complex resolution order not in skill; critical auth logic. |
| 24 | Admin Email Check: `process.env.ADMIN_EMAILS.split(",").map(e => e.toLowerCase())` | `apps/api/src/db.ts` | 290-293 | 5 | **YES** | Simple pattern for admin elevation; not documented. |
| 25 | Session Cache Invalidation: `invalidateSession(clerkId)` on mentorado/role changes | `apps/api/src/_core/context.ts` | 90, 260 | 5 | **YES** | Cache invalidation strategy not in skill; critical for auth consistency. |
| 26 | Impersonation Override: `x-impersonate-mentorado-id` header for admin testing | `apps/api/src/_core/context.ts` | 426-451 | 5 | **YES** | Admin impersonation pattern not documented in skill. |
| 27 | Role Privilege Check: `isPrivilegedRole(role)` helper for admin/mentor unified logic | `apps/api/src/_core/context.ts` | 42-45 | 5 | **YES** | Helper for role checks not in skill; appears in 2 places. |
| 28 | Menu Procedure Levels: protectedProcedure + assertMentoradoAccess() vs adminProcedure | `apps/api/src/AGENTS.md` | 90-110 | 5 | **PARTIAL** | Integration auth pattern documented in AGENTS.md but not in skill. |
| 29 | tRPC Middleware Return Value: Always return result of `next()` | `apps/api/src/_core/trpc.ts` | 14-27 | 5 | **NO** | Documented in tRPC 11 breaking changes (AGENTS.md). |
| 30 | Default Mentorado Values: Shared constants for new mentorado creation | `apps/api/src/_core/context.ts` | 48-56 | 4 | **YES** | Pattern not documented; used across auth/onboarding flows. |

---

## Confidence Scoring Legend

| Score | Meaning | Count |
|-------|---------|-------|
| 5 | Verified in codebase + multiple references | 28 |
| 4 | Verified but used in 1-2 places only | 2 |
| **Total Verified** | | **30** |

---

## Summary: Skill Documentation Gaps

### Critical Gaps (Impact: HIGH)

1. **Neon Pool Configuration** — Pool sizing, timeouts, and multi-connection strategy not detailed
2. **Prepared Statements** — Pattern shown for getUserByClerkId but no reusable helper or pattern library
3. **Multi-DB Context** — getDbForContext() for clinica/mentoria isolation not documented
4. **RelationalQueries API** — db.query.* syntax underutilized; only 6 uses vs 100+ traditional joins
5. **Clerk Auth Team Resolution** — Complex priority-based logic (userId > email > owner > auto-link > auto-create) not in skill
6. **Session Cache Strategy** — Invalidation on role/mentorado changes; critical for consistency

### Partial Gaps (Impact: MEDIUM)

7. **Batch Loading Pattern** — Mentioned in AGENTS.md; skill lacks concrete map-reduce examples
8. **Cursor Pagination** — Hybrid offset + nextCursor calculation not shown
9. **SQL Aggregations** — FILTER, COALESCE, CASE WHEN patterns documented in AGENTS not in skill
10. **Upsert Patterns** — onConflictDoUpdate/DoNothing used 12+ times; implementation details sparse in skill
11. **Integration Setup vs Operation** — protectedProcedure + assertMentoradoAccess() vs adminProcedure distinction

### No Gaps (Well-Documented)

- Transaction syntax and use
- leftJoin/innerJoin patterns
- where() with and()/or()/inArray()/isNull()
- pgEnum and type exports
- tRPC middleware and procedure levels

---

## Key Implementation Patterns to Document

### 1. Multi-DB Singleton Pattern
```typescript
// Single connection
let _db: Database | null = null;

// Context-aware connection
let _dbClinica: Database | null = null;
let _dbMentoria: Database | null = null;

function getDbForContext(contexto: ClienteContexto | null | undefined) {
  // Lazy init each connection
  // Fall back to main DB if context-specific not configured
}
```

### 2. Prepared Statement for Hot Paths
```typescript
let _getUserByClerkIdStmt: ReturnType<typeof _buildGetUserByClerkIdStmt> | null = null;

function _buildGetUserByClerkIdStmt() {
  return db.select({...}).from(users)
    .where(eq(users.clerkId, placeholder("clerkId")))
    .limit(1)
    .prepare("get_user_by_clerk_id");
}

export async function getUserByClerkId(clerkId: string) {
  if (!_getUserByClerkIdStmt) {
    _getUserByClerkIdStmt = _buildGetUserByClerkIdStmt();
  }
  return _getUserByClerkIdStmt.execute({ clerkId });
}
```

### 3. Batch Loading + Map Pattern
```typescript
const leadIds = items.map(i => i.lead.id);
if (leadIds.length > 0) {
  const allTags = await db.query.leadTags.findMany({
    where: inArray(leadTags.leadId, leadIds),
    with: { tag: true }
  });
  const tagMap = allTags.reduce((acc, lt) => {
    if (!acc[lt.leadId]) acc[lt.leadId] = [];
    acc[lt.leadId].push(lt.tag.label);
    return acc;
  }, {});
}
return items.map(i => ({...i, tags: tagMap[i.id] || []}));
```

### 4. Clerk Auth Team Resolution Priority
```typescript
// 1. Active team membership by userId (takes priority)
const membershipByUserId = await findTeamMembershipByUserId(user.id);
if (membershipByUserId) return membershipByUserId;

// 2. Pending/inactive team invitation by email (activate on first login)
if (user.email) {
  const membershipByEmail = await findTeamMembershipByEmail(user.email);
  if (membershipByEmail && shouldActivate) {
    await db.update(mentoradoTeamMembers).set({
      userId: user.id, status: "active", updatedAt: new Date()
    });
  }
}

// 3. Owner account direct mentorado (check ativo + expiration)
const ownerRows = await db.select().from(mentorados)
  .where(eq(mentorados.userId, user.id)).limit(1);
if (ownerRows[0]) return ownerRows[0];

// 4. Admin/mentor global access (no mentorado binding required)
if (isPrivilegedRole(user.role)) return null;

// 5. Auto-link by mentorado email
const autoLinked = await tryAutoLinkByEmail(user);
if (autoLinked) return autoLinked;

// 6. Auto-create for mentorado_neon billing plan users
if (user.billingPlan === "mentorado_neon") {
  return await createMentoradoForUser(user, clerkId, logger);
}

return null;
```

### 5. Hybrid CRM Stats with Stage/Status
```typescript
const hybridTipo = sql<string>`CASE
  WHEN ${leads.stageId} IS NOT NULL THEN ${pipelineStages.tipo}
  WHEN ${leads.status} IN ('fechado') THEN 'ganho'
  WHEN ${leads.status} IN ('perdido') THEN 'perdido'
  ELSE 'aberto'
END`;

// MUST include leftJoin for pipelineStages
const stats = await db.select({
  ativos: sql<number>`count(*) filter (where ${hybridTipo} = 'aberto')`,
  ganhos: sql<number>`count(*) filter (where ${hybridTipo} = 'ganho')`,
})
  .from(leads)
  .leftJoin(pipelineStages, eq(pipelineStages.id, leads.stageId))
  .where(whereClause);
```

---

## Next Steps for Skill Enhancement

1. Create `.claude/skills/drizzle-neon-clerk-auth/SKILL.md` with:
   - Multi-DB connection pattern
   - Prepared statement helpers
   - Batch loading standard
   - Auth team resolution priority
   - Cache invalidation strategy

2. Add reference: `.claude/skills/drizzle-neon-clerk-auth/references/pool-config.md`
   - Neon serverless pool sizing
   - Timeout recommendations
   - Context-aware connection routing

3. Add reference: `.claude/skills/drizzle-neon-clerk-auth/references/auth-patterns.md`
   - Team membership resolution
   - Role-based access control
   - Admin impersonation
   - Session cache management

4. Update existing skill with:
   - Concrete examples from codebase
   - db.query.* RelationalQueries API usage
   - Cursor pagination with offset hybrid
   - Batch loading with map-reduce

---

## Related Learnings

See `.claude/docs/architecture/13-backend-learnings.md` for:
- Multi-tenant resolution strategies
- CRM metrics aggregation with hybrid status/stage logic
- Bulk import and dedup patterns
- WhatsApp aggregation and Baileys patterns
- Workspace AI and automation patterns
