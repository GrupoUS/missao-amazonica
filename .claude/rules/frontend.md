---
globs: apps/web/**
---

# Frontend Rules (Tier 2 — Auto-loaded)

> Canonical implementation authority when editing frontend code: `apps/web/src/AGENTS.md`
> Design foundations and feature references: `.claude/docs/design-specs/`

## Purpose

This file stays intentionally **slim**. It should provide the minimum operational guardrails needed during auto-load, then point to deeper references only when the task requires them.

Load deeper docs **on demand**, not by default.

---

## Load Strategy

### Always use this file for
- React/frontend implementation in `apps/web/**`
- component edits
- styling changes
- route/page updates
- client-side performance fixes

### Also load these references only when needed

| Need | Load |
|------|------|
| Visual language, layout, GPUS tokens, anti-generic direction | `.claude/docs/design-specs/00-design-system-foundation.md` |
| Extend-vs-create decision, doc/component structure strategy | `.claude/docs/design-specs/00-lever-philosophy.md` |
| Historical frontend bug patterns, rerender/perf pitfalls | `.claude/docs/design-specs/00-frontend-learnings.md` |
| Global app shell, sidebar, page container, navigation rules | `.claude/docs/design-specs/global-layout-navigation.md` |
| Feature-specific UI behavior | relevant file under `.claude/docs/design-specs/` |

---

## Component Placement

- `components/ui/` → shadcn/ui primitives only
- `components/[feature]/` → feature-specific components
- Do not place custom product composites in `components/ui/`

---

## Styling and Tokens

- Use semantic tokens such as `bg-primary`, `text-foreground`, `border-border`
- Use approved custom utilities only when semantic tokens are insufficient
- Never hardcode hex values in component code
- Prefer tonal separation and spacing before extra borders/shadows

For full visual guidance, load:
- `.claude/docs/design-specs/00-design-system-foundation.md`

---

## React 19 Rules

- Function components only
- Hooks at top level only
- Use `ref` as prop instead of `React.forwardRef`
- Ref callbacks should return cleanup functions when needed
- Use `<Context value={...}>` directly
- Use `use()` only for reading promises/context, never to create promises in render
- Prefer localized Suspense boundaries, not one giant boundary

---

## Frontend Performance Rules

- `staleTime` must equal `refetchInterval` for polling queries
- `gcTime` must be greater than or equal to `staleTime`
- Use `skipToken` for conditional queries
- Memoize hot-path list items with `React.memo`
- Stabilize callbacks passed to memoized children
- Hoist static arrays, objects, `Intl` instances, and regexes to module scope
- Never create expensive objects in render paths
- Use `useTransition` for non-urgent UI updates
- Prefer `Set`/`Map` over repeated `.find()`/`.includes()` in hot paths
- Use immutable array methods instead of in-place mutation
- Avoid nested scroll containers unless the layout pattern explicitly requires them

For historical pitfalls and concrete examples, load:
- `.claude/docs/design-specs/00-frontend-learnings.md`

---

## Layout Rules

Use the standard application structure unless the feature explicitly requires a different contained-scroll pattern:

`DashboardLayout → Scroll owner → PageContainer → Content`

- Prefer one main scroll owner per page
- Keep page hierarchy obvious
- Preserve responsive spacing rhythm
- Avoid generic template-like layouts

For full layout/navigation guidance, load:
- `.claude/docs/design-specs/global-layout-navigation.md`

---

## Stability Rules (Frontend-specific)

- Always wrap `mutateAsync` in `try/catch` with user-facing error handling
- Never use `href="#"`; use `<button>` for actions
- Error boundaries must not expose stack traces in production

Also follow shared stability rules from:
- `.claude/rules/stability.md`

---

## Decision Heuristic

Before adding a new component or pattern:

1. Check whether an existing component/pattern can be extended
2. Prefer extending existing structure over creating a parallel one
3. Load deeper design references only if the task truly needs them

For the full decision framework, load:
- `.claude/docs/design-specs/00-lever-philosophy.md`

---

## Summary

This file is the frontend **guardrail layer**:
- short
- operational
- auto-load friendly

Deep detail lives in:
- `apps/web/src/AGENTS.md`
- `.claude/docs/design-specs/00-design-system-foundation.md`
- `.claude/docs/design-specs/00-lever-philosophy.md`
- `.claude/docs/design-specs/00-frontend-learnings.md`
- `.claude/docs/design-specs/global-layout-navigation.md`
