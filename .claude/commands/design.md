---
description: Canonical design workflow. Phase 0 (design spec) → Phase 1 (prototype) → Phase 2 (convert) → Phase 3 (validate). frontend-specialist runs in foreground (requires file write permissions).
workflow_type: prompt-chaining
---

## Stopping Conditions

- STOP if 3 design iterations fail Template Test → present options, ask user
- ASK if no GPUS tokens exist for the required color role
- ASK if design contradicts existing component patterns in `apps/web/src/components/`

---

# /design — Design Workflow

**ARGUMENTS**: $ARGUMENTS

> Orchestration-only. Deep policy lives in `debugger` frontend pack and `frontend-design@claude-plugins-official`.

---

## 0. CONTEXT LOAD (WISC Select)

1. Run `/prime-frontend` — loads `frontend.md` first, then only the required frontend references on demand
2. If continuing a prior session → read `.claude/docs/evolution/HANDOFF.md` first

**Tier 3 refs (read on demand only):**
- `.claude/docs/design-specs/00-design-system-foundation.md` — visual language, GPUS tokens, layout direction
- `.claude/docs/design-specs/00-lever-philosophy.md` — only when deciding extend vs create new component
- relevant feature spec under `.claude/docs/design-specs/` — only for the surface being designed

---

## 1. ASSESS COMPLEXITY

Per `_shared.md` Section 2.

| Complexity | Pattern | When |
|------------|---------|------|
| L1-L2 | Direct code | Bug fix, simple tweak |
| L3 | Single agent (foreground) | Component, known pattern |
| L4-L5 | Multiple agents | New feature, multi-component |
| L6+ | Agent Team | Full page, complex UX |

---

## Design Tool Chain

```
Phase 0: explorer + Skill("ui-ux-pro-max") → design spec
Phase 1: Skill("gpus-theme") + mcp__stitch__* → prototype (new pages only)
Phase 2: frontend-specialist + Skill("frontend-design@claude-plugins-official") → React code
Phase 3: debugger + performance-optimizer → validate
```

**Key rule:** `ui-ux-pro-max` generates the *spec* (Phase 0). `frontend-design` drives the *creative execution* (Phase 2). They never swap phases.

---

## PRE-FLIGHT: Design Research (Mandatory — L3+)

Before ANY implementation, spawn `explorer` (foreground) to generate a design specification:

Prompt template:
```
Invoke Skill("ui-ux-pro-max") and analyze: [user request]

Using ui-ux-pro-max, generate a complete design spec:
1. Style selection (justify against request context)
2. Color palette (GPUS tokens — never hardcode hex)
3. Typography pairing (name + scale)
4. Layout system (grid, spacing, breakpoints)
5. Component inventory (list shadcn/ui primitives to use)
6. Interaction patterns (hover, focus, loading, error, empty states)
7. Accessibility requirements (WCAG AA minimum)
8. Animation strategy (entrance, micro-interactions, reduced-motion)

Context: existing patterns in apps/web/src/components/, current GPUS tokens in index.css
Return: structured design spec (no code yet)
```

> **Skip only for:** Bug fixes (L1-L2) or trivial CSS tweaks.

---

## 1. Agent Selection

| Task Type | Agent | Background? |
|-----------|-------|-------------|
| Component or new page | `frontend-specialist` | **NO — foreground (Write/Edit required)** |
| Accessibility test | `debugger` | Yes |
| Performance review | `performance-optimizer` | Yes |
| SEO meta | `performance-optimizer` | Yes |

> For parallel execution of write-capable agents: multiple foreground Agent() calls in one message.

---

## 2. Execution Patterns

### Pattern 1: L1-L2 (Bug Fix / Tweak)
Fix directly. Skip Phase 0 and background agents.

### Pattern 2: L3 (Component / Known Pattern)
1. PRE-FLIGHT: spawn `explorer` foreground with design spec prompt
2. Wait for spec
3. Spawn `frontend-specialist` foreground with spec

### Pattern 3: L4-L5 (Multi-Component / Feature)
1. PRE-FLIGHT: spawn `explorer` foreground with design spec prompt
2. Wait for spec
3. Spawn multiple `frontend-specialist` agents foreground (one per component/section) in same message

### Pattern 4: L6+ (Full Page / Complex UX)
1. PRE-FLIGHT: spawn `explorer` foreground with design spec prompt
2. Phase 1 prototype (if new page): use Stitch MCP with `Skill("gpus-theme")`
3. Spawn `frontend-specialist` agents per section as foreground parallel calls

---

## 3. Skills to Load

```
Phase 0 (in explorer): Skill("ui-ux-pro-max")
Phase 1 (if using Stitch): Skill("gpus-theme")  — provides design system asset IDs
Phase 2 (in frontend-specialist): Skill("frontend-design@claude-plugins-official") + Skill("gpus-theme")
```

---

## 4. 4-Phase Pipeline

### Phase 0 — Design Research (explorer + ui-ux-pro-max)

Always for L3+. Generates structured design spec. Pass spec to frontend-specialist prompt.

### Phase 1 — Prototype (Stitch MCP)

**When:** New pages or landing pages only. Skip for components and bug fixes.

1. Invoke `Skill("gpus-theme")` — loads GPUS design system including Stitch asset IDs
2. `mcp__stitch__generate_screen_from_text` with design prompt
3. `mcp__stitch__apply_design_system` using GPUS design system (IDs provided by gpus-theme skill)
4. Iterate with `mcp__stitch__edit_screens` if needed
5. `mcp__stitch__get_screen` → download HTML

### Phase 2 — Convert to React

**frontend-specialist MUST invoke BOTH `Skill("frontend-design@claude-plugins-official")` and `Skill("gpus-theme")` BEFORE writing any code.**

#### Declare DESIGN COMMITMENT (mandatory — before first line of code)

```
🎨 DESIGN COMMITMENT: [Style Name]
  Geometry: [specific layout — not "clean grid"]
  Typography: [font + scale decision]
  Palette: [specific GPUS tokens]
  Effects: [specific animations/micro-interactions]
  Anti-cliché check: NOT Bento/glass/mesh/safe 50-50 split
```

> If you can describe the layout as "clean and minimal" without specifics, you haven't committed — restart thinking.

#### Implement

1. Break into components (max ~150 lines each)
2. Use shadcn/ui primitives
3. All colors → GPUS semantic tokens (never hardcode hex)
4. Add data queries (tRPC or server functions)
5. TypeScript interfaces
6. Scroll-triggered entrance animations (staggered)
7. Micro-interactions (scale/translate/opacity on hover)
8. `prefers-reduced-motion` support mandatory

### Phase 3 — Validate

#### Maestro Auditor (auto-rejection gates)

If ANY trigger is true → delete the implementation and restart:

| Trigger | Fail Condition | Fix |
|---------|----------------|-----|
| **Safe Split** | `grid-cols-2`, 50/50, 60/40, 70/30 layouts | Switch to 90/10, 100% stacked, or overlapping |
| **Glass Trap** | `backdrop-blur` without solid borders | Remove blur → solid colors + raw 1-2px borders |
| **Glow Trap** | Soft gradients to "pop" elements | High-contrast solid colors or grain textures |
| **Bento Trap** | Safe rounded grid boxes | Fragment grid, break alignment intentionally |
| **Blue Trap** | Default blue/teal as primary | Use project design tokens or distinctive accent |
| **Line Trap** | `1px solid` border dividers | Background shifts, thick padding, ghost borders |

Template test: "Could this be a Vercel/Stripe template?" → YES = FAIL.

#### UX Quality

- [ ] Loading states (skeletons shaped like expected output — not spinners)
- [ ] Error states
- [ ] Empty states with user guidance
- [ ] Keyboard navigation + focus not obscured by sticky elements (WCAG 2.2 SC 2.4.11)
- [ ] Touch targets ≥ 44×44px; minimum 24×24px with spacing (WCAG 2.2 SC 2.5.8)
- [ ] Drag interactions have non-drag alternatives (WCAG 2.2 SC 2.5.7)
- [ ] Key content left-aligned (NN Group: 69% more attention on left half)
- [ ] Choices grouped if >7 options (Hick's Law — decision time grows with options)
- [ ] Hover/state animations via CSS transitions, not JS (protects INP < 200ms at p75)

#### Visual Quality

- [ ] Semantic tokens only (no hardcoded hex)
- [ ] Dark mode tested
- [ ] Responsive breakpoints verified

#### Code Quality (per `_shared.md` Section 1)

- [ ] shadcn/ui primitives used
- [ ] `bun run type-check` passes
- [ ] `bun run lint:oxlint:check` passes

---

## Anti-Patterns

| Don't | Do |
|-------|----|
| Skip Phase 0 for L3+ | Always run explorer + ui-ux-pro-max first |
| Run frontend-specialist in background | Foreground only (background silently denies Write/Edit) |
| Skip Skill("frontend-design") | Invoke before any code in frontend-specialist |
| Write code before DESIGN COMMITMENT | Declare geometry/typography/palette/effects first |
| Use ui-ux-pro-max in frontend-specialist | Phase 0 (explorer) only |
| Hardcode colors | GPUS semantic tokens |
| Custom modal from scratch | shadcn/ui Dialog |
| Nested ScrollArea | Single at layout level |
| Components in `ui/` | `components/[feature]/` |
