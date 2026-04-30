# `.claude/` — Claude Code Framework

> Generic agent harness for any software project. Drop into a new repo, configure once, get a full agent toolkit: commands, skills, rules, hooks, and a project-overlay system for stack-specific authority.

---

## What's in here

| Path | Purpose | Generic? |
|---|---|---|
| `CLAUDE.md` | Tier 1 always-loaded behavioral config (intent classification, routing, sequential thinking, stopping conditions). | ✅ generic |
| `config.json` | Project values (name, paths, tooling, gates, overlay path). **Edit per project.** | 🔶 per-project |
| `commands/` | 10 slash commands (`/plan`, `/prime`, `/research`, `/design`, `/implement`, `/debug`, `/perf`, `/verify`, `/evolve`, `_shared.md`) | ✅ generic |
| `templates/` | 6 reusable templates (delegation, handoff, recovery, audit prompts, refactor methodology, architecture review) | ✅ generic |
| `rules/` | Tier 2 domain rule **scaffolds** (backend, database, frontend, integrations, stability, DESIGN). Generic templates. | ✅ generic |
| `skills/` | 10 skills (debugger, planning, performance-optimization, evolution-core, ui-ux-pro-max, frontend-design, supabase, supabase-postgres-best-practices, senior-prompt-engineer, skill-creator, xlsx) | ✅ generic |
| `agents/` | 9 agent definitions (debugger, evaluator, explorer-agent, frontend-specialist, librarian, mobile-developer, performance-optimizer, project-planner, verification-agent) | ✅ generic |
| `hooks/` | 13 Python hooks (SessionStart, PreToolUse, PostToolUse, etc.) — config-driven, no project hardcoding | ✅ generic |
| `scripts/` | CDP/Chrome debug scripts, context monitor — config-driven | ✅ generic |
| `settings.json` | Permissions + hook wiring. Generic Bash patterns + protected files. | ✅ generic |
| `settings.local.json` | Per-machine permissions (NOT committed). | 🔶 per-machine |
| `overlay/<project>/` | **Project authority.** Cardinal rules, identity, concrete domain rules, anti-patterns, layer map, etc. | 🔴 per-project |
| `docs/` | Per-project documentation. | 🔴 per-project |
| `logs/` | Auto-generated subagent + escalation event logs. | (runtime) |
| `agent-memory/` | Auto-generated cross-session memory. | (runtime) |

---

## Architecture: 3-tier loading

```
Tier 1 (always loaded by SessionStart)
  ├── .claude/CLAUDE.md                   # generic behavioral config
  ├── AGENTS.md                           # generic agent rules + execution best practices
  └── ${overlay}/CLAUDE-overlay.md        # project identity + cardinal rules + routing

Tier 2 (loaded on demand by /prime + routing matrix)
  └── .claude/rules/<domain>.md           # backend / database / frontend / integrations / stability / DESIGN
       ↑ resolves overlay-first via _shared.md § 0:
         if ${overlay}/rules/<domain>.md exists → read THAT (concrete project authority)
         else → fall back to .claude/rules/<domain>.md (generic scaffold)

Tier 3 (read only when justified)
  ├── docs/                               # product specs, design canon, implementation plans
  ├── ${overlay}/anti-patterns.md         # project bug catalog
  ├── ${overlay}/routing-supplements.md   # extra routing rows
  ├── ${overlay}/verify-supplements.md    # project smoke tests
  ├── ${overlay}/layer-map.md             # project layer stack (planning skill)
  ├── ${overlay}/seo-supplement.md        # project SEO/locale
  ├── ${overlay}/debugger-domain-rules.md # extended bug patterns
  └── ${overlay}/project-snapshot.md      # architecture map, commands, data model
```

**Golden rule:** never load both generic + overlay versions of a rule. Pick one. Overlay wins when present.

---

## Slash commands (positional args)

```
/plan [task description]               # classify + research + produce plan
/prime [auto|backend|frontend|fullstack]   # load minimum-viable context
/research [question]                   # parallel codebase + external research
/design [task]                         # 4-phase UI design workflow
/implement [plan-path-or-context]      # execute plan with skill routing + agent assignment
/debug [audit|frontend|backend|auth-db|recover]  # unified debug; default = triage + fix
/perf [build|db]                       # default = runtime PSI; build/db modes for targeted optimization
/verify [quick|spec-only|paranoid]     # post-impl gate; default = full 10-phase pipeline
/evolve [auto|handoff]                 # capture learnings; auto = AutoResearch loop; handoff = session state
```

All commands read `.claude/config.json` at start. Project-specific values resolve from `${...}` placeholders documented in `commands/_shared.md § 0`.

---

## Skills

Process skills (load first): `planning`, `debugger`, `evolution-core`.
Domain skills: `supabase`, `supabase-postgres-best-practices`, `performance-optimization`, `senior-prompt-engineer`.
Implementation skills (load last): `ui-ux-pro-max`, `frontend-design`, `xlsx`, `skill-creator`.

Invocation: `Skill("<name>")` — never `Read` skill files directly.

Skill-to-domain matrix in `commands/_shared.md § 6`.

Two skills (`supabase`, `supabase-postgres-best-practices`) are MIT-licensed upstream from [supabase/agent-skills](https://github.com/supabase/agent-skills). See `skills/supabase/UPSTREAM.md` and `skills/supabase-postgres-best-practices/UPSTREAM.md` for sync metadata + procedure.

---

## Hooks (auto-running)

| Event | Hook | What it does |
|---|---|---|
| SessionStart | `session_context.py` | Loads `AGENTS.md` + `${overlay}/CLAUDE-overlay.md` into context |
| PreToolUse (Bash) | `smart_bash_approver.py` | Auto-approves safe commands; blocks destructive ones |
| PreToolUse (Edit\|Write) | `protect_files.py` | Blocks edits to `.env*`, lockfiles, `.git/`, project-specific paths from overlay |
| PreToolUse (Agent) | `task_routing_guard.py` | Validates subagent name + enforces background flags |
| PostToolUse (Edit\|Write) | `ultracite_fix.py` | Runs project formatter/linter after edits |
| Stop | `ultracite_check.py` + `background_cleanup.py` | Final lint check + log stop event |
| SubagentStart | `subagent_start.py` | Injects context for spawned subagents |
| SubagentStop | `subagent_log.py` + `evaluator_escalation.py` | Logs subagent events; tracks failure escalation |
| Notification | `notify.py` | Desktop notifications (WSL/Linux/macOS) |

Hooks read `.claude/config.json` at runtime — no per-project edits needed.

---

## Installation in a new project (AI instructions)

> When asked to install this framework in another project, follow these steps in order. **Never skip a step. Never assume — verify each.**

### Step 1 — Copy the framework

```bash
# From the source project (this repo) to the target
TARGET=/path/to/target-project
cp -r .claude/CLAUDE.md           $TARGET/.claude/
cp -r .claude/commands            $TARGET/.claude/
cp -r .claude/templates           $TARGET/.claude/
cp -r .claude/rules               $TARGET/.claude/
cp -r .claude/skills              $TARGET/.claude/
cp -r .claude/agents              $TARGET/.claude/
cp -r .claude/hooks               $TARGET/.claude/
cp -r .claude/scripts             $TARGET/.claude/
cp .claude/settings.json          $TARGET/.claude/
cp .claude/config.json            $TARGET/.claude/
cp .claude/README.md              $TARGET/.claude/
cp AGENTS.md                       $TARGET/

# DO NOT copy:
#   - .claude/overlay/             (project-specific — you'll create your own)
#   - .claude/settings.local.json  (per-machine)
#   - .claude/logs/ + agent-memory/ (runtime data)
```

### Step 2 — Configure `.claude/config.json`

Open `.claude/config.json` and edit:

```jsonc
{
  "project": {
    "name": "<your-project-slug>",            // lowercase, kebab-case
    "displayName": "<Your Project Name>",
    "stack": "<short stack tag>",             // e.g. "next-js-supabase", "django-react"
    "stagingUrl": "<https://staging.url>",    // or "http://localhost:3000" if no staging
    "productionUrl": "<https://prod.url>",
    "locale": "<bcp47>"                       // e.g. "en-US", "pt-BR", "fr-FR"
  },
  "paths": {
    "backendRoot": "<src/api or apps/api/src or server/>",
    "frontendRoot": "<src or apps/web/src>",
    "schemaRoot": "<supabase/migrations or prisma/schema.prisma or db/schema/>",
    "stylesRoot": "<src/styles or app/styles>",
    "componentsRoot": "<src/components>",
    "libRoot": "<src/lib>"
  },
  "tooling": {
    "packageManager": "<bun|npm|pnpm|yarn>",
    "buildTool": "<vite|webpack|next|astro|nuxt|esbuild|...>",
    "typeChecker": "<tsc|tsgo|astro-check>",
    "linter": "<biome|eslint|oxlint>",
    "testRunner": "<vitest|jest|playwright|>",          // empty if none
    "deployer": "<vercel|fly|railway|netlify|coolify>",
    "frontendFramework": "<react|vue|svelte|astro+islands|...>",
    "database": "<postgres|mysql|sqlite|>",
    "orm": "<drizzle|prisma|kysely|supabase-js|sqlalchemy|>"
  },
  "gates": {
    "lighthouse": { "performance": 90, "accessibility": 90, "bestPractices": 90, "seo": 90 },
    "lcp": 2500,
    "cls": 0.1,
    "inp": 200,
    "initialJsKb": 100
  },
  "overlay": ".claude/overlay/<your-project-slug>"
}
```

**Verification:** confirm placeholders resolve correctly:
```bash
python -c "import json; cfg = json.load(open('.claude/config.json')); print(cfg['project'], cfg['paths'], cfg['overlay'])"
```

### Step 3 — Create project overlay

```bash
mkdir -p $TARGET/.claude/overlay/<your-project-slug>/rules
```

Required files:

```
.claude/overlay/<your-project-slug>/
├── README.md                      # what's in the overlay (mirror the source overlay's README)
├── CLAUDE-overlay.md              # Tier 1 supplement — project identity + cardinal rules + routing
└── rules/
    ├── backend.md                 # concrete backend rules for this stack
    ├── database.md                # concrete schema/RLS/migration rules
    ├── frontend.md                # concrete component/styling/render-mode rules
    ├── integrations.md            # concrete provider rules (payment/email/monitoring)
    ├── stability.md               # universal A-L extended with project gates
    └── DESIGN.md                  # concrete design tokens + brand
```

Optional files (create only when needed):

```
.claude/overlay/<your-project-slug>/
├── anti-patterns.md               # project bug catalog (loaded by /debug + debugger skill)
├── routing-supplements.md         # extra routing matrix rows
├── verify-supplements.md          # project-specific smoke tests
├── layer-map.md                   # project layer stack (loaded by planning skill)
├── seo-supplement.md              # project SEO/locale (loaded by performance-optimization)
├── debugger-domain-rules.md       # extended bug patterns
├── protected-files.json           # extra protected paths for protect_files.py
└── project-snapshot.md            # architecture map + commands + data model (orientation reference)
```

**Bootstrap each file** by copying the corresponding generic template from `.claude/rules/` and rewriting placeholders with concrete project values. Never copy from another project's overlay — always start from the generic template.

### Step 4 — Write `AGENTS.md` (root, not in `.claude/`)

`AGENTS.md` lives at project root. It's auto-loaded by `session_context.py` hook. The framework ships a generic version — if your project needs project-specific cardinal rules to be auto-loaded on every session, those go in `${overlay}/CLAUDE-overlay.md` instead (also auto-loaded by the hook).

The default generic `AGENTS.md` works for any project. Edit only if your project has cross-cutting rules that don't fit any other layer.

### Step 5 — Verify the install

```bash
cd $TARGET

# 1. Hook smoke-test
echo '{"source":"startup"}' | python .claude/hooks/session_context.py | python -m json.tool
# Expected: JSON with "additionalContext" containing AGENTS.md content + (if overlay exists) CLAUDE-overlay.md

# 2. Permission test
echo '{"tool_input":{"command":"npm test"}}' | python .claude/hooks/smart_bash_approver.py
# Expected: {"hookSpecificOutput":{"permissionDecision":"allow"}}

# 3. Protected files test
echo '{"tool_input":{"file_path":".env"}}' | python .claude/hooks/protect_files.py
# Expected: {"hookSpecificOutput":{"permissionDecision":"deny"}}

# 4. Rule resolution
python <<'PY'
import json, os
cfg = json.load(open('.claude/config.json'))
overlay = cfg['overlay']
for r in ['backend', 'database', 'frontend', 'integrations', 'stability', 'DESIGN']:
    overlay_path = f"{overlay}/rules/{r}.md"
    src = "overlay" if os.path.isfile(overlay_path) else "generic-fallback"
    print(f"{r}.md → {src}")
PY
# Expected: all 6 → "overlay" (after Step 3)
```

### Step 6 — Optional: install Supabase upstream skills

If your project uses Supabase, the framework already ships `skills/supabase/` and `skills/supabase-postgres-best-practices/` in sync with the official repo. To re-sync later:

```bash
# See skills/supabase/UPSTREAM.md and skills/supabase-postgres-best-practices/UPSTREAM.md
# for sync procedure (curl + diff + apply).
```

If your project does NOT use Supabase: leave the skills in place — they're inert when not invoked.

### Step 7 — Test commands

Open Claude Code in the target project and try:

```
/prime
/plan add a user settings page
/debug
```

If commands resolve correctly and skills load on demand, install is complete.

---

## How rules resolution works (the overlay pattern)

The framework ships **generic rule scaffolds** in `.claude/rules/`. Your project ships **concrete rule authority** in `.claude/overlay/<project>/rules/`.

When any command, skill, or agent says "read `.claude/rules/backend.md`", the harness resolves overlay-first:

```bash
# Pseudo-code from commands/_shared.md § 0
RULE=backend.md
OVERLAY=$(jq -r .overlay .claude/config.json)

if [ -f "$OVERLAY/rules/$RULE" ]; then
  cat "$OVERLAY/rules/$RULE"          # concrete project authority
else
  cat ".claude/rules/$RULE"           # generic scaffold (fallback)
fi
```

**Why two layers exist:**
- Generic scaffolds keep the framework reusable across projects (Astro, Next.js, Django, Rails, etc.)
- Overlay carries the concrete stack rules (Astro hybrid + Supabase RLS + Pix idempotency, etc.)

**Never edit the generic scaffolds for project-specific content.** Always create / edit the overlay version.

---

## Customization checklist

When forking this framework into a new project:

- [ ] `.claude/config.json` — `project.*`, `paths.*`, `tooling.*`, `gates.*`, `overlay`
- [ ] `.claude/overlay/<project>/CLAUDE-overlay.md` — project identity + cardinal rules
- [ ] `.claude/overlay/<project>/rules/*.md` — 6 concrete domain rule files
- [ ] (Optional) `.claude/overlay/<project>/{anti-patterns,routing-supplements,verify-supplements,layer-map,seo-supplement,debugger-domain-rules,project-snapshot}.md`
- [ ] (Optional) `.claude/overlay/<project>/protected-files.json` — extra protected paths
- [ ] `AGENTS.md` (root) — usually leave generic; edit only for cross-cutting project rules

---

## Maintenance

### Upstream sync (Supabase skills)

```bash
# In the target project, periodically:
cat .claude/skills/supabase/UPSTREAM.md
cat .claude/skills/supabase-postgres-best-practices/UPSTREAM.md
# Follow the procedure in each file (curl latest from GitHub, diff, apply).
```

### Adding a new skill

```bash
# Use the skill-creator skill in Claude Code:
/implement create a new skill for <topic>
# Or manually: copy skills/skill-creator/templates/ as starting point.
```

### Adding a new command

Don't. Edit the existing 10 commands or extract a template into `.claude/templates/` instead. Adding commands fragments the agent UX.

### Updating rules

Project-specific rules → edit `.claude/overlay/<project>/rules/`.
Generic templates → edit `.claude/rules/` only when the change applies to **every** project (rare).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Hook fails on SessionStart | `python .claude/hooks/session_context.py < /dev/null` to see traceback |
| Agent reads generic rule when overlay should win | Verify `.claude/config.json::overlay` path exists; verify `${overlay}/rules/<file>.md` exists |
| `protect_files.py` blocking legitimate edits | Add path to `${overlay}/protected-files.json` exclusions OR remove from project-specific list |
| Commands not appearing in Claude Code | `/hooks` command — verify `.claude/settings.json` is well-formed JSON |
| Skill fails to invoke | Read `skills/<skill>/SKILL.md` frontmatter — confirm trigger phrases match user request |

---

## Compatibility

- **Claude Code (CLI)** — primary target. Hooks + commands + skills all work natively.
- **GitHub Copilot, Cursor, Cline, Aider, etc.** — `AGENTS.md` is read by most agent-aware tools. Generic CLAUDE.md / commands / rules also serve as documentation.
- **Cross-platform** — all hooks are Python 3 (no shell scripts). Works on Windows / macOS / Linux without changes.

---

## Origin

This framework was extracted from a real-world Astro+Supabase project (Missão Amazônica · Sal da Terra) and refactored to be project-agnostic via the overlay pattern. Project-specific content lives in `.claude/overlay/missao-amazonica/` as a reference example of how a complete overlay looks.

To remove the example overlay: `rm -rf .claude/overlay/missao-amazonica` and update `.claude/config.json::overlay` to your own.

---

## Pointers

- `.claude/CLAUDE.md` — generic Tier 1 behavioral config
- `AGENTS.md` (root) — generic agent rules + execution best practices
- `.claude/commands/_shared.md` — canonical patterns: gates, agents, skill-routing, rule-resolution, verdict matrix
- `.claude/rules/README.md` — explains the rules-templates pattern
- `.claude/overlay/<project>/README.md` — per-project file inventory
- `.claude/skills/<skill>/SKILL.md` — each skill's invocation contract + reference docs
