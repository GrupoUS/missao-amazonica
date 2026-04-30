---
name: evolution-core
description: Use when starting sessions to load historical context, or after fixing errors to capture learnings for future reference. Provides persistent SQLite-based memory across sessions.
---

# Evolution Core

Sistema minimalista de memória persistente.

## Como Funciona

**Hooks Python** (em `.claude/hooks/`) capturam eventos automaticamente:
- `session_context.py` → Carrega contexto histórico no SessionStart
- `task_completed.py` → Registra conclusões em PostToolUse
- `subagent_log.py` → Log de sub-agentes em Stop

> Todos os hooks são `.py` — shell scripts (`.sh`) são **proibidos** neste projeto.

**CLI** (`memory_manager.py`) para queries manuais com SQLite.

## Arquivos Gerados

```
.claude/docs/evolution/
├── errors.jsonl     # Erros capturados pelos hooks
├── sessions.jsonl   # Logs de sessão
└── memory.db        # Banco SQLite (via CLI)
```

## CLI Commands

```bash
# Inicializar banco
python .claude/skills/evolution-core/scripts/memory_manager.py init

# Gerenciar sessões
python .claude/skills/evolution-core/scripts/memory_manager.py session start -t "task"
python .claude/skills/evolution-core/scripts/memory_manager.py capture "observation"
python .claude/skills/evolution-core/scripts/memory_manager.py session end -s "summary"

# Carregar contexto
python .claude/skills/evolution-core/scripts/memory_manager.py load_context --project "$PWD"

# Estatísticas
python .claude/skills/evolution-core/scripts/memory_manager.py stats
```

---

## Captura de Aprendizados (/evolve)

### Template de Captura

```bash
# O CLI já suporta captura de observações
python .claude/skills/evolution-core/scripts/memory_manager.py capture \
  "Problema: [descrição] | Root: [causa] | Fix: [solução]" \
  -t bug_fix
```

### Funções Disponíveis

| Comando | Descrição |
|---------|-----------|
| `capture "desc" -t "tool"` | Captura observação |
| `session start -t "task"` | Inicia sessão |
| `session end -s "summary"` | Finaliza sessão |
| `load_context --project PATH` | Carrega contexto histórico |
| `stats` | Estatísticas do banco |

### Integração com /evolve

O comando `/evolve` usa este CLI para:
1. Persistir aprendizados automaticamente
2. Sugerir aprimoramentos em skills
3. Atualizar AGENTS.md das subpastas
