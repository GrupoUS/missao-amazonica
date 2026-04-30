# NeonDash Activity Detail Sheet — Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Activity Detail Sheet
**Feature Area:** Dashboard / Atividades
**Created:** 2026-04-01
**Complexity:** L4 — multi-section + state + interactions

---

## Executive Summary

The Activity Detail Sheet is a right-sliding sidebar panel that displays complete activity details within the NeonDash mentorship dashboard. It surfaces module-level metadata (Why It Matters, Key Concept, Success Criteria, Resources), expandable step guides with atomic fields (O Que, Como, Exemplo, Criterio), inline-editable notes with auto-save, and progress tracking with checkbox toggles per step. The component lives inside `atividades-content.tsx` and is triggered by clicking the "Detalhes" button on any activity accordion item.

---

## 1. Design System Overview

### Pattern: Drill-Down Analytics + Editorial Minimalism

- Hierarchical summary-to-detail flow (module metadata at top, steps below, notes at bottom)
- Progressive disclosure via collapsibles and accordions reduces cognitive load
- Print-inspired typography with clear weight hierarchy guides the reading path
- Minimal scaffolding — whitespace and tonal shifts define structure, not heavy borders

### Visual Direction

**Not:**
- Glassmorphism / backdrop-blur panels (Glass Trap)
- Bento grids or card-heavy mosaic layouts
- Heavy 1px borders as section dividers (use background shifts or ghost borders)

**Yes:**
- Quiet spacing with generous padding (`px-6 py-4`)
- Single-column scrollable layout within a Sheet
- GPUS Gold + Azul Petroleo accent hierarchy on a tonal Slate surface system
- Clear typographic hierarchy: uppercase tracking-wide labels, medium-weight section headers, relaxed body text

---

## 2. Colors (GPUS Tokens ONLY)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | Gold `38 60% 45%` | Amber `43 96% 56%` | Active states, icons, progress bar, focus rings, checkbox accent |
| `--primary-foreground` | White `0 0% 100%` | Dark `222 47% 10%` | Text on primary buttons |
| `--foreground` | Petroleo `203 65% 26%` | Slate 50 `210 40% 98%` | Headings, body text, step labels |
| `--background` | Slate 50 `210 40% 98%` | Slate 950 `222 47% 6%` | Sheet background, header/footer bg |
| `--card` | White `0 0% 100%` | Slate 900 `222 47% 10%` | Step accordion item background (`bg-card`) |
| `--muted` | Slate 100 `210 40% 96%` | Slate 800 `217 33% 17%` | Key Concept card bg, icon wrapper bg, Exemplo bg |
| `--muted-foreground` | Slate gray `215 25% 40%` | Slate 400 `215 20% 65%` | Secondary text, metadata, labels, duration badges |
| `--border` | Slate 200 `214 32% 91%` | Slate 800 `217 33% 17%` | Step card borders, separators, resource card borders |
| `--ring` | Gold `38 60% 45%` | Gold `43 96% 56%` | Focus ring on all interactive elements |
| `--destructive` | Red `0 84% 60%` | Red `0 63% 31%` | Error states on save failures |

**Rule:** Always use Tailwind semantic classes (`bg-primary`, `text-foreground`, `border-border`). Never hardcode hex values (`bg-[#0f4c75]` is prohibited).

---

## 3. Typography

Font stack: **Manrope** (headlines/display) | **Inter** (body/UI) | **Fira Code** (metadata/mono)

> NEVER use "Fira Sans" — that was an incorrect reference in earlier specs. Manrope is the distinctive GPUS headline font; Inter is the intentional body companion (brand exception per gpus-theme).

| Element | Font | Size | Weight | Line Height | Tailwind Classes |
|---------|------|------|--------|-------------|------------------|
| Sheet Title | Manrope | 18px | 600 | 1.2 | `text-lg font-semibold` (via `SheetTitle`) |
| Section Label (uppercase) | Inter | 12px | 600 | 1.5 | `text-xs font-semibold uppercase tracking-wider` |
| Module Sub-label | Inter | 12px | 500 | 1.5 | `text-xs font-medium uppercase tracking-wide` |
| Step Title | Inter | 14px | 500 | 1.4 | `text-sm font-medium` |
| Body Text | Inter | 14px | 400 | 1.6 | `text-sm leading-relaxed` |
| Duration Badge | Fira Code | 12px | 400 | 1.5 | `text-xs tabular-nums` (via Badge) |
| Saving Indicator | Inter | 12px | 400 | 1.5 | `text-xs text-muted-foreground` |
| Progress Counter | Inter | 12px | 400 | 1.5 | `text-xs text-muted-foreground` |

### Editorial Rules Applied

- **Labels:** All-caps with wide tracking (`uppercase tracking-wide` / `tracking-wider`) for architectural section tags
- **Body text:** `text-muted-foreground` for warm-grey premium reading experience
- **Scale contrast:** Title (18px semibold) vs labels (12px uppercase) creates a 1.5x size + weight + case hierarchy

---

## 4. Layout Architecture

### Responsive Dimensions

| Breakpoint | Width | Padding | Gap Between Sections |
|-----------|-------|---------|---------------------|
| Mobile <=640px | 100% (full-screen) | `px-6 py-4` | `space-y-6` (24px) |
| Tablet 641-1024px | 600px max | `px-6 py-4` | `space-y-6` (24px) |
| Desktop >1024px | 600px max | `px-6 py-4` | `space-y-6` (24px) |

### Structure (ASCII Diagram)

```
+------------------------------------------+
| HEADER (sticky, border-b, bg-background) |
| +--------------------------------------+ |
| | [emoji] Activity Title     [X close] | |
| |  "Ver detalhes"                      | |
| | [====Progress Bar====] 1.5h height   | |
| | 3/7 completados                      | |
| +--------------------------------------+ |
+------------------------------------------+
| SCROLL AREA (flex-1, min-h-0)           |
|                                          |
| +-- Section 1: Sobre este modulo ------+ |
| | [Collapsible]                        | |
| |   Lightbulb  Por que isso importa    | |
| |     body text...                     | |
| |                                      | |
| |   [bg-muted card]                    | |
| |     Conceito-chave                   | |
| |     body text...                     | |
| |                                      | |
| |   Criterios de sucesso do modulo     | |
| |     CheckCircle2  criterion 1        | |
| |     CheckCircle2  criterion 2        | |
| |                                      | |
| |   | Reflection prompt (italic)       | |
| |   | border-l-2 border-primary/20     | |
| |                                      | |
| |   Recursos                           | |
| |   [resource card with icon + link]   | |
| +--------------------------------------+ |
|                                          |
| --- Separator ---                        |
|                                          |
| +-- Section 2: Passos (3/7) ----------+ |
| | [Accordion type="multiple"]          | |
| |                                      | |
| | +--[Step 1]---------------------+   | |
| | | [x] Step label      [5min]    |   | |
| | |   O que fazer                  |   | |
| | |   body text...                 |   | |
| | |   Como fazer                   |   | |
| | |   (1) instruction              |   | |
| | |   (2) instruction              |   | |
| | |   [bg-muted] Exemplo           |   | |
| | |   italic text...               |   | |
| | |   CheckCircle2 criterio text   |   | |
| | +--------------------------------+   | |
| |                                      | |
| | +--[Step 2]---------------------+   | |
| | | [ ] Step label      [3min]    |   | |
| | +--------------------------------+   | |
| +--------------------------------------+ |
|                                          |
| --- Separator ---                        |
|                                          |
| +-- Section 3: Minhas Notas ----------+ |
| | [Textarea, auto-save on blur]       | |
| | "Salvando..." indicator             | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| FOOTER (sticky, border-t, bg-background) |
| +--------------------------------------+ |
| | [Fechar] (outline, full-width)       | |
| +--------------------------------------+ |
+------------------------------------------+
```

---

## 5. Component Inventory (shadcn/ui)

| Component | Import Path | Purpose | Notes |
|-----------|-------------|---------|-------|
| `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` / `SheetFooter` / `SheetClose` | `@/components/ui/sheet` | Sidebar container | `side="right"`, `sm:max-w-[600px]` |
| `ScrollArea` | `@/components/ui/scroll-area` | Single scrollable content zone | Only ONE per page — never nested |
| `Accordion` / `AccordionItem` / `AccordionTrigger` / `AccordionContent` | `@/components/ui/accordion` | Steps expandable list | `type="multiple"` allows multiple open |
| `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` | `@/components/ui/collapsible` | Module metadata toggle | Single collapsible wrapping all metadata |
| `Badge` | `@/components/ui/badge` | Duration display | `variant="outline"`, Fira Code numerals |
| `Checkbox` | `@/components/ui/checkbox` | Step completion toggle | Wrapped in a `role="button"` div for event isolation |
| `Button` | `@/components/ui/button` | Footer close action | `variant="outline"` full-width |
| `Textarea` | `@/components/ui/textarea` | Notes editor | `resize-none`, min-h-[100px], auto-save on blur |
| `Progress` | `@/components/ui/progress` | Header progress bar | `h-1.5`, value from 0-100 |
| `Separator` | `@/components/ui/separator` | Section dividers | Between metadata/steps and steps/notes |

### Icon Usage (lucide-react)

All icons imported directly from `lucide-react`:

| Icon | Usage |
|------|-------|
| `BookOpen` | Module metadata collapsible trigger |
| `Lightbulb` | "Por que isso importa" section |
| `CheckCircle2` | Success criteria items, step criterio |
| `MessageSquare` | Reflection prompt |
| `Clock` | Duration badge |
| `ExternalLink` | Resource link indicator |
| `FileText` / `Wrench` / `Video` / `BookMarked` | Resource type icons (mapped via `RESOURCE_ICON`) |

---

## 6. Detailed Sections

### 6.1 Header (Sticky)

- **Structure:** `SheetHeader` with `sticky top-0 z-10 border-b bg-background px-6 py-4`
- **Row 1:** Emoji icon in `rounded-lg bg-muted p-2 text-2xl` wrapper + `SheetTitle` (truncated) + subtitle "Ver detalhes" in `text-muted-foreground text-xs`
- **Row 2:** `Progress` bar (`h-1.5`, value computed from step completion) + counter text `{completed}/{total} completados`
- **Spacing:** `mt-3 space-y-1.5` between title row and progress row

### 6.2 Module Metadata (Collapsible)

Wraps all module-level data in a single `<Collapsible>`. Only renders if `hasModuleData` is truthy.

**Sub-sections (in order, all conditional):**

| Sub-section | Icon | GPUS Tokens | Layout |
|-------------|------|-------------|--------|
| Por que isso importa | `Lightbulb` `text-primary` | Label: `font-medium text-foreground text-xs uppercase tracking-wide`, Body: `text-muted-foreground text-sm leading-relaxed` | `flex gap-3` |
| Conceito-chave | None | Container: `rounded-lg bg-muted px-3 py-2.5`, same label/body pattern | Standalone card |
| Criterios de sucesso | `CheckCircle2` `text-primary` per item | Label: same uppercase pattern, Items: `text-muted-foreground text-sm` | `ul > li` with `space-y-1.5` |
| Reflection Prompt | `MessageSquare` `text-primary/60` | `border-primary/20 border-l-2 pl-3`, italic body | `flex gap-3` with left accent border |
| Recursos | Type-mapped icon `text-primary/70` | Card: `border border-border rounded-lg p-2.5`, hover: `hover:border-primary/30 hover:bg-muted/40` | Link cards with `target="_blank" rel="noopener noreferrer"` |

**Followed by:** `<Separator />` dividing metadata from steps section.

### 6.3 Steps Section (Accordion)

- **Label:** `Passos ({completed}/{total})` in `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- **Container:** `<Accordion type="multiple">` with `space-y-1.5` between items
- **Each AccordionItem:**
  - Container: `rounded-lg border border-border/60 bg-card`
  - Trigger: `px-4 py-3 hover:no-underline hover:bg-muted/40`
    - Checkbox (wrapped in `role="button"` div with `onClick` + `onKeyDown` stopping propagation)
    - Step label: `text-sm font-medium`, with strikethrough when completed (`text-muted-foreground line-through opacity-70`)
    - Duration badge: `Badge variant="outline"` with `Clock` icon and `tabular-nums`
  - Content: `px-4 pb-4`
    - **O Que Fazer:** Label + body paragraph
    - **Como Fazer:** Numbered `ol` with circular number badges (`rounded-full bg-primary/10 text-primary text-xs font-bold`)
    - **Exemplo:** `rounded-md bg-muted/60 px-3 py-2` card with italic text
    - **Criterio:** `CheckCircle2` icon + inline text

### 6.4 Notes Section

- **Label:** `Minhas Notas` in uppercase tracking pattern
- **Textarea:** `min-h-[100px] resize-none border-border bg-muted/40 text-foreground text-sm`, placeholder styled with `placeholder:text-muted-foreground/60`, focus ring `focus:border-primary/40`
- **Behavior:** Auto-save on blur via `handleNoteBlur` callback; compares current value against saved value before firing mutation
- **Saving indicator:** `"Salvando..."` text in `text-muted-foreground text-xs` shown when `isSavingNote` is true

### 6.5 Footer (Sticky)

- **Structure:** `SheetFooter` with `sticky bottom-0 border-t bg-background px-6 py-3`
- **Action:** Single `Button variant="outline"` full-width, wrapped in `SheetClose asChild`
- **Label:** "Fechar"

---

## 7. Animations & Interactions

| Interaction | Duration | Easing | Effect | Implementation |
|------------|----------|--------|--------|----------------|
| Sheet enter | 300ms | ease-out | Slide from right + backdrop fade | Built into shadcn Sheet (Radix) |
| Sheet exit | 200ms | ease-out | Slide to right + backdrop fade | Built into shadcn Sheet (Radix) |
| Collapsible reveal | 300ms | ease | Height + opacity transition | Built into shadcn Collapsible (Radix) |
| Accordion expand | 300ms | ease | Height transition | Built into shadcn Accordion (Radix) |
| Checkbox toggle | 200ms | ease | Color transition + subtle scale | CSS transition on Checkbox |
| Hover states | 150ms | ease | `hover:bg-muted/40`, `hover:border-primary/30` | CSS `transition-colors` |
| Progress bar fill | 300ms | ease-out | Width transition | Built into shadcn Progress |

### Rules

- **Motion library:** `motion/react` (import from `motion/react`). NEVER use `framer-motion` — the project has migrated.
- **CSS-first:** All hover and state transitions use CSS `transition-colors` / `transition-transform`. No JS-driven hover animations.
- **`useReducedMotion()` is MANDATORY:** The parent `atividades-content.tsx` already uses `useReducedMotion()` from `motion/react`. All entrance animations pass `initial={reducedMotion ? undefined : { ... }}` to disable motion when the user prefers reduced motion.
- **GPU-accelerated only:** Animate `transform` and `opacity` exclusively. Never animate `width`, `height`, `margin`, or `padding` directly (Radix handles height transitions internally via content measurement).

---

## 8. Responsive Behavior

### Mobile (<=640px)

- Sheet occupies **100% width** (`w-full` default, `sm:max-w-[600px]` kicks in above 640px)
- Full-screen modal feel with sticky header/footer
- Touch targets: All buttons and checkboxes meet 44px minimum via padding
- Collapsible module metadata starts **closed** to reduce initial scroll depth
- All font sizes remain the same (14px body minimum)

### Tablet (641-1024px)

- Sheet width: `600px` max (`sm:max-w-[600px]`)
- Slides in from right with overlay backdrop
- All interactions and hover states active

### Desktop (>1024px)

- Same 600px max width
- Slides in from right
- Full hover states visible
- Comfortable reading column at 600px - 48px padding = 552px content width

---

## 9. State Management

### Component Props Interface

```typescript
interface AtividadeDetailSheetProps {
  atividade: Atividade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressMap: Record<string, ProgressData>;
  isReadOnly: boolean;
  mentoradoId?: number;
  onToggleStep: (atividadeCodigo: string, stepCodigo: string) => void;
  onSaveNote: (atividadeCodigo: string, stepCodigo: string, notes: string) => void;
  isSavingNote: boolean;
  isTogglingStep: boolean;
}

interface ProgressData {
  completed: boolean;
  notes?: string | null;
}
```

### Local State (inside AtividadeDetailSheet)

```typescript
const [moduleNote, setModuleNote] = useState(
  progressMap[`${atividade?.codigo}:module-notes`]?.notes ?? ""
);
```

- `moduleNote` — textarea content for the current activity's notes
- Synced via `useEffect` when `progressMap` or `atividade.codigo` changes
- Saved on blur via `handleNoteBlur` (compares against stored value to avoid unnecessary mutations)

### Parent State (inside AtividadesContent)

```typescript
const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
const [sheetOpen, setSheetOpen] = useState(false);
```

### tRPC Queries and Mutations

**Queries:**

```typescript
// Self-progress (mentorado viewing own)
trpc.atividades.getProgress.useQuery(undefined, { enabled: !mentoradoId });

// Mentor viewing mentorado's progress
trpc.atividades.getProgressById.useQuery(
  { mentoradoId: mentoradoId! },
  { enabled: !!mentoradoId }
);
```

**Mutations (defined in parent):**

```typescript
// Toggle step completion
const toggleMutation = trpc.atividades.toggleStep.useMutation({
  onSuccess: (_, variables) => {
    progressQuery.refetch();
    if (variables.completed) celebrate();
  },
  onError: () => toast.error("Erro ao atualizar o passo. Tente novamente."),
});

// Update notes
const updateNoteMutation = trpc.atividades.updateNote.useMutation({
  onSuccess: () => progressQuery.refetch(),
  onError: () => toast.error("Erro ao salvar a nota. Tente novamente."),
});
```

### Invalidation Strategy

> **Rule:** Always use `onSettled` (not just `onSuccess`) for query invalidation in new code. The current implementation uses `onSuccess` + `.refetch()` — future refactors should migrate to:

```typescript
const toggleMutation = trpc.atividades.toggleStep.useMutation({
  onSettled: () => {
    utils.atividades.getProgress.invalidate();
    utils.atividades.getProgressById.invalidate();
  },
});
```

### Optimistic Update Pattern (Step Toggle)

The parent passes the toggled state inline:

```typescript
onToggleStep={(atividadeCodigo, stepCodigo) =>
  toggleMutation.mutate({
    atividadeCodigo,
    stepCodigo,
    completed: !(progressMap[`${atividadeCodigo}:${stepCodigo}`]?.completed ?? false),
  })
}
```

UI reflects the server state via `progressMap` after `refetch()`. For true optimistic updates, use `onMutate` + `queryClient.setQueryData` with `onError` rollback.

### Read-Only Mode

When `mentoradoId` is provided, `isReadOnly` is `true`:
- Checkboxes are `disabled`
- Notes textarea is `disabled`
- Toggle step handler early-returns in parent

---

## 10. Accessibility

- [x] **Focus rings:** `2px ring-primary` (via `--ring` token) on all interactive elements — Sheet close button, collapsible trigger, accordion triggers, checkbox wrapper, resource links, footer button, textarea
- [x] **Keyboard navigation:** `Tab` / `Shift+Tab` through all interactive elements; `Enter` / `Space` on checkbox wrapper (custom `onKeyDown` handler); `Escape` closes sheet (built into Radix Sheet)
- [x] **ARIA labels on icon-only buttons:** Checkbox wrapper has `aria-label="Marcar como incompleto"` / `"Marcar como completo"` based on state
- [x] **Semantic HTML:** `<section>` regions implied by Sheet structure; heading hierarchy via `SheetTitle` (maps to `h2`); section labels use `<p>` with uppercase styling (consider `<h3>` for improved semantics)
- [x] **Contrast >= 4.5:1:** Light mode: Petroleo `#0f4c75` on Slate 50 `#f8fafc` = 7.2:1. Dark mode: Slate 50 `#f8fafc` on Slate 950 `#020617` = 18.1:1. Muted foreground passes 4.5:1 in both modes.
- [x] **`prefers-reduced-motion` respected:** Parent uses `useReducedMotion()` from `motion/react`; all `motion.div` entrance animations conditionally disabled
- [x] **Touch targets >= 44px on mobile:** Checkbox wrapper has sufficient padding via `py-3` on AccordionTrigger; footer button is full-width; resource cards have `p-2.5` minimum
- [x] **External links:** All resource links have `rel="noopener noreferrer"` and `target="_blank"`
- [x] **WCAG 2.2 SC 2.4.11:** Sticky header/footer do not obscure focused elements — ScrollArea handles content offset
- [x] **Color not the sole indicator:** Completed steps use strikethrough text + opacity reduction alongside color change; checkboxes provide binary checked/unchecked state

---

## 11. Anti-Patterns to Avoid

- **Multiple ScrollArea nesting:** The Sheet has exactly ONE `<ScrollArea>`. The parent page (`DashboardLayout`) has its own scroll. Never nest a ScrollArea inside the Sheet's ScrollArea.
- **`framer-motion` instead of `motion/react`:** The project has migrated. Import from `motion/react`, never from `framer-motion`.
- **Inline arrow callbacks as props:** Use `useCallback` for handlers passed to child components or memoized elements. The current component uses `useCallback` for `handleNoteBlur` — extend this pattern to any new handlers.
- **`onSuccess` for cache invalidation:** Always use `onSettled` to ensure the cache is invalidated regardless of success or failure. The current `refetch()` in `onSuccess` misses error-state cache staleness.
- **Hardcoded hex colors:** No `bg-[#0f4c75]`, `text-[#fbbf24]`, or `style={{ color: '...' }}`. Use semantic tokens exclusively.
- **`as any` type assertions:** The component uses proper TypeScript types (`Atividade`, `ProgressData`). Never introduce `as any` to silence type errors.
- **`console.log` in production:** Use the `logger` from `_core/logger` on the backend; remove all `console.log` before merge.
- **Non-null assertion (`!`):** Never use `!` on optional data. The component correctly uses `??` fallbacks and optional chaining throughout.

---

## 12. File Structure

### Current Implementation

```
apps/web/src/
  components/dashboard/
    atividade-detail-sheet.tsx        # Main Sheet component (413 LOC)
    atividade-modulo-card.tsx          # Standalone module metadata card (193 LOC)
    atividades-content.tsx             # Parent container, manages state + mutations (601 LOC)
    step-item.tsx                      # Individual step row (used in parent accordion)
    task-creation-popover.tsx          # Task creation from activity
  routes/
    _dashboard.atividades.tsx          # Route layout (WorkspaceLayout)
    _dashboard.atividades.index.tsx    # Index route (lazy-loaded)

packages/shared/src/
  atividades-data.ts                   # Atividade, AtividadeStep, AtividadeRecurso interfaces + static data

apps/web/src/lib/
  step-guide.ts                        # getStepGuideContent() helper
  trpc.ts                             # tRPC client
  utils.ts                            # cn() utility
```

### Data Types (from `@neondash/shared/atividades-data`)

```typescript
interface Atividade {
  codigo: string;
  descricao?: string;
  etapa: string;
  icone: string;
  steps: AtividadeStep[];
  titulo: string;
  whyItMatters?: string;
  keyConcept?: string;
  resources?: AtividadeRecurso[];
  reflectionPrompt?: string;
  successCriteria?: string[];
}

interface AtividadeStep {
  codigo: string;
  descricao?: string;
  detalhes?: string;
  label: string;
  tempoMin?: string;
  oQue?: string;
  como?: string[];
  exemplo?: string;
  criterio?: string;
}

interface AtividadeRecurso {
  type: string;    // "template" | "ferramenta" | "video" | "artigo"
  title: string;
  url: string;
  relevance: string;
}
```

---

## 13. Pre-Delivery Checklist

### Visual

- [ ] No hardcoded hex colors — all values use GPUS semantic tokens
- [ ] All icons from `lucide-react` — no emoji used as UI icons (activity `icone` field is data-driven, acceptable)
- [ ] Font stack verified: Manrope (headings via SheetTitle), Inter (body), Fira Code (duration badges)
- [ ] Hover states are smooth transitions (no layout shifts, no JS-driven animation)
- [ ] Dark mode: toggle light/dark, verify all text meets 4.5:1 contrast

### Interaction

- [ ] Sheet opens from right, closes via footer button + Escape + backdrop click
- [ ] Checkbox toggles fire `onToggleStep` with correct `atividadeCodigo` + `stepCodigo`
- [ ] Accordion expands/collapses without visual jumps
- [ ] Notes auto-save on blur (only when changed)
- [ ] Saving indicator appears during mutation pending state
- [ ] Read-only mode disables checkboxes and textarea when `mentoradoId` is provided

### State

- [ ] `progressMap` syncs `moduleNote` via `useEffect` on atividade change
- [ ] Completed steps count recomputes reactively from `progressMap`
- [ ] All mutation errors show user-facing toast via `toast.error()`
- [ ] No mutation fires without try-catch or `onError` handler

### Performance

- [ ] Only ONE `<ScrollArea>` in the Sheet — no nesting
- [ ] `useCallback` on handlers passed as props (`handleNoteBlur`)
- [ ] `RESOURCE_ICON` map is hoisted to module scope (not recreated per render)
- [ ] No `new Date()` or `new Intl.*` in render path
- [ ] Step guide content resolved in parent via `stepGuidesMap` (memoized)

### Responsive

- [ ] Works at 375px width (full-screen sheet)
- [ ] Works at 768px width (600px max sidebar)
- [ ] Works at 1440px width (600px max sidebar)
- [ ] No horizontal scroll on any breakpoint
- [ ] Touch targets >= 44px on mobile (checkbox area, buttons, resource links)

### Accessibility

- [ ] Tab navigation works through all interactive elements within the Sheet
- [ ] Screen reader labels present on checkbox wrappers
- [ ] External links have `rel="noopener noreferrer"`
- [ ] `prefers-reduced-motion` disables entrance animations
- [ ] Escape key closes the Sheet

---

## 14. Success Criteria

These are the measurable outcomes that define "done" for the Activity Detail Sheet:

- Clicking "Detalhes" on any activity accordion item opens the Sheet from the right with a 300ms slide animation
- Module metadata (Why It Matters, Key Concept, Success Criteria, Reflection, Resources) renders conditionally — sections with no data are hidden, not empty
- Steps accordion allows multiple steps open simultaneously (`type="multiple"`) with checkbox, label, duration badge, and expandable guide content
- Checking/unchecking a step fires `toggleStep` mutation and updates the progress bar in the header after refetch
- Notes textarea saves on blur via `updateNote` mutation only when the content has changed from the stored value
- Read-only mode (mentor viewing mentorado) disables all checkboxes and the textarea
- Dark mode renders with correct Amber Gold primary and Slate 950 background — no contrast failures
- Sheet works at 375px (full-screen), 768px (600px sidebar), and 1440px (600px sidebar) without horizontal scroll
- Keyboard navigation: Tab through all interactive elements, Enter/Space on checkboxes, Escape to close
- Zero `console.log` statements, zero TypeScript `any` types, zero hardcoded hex colors in the component
