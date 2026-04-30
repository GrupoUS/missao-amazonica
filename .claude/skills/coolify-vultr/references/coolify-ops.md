# Coolify Operations Reference

Base URL: `http://216.238.125.45:8000/api/v1`
Auth: `Authorization: Bearer {id}|{token}` (Sanctum format, requires `*` permissions for deploy)

---

## Quick Deploy

```bash
COOLIFY_API="http://216.238.125.45:8000/api/v1"

# Deploy (start)
curl "${COOLIFY_API}/applications/{uuid}/start" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Accept: application/json"

# Force rebuild (skip cache)
curl "${COOLIFY_API}/deploy?uuid={uuid}&force=true" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"

# Restart / Stop
curl "${COOLIFY_API}/applications/{uuid}/restart" -H "Authorization: Bearer $COOLIFY_TOKEN"
curl "${COOLIFY_API}/applications/{uuid}/stop" -H "Authorization: Bearer $COOLIFY_TOKEN"
```

Returns: `{ "message": "Deployment request queued.", "deployment_uuid": "..." }`

---

## Application API

```
GET    /api/v1/applications/{uuid}     # Get app details
PATCH  /api/v1/applications/{uuid}     # Update app
DELETE /api/v1/applications/{uuid}     # Delete app
GET    /api/v1/applications/{uuid}/deployments  # List deployments
```

### Create Application

```
POST /api/v1/applications/public                   # Public GitHub repo
POST /api/v1/applications/private-deploy-key        # Private (deploy key)
POST /api/v1/applications/private-github-app        # Private (GitHub App)
POST /api/v1/applications/dockerfile                # Dockerfile without git
POST /api/v1/applications/dockerimage               # Pre-built image
POST /api/v1/applications/dockercompose             # Docker Compose
```

### PATCH Fields

Accepted: `domains`, `health_check_enabled/path/port/interval/timeout/retries/start_period`, `name`, `description`, `git_branch`, `dockerfile_location`, `base_directory`, `ports_exposes`.

**NOT accepted:** `fqdn` (use `domains`), `is_build_time` in envs, `docker_compose_custom_build_options`.

---

## Environment Variables

```bash
# List
curl "${COOLIFY_API}/applications/{uuid}/envs" -H "Authorization: Bearer $TOKEN"

# Create (single)
curl "${COOLIFY_API}/applications/{uuid}/envs" -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"key": "NODE_ENV", "value": "production", "is_preview": false}'

# Update
curl "${COOLIFY_API}/applications/{uuid}/envs/{env_uuid}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"key": "...", "value": "...", "is_preview": false}'

# Bulk (may fail in some versions — use individual POST as fallback)
curl "${COOLIFY_API}/applications/{uuid}/envs/bulk" -X PATCH \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"bulk": "KEY1=value1\nKEY2=value2"}'
```

> **`is_build_time` NOT accepted.** VITE_* vars auto-available during build.

### Env Scoping

| Mode | Build Phase | Container Runtime |
|---|---|---|
| Build + Runtime (default) | ✅ | ✅ |
| Build only | ✅ | ❌ |
| Runtime only | ❌ | ✅ |

### Predefined Variables (auto-generated)

`COOLIFY_FQDN`, `COOLIFY_URL`, `COOLIFY_BRANCH`, `SOURCE_COMMIT`, `PORT`, `HOST`

---

## Redis (Coolify Database)

```bash
# Create
curl "${COOLIFY_API}/databases/redis" -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"server_uuid":"...","project_uuid":"...","environment_name":"production",
  "name":"redis","image":"redis:7-alpine","is_public":false,"instant_deploy":true,
  "redis_conf":"<base64>"}'
```

> **redis_conf MUST be base64:** `echo -e "maxmemory 2gb\nmaxmemory-policy noeviction\nappendonly yes\nappendfsync everysec" | base64 -w 0`

### Redis Configuration

| Setting | Value | Why |
|---|---|---|
| `maxmemory` | 2gb | Fits in 4GB VPS with app |
| `maxmemory-policy` | noeviction | Never silently discard sessions |
| `appendonly` | yes | Persist data across restarts |
| `appendfsync` | everysec | Balance durability vs performance |

Production uses DB 0, staging uses DB 1.

---

## GitHub Actions CI/CD

Deploy workflows use a reusable workflow to avoid duplication:

```
deploy-staging.yml (caller) → verify job (inline) → cd-coolify-deploy.yml (reusable)
deploy.yml (caller)         → verify job (inline) → cd-coolify-deploy.yml (reusable)
verify-changes.yml          → verify only (no deploy, runs on PRs)
```

---

## Docker Layer Cache Optimization

Coolify injects changing build args that invalidate Docker layer cache:
- `SOURCE_COMMIT` — changes every commit (**fixed in Coolify v4.0.0-beta.450+**)
- `COOLIFY_CONTAINER_NAME` — changes per container

### Solutions (both applied in current Dockerfile)

1. **BuildKit cache mounts** — immune to layer cache invalidation
2. **BuildKit GC on VPS** — extend cache retention to 30 days:

```json
// /etc/docker/daemon.json
{
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "10gb",
      "policy": [
        { "keepDuration": "720h", "keepBytes": 10737418240 },
        { "all": true, "keepBytes": 10737418240 }
      ]
    }
  }
}
```

Then: `sudo systemctl restart docker`

3. **Verify Coolify >= v4.0.0-beta.450** — older versions break all layer caching.

---

## Health Checks

- **Coolify health check:** DISABLED (causes rollback conflicts with rolling updates)
- **Docker HEALTHCHECK:** Active in Dockerfile (uses `wget` + `127.0.0.1`)

---

## Traefik (Coolify-managed)

```
traefik.http.routers.https-0-*.tls.certresolver = letsencrypt
traefik.http.middlewares.gzip.compress = true
traefik.http.services.*.loadbalancer.server.port = 3000
```

### Security Headers (add via Coolify custom labels if needed)

`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `Referrer-Policy: strict-origin-when-cross-origin`

---

## Resource Limits (vhf-2c-4gb)

| Service | Limit |
|---|---|
| App (prod) | ~1.5G |
| App (staging) | ~1G |
| Redis | ~512M |
| Coolify + Traefik | ~1G |

---

## Common Gotchas

1. **Redis conf must be base64** — raw text returns validation error
2. **`fqdn` not accepted in PATCH** — use `domains`
3. **`is_build_time` not accepted** — omit from env vars
4. **API must be enabled** — check `instance_settings.is_api_enabled`
5. **Token is Sanctum format** — `{token_id}|{plain_text_token}`
6. **Bulk env may fail** — loop individual POSTs as fallback
7. **Storage API may not accept `type`** — use DB insert as fallback
8. **Deploy requires `*` (all permissions) token**
9. **Never trigger concurrent rebuilds on the 4GB VPS.** A `git push` to `dev-test`
   triggers `CI/CD — Staging` → Coolify build. If you also call `/deploy?uuid=...`
   manually within the same window (e.g. via an admin workflow + the auto CI),
   the VPS runs two parallel Docker builders, OOMs, and Traefik can become
   unresponsive on port 443 while Coolify itself slows to a crawl. Recovery
   requires waiting (~5–10min) or a Vultr reboot. **Always check
   `gh run list --workflow="CI/CD — Staging"` before triggering a manual deploy
   and wait for in-progress runs to finish first.**

---

## Setting Env Vars from a Local Machine (Without SSH or Token)

When you don't have the Coolify token locally but `gh` is authenticated with
`workflow` scope, use the reusable admin workflow at
[admin-set-coolify-envs.yml](../../../../.github/workflows/admin-set-coolify-envs.yml).
It runs from a GitHub-hosted runner (whitelisted IP) and uses repo secrets.

```bash
# 1. Add the new secret(s) to GitHub
gh secret set NEW_VAR_NAME --body "value"

# 2. Edit admin-set-coolify-envs.yml — extend the upsert loop
#    to read NEW_VAR_NAME and POST it as a Coolify env

# 3. Commit the workflow change to BOTH dev-test and main
#    (workflow_dispatch only finds files on the default branch)
git push origin dev-test
git checkout main && git checkout dev-test -- .github/workflows/admin-set-coolify-envs.yml
git commit -m "ops(coolify): register admin workflow [skip ci]" \
  -m "[skip ci] prevents an unintended prod deploy from this commit"
git push origin main

# 4. Wait for any in-progress staging deploy to finish, THEN trigger
gh run list --workflow="CI/CD — Staging" --limit 1
gh workflow run admin-set-coolify-envs.yml --ref main \
  -f target=both -f redeploy=true

# 5. Watch
gh run watch <id> --exit-status
```

The workflow:
- GETs existing envs → POSTs new ones, PATCHes if already present (idempotent)
- Triggers redeploy via `/deploy?uuid=...`
- Health-checks `/health/live` from the runner using `--resolve` (bypasses DNS)

> Use `redeploy=false` if you only want to upsert envs without restarting (e.g.
> when you'll deploy later via the normal CI flow).
