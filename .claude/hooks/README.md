# Claude Code Hooks - NeonDash

## Visão Geral

Este projeto usa hooks Claude Code para aumentar autonomia de agentes enquanto mantém guardrails de segurança.
Todos os hooks são **Python 3** (`.py`) — shell scripts são proibidos neste projeto.

## Kilo CLI

- O Kilo CLI atual nao le a chave `hooks` do `kilo.json`; o schema oficial e o `kilo debug config` resolvido nao expunham hooks nativos.
- A ativacao no Kilo agora acontece via plugin de projeto em `.kilo/kilo.json` apontando para `.kilo/plugins/claude-hooks.mjs`.
- Esse plugin usa apenas pontos viaveis do Kilo hoje: `experimental.chat.system.transform`, `tool.execute.before`, `tool.execute.after`, `shell.env` e `event`.
- No Kilo eu nao repliquei conceitos sem equivalente real, como status line ou hooks Claude-especificos sem callback publico.
- Os subagentes Kilo referenciados pelos workflows agora existem em `.kilo/agent/` e podem ser chamados diretamente pelo `task` tool: `debugger`, `frontend-specialist`, `project-planner`, `performance-optimizer`, `mobile-developer`, `explorer`, alem de `explore`, `librarian` e `evaluator`.
- O bridge injeta contexto especifico para esses subagentes no `task` tool e bloqueia nomes que nao existem na configuracao local do Kilo.
- O bridge do Kilo tambem executa `task_routing_guard.py` antes de cada `task`; hoje ele valida o subagente e so cobra `run_in_background` quando o runtime realmente expor esse campo.
- Evidencias de execucao do bridge ficam em `.claude/logs/kilo-hooks-plugin.jsonl`, `.claude/logs/kilo-hooks-events.jsonl` e `.claude/logs/kilo-subagent-events.jsonl`.

## Hooks Configurados

### SessionStart

- **session_context.py**: Carrega `AGENTS.md` via `additionalContext` (padrão universal cross-platform) + contexto do projeto (branch, gates)

### PreToolUse

- **smart_bash_approver.py**: Auto-aprova comandos seguros, bloqueia perigosos
- **protect_files.py**: Bloqueia modificação de arquivos sensíveis
- **task_routing_guard.py**: Bloqueia subagent inválido e reforça Task com roteamento correto

### PermissionRequest

- Auto-aprova Read/Grep/Glob/Bash/Edit/Write tools

### PostToolUse

- **ultracite_fix.py**: Formata (Biome) + lint fix (OXLint) após edição

### Stop

- **ultracite_check.py**: Verifica lint (OXLint) antes de parar — bloqueia em erros
- **background_cleanup.py**: Registra evento de parada para observabilidade

### SubagentStart

- **subagent_start.py**: Injeta contexto quando subagentes iniciam

### SubagentStop

- **subagent_log.py**: Log de eventos de subagentes para observabilidade
- **evaluator_escalation.py**: Sinaliza escalonamento para evaluator (Mode 3) em falhas repetidas

### TaskCompleted

- **task_completed.py**: Log de conclusão de tasks em equipes

### TeammateIdle

- Auto-aprova idle (evita notificações desnecessárias)

### Notification

- **notify.py**: Notificações desktop (WSL/Linux/macOS)

---

## Comandos Seguros (Auto-aprovados)

```bash
# Git
git status, git diff, git log, git branch, git fetch

# File system
ls, cat, head, tail, grep, find, which, pwd, echo

# Bun/Node
bun test, bun run check, bun run lint, bun install, bun x, bun run build
npm test, npm run lint, npm run build
bunx oxlint, bunx biome, bunx ultracite

# Version checks
python3 --version, node --version, bun --version
```

---

## Comandos Bloqueados (Sempre)

```bash
# Destructive
rm -rf /, rm -rf ~, rm -rf *, rm -rf $HOME

# Database
DROP DATABASE, DROP TABLE, TRUNCATE

# Git dangerous
git push --force main, git push --force master, git reset --hard HEAD~

# System
chmod -R 777 /, dd if=... of=/dev/, :(){ :|:& };:
sudo rm, truncate -s 0
```

---

## Arquivos Protegidos

Estes arquivos não podem ser editados via hooks:

| Pattern                              | Razão           |
| ------------------------------------ | --------------- |
| `.env*`                              | Credenciais     |
| `credentials`, `secrets`, `api-keys` | Dados sensíveis |
| `.git/`                              | Repositório     |
| `package-lock.json`, `bun.lockb`     | Lockfiles       |

---

## Testando Hooks

```bash
# Testar aprovação de comando seguro
echo '{"tool_input":{"command":"bun test"}}' | python3 .claude/hooks/smart_bash_approver.py
# Expected: {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}

# Testar bloqueio de comando perigoso
echo '{"tool_input":{"command":"rm -rf /"}}' | python3 .claude/hooks/smart_bash_approver.py
# Expected: {"hookSpecificOutput":{"...permissionDecision":"deny"...}}

# Testar proteção de arquivo
echo '{"tool_input":{"file_path":"./.env"}}' | python3 .claude/hooks/protect_files.py
# Expected: {"hookSpecificOutput":{"...permissionDecision":"deny"...}}
```

---

## Logs

Eventos de subagentes são logados em:

```
.claude/logs/subagent-events.jsonl
```

Formato:

```json
{
  "timestamp": "2025-02-17T12:00:00Z",
  "agent": "debugger",
  "status": "completed",
  "duration_ms": "5000"
}
```

---

## Debug

```bash
# Ver hooks ativos no Claude Code
/hooks

# Debug mode (ver execução de hooks)
claude --debug

# Verbose mode (output de hooks no transcript)
Ctrl+O
```

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                      HOOK FLOW                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  SessionStart ───► session_context.py ──► AGENTS.md + contexto │
│                                                                │
│  PreToolUse ─────► smart_bash_approver.py (Bash)              │
│               ├──► protect_files.py (Edit|Write)              │
│               └──► task_routing_guard.py (Agent)              │
│                        │                                       │
│                        ▼                                       │
│               ┌─────────────────┐                              │
│               │ ALLOW / DENY /  │                              │
│               │     ASK         │                              │
│               └─────────────────┘                              │
│                                                                │
│  PermissionRequest ──► Auto-approve read/write tools          │
│                                                                │
│  PostToolUse ────► ultracite_fix.py (biome + oxlint fix)      │
│                                                                │
│  SubagentStart ──► subagent_start.py (context injection)      │
│  SubagentStop ───► evaluator_escalation.py + subagent_log.py  │
│                                                                │
│  TaskCompleted ──► task_completed.py (team event log)         │
│                                                                │
│  Stop ───────────► ultracite_check.py + background_cleanup.py │
│                                                                │
│  Notification ───► notify.py (desktop toast)                  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Rollback

Se hooks causarem problemas:

```bash
# Quick disable: remover "hooks" section do settings.json

# Full rollback:
git checkout .claude/settings.json
rm .claude/hooks/*.py
rm -rf .claude/logs
```

---

## Impacto

| Métrica                       | Antes   | Depois         |
| ----------------------------- | ------- | -------------- |
| Aprovações manuais/dia        | ~50     | ~10            |
| Tempo em permissões           | ~15min  | ~3min          |
| Risco de comandos perigosos   | Médio   | Baixo          |
| Observabilidade de subagentes | Nenhuma | Logs completos |
