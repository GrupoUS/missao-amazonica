# ADR-016: shadcn/ui + Tailwind CSS v4 for UI Components

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

The NeonDash frontend needs a UI component library for building a complex dashboard with 44+ routes, data tables, Kanban boards, charts, and forms. Options considered: (A) Material UI (npm package, styled), (B) Chakra UI (runtime CSS-in-JS), (C) Custom component library, (D) shadcn/ui (copy-paste primitives) + Tailwind CSS.

Key requirements: no runtime CSS overhead, customizable semantic color tokens (GPUS palette for dark/light mode), accessibility, and full ownership of component code.

## Decision

Use shadcn/ui for component primitives (copy-paste into `apps/web/src/components/ui/`, 86 components owned) combined with Tailwind CSS v4 for utility styling. Custom color utilities defined via `@utility` in `apps/web/src/index.css`. Semantic tokens follow the GPUS (Gold-Petroleo-Ultra-Slate) palette defined in CSS variables.

## Consequences

**Positive:**
- Full ownership of component code — no npm upgrade breaking changes
- Semantic color tokens enable dark/light mode with a single variable swap
- Tailwind v4 `@utility` directive allows custom tokens without JS config
- shadcn/ui's Radix UI primitives provide accessible behavior for free

**Negative / Trade-offs:**
- 86 owned components in `components/ui/` require manual updates when shadcn releases improvements
- Tailwind v4 is newer — some community patterns are still v3-based
- Custom GPUS palette means design tokens must be maintained in sync with CSS variables

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Material UI | Mature, complete, large community | Opinionated styling, MUI theme system conflicts with GPUS, runtime CSS overhead | Rejected: design inflexibility |
| B — Chakra UI | Good DX, accessible | Runtime CSS-in-JS performance cost, theming model conflicts with Tailwind | Rejected: runtime overhead |
| C — Custom component library | Full control | Enormous upfront investment, no accessibility primitives | Rejected: too slow to build |
| D — shadcn/ui + Tailwind v4 | Owned code, semantic tokens, accessible primitives, zero runtime CSS | Manual maintenance of 86 components | **Chosen** |

## Related ADRs

- [ADR-015](015-tanstack-router.md) — Route pages are built with these UI components
