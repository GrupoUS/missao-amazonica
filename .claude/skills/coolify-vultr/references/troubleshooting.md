# Troubleshooting — Deploy & Container

## Quick Diagnostic Script

```bash
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45 "
# 1. Containers running?
sudo docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -v coolify

# 2. Health checks from inside?
for CID in \$(sudo docker ps -q --filter 'label=coolify.managed=true' | head -5); do
  NAME=\$(sudo docker inspect \$CID --format '{{.Name}}')
  HC=\$(sudo docker exec \$CID wget -qO- http://127.0.0.1:3000/health/live 2>&1 || echo 'FAIL')
  echo \"  \$NAME: \$HC\"
done

# 3. Traefik errors?
sudo docker logs coolify-proxy --tail 10 2>&1 | grep -i 'ERR'

# 4. SSL certs?
sudo docker exec coolify-proxy cat /traefik/acme.json 2>/dev/null | python3 -c '
import sys,json
d=json.load(sys.stdin)
for r,i in d.items():
  certs=i.get(\"Certificates\",[]) or []
  print(f\"  {r}: {len(certs)} certs\")
  for c in certs:
    print(f\"    {c.get(\"domain\",{}).get(\"main\",\"?\")}\")
' 2>/dev/null || echo '  No certs'
"
```

---

## DNS Issues

### DNS Not Resolving (Most Common Failure)

**Sintoma:** Sites não abrem, DNS resolve para IP antigo.
**Root cause:** Nameservers no registrador ainda apontam para provedor antigo.

```bash
# 1. Verificar NS records
curl -sS "https://dns.google/resolve?name=neondash.com.br&type=NS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for a in d.get('Answer',[]):
    ns=a['data']
    print(f'  {\"CORRECT\" if \"vultr\" in ns else \"WRONG\"}: {ns}')
"

# 2. Verificar A record
python3 -c "import socket; print(socket.gethostbyname('neondash.com.br'))"
# Esperado: 216.238.125.45

# 3. Bypass DNS (test server directly)
curl -sS -k --resolve "neondash.com.br:443:216.238.125.45" \
  "https://neondash.com.br/health/live"
# Se "OK" → problema é 100% DNS
```

**Fix:** No registrador, alterar nameservers para `ns1.vultr.com` / `ns2.vultr.com`. Propagação: 5min a 48h.

### Clerk Subdomains & SSL

**Sintoma:** `NET::ERR_CERT_AUTHORITY_INVALID` em `accounts.neondash.com.br`.
**Root cause:** CNAME records para Clerk devem ter proxy DESABILITADO.

```bash
vultr-cli dns record list neondash.com.br -o json | jq '.[] | select(.type=="CNAME")'
# accounts → accounts.neondash.com.br.clerk.accounts.dev
# clerk    → frontend-api.clerk.accounts.dev
```

> **REGRA:** Subdomínios Clerk NUNCA devem ter proxy habilitado.

---

## SSL Certificate Failed (Let's Encrypt)

**Sintoma:** Traefik log: `Unable to obtain ACME certificate`.

| # | Causa | Fix |
|---|---|---|
| 1 | DNS não aponta para o servidor | Corrigir DNS primeiro |
| 2 | Porta 80 bloqueada | Verificar firewall Vultr (porta 80) |
| 3 | Rate limit Let's Encrypt | Aguardar 1h, não force redeploy |
| 4 | NXDOMAIN | Criar A record na zona DNS |

```bash
# Restart Traefik (força nova tentativa ACME)
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45 \
  "sudo docker restart coolify-proxy"

# Verificar logs de cert
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45 \
  "sudo docker logs coolify-proxy --tail 20 2>&1 | grep -i 'acme\|cert\|ERR'"
```

---

## Build Failures

### `bun install` fails in Docker

- Ensure `bun.lock` is committed and up-to-date
- Run `bun install` locally first, commit `bun.lock`
- Check `.dockerignore` isn't excluding `bun.lock`

### `bun run build` fails with OOM

- Add `NODE_OPTIONS: --max-old-space-size=4096` to build stage
- Ensure all Vite build args are passed
- Run `bun run type-check` locally before pushing

### Build fails: "could not read Username for github.com"

Private repo without credentials. Fix:
1. `ssh-keygen -t ed25519 -f /tmp/deploy-key -N ""`
2. `gh repo deploy-key add /tmp/deploy-key.pub -R GrupoUS/neondash -t "coolify"`
3. Register private key in Coolify: `POST /api/v1/security/keys`
4. Recreate app as `private-deploy-key`

### Build fails: "secret not found"

Dockerfile uses `--mount=type=secret` with ARG fallback. Verify VITE_* env vars are configured in Coolify app.

### Image too large (>150MB)

```bash
docker images neondash --format "{{.Size}}"
docker history neondash --no-trunc
```

Fix: Alpine base, 3-stage build, verify `.dockerignore`.

---

## Container Issues

### Container Not Running / Health Check Failing

**Coolify vs Docker health check:**
- Coolify: external check, triggers rollback (AGGRESSIVE)
- Docker HEALTHCHECK: runs inside container

> **REGRA:** Keep Coolify health check **DISABLED**. Use Docker HEALTHCHECK only.

```bash
# Check health from inside container
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45
sudo docker exec <container> wget -qO- http://127.0.0.1:3000/health/live

# Disable Coolify health check
curl "$COOLIFY_API/applications/{uuid}" -X PATCH \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"health_check_enabled": false}'
```

### Health check failing: IPv6 localhost

**Root cause:** Alpine `wget` resolves `localhost` to `::1` first. App listens on IPv4 only.
**Fix:** Use `127.0.0.1` in Dockerfile HEALTHCHECK (already applied).

### `Cannot find package 'vite'` in production

**Root cause:** Bun bundler resolves `import("./vite")` eagerly at parse time.
**Fix:**
```typescript
if (nodeEnv === "development") {
  try {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } catch { serveStatic(app); }
}
```

### Container exits immediately

```bash
sudo docker logs <container_id> --tail 50
sudo docker inspect <container_id> --format '{{.State.ExitCode}}'
```

Common: missing `DATABASE_URL`, Redis connection failure, port conflict.

---

## Redis Issues

### Connection Refused

- Use internal URL: `redis://default:{password}@{container-uuid}:6379/0` (never `localhost`)
- Verify containers on same Docker network
- Staging uses DB 1: `redis://...@{uuid}:6379/1`

### Redis OOM

```bash
sudo docker exec <redis_container> redis-cli INFO memory
```

Fix: increase `maxmemory` or check session leaks.

---

## Coolify API Returns "API is disabled"

```bash
ssh linuxuser@216.238.125.45 \
  "sudo docker exec coolify-db psql -U coolify -d coolify \
   -c \"UPDATE instance_settings SET is_api_enabled = true;\""
```

## Vultr API Returns "Unauthorized IP address"

Retry with delay:
```bash
for i in 1 2 3 4 5; do
  RESULT=$(curl -sS "https://api.vultr.com/v2/domains" \
    -X POST -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    --data '{"domain": "example.com"}')
  echo "$RESULT" | grep -q '"domain"' && break
  sleep 3
done
```

---

## Rollback

```bash
# Via Coolify API
curl "$COOLIFY_API/applications/{uuid}/restart" -H "Authorization: Bearer $TOKEN"

# Via Git (triggers auto-deploy)
git revert <bad-commit>
git push origin main
```

---

## Monitoring Commands

```bash
ssh -i ~/.ssh/vultr_neondash linuxuser@216.238.125.45

sudo docker ps --format "table {{.Names}}\t{{.Status}}"
sudo docker stats --no-stream
sudo docker logs <container> --tail 50

curl -sS -k --resolve "neondash.com.br:443:216.238.125.45" "https://neondash.com.br/health/live"
curl -sS -k --resolve "staging.neondash.com.br:443:216.238.125.45" "https://staging.neondash.com.br/health/live"

# Redis backup
sudo docker exec <redis> redis-cli BGSAVE
sudo docker cp <redis>:/data/dump.rdb ./backup-$(date +%Y%m%d).rdb
```

---

## Persistent Storage

Coolify stores volumes in `/var/lib/docker/volumes/`. Baileys sessions mounted at `/app/.baileys-sessions`.
