# NeonDash Activity Detail Sheet — Complete Design Specification

**Project:** NeonDash Mentorship Performance Dashboard  
**Component:** Notion-style Sidebar Panel for Activity Details  
**Created:** 2026-02-25  
**Complexity:** L4 (Multi-section, rich interactions, state management)

---

## Executive Summary

This specification describes a **Notion-style sidebar sheet** that displays complete activity details in the NeonDash mentorship dashboard. The sheet opens from the right, showing:

- **Module-level metadata** (Why It Matters, Key Concept, Success Criteria, Resources)
- **Atomic step details** (expandable accordion with "O Que", "Como", "Exemplo", "Critério")
- **Inline-editable notes** (Notion-style save-on-blur)
- **Progress tracking** (checkbox toggles per step)

The design combines **data-dense dashboard precision** with **editorial minimalism**, using GPUS tokens (Azul Petróleo + Gold), Fira Sans typography, and purposeful whitespace.

---

## 1. Design System Overview

### Pattern: Drill-Down Analytics + Editorial Polish

- Hierarchical summary-to-detail flow
- Expandable sections preserve context
- Print-inspired typography guides reading
- Minimal scaffolding, maximum clarity

### Visual Direction

**Not:**
- Glassmorphism, Bento grids, busy patterns, heavy borders

**Yes:**
- Quiet spacing, Fira fonts, single-column layout, GPUS color accents, clear hierarchy

---

## 2. Colors (GPUS Tokens ONLY)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | Gold 38 60% 45% | Amber 43 96% 56% | Headers, active states |
| `--foreground` | Petróleo 203 65% 26% | Slate 50 210 40% 98% | Body text |
| `--background` | Slate 50 210 40% 98% | Slate 950 222 47% 6% | Sheet bg |
| `--muted-foreground` | Slate 400 | Slate 400 | Secondary text, metadata |
| `--border` | Slate 200 | Slate 800 | Dividers, separators |
| `--secondary` | Gold 48 100% 72% | Petróleo 203 65% 26% | Badge backgrounds |

---

## 3. Typography

**Fonts:** Fira Sans (headings, body) + Fira Code (metadata/technical)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Sheet Title | 24px | 700 | 1.2 |
| Module Header | 14px | 600 | 1.4 |
| Step Title | 16px | 600 | 1.4 |
| Body Text | 14px | 400 | 1.6 |
| Metadata | 12px | 400 | 1.5 |

---

## 4. Layout Architecture

### Responsive Dimensions

| Breakpoint | Width | Padding |
|-----------|-------|---------|
| Mobile ≤640px | 100% | 16px |
| Tablet 641-1024px | 70% / 560px | 20px |
| Desktop >1024px | 40% / 520px | 24px |

### Structure

```
┌──────────────────────────────────┐
│ [HEADER - Sticky, 56px]          │
│ Activity Title + Close Button    │
├──────────────────────────────────┤
│ [SCROLLABLE CONTENT]             │
│                                  │
│ 1. Module Metadata (24px gap)    │
│    ├─ Why It Matters (open)      │
│    ├─ Key Concept (open)         │
│    ├─ Success Criteria (closed)  │
│    ├─ Reflection Prompt (closed) │
│    └─ Resources (closed)         │
│                                  │
│ 2. Steps Section (32px gap)      │
│    ├─ Step 1 (expandable)        │
│    ├─ Step 2...                  │
│    └─ Step N...                  │
│                                  │
│ 3. Notes Section (28px gap)      │
│    └─ Inline-edit textarea       │
│                                  │
├──────────────────────────────────┤
│ [FOOTER - Sticky, 60px]          │
│ Cancel Link + Save Button        │
└──────────────────────────────────┘
```

---

## 5. Component Inventory (shadcn/ui)

| Component | Purpose | Notes |
|-----------|---------|-------|
| `Sheet` | Sidebar container | Slides from right |
| `ScrollArea` | Content scroll zone | Custom scrollbar |
| `Card` | Metadata cards | Left border accent |
| `Badge` | Duration, status | 12px Fira Code |
| `Checkbox` | Step completion | 20x20px, animates |
| `Button` | Actions | Primary + Ghost variants |
| `Textarea` | Notes | Auto-expands on typing |
| `Collapsible` | Expandable sections | Smooth 300ms reveal |

---

## 6. Detailed Sections

### 6.1 Header (Fixed)
- Icon (24x24px) + Title (24px/700) + Close button
- Sticky to top, border-bottom, z-index 10

### 6.2 Module Metadata Cards
- **Why It Matters** (open by default, icon: CheckCircle2)
- **Key Concept** (always open, icon: Lightbulb)
- **Success Criteria** (closed, collapsible list with count badge)
- **Reflection Prompt** (closed)
- **Resources** (closed, list of links)

All cards have:
- Left border: `border-l-4 border-primary`
- Background: `bg-secondary/5`
- Padding: 16px

### 6.3 Steps Accordion
- **Only one step expanded at a time**
- Header shows: `☐ ⏱ 5 min | [>] Step 1: O Que...`
- Expanded content:
  - **COMO** (methods list, always visible)
  - **EXEMPLO** (text, collapsible)
  - **CRITÉRIO** (text, collapsible)

### 6.4 Notes Section (Notion-style)
- Idle: Read-only text display
- Click/Focus: Auto-expanding textarea
- Blur: Auto-save via tRPC

### 6.5 Footer (Fixed)
- Cancel (ghost) + Save (primary)

---

## 7. Animations & Interactions

| Interaction | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Sheet enter/exit | 300ms / 200ms | ease-out | Slide from right |
| Checkbox toggle | 200ms | ease | Scale 1→1.1→1, color change |
| Chevron rotate | 200ms | ease | 0° → 180° |
| Collapsible reveal | 300ms | ease | Height + opacity transition |
| Textarea expand | Smooth | — | Max 300px, grows on typing |
| Hover states | 150ms | ease | `bg-secondary/5`, opacity changes |

---

## 8. Responsive Behavior

### Mobile (≤640px)
- Full-screen modal
- Padding: 16px
- Font sizes: -1px
- Collapsibles closed except "Why It Matters"

### Tablet (641-1024px)
- 70% width, slide-in from right
- Padding: 20px

### Desktop (>1024px)
- 40% width, slide-in from right
- Padding: 24px
- Full hover states visible

---

## 9. State Management

### Local React State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
const [stepCompletion, setStepCompletion] = useState<Record<string, boolean>>({});
const [isEditingNotes, setIsEditingNotes] = useState(false);
const [notes, setNotes] = useState(activityNotes);
const [isSaving, setIsSaving] = useState(false);
```

### tRPC Mutations
- **Toggle Step:** `api.atividades.toggleStep({ actividadeId, stepId })`
- **Update Notes:** `api.atividades.updateNote({ actividadeId, notes })`

### Optimistic Updates
- Step toggle: Update UI immediately, sync in background
- Notes: Update textarea immediately, disable button during save

---

## 10. Accessibility

- [x] Focus rings: 2px primary color on all interactive elements
- [x] Keyboard nav: Tab, Shift+Tab, Enter, Escape
- [x] ARIA labels on icon-only buttons
- [x] Semantic HTML: `<section>`, `<h3>`, `<h4>`
- [x] Contrast: ≥4.5:1 in light + dark modes
- [x] Motion: Respects `prefers-reduced-motion`
- [x] Scrollbar: Custom but visible + accessible

---

## 11. Pre-Delivery Checklist

**Visual:**
- [ ] No hardcoded hex colors (GPUS tokens only)
- [ ] All icons from `lucide-react`
- [ ] Fira fonts imported correctly
- [ ] Hover states smooth (no layout shifts)
- [ ] No emojis as UI icons

**Interaction:**
- [ ] Sheet opens/closes smoothly from right
- [ ] Checkbox toggles animate smoothly
- [ ] Collapsibles expand without jumps
- [ ] Notes auto-save on blur
- [ ] Focus rings visible for keyboard users

**Responsive:**
- [ ] Works at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on any breakpoint
- [ ] Touch targets ≥44px on mobile

**Accessibility:**
- [ ] Tab navigation works throughout
- [ ] Screen reader labels present
- [ ] Color not the only indicator
- [ ] Dark mode readable

---

## 12. File Structure

```
apps/web/src/components/dashboard/
├── activity-detail-sheet.tsx         (Main container)
├── activity-detail-header.tsx        (Header subcomponent)
├── activity-module-section.tsx       (Module metadata)
├── activity-steps-section.tsx        (Steps accordion)
├── activity-step-card.tsx            (Single step)
└── activity-notes-section.tsx        (Notes editor)
```

---

## 13. Success Criteria

✅ Sheet opens/closes with backdrop fade  
✅ Module metadata cards display with left accent border  
✅ "Success Criteria", "Resources" toggle smoothly  
✅ Steps accordion (one open at a time)  
✅ Checkbox updates optimistically → saves to backend  
✅ Notes auto-expand → auto-save on blur  
✅ Dark/light mode no contrast issues  
✅ Mobile responsive at 375px  
✅ Keyboard navigation (Tab, Enter, Escape)  
✅ No console errors  

---

**Design Specification Completed:** 2026-02-25  
**Format:** Markdown + React + Tailwind CSS 4 + shadcn/ui
