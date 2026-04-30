# GPUS Design System Foundation

> Canonical design foundation for NeonDash design specifications.
> Use this document when a task touches UI architecture, visual language, component styling, layout behavior, or “extend vs create” decisions for frontend surfaces.

## Purpose

This document consolidates the design foundations that were previously scattered across root-level reference notes. It exists to support **selective context loading**:

- Load this file for **UI creation**, **layout redesign**, **component refinement**, or **design review**
- Do **not** load it for backend-only, schema-only, or infra-only work
- Use it together with feature-specific specs in `design-specs/` when implementing a concrete page or workflow

---

## 1. Brand Identity

NeonDash follows the **GPUS** visual identity:

- **Positioning:** premium, professional, educational, operational
- **Emotional tone:** calm authority, structure, clarity, confidence
- **Visual character:** minimal, intentional, non-generic, high-signal
- **Primary brand colors:** Azul Petróleo + Gold

### Core Principle

**GPUS tokens are immutable.**
Layout and composition may evolve, but color identity must remain anchored to the GPUS palette and semantic tokens.

---

## 2. Design Philosophy

### Intentional Minimalism

The UI should feel curated, not assembled.

- Every element must justify its existence
- Whitespace is a structural tool, not empty space
- Typography should guide reading flow and hierarchy
- Avoid decorative noise, visual filler, and trend-driven styling
- If an element has no functional, communicative, or spatial role, remove it

### Anti-Generic Standard

If a surface looks like a default template, it is wrong.

Use this **Template Test** before finalizing any UI:

1. Could this be mistaken for a generic SaaS template?
2. Does it feel interchangeable with any dashboard on the internet?
3. Does the layout rely on convenience patterns instead of product intent?
4. Is the visual hierarchy obvious because of structure, not because of extra borders and effects?

If the answer is “yes” to any of the first three, redesign it.

---

## 3. GPUS Quick Palette

Always prefer semantic tokens in implementation. Raw values are documented here only for reference and validation.

| Token | Light | Dark | Usage |
|------|------|------|------|
| `--primary` | `38 60% 45%` | `43 96% 56%` | Primary actions, accents, focus |
| `--foreground` | `203 65% 26%` | `210 40% 98%` | Primary text |
| `--background` | `210 40% 98%` | `222 47% 6%` | App/page background |
| `--secondary` | warm supportive surface | dark muted panel | Secondary containers |
| `--muted` | subtle soft background | low-contrast panel | Quiet UI zones |
| `--border` | light slate border | dark slate border | Separation when truly needed |

### Color Rules

- Use semantic tokens such as `bg-primary`, `text-foreground`, `bg-secondary`, `border-border`
- Use approved custom utilities like `text-neon-petroleo` only when the semantic layer is insufficient
- Never hardcode hex values inside component code
- Never introduce ad-hoc one-off colors for a single feature
- Sidebar-specific surfaces must use sidebar token families when applicable

---

## 4. Layout Foundation

### Canonical Application Layout

```text
DashboardLayout → ScrollArea (single) → PageContainer → Content
```

This is the baseline structure for most authenticated product surfaces.

### Layout Rules

- One main scroll owner per page by default
- Prefer stable page containers over nested scrolling wrappers
- Use asymmetry intentionally; avoid rigid equal-width compositions
- Use spacing and tonal changes before borders and shadows
- Preserve clear entry points, content rhythm, and scanning flow

### Common Page Patterns

| Pattern | Grid | Typical Usage |
|--------|------|---------------|
| KPI cards | `grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6` | Dashboards |
| Settings | `grid-cols-1 lg:grid-cols-2 gap-6` | Config pages |
| Kanban | horizontal flow + controlled scroll | CRM |
| Tabbed content | tabs + single-flow body | Patient and multi-module pages |

---

## 5. Typography Foundation

Typography carries information architecture, not just styling.

### Recommended Role Distribution

- **Primary UI / headings / body:** system project stack for app consistency
- **Technical or metadata text:** `Fira Code` when scannability benefits from mono alignment
- **Dense operational text:** keep legible, compact, and restrained
- **Large headings:** use sparingly; hierarchy should feel earned

### Typography Rules

- Headings must clarify structure, not decorate the page
- Metadata should be visually quieter than primary content
- Avoid oversized type that creates false importance
- Avoid too many font sizes in one surface
- Prefer strong spacing rhythm over exaggerated font contrast

---

## 6. Component Composition Rules

### General Principles

- Extend an existing pattern before creating a new one
- Prefer familiar internal component primitives over bespoke rewrites
- Keep component responsibilities narrow and legible
- Use composition and state isolation to avoid re-render cascades
- Favor stable props and module-level constants for static configuration

### Placement Guidance

- `components/ui/` is for primitives only
- Feature-specific behaviors belong in feature directories
- Do not place custom product composites in primitive libraries
- If a new component is not broadly reusable, keep it close to the feature

---

## 7. Extend vs Create — LEVER Lens

Use the LEVER philosophy before introducing new UI structures.

### LEVER

- **L**everage patterns
- **E**xtend first
- **V**erify reactivity
- **E**liminate duplication
- **R**educe complexity

### Decision Tree

```text
Before coding:
├── Can existing code handle it? → Yes: EXTEND
├── Can we modify existing patterns? → Yes: ADAPT
└── Is new code reusable? → Yes: ABSTRACT → No: RECONSIDER
```

### Scoring Heuristic

| Factor | Points |
|--------|--------|
| Reuse existing data structure | +3 |
| Reuse existing interaction pattern | +3 |
| Reuse >70% of existing implementation | +5 |
| Introduces circular coupling | -5 |
| Truly distinct domain need | -3 |

**Score > 5:** extend the existing structure.

### Three-Pass UI Delivery

1. **Discovery** — find similar components and page patterns
2. **Design** — define structure, state, and visual hierarchy
3. **Implementation** — ship the smallest complete solution with maximal reuse

---

## 8. Frontend Performance Constraints for Design Work

Design decisions must respect rendering cost.

### Non-Negotiable Patterns

- Hoist static arrays, objects, formatters, and regexes to module scope
- Do not create expensive objects inside render paths
- Use `React.memo` for virtualized items, polling-driven children, and DnD-heavy nodes
- Stabilize callbacks passed into memoized children
- Use `skipToken` for conditional queries instead of fake fallback IDs
- Polling queries must align `staleTime` with `refetchInterval`
- Avoid per-render filtering/mapping work when memoized lookup structures are possible

### Design Impact

When proposing a UI:

- prefer derived maps over repeated filtering in render
- avoid deep prop chains with unstable references
- avoid component trees that require whole-list rerenders for local interactions
- do not recommend interaction patterns that depend on unnecessary global state churn

---

## 9. Accessibility Baseline

Every design spec should assume accessibility is required, not optional.

### Minimum Expectations

- Clear heading hierarchy
- Keyboard-reachable interactions
- Visible focus states
- Adequate contrast in light and dark modes
- Motion that respects reduced-motion preferences
- Color is never the sole status indicator
- Icon-only actions require accessible labeling
- Error and success states need textual meaning, not color-only signaling

### UX Interpretation

Accessibility in NeonDash should feel **premium and disciplined**, not “bolted on”.

---

## 10. Motion and Interaction Tone

Motion should reinforce orientation and state change.

### Motion Rules

- Use motion to explain, not entertain
- Transitions should be short, smooth, and quiet
- Hover and focus states should be visible but restrained
- Avoid stacked motion effects on the same element
- Respect `prefers-reduced-motion`

### Good Uses

- sheet entrance/exit
- accordion expansion
- hover emphasis on actionable rows
- state confirmation on toggles and saves

### Avoid

- decorative floating
- dramatic elastic transitions
- constant shimmer/noise
- “AI-looking” animated excess

---

## 11. What to Load With This File

Load this file together with:

### For concrete feature work
- the relevant feature spec inside `design-specs/`

### For layout/navigation work
- `design-specs/global-layout-navigation.md`

### For implementation handoff
- `design-specs/IMPLEMENTATION-GUIDE.md`

### For quick execution reference
- feature quick-reference docs such as:
  - `design-specs/ACTIVITY-SHEET-QUICK-REFERENCE.md`
  - `design-specs/AUTOMATION-TOOLBAR-QUICK-REFERENCE.md`

Do not automatically load all design specs. Only load the feature documents directly related to the task.

---

## 12. When Not to Load This File

Skip this file when the task is strictly:

- backend-only
- schema-only
- integration-only
- webhook-only
- auth-only without UI implications
- logging, infra, or deployment work

In those cases, load architecture/backend references instead.

---

## 13. Summary

Use this foundation to keep NeonDash UI work:

- on-brand
- low-noise
- extend-first
- performant
- accessible
- context-efficient

If a design decision improves novelty but weakens clarity, consistency, or maintainability, reject it.
