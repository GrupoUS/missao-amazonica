# Risk — Risco e Decisões (L6+)

**Quando usar:** L6+ tasks, architecture decisions
**Quando skip:** L1-L5 (a menos que breaking changes/security)

---

## Pre-Mortem (Análise de Risco)

### 1. Assumir Falha

> "2 dias depois. O feature quebrou. O que aconteceu?"

Categorias:
- **Technical** — code logic, null checks, race conditions
- **Integration** — webhooks, API contracts
- **Data** — migrations, FK, indexes
- **Performance** — N+1, full table scans
- **Human** — requisitos mal entendidos

### 2. Ranking

```
Score = Probabilidade (1-3) × Impacto (1-3)
```

| Score | Ação |
|-------|------|
| 7-9 | **BLOCK** — Mitigar antes |
| 4-6 | **MITIGATE** — Adicionar safeguards |
| 1-3 | **ACCEPT** — Monitorar |

### 3. Embed no Plano

```markdown
## Risk

| # | Risk | Score | Mitigation |
|---|------|-------|------------|
| 1 | FK cascade | 6 | Soft-delete instead |
```

---

## Falhas Comuns do Stack

| Layer | Falha | Prevenção |
|-------|-------|-----------|
| Drizzle | Missing index FK | Sempre add index |
| tRPC | Zod drift | Derivar de Drizzle |
| Clerk | Webhook signature | Verificar secret |
| Neon | Cold start | Connection pooling |
| Stripe | Missing events | Idempotent handler |

---

## ADR (Architecture Decision Records)

**Quando:** L6+ com múltiplas abordagens válidas
**Skip:** L1-L5, ou quando só existe uma abordagem

### Formato (≤15 linhas)

```markdown
### ADR: [Título]

**Context:** [Problema e por que precisa decidir]

**Options:** A) [Opção] / B) [Opção]

**Decision:** [X] because [razão]

**Consequences:** [Consequência], [Trade-off]
```

### Exemplo

```markdown
### ADR: Router para novos endpoints

**Context:** 8 novos endpoints. Projeto migra Express → Hono.

**Options:** A) Express / B) Hono

**Decision:** Hono because alinhado com plano de migração.

**Consequences:** Melhora performance, team aprende Hono.
```

### Integração no Plano

```markdown
## Research
...

## Architecture Decisions
### ADR: [Title]
...

## Tasks
```

---

## Checklist

- [ ] 5+ failure modes brainstormed
- [ ] Top 3 risks com mitigação
- [ ] Score ≥ 7 tem rollback
- [ ] Stack failures checkados
- [ ] ADR para decisões arquiteturais (L6+)
