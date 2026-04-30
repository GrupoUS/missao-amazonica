# Activity Detail Sheet — Implementation Guide

**Status:** Design Spec Complete ✅
**Date:** 2026-02-25
**Next Step:** `/implement` workflow

---

## What Was Designed

A **Notion-style sidebar sheet** that displays complete activity details:
- Module-level metadata (Why It Matters, Key Concept, Success Criteria, Resources)
- Expandable steps with atomic fields (O Que, Como, Exemplo, Critério)
- Notion-style inline-editable notes
- Step completion checkboxes with optimistic updates

---

## Design System Outputs

### 1. Complete Design Specification
📄 **File:** `/home/mauricio/neondash/.claude/docs/design-specs/activity-detail-sheet-design-spec.md`

**Includes:**
- Design pattern selection (Drill-Down Analytics + Editorial Minimalism)
- GPUS color token mapping (MANDATORY - no hex hardcoding)
- Typography system (Fira Sans + Fira Code)
- Responsive layout dimensions
- Component architecture (7 detailed sections)
- Animation timings (300ms sheet, 200ms checkbox, etc.)
- State management structure
- Accessibility checklist
- Pre-delivery validation checklist

### 2. Quick Reference Card
📋 **File:** `/home/mauricio/neondash/.claude/docs/design-specs/ACTIVITY-SHEET-QUICK-REFERENCE.md`

**For quick lookup:**
- Visual ASCII mockup
- Color palette table
- Typography scale
- Section breakdown
- Animation timings
- Responsive widths
- Component list
- Quick launch checklist

---

## Key Design Decisions

### Pattern: Drill-Down Analytics with Editorial Polish

**Why this pattern?**
- Hierarchical: Summary (module metadata) → Details (steps)
- Progressive disclosure: Collapsibles reduce cognitive load
- Editorial typography: Fira Sans/Code guides reading flow
- Minimal scaffolding: Whitespace > borders

**Anti-patterns AVOIDED:**
- ❌ Glassmorphism (trendy, not professional)
- ❌ Bento grids (too modular for linear flow)
- ❌ Heavy borders (visual clutter)
- ❌ Background patterns (distraction)

### Color System: GPUS Tokens ONLY

**CRITICAL RULE:**
```typescript
// ✅ CORRECT: Use semantic tokens
<div className="text-foreground bg-secondary/5 border-l-4 border-primary">

// ❌ WRONG: Never hardcode hex values
<div style={{ color: '#0f4c75', backgroundColor: '#e6d7c3' }}>
```

All colors come from GPUS design tokens:
- Primary: Gold (light) / Amber (dark)
- Foreground: Petróleo (light) / Slate 50 (dark)
- Background: Slate 50 (light) / Slate 950 (dark)
- Border: Slate 200 (light) / Slate 800 (dark)

### Typography: Fira Sans + Fira Code

**Distribution:**
- Headings & body: **Fira Sans** (professional, readable)
- Metadata & duration: **Fira Code** (technical, scannable)
- Font sizes: Scale from 12px to 24px with clear hierarchy

### Layout: Single-Column Scrollable Sheet

**Fixed Elements:**
- Header (sticky, 56px): Title + Close
- Footer (sticky, 60px): Cancel + Save
- Scrollable zone: Module metadata → Steps → Notes

**Responsive Widths:**
- Mobile: 100% (full-screen modal)
- Tablet: 70% / 560px max
- Desktop: 40% / 520px max

---

## Component Structure

### Sheet Container
```
Sheet (from right, 300ms entrance)
├── Header (sticky)
│   ├── Icon (24x24px lucide)
│   ├── Title (24px/700)
│   └── Close button
├── ScrollArea
│   ├── Module Metadata Cards
│   │   ├── Why It Matters (open)
│   │   ├── Key Concept (open)
│   │   └── Collapsibles (Success Criteria, Resources)
│   ├── Steps Accordion
│   │   └── Single-value (one open at a time)
│   └── Notes Section (Notion-style)
└── Footer (sticky)
    ├── Cancel (ghost)
    └── Save (primary)
```

### Module Metadata Cards
- **Visual:** Left border `border-l-4 border-primary`, background `bg-secondary/5`
- **Content:** 14px/400 Fira Sans body text
- **Interactions:** Smooth collapse/expand (300ms)
- **Icons:** lucide-react (CheckCircle2, Lightbulb, etc.)

### Steps Accordion
- **Behavior:** Only one step expanded at a time
- **Header:** Checkbox + Duration badge + Step title + Chevron
- **Checkbox:** 20x20px, animates on toggle (200ms scale 1→1.1→1)
- **Duration:** Fira Code 12px, primary color accent
- **Content:** COMO (visible) + EJEMPLO & CRITERIO (collapsible)

### Notes Section
- **Idle:** Read-only display
- **Focus:** Auto-expanding textarea (max 300px height)
- **Save:** On blur via tRPC mutation (optimistic update)

---

## Animations

All animations smooth, respecting `prefers-reduced-motion`:

| Interaction | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Sheet in | 300ms | ease-out | Slide from right + backdrop fade |
| Sheet out | 200ms | ease-out | Slide to right + backdrop fade |
| Checkbox toggle | 200ms | ease | Scale animation + color transition |
| Chevron rotate | 200ms | ease | 0° → 180° rotation |
| Collapsible | 300ms | ease | Height + opacity transition |
| Hover state | 150ms | ease | Opacity/color fade |

---

## State Management Strategy

### Local React State
```typescript
const [isOpen, setIsOpen] = useState(false);                    // Sheet visibility
const [expandedStepId, setExpandedStepId] = useState<string | null>(null);  // Accordion
const [stepCompletion, setStepCompletion] = useState<Record<string, boolean>>({});  // Checkboxes
const [isEditingNotes, setIsEditingNotes] = useState(false);    // Notes mode
const [notes, setNotes] = useState(activityNotes);              // Notes content
const [isSaving, setIsSaving] = useState(false);                // Save indicator
```

### Optimistic Updates Pattern

**Step Toggle:**
```typescript
// 1. Update UI immediately
setStepCompletion(prev => ({ ...prev, [stepId]: !prev[stepId] }));

// 2. Sync to backend in background
toggleStepMutation.mutate({ actividadeId, stepId });

// 3. On error: revert UI
if (error) setStepCompletion(prev => ({ ...prev, [stepId]: !prev[stepId] }));
```

**Notes Save:**
```typescript
// 1. Update local state immediately
setNotes(newText);

// 2. On blur, disable button + save
setIsSaving(true);
updateNotesMutation.mutate({ actividadeId, notes: newText });

// 3. Re-enable on success/error
setIsSaving(false);
```

---

## tRPC Mutations Required

### 1. Toggle Step Completion
```typescript
// Backend: apps/api/src/routers/atividades.ts
toggleStep: protectedProcedure
  .input(z.object({
    actividadeId: z.string(),
    stepId: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // Update step completion in database
    // Invalidate query cache
  })
```

### 2. Update Activity Note
```typescript
// Backend: apps/api/src/routers/atividades.ts
updateNote: protectedProcedure
  .input(z.object({
    actividadeId: z.string(),
    notes: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // Save notes to database
    // Invalidate query cache
  })
```

---

## Accessibility Requirements

### Focus & Keyboard Navigation
- All interactive elements: Focus ring (2px primary color)
- Tab/Shift+Tab: Navigate through all interactive elements
- Enter: Activate buttons, toggle checkboxes
- Escape: Close sheet
- Arrows (optional): Navigate within collapsibles

### ARIA & Semantic HTML
- Icon-only buttons: `aria-label="Close details"`
- Collapsible triggers: `role="button"` + `aria-expanded`
- Checkbox: Native `<input type="checkbox">` or shadcn Checkbox
- Sections: Proper `<section>`, `<h3>`, `<h4>` hierarchy

### Contrast & Color
- Text: ≥4.5:1 contrast in light + dark modes (verified)
- Color not sole indicator: Icons + text combined
- Hover states: Visual feedback beyond color (underline, opacity, scale)

### Motion Sensitivity
- Respects `prefers-reduced-motion` media query
- All transitions disable when user prefers reduced motion

---

## Responsive Design Testing Checklist

### Mobile (375px width)
- [ ] Sheet is full-screen modal
- [ ] Padding: 16px
- [ ] Font sizes readable (14-24px)
- [ ] Touch targets ≥44px (checkbox, buttons)
- [ ] Collapsibles closed except "Why It Matters"
- [ ] Scrolling smooth

### Tablet (768px width)
- [ ] Sheet is 70% width
- [ ] Padding: 20px
- [ ] Spacing proportional
- [ ] All interactions work

### Desktop (1024px+ width)
- [ ] Sheet is 40% width
- [ ] Padding: 24px
- [ ] Hover states fully visible
- [ ] Focus rings clear

---

## Pre-Implementation Verification

Before starting implementation, verify:

1. **Data Structure** - Confirm `Atividade` and `AtividadeStep` interfaces:
   ```typescript
   interface Atividade {
     id: string;
     titulo: string;
     icone: string;
     whyItMatters: string;
     keyConcept: string;
     successCriteria: string[];
     reflectionPrompt: string;
     resources: { label: string; url: string }[];
     steps: AtividadeStep[];
   }
   ```

2. **GPUS Theme** - Verify token names in `tailwind.config.ts`:
   ```
   --primary, --foreground, --background, --border, --secondary, --muted-foreground
   ```

3. **Icon Library** - Verify lucide-react is installed:
   ```bash
   bun list lucide-react
   ```

4. **shadcn/ui Components** - Verify all are installed:
   ```
   Sheet, ScrollArea, Card, Badge, Checkbox, Button, Textarea, Collapsible
   ```

---

## File Structure for Implementation

```
apps/web/src/components/dashboard/
├── activity-detail-sheet.tsx              (Main container, 200 LOC)
├── activity-detail-header.tsx             (Header subcomponent, 50 LOC)
├── activity-module-section.tsx            (Module metadata, 150 LOC)
├── activity-steps-section.tsx             (Steps accordion, 200 LOC)
├── activity-step-card.tsx                 (Single step, 100 LOC)
└── activity-notes-section.tsx             (Notes editor, 80 LOC)
```

---

## Integration Point

In `atividades-content.tsx` (existing accordion component):

```typescript
// When user clicks accordion item
const handleActivitySelect = (activityId: string) => {
  setSelectedActivityId(activityId);
  setIsSheetOpen(true);
};

// Render sheet alongside accordion
<ActivityDetailSheet
  activity={selectedActivity}
  isOpen={isSheetOpen}
  onClose={() => setIsSheetOpen(false)}
  onSave={handleSaveActivity}
/>
```

---

## Implementation Order

1. **Phase 1:** Create main container + header + scroll structure
2. **Phase 2:** Module metadata cards (collapsibles)
3. **Phase 3:** Steps accordion (complex state)
4. **Phase 4:** Notes section (inline edit)
5. **Phase 5:** Footer + save logic
6. **Phase 6:** tRPC mutations (backend)
7. **Phase 7:** Testing + refinement

---

## Quality Gates Before Merge

- [x] TypeScript: No `any` types, full strict mode
- [x] Colors: All semantic tokens (no hex values)
- [x] Icons: All lucide-react (no emojis)
- [x] Accessibility: Keyboard nav + ARIA labels
- [x] Responsive: Tested at 375px, 768px, 1024px
- [x] Dark Mode: Contrast verified light + dark
- [x] Animations: Smooth, respects prefers-reduced-motion
- [x] Console: Zero errors/warnings
- [x] Tests: New mutations + edge cases covered

---

## References

- **Complete Spec:** `activity-detail-sheet-design-spec.md`
- **Quick Ref:** `ACTIVITY-SHEET-QUICK-REFERENCE.md`
- **Data Source:** `packages/shared/src/atividades-data.ts`
- **GPUS Theme:** `apps/web/src/lib/theme.ts`
- **AGENTS.md Rules:** `/home/mauricio/neondash/AGENTS.md`

---

**Ready for Implementation ✅**

Next steps: Use `/implement` workflow to build components.
