# ADR-011: Clerk for Authentication and User Management

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash requires authentication with multiple user roles (admin, mentor, mentorado, clinica_staff), organization management (mentors can create organizations with team members), and a Brazilian Portuguese user experience. Options considered: (A) custom JWT authentication with PostgreSQL user table, (B) Auth0/Okta (enterprise managed auth), (C) Clerk (developer-focused managed auth with organization support), (D) Supabase Auth.

The key requirement is native support for organizations (Clerk Orgs) that map directly to mentor teams — this eliminates the need to build a custom team membership system.

## Decision

Use Clerk for all authentication and user management. The frontend uses `@clerk/clerk-react` (ClerkProvider, useAuth). The backend uses `@hono/clerk-auth` middleware to validate JWTs per request. Clerk Organizations map to mentor teams.

User data is synchronized to the local `users` table on first login via `upsertUserFromClerk()`. The role system (`admin`, `mentor`, `user`, `clinica_staff`, `clinica_owner`) is stored locally and enriched beyond Clerk's metadata.

The session cache (`_core/session-cache.ts`) uses Redis + in-memory fallback to reduce Clerk API calls by ~80%.

## Consequences

**Positive:**
- Organization/team management out of the box (Clerk Orgs → mentor teams)
- Passkeys, social login, MFA handled by Clerk without custom implementation
- Brazilian Portuguese locale supported natively
- `@hono/clerk-auth` makes JWT verification a single middleware line
- Clerk Dashboard provides user management UI for support operations

**Negative / Trade-offs:**
- Vendor lock-in: migrating away from Clerk would require replacing auth across frontend, backend, and all webhook handlers
- Clerk API rate limits require the session cache to avoid excessive validation calls
- Custom roles beyond Clerk's built-in roles must be managed in the local DB (role synchronization complexity)

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Custom JWT + PostgreSQL users table | Full control, no vendor lock-in, no cost | Auth security is hard — OWASP, token rotation, MFA, passkeys, org management all custom-built | Rejected: security risk for startup |
| B — Auth0 / Okta | Enterprise-grade, mature | Expensive at scale, complex pricing, more enterprise-focused than developer-focused | Rejected: cost and complexity |
| C — Clerk | Native org/team support, passkeys, social login, Brazilian PT locale, `@hono/clerk-auth` middleware | Vendor lock-in, rate limits require session cache, custom roles beyond Clerk's metadata | **Chosen** |
| D — Supabase Auth | Integrated with Supabase DB, open source option | Would require migrating away from Neon; tighter coupling to Supabase ecosystem | Rejected: conflicts with ADR-012 Neon |

## Related ADRs

- [ADR-007](007-redis-dual-purpose.md) — Redis session cache reduces Clerk API validation calls by ~80%
- [ADR-010](010-trpc-over-rest.md) — Clerk JWT validated in tRPC `protectedProcedure` middleware
