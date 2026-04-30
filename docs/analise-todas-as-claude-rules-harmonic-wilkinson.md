# Plano — Refactor `.claude/commands/` + `.claude/skills/`

> Genericização total. Funciona em qualquer projeto via `.claude/config.json` + overlay opcional.
> Decisões aprovadas: `genérico puro + overlay opcional` · `fetch upstream Supabase agora` · `10 commands + templates externos`.

---

## Context

**Problema:** `.claude/commands/` (22 arquivos, 4.054 linhas) e `.claude/skills/` (10 skills) foram herdados de outro projeto (NeonDash) e contêm:

- **Redundância pesada:** debug-trio (debug+audit+debug-frontend, 65% overlap), perf-quad (perf+optimize-bundle/db/memory, 72% overlap), prime-trio (prime+prime-backend+prime-frontend, 58% overlap).
- **Coupling project-specific:** URLs hardcoded (`staging.neondash.com.br` em 19+ refs), paths (`apps/api/`, `apps/web/`), stack assumptions (Vite, tsgo, Bun, TanStack Router, Hono, Drizzle, Clerk, tRPC).
- **Templates verbosos inline:** `delegate.md` (49l), `recover.md` (45l), `handoff.md` (48l), prompts de agentes em `audit.md` (60-80 linhas cada × 4).

**Outcome desejado:**
- 22 commands → **10 commands + 1 `_shared.md` + `templates/`** (redução ~50% linhas, zero perda funcional).
- 10 skills → todas genéricas + 2 open-source sincronizadas com upstream Supabase.
- Plug-and-play em qualquer projeto via `.claude/config.json`; layer Missão Amazônica vira `.claude/overlay/missao-amazonica/` opcional.
- Rules (`.claude/rules/`) **permanecem project-specific** (descrevem o stack atual) — apenas commands/skills viram genéricos.

---

## Modelo de orquestração preservado

Commands/skills devem respeitar contrato existente em `.claude/CLAUDE.md`:

1. **Tier loading** — Tier 1 (CLAUDE.md sempre) → Tier 2 (rules/ on-demand) → Tier 3 (docs/ pointers).
2. **Routing matrix** — task-type → rule-file → impl path.
3. **Intent classification** — L1-L2 trivial · L3 explícito · L4 exploratório · L5+ aberto.
4. **Sequential thinking** — invocar antes de ação em L4+, multi-domain, ambíguo, 3+ phases.
5. **Stopping conditions** — max 3 fix attempts mesma hipótese · max 5 agent spawns · escalate via `/recover`.
6. **Skill invocation** — antes de qualquer resposta (1% chance → invocar).

---

## Phase 1 — Commands (22 → 10 + templates + shared)

### 1.1 Final command set

| # | Command | Lines (alvo) | Origem (consolidação) | Coupling alvo |
|---|---|---|---|---|
| 1 | `_shared.md` | ~200 | Atual + extrai padrões duplicados de implement/design/audit | GENERIC |
| 2 | `plan.md` | ~80 | Atual (já genérico) | GENERIC |
| 3 | `prime.md` | ~150 | **Funde** prime + prime-backend + prime-frontend → arg posicional: `/prime`, `/prime backend`, `/prime frontend`, `/prime fullstack` | GENERIC + overlay |
| 4 | `research.md` | ~100 | Atual (já genérico) | GENERIC |
| 5 | `design.md` | ~200 | Atual desacoplado de Stitch-MCP-only (phase 1 aceita `figma`/`stitch`/`manual`) | GENERIC |
| 6 | `implement.md` | ~180 | Atual + extrai skill-routing + agent-matrix para `_shared.md` | GENERIC |
| 7 | `debug.md` | ~380 | **Funde** debug + debug-frontend + audit → arg posicional: `/debug`, `/debug audit`, `/debug frontend`, `/debug recover` | GENERIC |
| 8 | `perf.md` | ~250 | **Funde** perf + optimize-bundle + optimize-database (drop optimize-memory) → arg posicional: `/perf`, `/perf build`, `/perf db`. Parametrizado via config. | GENERIC |
| 9 | `verify.md` | ~520 | Atual + extrai matriz de verdict para `_shared.md`; staging URL via config | GENERIC |
| 10 | `evolve.md` | ~150 | Atual (genérico, só roteia evolution-core skill) | GENERIC |

**Removidos / externalizados:**
- `debug-frontend.md`, `audit.md` → fundidos em `debug.md`
- `optimize-bundle-size.md`, `optimize-database-performance.md` → fundidos em `perf.md`
- `optimize-memory-usage.md` → **deletado** (genérico demais, sem instrumentação real; documentar referência externa se necessário)
- `prime-backend.md`, `prime-frontend.md` → fundidos em `prime.md`
- `recover.md` → absorvido como `/debug --mode=recover`
- `delegate.md`, `handoff.md`, `architecture-review.md`, `refactor-code.md` → movidos para `.claude/templates/` como referências (commands não precisam, são padrões/checklists)

### 1.2 Templates externos (`.claude/templates/`)

Diretório novo. Cada arquivo é um template/checklist sem ser invocável como `/command`:

| Arquivo | Origem | Uso |
|---|---|---|
| `delegation-protocol.md` | `delegate.md` (49l) | 7-section delegation referenced from `implement.md` |
| `handoff-template.md` | `handoff.md` (48l) | Session state template referenced from `evolve.md` |
| `recovery-protocol.md` | `recover.md` (45l) | Failure recovery template referenced from `debug.md --mode=recover` |
| `architecture-review-checklist.md` | `architecture-review.md` (37l) | Reference checklist used inside `audit` mode |
| `refactor-methodology.md` | `refactor-code.md` (120l) | 17-step methodology referenced when implement detects refactor intent |
| `audit-agent-prompts.md` | extraído de `audit.md` (lines 62-308) | 4 agent prompt templates loaded by `debug.md --mode=audit` |

### 1.3 Configuração genérica

**Novo:** `.claude/config.json` (lido por commands em runtime via Bash/Read).

```json
{
  "project": {
    "name": "missao-amazonica",
    "stack": "astro-hybrid",
    "stagingUrl": "http://localhost:4321",
    "productionUrl": "",
    "locale": "pt-BR"
  },
  "paths": {
    "backendRoot": "src/pages/api",
    "frontendRoot": "src",
    "schemaRoot": "supabase/migrations",
    "stylesRoot": "src/styles",
    "componentsRoot": "src/components"
  },
  "tooling": {
    "packageManager": "bun",
    "buildTool": "astro",
    "typeChecker": "astro-check",
    "linter": "biome",
    "testRunner": "",
    "deployer": "vercel"
  },
  "gates": {
    "lighthouse": { "performance": 95, "accessibility": 95, "bestPractices": 95, "seo": 95 },
    "lcp": 2500,
    "cls": 0,
    "inp": 100,
    "initialJsKb": 50
  },
  "overlay": ".claude/overlay/missao-amazonica"
}
```

**Overlay opcional:** `.claude/overlay/missao-amazonica/` (carrega se presente):

```
.claude/overlay/missao-amazonica/
├── README.md                    # explica o overlay
├── anti-patterns.md             # NeonDash-style: Pix idempotency, donor PII, derived totals, SPA ban
├── routing-supplements.md       # links extras à routing matrix (Pix providers, Resend wrappers)
└── verify-supplements.md        # smoke tests específicos (webhook idempotency, RLS anon deny, public_donor_list)
```

Quando outro projeto usar esses commands: deleta o overlay ou cria seu próprio em `.claude/overlay/<seu-projeto>/`.

### 1.4 Padrões a extrair para `_shared.md`

Hoje `_shared.md` tem: Quality Gates, Complexity Routing, Agent Matrix, WISC Load, AutoResearch Loop. Adicionar:

- **§ Skill-to-Domain Matrix** (extraído de `implement.md` § 1, `design.md` § 3, `verify.md` Phase 1) — single source of truth.
- **§ Parallel Agent Spawn pattern** (extraído de `implement.md` § 5, `audit.md`) — single recipe.
- **§ Sequential Phase Gating pattern** (extraído de `implement.md` § 6, `verify.md`) — single recipe.
- **§ Verdict Matrix template** (extraído de `verify.md` lines ~600+) — reusável.
- **§ Config Loader recipe** (novo) — como ler `.claude/config.json` + carregar overlay.

### 1.5 Genericização — refs a substituir

Search-and-replace exhaustivo nos 10 commands finais:

| Padrão atual | Substituir por |
|---|---|
| `apps/api/` `apps/web/` | `${PATHS_BACKEND_ROOT}` `${PATHS_FRONTEND_ROOT}` (lidos do config) |
| `staging.neondash.com.br` | `${PROJECT_STAGING_URL}` (config) |
| `bun run`, `bunx` | `${TOOLING_PACKAGE_MANAGER} run`, fallback texto explicativo |
| `tsgo`, `Vite 7`, `TanStack Router`, `Hono`, `Drizzle`, `Neon HTTP`, `Clerk`, `tRPC` | exemplos genéricos + nota "ajuste para seu stack via config" |
| `NeonDash`, `Missão Amazônica`, `Sal da Terra` | remover; usar `${PROJECT_NAME}` em logs |
| `mentoradoId`, `Pix`, `Meta OAuth`, `Resend` | exemplos genéricos; refs específicas só em overlay |

Cada command que precisa de stack-specific guidance carrega via:

```markdown
## Stack-specific
Read `.claude/config.json::tooling`. If `${overlay}` exists, also read `${overlay}/anti-patterns.md`.
```

---

## Phase 2 — Skills (10 skills)

### 2.1 Inventário com classificação

| Skill | Status | Ação |
|---|---|---|
| `evolution-core` | GENERIC (95%) | Traduzir headers PT→EN; ship as-is |
| `senior-prompt-engineer` | GENERIC (100%) | Verificar stubs; ship as-is |
| `skill-creator` | GENERIC (100%) | Sem mudanças |
| `ui-ux-pro-max` | GENERIC (100%) | Sem mudanças (CSV data já agnostic) |
| `xlsx` | GENERIC (100%) | Sem mudanças (verificar `recalc.py` dependency) |
| `supabase` | OFFICIAL UPSTREAM | **FETCH** de https://github.com/supabase-community/skills (ou repo oficial mais recente); diff + atualizar |
| `supabase-postgres-best-practices` | OFFICIAL UPSTREAM (MIT, Supabase) | **FETCH** upstream; diff + atualizar |
| `debugger` | DEEPLY-COUPLED (68%) | Refactor: extrair anti-patterns NeonDash → `.claude/overlay/missao-amazonica/anti-patterns.md`. Skill core fica genérico via param `--anti-patterns-file=$OVERLAY/anti-patterns.md` |
| `performance-optimization` | DEEPLY-COUPLED (60%) | Refactor: separar `seo-playbook-neondash.md` (delete ou move overlay) de `seo-baseline.md` genérico. Parametrizar URLs via config. |
| `planning` | DEEPLY-COUPLED (55%) | Refactor: extrair "Layer Map" Hono+tRPC+Drizzle → `.claude/overlay/missao-amazonica/layer-map.md`. Skill core lê layer-map por config + suporta Astro+Supabase como exemplo genérico. |

### 2.2 Upstream sync (Supabase official)

**Procedimento:**

1. Localizar fonte upstream:
   - `supabase` skill → check `https://github.com/supabase-community/agent-skills` ou `https://github.com/supabase/supabase` docs/skills directory (via Tavily search "supabase agent skill upstream").
   - `supabase-postgres-best-practices` → metadata indica `author: supabase`, MIT license, Jan 2026; buscar upstream.
2. Para cada skill:
   - Fetch SKILL.md + references/ + scripts/ atuais upstream.
   - Diff contra `.claude/skills/<skill>/`.
   - Mostrar diff resumo ao user antes de aplicar.
   - Aplicar update preservando qualquer customização local detectada.
3. Adicionar `.claude/skills/<skill>/UPSTREAM.md` documentando: source URL, commit/version, last-sync date, customizations preserved.

### 2.3 Refactor das 3 skills coupled

#### `debugger`
- **Manter:** core methodology (7-layer debugging pyramid), 4 packs (frontend/backend/auth/db), sub-agent templates, browser-setup.md, scripts.
- **Extrair p/ overlay:**
  - `consolidated-domain-rules.md` → split em:
    - `references/methodology.md` (genérico, fica)
    - `.claude/overlay/missao-amazonica/anti-patterns.md` (NeonDash anti-patterns — Clerk/tRPC/Drizzle/Neon HTTP/Pix/mentoradoId)
- **Genericizar:** URLs hardcoded → ler `${PROJECT_STAGING_URL}` do config; pack-guides.md aceita `--framework=react|vue|astro` flag.

#### `performance-optimization`
- **Manter:** PSI API, Lighthouse, Unlighthouse references, scripts.
- **Extrair p/ overlay:**
  - `references/seo-playbook.md` → split em `seo-baseline.md` (genérico) + `.claude/overlay/missao-amazonica/seo-supplement.md` (TanStack Router specifics, route patterns NeonDash).
- **Genericizar:** URLs via config; React Doctor refs viram opcionais (gated por `${TOOLING_FRONTEND_FRAMEWORK} = react`).

#### `planning`
- **Manter:** D.R.P.I.V protocol, complexity classification (L1-L6+), risk assessment, harness patterns.
- **Extrair p/ overlay:**
  - Layer Map hardcoded (Schema → tRPC → Hono → Query Hook → React → Route) → `.claude/overlay/missao-amazonica/layer-map.md`.
  - Skill core ganha exemplo genérico de layer map (Astro+Supabase: `migrations → API route → component → page`).
- **Genericizar:** verification commands (`bun run type-check`, `bunx biome`) → ler de `${TOOLING}` config.

---

## Critical files

### A modificar (Phase 1)
- `D:\Coders\missao-amazonica\.claude\commands\_shared.md` (expandir)
- `D:\Coders\missao-amazonica\.claude\commands\prime.md` (mesclar prime-backend + prime-frontend)
- `D:\Coders\missao-amazonica\.claude\commands\debug.md` (mesclar debug-frontend + audit + recover)
- `D:\Coders\missao-amazonica\.claude\commands\perf.md` (mesclar optimize-bundle + optimize-database; drop optimize-memory)
- `D:\Coders\missao-amazonica\.claude\commands\implement.md` (extrair skill-router → _shared)
- `D:\Coders\missao-amazonica\.claude\commands\verify.md` (extrair verdict matrix → _shared; staging URL via config)
- `D:\Coders\missao-amazonica\.claude\commands\design.md` (genericizar Stitch-MCP-only)
- `D:\Coders\missao-amazonica\.claude\commands\plan.md` (sweep refs)
- `D:\Coders\missao-amazonica\.claude\commands\research.md` (sweep refs)
- `D:\Coders\missao-amazonica\.claude\commands\evolve.md` (sweep refs)

### A deletar (Phase 1)
- `.claude\commands\prime-backend.md`
- `.claude\commands\prime-frontend.md`
- `.claude\commands\debug-frontend.md`
- `.claude\commands\audit.md`
- `.claude\commands\optimize-bundle-size.md`
- `.claude\commands\optimize-database-performance.md`
- `.claude\commands\optimize-memory-usage.md`
- `.claude\commands\recover.md`
- `.claude\commands\delegate.md` (move para templates)
- `.claude\commands\handoff.md` (move para templates)
- `.claude\commands\architecture-review.md` (move para templates)
- `.claude\commands\refactor-code.md` (move para templates)

### A criar (Phase 1)
- `D:\Coders\missao-amazonica\.claude\config.json`
- `D:\Coders\missao-amazonica\.claude\templates\delegation-protocol.md`
- `D:\Coders\missao-amazonica\.claude\templates\handoff-template.md`
- `D:\Coders\missao-amazonica\.claude\templates\recovery-protocol.md`
- `D:\Coders\missao-amazonica\.claude\templates\architecture-review-checklist.md`
- `D:\Coders\missao-amazonica\.claude\templates\refactor-methodology.md`
- `D:\Coders\missao-amazonica\.claude\templates\audit-agent-prompts.md`
- `D:\Coders\missao-amazonica\.claude\overlay\missao-amazonica\README.md`
- `D:\Coders\missao-amazonica\.claude\overlay\missao-amazonica\anti-patterns.md`
- `D:\Coders\missao-amazonica\.claude\overlay\missao-amazonica\routing-supplements.md`
- `D:\Coders\missao-amazonica\.claude\overlay\missao-amazonica\verify-supplements.md`

### A modificar (Phase 2)
- `.claude\skills\evolution-core\SKILL.md` (PT → EN)
- `.claude\skills\debugger\SKILL.md` + `references/consolidated-domain-rules.md` (extrair anti-patterns)
- `.claude\skills\performance-optimization\SKILL.md` + `references/seo-playbook.md` (split SEO baseline + overlay)
- `.claude\skills\planning\SKILL.md` + references (extrair layer map)
- `.claude\skills\supabase\` (sync upstream, criar UPSTREAM.md)
- `.claude\skills\supabase-postgres-best-practices\` (sync upstream, criar UPSTREAM.md)

### A criar (Phase 2)
- `.claude\overlay\missao-amazonica\layer-map.md` (Astro+Supabase específico, extraído de planning skill)
- `.claude\overlay\missao-amazonica\seo-supplement.md` (extraído de performance-optimization)
- `.claude\skills\supabase\UPSTREAM.md` (sync metadata)
- `.claude\skills\supabase-postgres-best-practices\UPSTREAM.md` (sync metadata)

---

## Sequência de execução

1. **Setup config** (10min) — criar `.claude/config.json` + estrutura `.claude/overlay/missao-amazonica/` + `.claude/templates/`.
2. **Externalizar templates** (30min) — mover delegate/handoff/recover/architecture-review/refactor-code → templates/; deletar arquivos originais em commands/.
3. **Extrair audit prompts** — copiar prompts de audit.md (lines 62-308) → templates/audit-agent-prompts.md.
4. **Phase 1.A — Mesclar trios** (2h) — debug+audit+debug-frontend, perf+optimize-trio, prime-trio. Cada merge: copiar essência única + parametrizar refs + grep verify.
5. **Phase 1.B — Expandir _shared.md** (45min) — adicionar 5 novas seções (skill-matrix, parallel-spawn, sequential-gating, verdict-matrix, config-loader).
6. **Phase 1.C — Sweep genericização** (1h) — search-replace project refs em todos 10 commands finais; mover refs Missão Amazônica para overlay.
7. **Phase 2.A — Skills genéricas trivais** (20min) — `evolution-core` PT→EN.
8. **Phase 2.B — Refactor 3 skills coupled** (1.5h) — debugger, performance-optimization, planning. Cada uma: extrair overlay + genericizar SKILL.md + atualizar references.
9. **Phase 2.C — Upstream sync** (1h) — fetch + diff + apply para `supabase` e `supabase-postgres-best-practices`. Criar UPSTREAM.md em cada uma.
10. **Verification** (45min) — checklist abaixo.

**Total estimado:** ~7-8h.

---

## Verification

Como validar que nada quebrou e tudo ficou genérico:

### Sintaxe de invocação (args posicionais)

Commands com sub-modes usam **arg posicional simples**, não flags:

```
/debug                # default: triagem + diagnóstico
/debug audit          # 4-agent full audit
/debug frontend       # static + Playwright E2E
/debug recover        # failure recovery protocol

/perf                 # default: runtime audit (PSI)
/perf build           # bundle/build optimization
/perf db              # database performance (N+1, indexes, pool)

/prime                # auto-classify
/prime backend        # backend context load
/prime frontend       # frontend context load
/prime fullstack      # cross-domain
```

Cada command parseia primeiro arg como modo; ausência → default. `_shared.md` documenta o pattern.

### Smoke tests por command final

| Command | Teste |
|---|---|
| `/plan` | Invocar com tarefa L4 fictícia; confirma classifica + pesquisa + retorna plan sem refs project-specific |
| `/prime` | Lê `.claude/config.json`; carrega overlay se existir; outputs Tier 2 rules referenciadas |
| `/prime backend` | Carrega rules backend + database + integrations |
| `/research` | Spawn explorer + librarian em paralelo; sem refs NeonDash |
| `/design` | Phase 0 spec funciona com prototype-tool=manual (não Stitch-MCP-only) |
| `/implement` | Carrega skill-router de `_shared.md` § Skill-to-Domain Matrix; executa fase trivial |
| `/debug` | Triage → investigation; sem URL hardcoded |
| `/debug audit` | Spawn 4 agents com prompts de `templates/audit-agent-prompts.md` |
| `/debug frontend` | Static + Playwright; staging URL vem de config |
| `/debug recover` | Carrega `templates/recovery-protocol.md` |
| `/perf` | PSI API com URL do config; sem hardcoded `staging.neondash.com.br` |
| `/perf build` | Funciona em projeto Astro (não Vite-only); detect tool |
| `/perf db` | Postgres-agnostic (não assume Drizzle+Neon) |
| `/verify` | 10 phases; staging URL via config; verdict matrix de _shared |
| `/evolve` | Roteia evolution-core; sem refs NeonDash |

### Greps de validação (zero hits esperado)

```bash
# project refs em commands finais
grep -ri "neondash\|missao-amazonica\|sal da terra" .claude/commands/ --include="*.md"

# project refs em skills genéricas
grep -ri "neondash\|missao-amazonica" .claude/skills/{evolution-core,senior-prompt-engineer,skill-creator,ui-ux-pro-max,xlsx,supabase,supabase-postgres-best-practices}/

# stack hardcoded
grep -ri "tsgo\|TanStack Router\|Drizzle\|Clerk\|Hono\|Pix\|mentoradoId" .claude/commands/ .claude/skills/{evolution-core,senior-prompt-engineer,skill-creator,supabase,supabase-postgres-best-practices}/

# refs Missão Amazônica DEVEM aparecer em overlay
grep -ri "missao-amazonica\|astro hybrid\|supabase" .claude/overlay/missao-amazonica/
```

### Checklist final

- [ ] 10 commands finais + `_shared.md` em `.claude/commands/`
- [ ] 6 templates em `.claude/templates/`
- [ ] 4 arquivos de overlay em `.claude/overlay/missao-amazonica/`
- [ ] `.claude/config.json` lido por commands
- [ ] 12 arquivos deletados de `.claude/commands/` (lista acima)
- [ ] 10 skills, 3 refatoradas (debugger, performance-optimization, planning)
- [ ] 2 skills sincronizadas com upstream + UPSTREAM.md
- [ ] `evolution-core` em inglês
- [ ] Greps de project-refs em commands genéricos retornam 0
- [ ] Tier 1 (CLAUDE.md) + Tier 2 (rules/) + Tier 3 (docs/) intactos — apenas commands/skills mudaram
- [ ] Modelo de orquestração preservado: routing matrix, intent classification, sequential thinking triggers, stopping conditions
- [ ] AGENTS.md atualizado se referenciar commands removidos (e.g., `/audit` → `/debug --mode=audit`)

### Rollback plan

Antes de começar: `git checkout -b refactor/claude-commands-skills-generic`. Cada phase = commit separado. Se quebrar:
- Phase 1 only — `git revert` commits Phase 1.
- Phase 2 only — `git revert` commits Phase 2.
- Total — `git checkout main`.
