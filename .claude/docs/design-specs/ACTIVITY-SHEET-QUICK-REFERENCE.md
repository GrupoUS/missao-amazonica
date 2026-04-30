# Activity Detail Sheet — Quick Reference Card

## At a Glance

**Component Name:** `ActivityDetailSheet`  
**Opens from:** Right side of screen  
**Triggers:** Click activity in accordion  
**Data source:** `packages/shared/src/atividades-data.ts`

---

## Visual Structure

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📚 Activity Title        ✕ ┃ ← Header (sticky, 56px)
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                              ┃
┃ ╔══════════════════════════╗ ┃
┃ ║✓ Why It Matters          ║ ┃
┃ ║Lorem ipsum dolor...      ║ ┃ ← Module metadata (open)
┃ ╚══════════════════════════╝ ┃
┃                              ┃
┃ ╔══════════════════════════╗ ┃
┃ ║🎯 Key Concept           ║ ┃
┃ ║Atomic habituation...     ║ ┃
┃ ╚══════════════════════════╝ ┃
┃                              ┃
┃ ☐ Success Criteria      [v] ┃
┃ ☐ Resources             [v] ┃ ← Collapsibles (closed)
┃                              ┃
┃ ┌────────────────────────┐  ┃
┃ │ ☐ ⏱5min [>] Step 1... │  ┃
┃ └────────────────────────┘  ┃ ← Steps accordion
┃ ┌────────────────────────┐  ┃
┃ │ ☐ ⏱3min [>] Step 2... │  ┃
┃ └────────────────────────┘  ┃
┃                              ┃
┃ 📝 Notes                     ┃
┃ [Click to add notes...] ──┐  ┃ ← Notes (inline edit)
┃                           │  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Cancel                 Save  ┃ ← Footer (sticky, 60px)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Color Scheme (GPUS Tokens)

| Token | Value |
|-------|-------|
| Primary | Gold (light) / Amber (dark) |
| Foreground | Petróleo (light) / Slate 50 (dark) |
| Background | Slate 50 (light) / Slate 950 (dark) |
| Border | Slate 200 (light) / Slate 800 (dark) |
| Secondary | Gold accent for badges |

**Rule:** Use Tailwind semantic tokens. Never hardcode hex values.

---

## Typography

| Text | Font | Size | Weight |
|------|------|------|--------|
| Activity title | Fira Sans | 24px | 700 |
| Section headers | Fira Sans | 14px | 600 |
| Step title | Fira Sans | 16px | 600 |
| Body text | Fira Sans | 14px | 400 |
| Metadata / Duration | Fira Code | 12px | 400 |

---

## Section Breakdown

### 1. Header (56px, sticky)
- **Icon:** 24x24px lucide-react
- **Title:** Activity name
- **Close:** X button, hover: opacity-70

### 2. Module Metadata Cards
- **Why It Matters** → Starts **open**, icon: CheckCircle2
- **Key Concept** → Always **open**, icon: Lightbulb  
- **Success Criteria** → Starts **closed**, has count badge
- **Reflection Prompt** → Starts **closed**
- **Resources** → Starts **closed**, list of links

Each card:
- Left border: `border-l-4 border-primary`
- Background: `bg-secondary/5`
- Padding: 16px

### 3. Steps Section (Accordion)
- **One step expanded at a time**
- Header: `☐ ⏱ 5min [>] Step 1: O Que...`
- When expanded:
  - **COMO** (always visible)
  - **EXEMPLO** (collapsible)
  - **CRITÉRIO** (collapsible)

### 4. Notes Section (Notion-style)
- Click to edit (like Notion)
- Auto-save on blur
- Auto-expand textarea

### 5. Footer (60px, sticky)
- **Cancel** (ghost button)
- **Save** (primary button)

---

## Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Sheet in/out | 300ms / 200ms | ease-out |
| Checkbox toggle | 200ms | ease |
| Chevron rotate | 200ms | ease |
| Collapsible reveal | 300ms | ease |
| Hover fade | 150ms | ease |

---

## Responsive Widths

| Breakpoint | Width | Padding |
|-----------|-------|---------|
| Mobile | 100% | 16px |
| Tablet | 70% / 560px | 20px |
| Desktop | 40% / 520px | 24px |

---

## State Management

### Local State
```typescript
isOpen, expandedStepId, stepCompletion, isEditingNotes, notes, isSaving
```

### Mutations
- `api.atividades.toggleStep({ actividadeId, stepId })`
- `api.atividades.updateNote({ actividadeId, notes })`

### Optimistic Updates
- Step toggle: Update UI immediately → sync in background
- Notes: Update textarea immediately → save on blur

---

## Accessibility

- ✅ Focus rings (2px primary color)
- ✅ Keyboard nav (Tab, Enter, Escape)
- ✅ ARIA labels on icon buttons
- ✅ Semantic HTML (`<section>`, `<h3>`)
- ✅ Contrast ≥4.5:1 (light + dark)
- ✅ Respects `prefers-reduced-motion`

---

## shadcn/ui Components Used

| Component | Config |
|-----------|--------|
| Sheet | Side: right, responsive width |
| ScrollArea | Custom scrollbar styling |
| Card | Subtle border, light background |
| Badge | 12px, Fira Code |
| Checkbox | 20x20px, animates on toggle |
| Button | Primary + Ghost variants |
| Textarea | Auto-expands, max 300px |
| Collapsible | 300ms smooth reveal |

---

## Quick Checklist Before Launch

- [ ] All colors use GPUS tokens (no hex values)
- [ ] All icons from `lucide-react`
- [ ] Fira fonts imported
- [ ] Sheet slides in from right, closes cleanly
- [ ] Checkbox toggles animate smoothly
- [ ] Collapsibles expand/collapse without jumps
- [ ] Notes auto-save on blur
- [ ] Dark mode no contrast issues
- [ ] Mobile responsive at 375px
- [ ] Keyboard nav works (Tab, Enter, Escape)
- [ ] No console errors

---

**File Location:** `/home/mauricio/neondash/docs/design-specs/activity-detail-sheet-design-spec.md`  
**Created:** 2026-02-25
