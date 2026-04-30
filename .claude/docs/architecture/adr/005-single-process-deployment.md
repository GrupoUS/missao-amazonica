# ADR-005: Serve Frontend SPA as Static Files from the API Process (Single Docker Container)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

A common architecture serves the frontend from a CDN or separate web server (nginx), with the API on a separate container. NeonDash targets a single VPS deployment (Vultr, 1 server), making infrastructure simplicity a priority over independent scaling.

## Decision

Vite builds the frontend SPA to `apps/web/dist/`, which is copied into the API container's `dist/public/`. The Hono API serves static files in production. A single Docker container runs both frontend and backend. No separate nginx container is required.

## Consequences

**Positive:**
- Simpler deployment: one container to manage, monitor, and deploy
- No CDN cost for static assets
- Reduced infrastructure complexity for a single-server deployment
- Dockerfile 3-stage build handles both web build and API build in one pipeline

**Negative / Trade-offs:**
- API process serves static assets, adding minor overhead to request handling
- Cannot independently scale the static file server from the API
- A future CDN migration would require Dockerfile and CI changes
- Memory limit (1536M) must accommodate both SPA serving and API workload

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Separate nginx + API containers | Industry standard, independent static serving | Extra container to manage, nginx config overhead, two Docker images | Rejected: over-engineering for single VPS |
| B — Single process (Hono serves static files) | One container, simpler deployment, no nginx config | Minor overhead from API serving static assets, no independent CDN scaling | **Chosen** |
| C — CDN + API | Best static performance, global edge | CDN cost, Vite env vars must be baked at build time (already true), DNS management complexity | Rejected: cost and complexity for startup scale |

## Related ADRs

- [ADR-001](001-bun-runtime.md) — Bun is the single runtime serving both API and static files
- [ADR-002](002-embedded-ai-gateway.md) — AI Gateway is embedded in this single process
- [ADR-003](003-multi-whatsapp-providers.md) — All WhatsApp providers run within this process
- [ADR-018](018-vite-frontend-build.md) — Vite builds the frontend SPA; Hono serves the output from dist/public/
