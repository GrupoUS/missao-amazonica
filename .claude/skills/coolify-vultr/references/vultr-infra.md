# Vultr Infrastructure Reference

> CLI: `vultr-cli` v3 | REST API: `https://api.vultr.com/v2`

## Authentication

```bash
# Load from .env (VULTR_API) → export as VULTR_API_KEY for CLI
export VULTR_API_KEY=$(grep '^VULTR_API=' .env | cut -d= -f2)

# Or config file: echo "api-key: $VULTR_API_KEY" > ~/.vultr-cli.yaml
```

> **Gotcha:** `.env` uses `VULTR_API`, CLI expects `VULTR_API_KEY`. Always export.

## NeonDash Resource IDs

| Resource | ID |
|---|---|
| Instance | `5f75a3b9-f538-4fc3-a845-a522b983166d` |
| SSH Key | `f68ee751-0714-404b-8361-70ceb0640e9b` |
| Firewall Group | `00cad25f-6863-46b6-b19b-dec24b5cb093` |
| Domain | `neondash.com.br` |
| Server IP | `216.238.125.45` |
| Region | `sao` (São Paulo) |
| Plan | `vhf-2c-4gb` |

---

## Instance

```bash
vultr-cli instance get 5f75a3b9-f538-4fc3-a845-a522b983166d
vultr-cli instance restart 5f75a3b9-f538-4fc3-a845-a522b983166d
vultr-cli instance bandwidth 5f75a3b9-f538-4fc3-a845-a522b983166d

# REST API
curl -s "https://api.vultr.com/v2/instances/5f75a3b9-f538-4fc3-a845-a522b983166d" \
  -H "Authorization: Bearer $VULTR_API_KEY"
```

---

## DNS Management

```bash
# List records
vultr-cli dns record list neondash.com.br
vultr-cli dns record list neondash.com.br -o json

# Create A record
vultr-cli dns record create neondash.com.br \
  --type A --name "sub" --data 216.238.125.45 --ttl 300

# Create CNAME
vultr-cli dns record create neondash.com.br \
  --type CNAME --name "www" --data "neondash.com.br" --ttl 300

# Create TXT (SPF, DKIM)
vultr-cli dns record create neondash.com.br \
  --type TXT --name "" --data "v=spf1 include:_spf.google.com ~all" --ttl 300

# Update / Delete
vultr-cli dns record update neondash.com.br --record-id <id> --data 216.238.125.45
vultr-cli dns record delete neondash.com.br --record-id <id>
```

> **Note:** Use empty string `""` for root domain `--name`. Rate limit: ~200 req/min.

---

## Firewall

Required ports:

| Port | Protocol | Purpose |
|---|---|---|
| 22 | TCP | SSH access |
| 80 | TCP | HTTP (Traefik → redirect HTTPS) |
| 443 | TCP | HTTPS (Traefik + Let's Encrypt) |
| 8000 | TCP | Coolify Dashboard |

```bash
# List rules
vultr-cli firewall rule list 00cad25f-6863-46b6-b19b-dec24b5cb093

# Create rule
vultr-cli firewall rule create 00cad25f-6863-46b6-b19b-dec24b5cb093 \
  --ip-type v4 --protocol tcp --port 443 \
  --subnet 0.0.0.0 --size 0 --notes "HTTPS"

# Delete rule
vultr-cli firewall rule delete 00cad25f-6863-46b6-b19b-dec24b5cb093 --rule-number <n>
```

---

## SSH Keys

```bash
vultr-cli ssh-key list
vultr-cli ssh-key create --name "neondash-deploy" --key "$(cat ~/.ssh/vultr_neondash.pub)"
vultr-cli ssh-key delete f68ee751-0714-404b-8361-70ceb0640e9b
```

---

## Practical Scripts

### Full diagnostics

```bash
#!/bin/bash
export VULTR_API_KEY=$(grep '^VULTR_API=' .env | cut -d= -f2)
echo "=== Account ===" && vultr-cli account
echo -e "\n=== Instance ===" && vultr-cli instance get 5f75a3b9-f538-4fc3-a845-a522b983166d
echo -e "\n=== DNS Records ===" && vultr-cli dns record list neondash.com.br
echo -e "\n=== Firewall Rules ===" && vultr-cli firewall rule list 00cad25f-6863-46b6-b19b-dec24b5cb093
```

### DNS migration helper

```bash
#!/bin/bash
export VULTR_API_KEY=$(grep '^VULTR_API=' .env | cut -d= -f2)
IP="216.238.125.45"
vultr-cli dns record create neondash.com.br --type A --name "" --data $IP --ttl 300
for SUB in staging api www; do
  vultr-cli dns record create neondash.com.br --type A --name "$SUB" --data $IP --ttl 300
done
vultr-cli dns record create neondash.com.br --type A --name "*" --data $IP --ttl 300
```

---

## CLI Gotchas

1. **Env var name:** vultr-cli expects `VULTR_API_KEY`, project `.env` uses `VULTR_API`
2. **Boolean flags:** Use `=` syntax: `--notify=true` (not `--notify true`)
3. **DNS root:** Use `""` for root domain records
4. **Rate limits:** ~200 req/min. CLI doesn't auto-retry on 429
5. **Output format:** Default is `text`. Use `-o json` for scripting
6. **REST API** rate limit: 3 req/sec. Pagination via `cursor` param
