# Architecture Decision Records

> ADRs document significant architectural decisions with their context, rationale, and consequences.
> Template: [000-template.md](000-template.md)

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-bun-runtime.md) | Use Bun as Sole Runtime, Package Manager, and Bundler | Accepted | 2026-04-01 |
| [002](002-embedded-ai-gateway.md) | Embed AI Gateway as Internal Package (Not Microservice) | Accepted | 2026-04-01 |
| [003](003-multi-whatsapp-providers.md) | Three-Provider WhatsApp Strategy (Baileys / Z-API / Meta Cloud) | Accepted | 2026-04-01 |
| [004](004-tsgo-type-checking.md) | Use tsgo (Go-Native TypeScript Checker) Instead of tsc | Accepted | 2026-04-01 |
| [005](005-single-process-deployment.md) | Single-Process Deployment (Monolith with Embedded Services) | Accepted | 2026-04-01 |
| [006](006-multi-tenant-mentorado-isolation.md) | Row-Level Multi-Tenancy via mentoradoId Foreign Key | Accepted | 2026-04-01 |
| [007](007-redis-dual-purpose.md) | Redis for Both Session Cache and Real-Time Pub/Sub | Accepted | 2026-04-01 |
| [008](008-python-only-scripts.md) | Python-Only Automation Scripts (No Shell Scripts) | Accepted | 2026-04-01 |
| [009](009-turborepo-monorepo.md) | Turborepo Monorepo over Polyrepo | Accepted | 2026-04-01 |
| [010](010-trpc-over-rest.md) | tRPC for Internal API (End-to-End Type Safety) | Accepted | 2026-04-01 |
| [011](011-clerk-authentication.md) | Clerk for Authentication and User Management | Accepted | 2026-04-01 |
| [012](012-neon-postgresql.md) | Neon Serverless PostgreSQL as Primary Database | Accepted | 2026-04-01 |
| [013](013-wisc-documentation.md) | WISC 3-Tier AGENTS.md Documentation System | Accepted | 2026-04-01 |
| [014](014-drizzle-orm.md) | Drizzle ORM for Type-Safe Database Access | Accepted | 2026-04-01 |
| [015](015-tanstack-router.md) | TanStack Router for Type-Safe File-Based Routing | Accepted | 2026-04-01 |
| [016](016-shadcn-tailwind.md) | shadcn/ui + Tailwind CSS v4 for UI Components | Accepted | 2026-04-01 |
| [017](017-biome-oxlint.md) | Biome + OXLint for Native-Speed Linting | Accepted | 2026-04-01 |
| [018](018-vite-frontend-build.md) | Vite 7 for Frontend Build | Accepted | 2026-04-01 |
| [019](019-sse-realtime.md) | SSE for Real-Time Chat Events | Accepted | 2026-04-01 |
| [020](020-dual-payment-strategy.md) | Dual Payment Gateway Strategy (Stripe + ASAAS) | Accepted | 2026-04-01 |
| [021](021-gemini-ai-provider.md) | Google Gemini as AI Model Provider | Accepted | 2026-04-01 |

---

## How to Create a New ADR

1. Copy [000-template.md](000-template.md) to `NNN-short-title.md` (next sequential number).
2. Fill in Context, Decision, and Consequences.
3. Set Status to `Proposed` during review, `Accepted` once approved.
4. Add the entry to this index.
5. If later reversed: set Status to `Deprecated` or `Superseded by ADR-NNN`.
