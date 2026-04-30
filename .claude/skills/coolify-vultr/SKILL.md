---
name: coolify-vultr
description: Use for Vultr and Coolify deployment, Docker builds, Traefik routing, SSL, DNS, health probes, graceful shutdown, and Turborepo CI caching.
---

# Coolify + Vultr Deploy Skill

Production deployment for NeonDash on Vultr VPS via Coolify PaaS (self-hosted).

> **Core Principle:** Git push → GitHub Actions CI → Coolify API deploy → Docker build (BuildKit) → Traefik routing + SSL → Healthy container.

---

## Live Docs Lookup (Context7)

Before Coolify/Docker operations, fetch live docs:
- Coolify API → resolve library ID, query for deploy endpoints, env var management, application status
- Docker BuildKit → resolve for `--mount=type=cache`, multi-stage build patterns, `.dockerignore` best practices

---

## Quick Reference

| Field | Value |
|---|---|
| **Server IP** | `216.238.125.45` |
| **Region** | `sao` (São Paulo, Brazil) |
| **Plan** | `vhf-2c-4gb` (2 vCPU, 4GB RAM, NVMe) |
| **OS** | Ubuntu 24.04 LTS |
| **User** | `linuxuser` (sudo without password) |
| **SSH Key** | `~/.ssh/vultr_neondash` (ED25519) |
| **Coolify Dashboard** | `http://216.238.125.45:8000` |
| **Prod Domain** | `neondash.com.br` |
| **Staging Domain** | `staging.neondash.com.br` |
| **Vultr API Key** | `VULTR_API` in `.env` (export as `VULTR_API_KEY` for vultr-cli) |
| **Dockerfile** | `apps/api/Dockerfile` (3-stage Alpine, BuildKit, dual-mode secrets) |
| **Bun Version** | `1.3.9` (pinned in Dockerfile, workflows, `package.json`) |

### Resource IDs

| Resource | Vultr ID | Coolify UUID |
|---|---|---|
| Instance / Server | `5f75a3b9-f538-4fc3-a845-a522b983166d` | `rks47cdzekgp8i596i6d7l0q` |
| SSH Key | `f68ee751-0714-404b-8361-70ceb0640e9b` | — |
| Firewall Group | `00cad25f-6863-46b6-b19b-dec24b5cb093` | — |
| Project | — | `zi2unltbhnqvtigrg1degp7m` |
| App (prod) | — | `n23rngcsqcoxzxe6fy04fzb7` |
| App (staging) | — | `c127inn02gq89laqgxshkgni` |
| Redis | — | `bz4d3ql9pq1v91ecbb58607c` |

### API Access

| Service | Base URL | Auth |
|---|---|---|
| **Vultr API** | `https://api.vultr.com/v2` | `Authorization: Bearer $VULTR_API_KEY` |
| **Vultr CLI** | `vultr-cli` binary | `export VULTR_API_KEY=...` |
| **Coolify API** | `http://216.238.125.45:8000/api/v1` | `Authorization: Bearer {id}\|{token}` |

**Vultr API Key:** `ATTUPELVZ3AU4B4JI6ITIBXFDZXYM6FDRP3A`

> **Note:** Vultr API has IP-based access control. The VPS IP is NOT whitelisted for API calls.

### Clerk DNS Requirements (CRITICAL)

| Subdomain | Type | Target | Purpose |
|---|---|---|---|
| `accounts` | CNAME | `accounts.clerk.services` | Sign-in/Sign-up |
| `clerk` | CNAME | `frontend-api.clerk.services` | Clerk Frontend API |

These CNAMEs take precedence over wildcard `*` A record. If missing → Clerk login fails with `NET::ERR_CERT_AUTHORITY_INVALID`.

---

## Symptom Lookup

| Symptom | Reference |
|---|---|
| Site não abre (HTTPS) | [troubleshooting.md](references/troubleshooting.md#dns-issues) |
| SSL cert error | [troubleshooting.md](references/troubleshooting.md#ssl-certificate-failed-lets-encrypt) |
| Clerk auth cert invalid | [troubleshooting.md](references/troubleshooting.md#clerk-subdomains--ssl) |
| Coolify build fails | [troubleshooting.md](references/troubleshooting.md#build-failures) |
| Container unhealthy | [troubleshooting.md](references/troubleshooting.md#container-issues) |
| Redis connection refused | [troubleshooting.md](references/troubleshooting.md#redis-issues) |
| Coolify API disabled | [troubleshooting.md](references/troubleshooting.md#coolify-api-returns-api-is-disabled) |
| SSH timeout | [vultr-infra.md](references/vultr-infra.md#firewall) |
| Traefik 502 | Coolify manages network automatically |
| Build OOM | [troubleshooting.md](references/troubleshooting.md#bun-run-build-fails-with-oom) |
| Port 443 dead after deploy | Concurrent rebuilds OOM'd VPS — [coolify-ops.md § Common Gotchas #9](references/coolify-ops.md#common-gotchas) |
| Image too large | [dockerfile-guide.md](references/dockerfile-guide.md#image-size-targets) |
| Slow rebuild (no cache) | [dockerfile-guide.md](references/dockerfile-guide.md#buildkit-cache-mounts-critical) |
| Set Coolify env vars without local token | [coolify-ops.md § Setting Env Vars from a Local Machine](references/coolify-ops.md#setting-env-vars-from-a-local-machine-without-ssh-or-token) |

---

## SSH Access

```bash
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45
docker ps                  # Containers
docker logs <name>         # App logs
ls /data/coolify/          # Coolify data
```

---

## Deploy Architecture

```
GitHub push main     → GH Actions CI → Coolify API deploy → neondash.com.br
GitHub push dev-test → GH Actions CI → Coolify API deploy → staging.neondash.com.br
```

### CI/CD Workflow

Files: `.github/workflows/deploy.yml` + `deploy-staging.yml` (callers) → `cd-coolify-deploy.yml` (reusable)

| Branch | Environment | Coolify App UUID | Domain |
|---|---|---|---|
| `main` | production | `COOLIFY_APP_UUID_PROD` | `neondash.com.br` |
| `dev-test` | staging | `COOLIFY_APP_UUID_STAGING` | `staging.neondash.com.br` |

### GitHub Secrets

| Secret | Purpose |
|---|---|
| `VPS_HOST` | `216.238.125.45` |
| `VPS_USERNAME` | `linuxuser` |
| `VPS_SSH_KEY` | Content of `~/.ssh/vultr_neondash` |
| `VPS_PASSWORD` | Server password (fallback) |
| `VULTR_API_KEY` | Vultr API token |
| `COOLIFY_API_TOKEN` | Coolify API bearer token |
| `COOLIFY_APP_UUID_PROD` | Production app UUID |
| `COOLIFY_APP_UUID_STAGING` | Staging app UUID |

### CI Caching

| Cache | Path | Key Strategy | Benefit |
|---|---|---|---|
| `node_modules` | `~/.bun/install/cache` | `bun.lock` hash | Skips `bun install` on hit (~30s) |
| Turbo (local) | `.turbo/` | `turbo-{OS}-{sha}` + OS fallback | Incremental task runs in verify step |

> **No remote cache**: `TURBO_TOKEN`/`TURBO_TEAM` are NOT configured. Turbo caches locally per-runner via `actions/cache`. Docker builds use BuildKit cache (VPS-side), not Turbo cache.

- Production: `cancel-in-progress: false` (never cancel prod deploy)
- Staging: `cancel-in-progress: true` (cancel stale on new push)
- `paths-ignore` skips CI for docs/agent/claude-only changes

---

## Turborepo + Deploy

> Full reference: [turbo-docker.md](references/turbo-docker.md)

### Role of Turborepo in Deploy Pipeline

```
turbo run lint:check check test  →  CI verify (parallel, cached)
bun --filter=<pkg> build         →  Docker builder stage (direct, no turbo)
Coolify API trigger              →  BuildKit build on VPS (independent of turbo)
```

Turborepo is **NOT used inside Docker**. The Docker builder stage uses `bun run --filter=` directly.

### turbo.json Build Config

```json
"build": {
  "outputs": ["dist/**"],          // Vite → dist/ (not .next/)
  "env": ["NODE_ENV", "VITE_*"],   // Hash-affecting env vars
  "inputs": ["$TURBO_DEFAULT$"]    // .env covered by globalDependencies
}
```

### Common Mistakes

| Mistake | Fix |
|---|---|
| `.next/**` in build outputs | This is Vite, not Next.js — use `dist/**` only |
| `remoteCache` without `TURBO_TOKEN` | Remove block; use `actions/cache` with `.turbo/` path instead |
| `turbo: "latest"` | Pin exact version (`^2.x.y`) for reproducible builds |
| Listing `.env` in both `globalDependencies` AND `build.inputs` | Redundant — `globalDependencies` already busts all caches |
| Running `turbo` inside Dockerfile | Unnecessary — turbo cache isn't in Docker context; use `bun --filter` |
| `packages/ui` in Dockerfile COPY steps | Removed 2026-03-31 — was orphan placeholder, no consumers |

---

## Post-Migration Checklist

When migrating DNS to a new provider:

- [ ] DNS zone records created (A, NS, wildcard)
- [ ] **Nameservers changed at registrar** (most common miss!)
- [ ] NS propagation verified via `dns.google/resolve`
- [ ] SSL certificates issued (check Traefik logs)
- [ ] Health endpoints returning 200
- [ ] Webhooks updated (Stripe, Clerk, Meta) if domain changed

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Running as root | `USER bunuser` in Dockerfile final stage |
| No health check | HEALTHCHECK with `/health/live` |
| Health check uses `localhost` | Use `127.0.0.1` (IPv6 issue on Alpine) |
| No grace period on shutdown | 10s wait via `SHUTDOWN_GRACE_PERIOD` env var |
| `--smol` flag in production | Remove — not needed with 4GB+ RAM |
| Coolify health check enabled | Disable — conflicts with rolling updates |
| No `--mount=type=cache` on install | Add BuildKit cache mount |
| Bun version mismatch | Pin same version in Dockerfile, workflows, `package.json` |
| **Deleted package still in Dockerfile COPY** | After removing a workspace package, update ALL of: `Dockerfile` COPY steps (both deps + builder stages), `tsconfig.json` project references, `vitest.config.ts` test projects, `bun.lock`, root `package.json` workspaces. Missing any one causes Docker build failure. |
| **Vercel artifacts in Coolify project** | A root `api/` folder (Vercel serverless routes) and `vercel.json` are dead weight after migrating to Coolify. Delete both. Background tasks must use the internal Bun scheduler (`_core/scheduler.ts` via `scheduleInterval`/`scheduleDaily`) — never HTTP cron endpoints that require an external trigger. |

---

## References

| File | Content |
|---|---|
| [vultr-infra.md](references/vultr-infra.md) | Vultr CLI + API: instances, DNS, firewall, SSH keys |
| [coolify-ops.md](references/coolify-ops.md) | Coolify API, env vars, deploy, Traefik, Redis, caching |
| [dockerfile-guide.md](references/dockerfile-guide.md) | 3-stage Dockerfile, .dockerignore, BuildKit cache, image targets |
| [turbo-docker.md](references/turbo-docker.md) | Turborepo integration: CI caching, turbo.json config, turbo prune pattern |
| [runtime.md](references/runtime.md) | Health probes (/health/live, /health/ready, /metrics) + graceful shutdown |
| [troubleshooting.md](references/troubleshooting.md) | DNS, SSL, build, container, Redis diagnostics + monitoring |
