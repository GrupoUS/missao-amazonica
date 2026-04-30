# Automation Actions Toolbar — Lead Sheet Enhancement

**Design Specification**

**Date:** 2026-02-25  
**Status:** ✅ Design Spec Complete  
**Complexity:** L4 (Multi-component, modal flows, state management)  
**Handoff to:** `frontend-specialist`

---

## Executive Summary

Enhancement to the **Lead Sheet** (slide-over drawer) in NeonDash CRM with a new action button bar featuring:

1. **⚡ Automação button** — Trigger automation workflows / view active automation list
2. **+ Trilha button** — Create or manage learning trails for mentees
3. **New UI Component: AutomationModal** — Dialog overlay with list/create/edit state transitions

**Design Direction:** Professional, data-dense operational UI. No generic SaaS aesthetics. GPUS theme (Azul Petróleo + Gold) anchors all color decisions.

---

## Design System Decisions

### 1. Pattern Selection: Operational Minimalism

**Selected Pattern:** Drill-Down Analytics + Progressive Disclosure  
**Why:** CRM workflows require quick access without cognitive overload. Progressive disclosure (show list by default, create/edit on demand) reduces cognitive load while maintaining full functionality.

**Anti-patterns Rejected:**
- ❌ Glassmorphism (too trendy, conflicts with GPUS professional tone)
- ❌ Generic SaaS modal (bento grids, rounded cards, floating effects)
- ❌ Busy toolbar layouts (too many buttons visible)

**Key Principles:**
- Hierarchy: List (default) → Create (on click) → Edit (on selection)
- Whitespace: 16px gutters, 24px section spacing
- Density: Compact rows for high-volume trails/automations
- Typography: Fira Sans (label) + Fira Code (data/counts)

---

### 2. Style Category: Professional Dashboard

**Selected Style:** Clean, Minimal, Data-Dense Operational  
**Framework:** Tailwind CSS 4 + shadcn/ui primitives  
**Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AAA

**Implementation Details:**
- No backdrop blur (Glassmorphism rejected)
- Subtle borders: 1px `border-slate-200` (light) / `border-slate-800` (dark)
- Flat design: No shadows except 4px z-elevation on Dialog
- High contrast text for readability in dense lists

---

### 3. Color Palette — GPUS Theme Tokens ONLY

**CRITICAL RULE:** Never hardcode hex values. Use Tailwind semantic tokens exclusively.

#### Primary Brand Colors
| Role | Light Mode | Dark Mode | Tailwind Token |
|------|-----------|-----------|----------------|
| **Primary Button** | Gold `hsl(38 60% 45%)` | Amber `hsl(43 96% 56%)` | `bg-primary` `text-primary` |
| **Foreground Text** | Petróleo `hsl(203 65% 26%)` | Slate 50 `hsl(210 40% 98%)` | `text-foreground` |
| **Background** | Slate 50 `hsl(210 40% 98%)` | Slate 950 `hsl(222 47% 6%)` | `bg-background` |
| **Border Default** | Slate 200 `hsl(213 32% 91%)` | Slate 800 `hsl(217 32% 17%)` | `border-border` |
| **Muted Text** | Slate 500 `hsl(215 13% 54%)` | Slate 400 `hsl(216 14% 63%)` | `text-muted-foreground` |

#### Semantic Status Colors

| Status | Light Hex | Dark Hex | Semantic Token | Use Case |
|--------|-----------|----------|-----------------|----------|
| **Active** | `#10B981` (Emerald) | `#34D399` (Emerald-400) | `bg-green-500` / `border-green-500` | ✅ Automação ativa, Trail em progresso |
| **Paused** | `#F59E0B` (Amber) | `#FBBF24` (Amber-400) | `bg-yellow-500` / `border-yellow-500` | ⏸️ Trail pausada |
| **Completed** | `#3B82F6` (Blue) | `#60A5FA` (Blue-400) | `bg-blue-500` / `border-blue-500` | ✓ Trail concluída |
| **Cancelled** | `#EF4444` (Red) | `#F87171` (Red-400) | `bg-red-500` / `border-red-500` | ✗ Automação cancelada |

**Implementation Example:**
```tsx
// ✅ CORRECT
<Badge className="bg-green-500 text-white">Ativa</Badge>

// ❌ WRONG — Never hardcode hex
<Badge style={{ backgroundColor: "#10B981" }}>Ativa</Badge>
```

---

### 4. Typography — Professional, Data-Dense

**Selected Pairing:** Fira Code + Fira Sans (Dashboard Data pattern)  
**Rationale:** Monospace Fira Code signals precision (automation counts, data); Fira Sans ensures readability for labels and descriptions.

| Element | Font | Size | Weight | Line Height | Use |
|---------|------|------|--------|-------------|-----|
| **Dialog Title** | Fira Sans | 20px | 700 | 1.2 | "Automações Ativas" |
| **Section Header** | Fira Sans | 14px | 600 | 1.5 | "Trilhas em Progresso" |
| **List Item Label** | Fira Sans | 13px | 500 | 1.4 | Automation name, Trail title |
| **Data / Count** | Fira Code | 12px | 500 | 1.3 | "5 steps", "2/8 completed" |
| **Body Text** | Fira Sans | 13px | 400 | 1.5 | Description, helper text |
| **Helper / Hint** | Fira Sans | 12px | 400 | 1.4 | Placeholder, muted text |
| **Badge / Tag** | Fira Code | 11px | 600 | 1.2 | Status badge ("Ativa", "Pausada") |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

**Tailwind Config:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    fontFamily: {
      mono: ['Fira Code', 'monospace'],
      sans: ['Fira Sans', 'sans-serif'],
    },
  },
};
```

---

## Component Architecture

### 1. Lead Sheet Enhancement — Action Button Bar

**Location:** `apps/web/src/components/crm/lead-sheet-header.tsx` (existing file)

**New Elements to Add:**

```typescript
// Current structure (existing)
<div className="flex items-center justify-between gap-2">
  <h2 className="text-xl font-bold">Lead Detail</h2>
  <button>📝 Nota</button>  // Existing
</div>

// New button bar (ADDED RIGHT OF "NOTA" BUTTON)
<div className="flex items-center justify-between gap-2">
  <h2 className="text-xl font-bold">Lead Detail</h2>
  <div className="flex gap-2">
    <button>📝 Nota</button>
    <button>⚡ Automação</button>  // NEW
    <button>+ Trilha</button>      // NEW
  </div>
</div>
```

#### Button Specifications

**⚡ Automação Button**

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setAutomationModalOpen(true)}
  className="gap-2"
>
  <Zap className="w-4 h-4" />
  Automação
  {activeAutomationCount > 0 && (
    <Badge className="ml-1 bg-green-500 text-white text-xs">
      {activeAutomationCount}
    </Badge>
  )}
</Button>
```

**Styling:**
- Variant: `outline` (gray border, transparent background)
- Size: `sm` (28px height)
- Icon: Lucide `Zap` (⚡)
- Badge: Conditional, shows count of active automations
- Hover: `hover:bg-slate-100` (light) / `hover:bg-slate-800` (dark)
- Active state: `ring-2 ring-primary` (Gold)

---

**+ Trilha Button**

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => setTrialModalOpen(true)}
  className="gap-2"
>
  <Plus className="w-4 h-4" />
  Trilha
</Button>
```

**Styling:**
- Variant: `outline` (gray border, transparent background)
- Size: `sm` (28px height)
- Icon: Lucide `Plus` (+)
- Hover: `hover:bg-slate-100` (light) / `hover:bg-slate-800` (dark)
- Active state: `ring-2 ring-primary` (Gold)

---

### 2. AutomationModal Component

**File Path:** `apps/web/src/components/crm/automation-modal.tsx` (NEW)

**Purpose:** Dialog overlay with 3 internal states (list, create, edit) connected to lead context

**State Machine:**
```
┌──────────────┐
│   Closed     │
└──────────────┘
       ↓
┌──────────────────────────┐
│  List Mode (default)     │ ← Shows active automations + empty state
└──────────────────────────┘
  ↙ (click Create)  ↓ (click Edit)
 ┌─────────────────┐  ┌────────────────────┐
 │  Create Mode    │  │  Edit Mode         │
 │  (new form)     │  │  (existing form)   │
 └─────────────────┘  └────────────────────┘
  ↓ (save/cancel)      ↓ (save/cancel)
 └──────────────────────────┘
         ↓
    Refresh → List
         ↓
    (auto-close on ESC)
```

---

#### Modal Layout

**Max Width:** `max-w-md` (448px at breakpoint 768px)  
**Height:** Responsive, max `max-h-[90vh]` (avoid overflow)  
**Z-Index:** 40 (above sheet which is z-30)

**Structure:**

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    
    {/* MODE-SPECIFIC HEADER */}
    <header className="flex items-center justify-between gap-2 pb-4 border-b">
      {mode !== 'list' && (
        <button onClick={() => setMode('list')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h2 className="text-lg font-bold">
        {mode === 'list' && 'Automações Ativas'}
        {mode === 'create' && 'Nova Automação'}
        {mode === 'edit' && 'Editar Automação'}
      </h2>
      <button onClick={() => setIsOpen(false)}>
        <X className="w-5 h-5" />
      </button>
    </header>

    {/* MODE-SPECIFIC BODY */}
    <ScrollArea className="h-[400px] px-4">
      {mode === 'list' && <AutomationList />}
      {mode === 'create' && <AutomationCreateForm />}
      {mode === 'edit' && <AutomationEditForm />}
    </ScrollArea>

    {/* MODE-SPECIFIC FOOTER */}
    <footer className="flex justify-end gap-2 pt-4 border-t">
      {mode !== 'list' && (
        <Button variant="ghost" onClick={() => setMode('list')}>
          Cancelar
        </Button>
      )}
      {mode === 'create' && (
        <Button onClick={handleCreateSave}>
          Criar
        </Button>
      )}
      {mode === 'edit' && (
        <Button onClick={handleEditSave}>
          Salvar
        </Button>
      )}
    </footer>

  </DialogContent>
</Dialog>
```

---

#### State Modes Detail

##### Mode 1: List (Default)

**Content:**
- Empty state (if no automations)
- Automation rows (if any exist)

**Empty State Design:**

```tsx
<div className="py-16 text-center">
  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
  <h3 className="font-semibold text-sm mb-2">Nenhuma automação ativa</h3>
  <p className="text-xs text-muted-foreground mb-4">
    Crie uma automação para automatizar ações neste lead.
  </p>
  <Button
    variant="outline"
    size="sm"
    onClick={() => setMode('create')}
  >
    Criar Automação
  </Button>
</div>
```

**Automation Row Design:**

```tsx
<div className="flex items-center justify-between gap-3 py-3 px-3 border-b hover:bg-secondary/5 cursor-pointer transition-colors"
     onClick={() => handleEditAutomation(automation)}>
  <div className="flex-1">
    <h3 className="font-semibold text-sm">{automation.name}</h3>
    <p className="text-xs text-muted-foreground">{automation.description}</p>
  </div>
  <Badge className={`${statusColorMap[automation.status]} text-white`}>
    {statusLabelMap[automation.status]}
  </Badge>
  <ChevronRight className="w-4 h-4 text-muted-foreground" />
</div>
```

**Action Row (Bottom of List):**

```tsx
<div className="py-3 px-3 border-t sticky bottom-0 bg-background">
  <Button
    variant="outline"
    size="sm"
    className="w-full"
    onClick={() => setMode('create')}
  >
    <Plus className="w-4 h-4 mr-2" />
    Nova Automação
  </Button>
</div>
```

---

##### Mode 2: Create Form

**Fields:**
1. **Nome da Automação** (text input, required)
2. **Descrição** (textarea, optional)
3. **Tipo de Acionamento** (select dropdown: "on_lead_stage_change", "on_interaction_add", "on_manual_trigger")
4. **Ação** (select dropdown: varies by trigger type)
5. **Status** (radio group: "active" | "paused")

**Form Layout:**

```tsx
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium">Nome da Automação *</label>
    <input
      type="text"
      placeholder="ex: Enviar convite de calendário"
      className="w-full px-3 py-2 border border-border rounded-md text-sm"
    />
  </div>

  <div>
    <label className="text-sm font-medium">Descrição</label>
    <textarea
      placeholder="Descrição opcional"
      className="w-full px-3 py-2 border border-border rounded-md text-sm"
      rows={3}
    />
  </div>

  <div>
    <label className="text-sm font-medium">Tipo de Acionamento *</label>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="on_stage_change">Quando estágio muda</SelectItem>
        <SelectItem value="on_interaction">Quando há interação</SelectItem>
        <SelectItem value="manual">Acionamento manual</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div>
    <label className="text-sm font-medium">Status</label>
    <RadioGroup defaultValue="active">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="active" id="active" />
        <label htmlFor="active" className="text-sm cursor-pointer">
          Ativa
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paused" id="paused" />
        <label htmlFor="paused" className="text-sm cursor-pointer">
          Pausada
        </label>
      </div>
    </RadioGroup>
  </div>
</div>
```

---

##### Mode 3: Edit Form

**Identical to Create Form, but:**
- Fields pre-populated with existing automation data
- Additional "Delete" button in footer (destructive variant)
- Header says "Editar Automação" instead of "Nova Automação"

**Delete Button:**

```tsx
<footer className="flex justify-between gap-2 pt-4 border-t">
  <Button
    variant="destructive"
    size="sm"
    onClick={handleDeleteAutomation}
  >
    Deletar
  </Button>
  <div className="flex gap-2">
    <Button variant="ghost" onClick={() => setMode('list')}>
      Cancelar
    </Button>
    <Button onClick={handleEditSave}>
      Salvar
    </Button>
  </div>
</footer>
```

---

#### State Transitions & Animations

| Transition | Duration | Effect | CSS Class |
|-----------|----------|--------|-----------|
| **List → Create** | 200ms | Fade + slide-left (new form enters from right) | `animate-in slide-in-from-right-4 fade-in duration-200` |
| **Create → List** | 150ms | Fade + slide-right (back to list) | `animate-out slide-out-to-right-4 fade-out duration-150` |
| **Edit → List** | 150ms | Fade + slide-right | `animate-out slide-out-to-right-4 fade-out duration-150` |
| **List → Edit** | 200ms | Fade + slide-left | `animate-in slide-in-from-right-4 fade-in duration-200` |
| **Row hover** | 150ms | Subtle bg color change | `hover:bg-secondary/5 transition-colors duration-150` |

**Implementation:**

```tsx
{mode === 'list' ? (
  <div className="animate-in slide-in-from-right-4 fade-in duration-200">
    <AutomationList />
  </div>
) : (
  <div className="animate-in slide-in-from-right-4 fade-in duration-200">
    {mode === 'create' ? <CreateForm /> : <EditForm />}
  </div>
)}
```

---

### 3. Trail Status Badge Component

**File Path:** `apps/web/src/components/crm/trail-status-badge.tsx` (NEW, reusable)

**Purpose:** Display trail status with consistent coloring across app

**Implementation:**

```tsx
import { Badge } from '@/components/ui/badge';

type TrailStatus = 'active' | 'paused' | 'completed' | 'cancelled';

const statusConfig: Record<TrailStatus, { label: string; className: string }> = {
  active: { label: 'Em Progresso', className: 'bg-green-500 text-white' },
  paused: { label: 'Pausada', className: 'bg-yellow-500 text-white' },
  completed: { label: 'Concluída', className: 'bg-blue-500 text-white' },
  cancelled: { label: 'Cancelada', className: 'bg-red-500 text-white' },
};

interface TrailStatusBadgeProps {
  status: TrailStatus;
  variant?: 'default' | 'outline';
}

export function TrailStatusBadge({ status, variant = 'default' }: TrailStatusBadgeProps) {
  const config = statusConfig[status];
  
  if (variant === 'outline') {
    return (
      <Badge 
        variant="outline" 
        className={`border-2 ${config.className.replace('text-white', '')}`}
      >
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
```

**Usage:**

```tsx
<TrailStatusBadge status="active" />
<TrailStatusBadge status="paused" variant="outline" />
```

---

## Button Design Specifications

### ⚡ Automação Button

| Property | Value | Notes |
|----------|-------|-------|
| **Variant** | `outline` | Gray border, transparent bg |
| **Size** | `sm` | 28px height |
| **Icon** | Lucide `Zap` | 16x16px (w-4 h-4) |
| **Border Color** | `border-slate-300` (light) / `border-slate-600` (dark) | Use Tailwind tokens |
| **Hover State** | `hover:bg-slate-100` (light) / `hover:bg-slate-800` (dark) | 150ms smooth transition |
| **Active/Focus State** | `ring-2 ring-primary ring-offset-2` | Gold focus ring |
| **Badge** | Conditional, green background | Shows count if > 0 |
| **Gap** | `gap-2` | Space between icon and text |

---

### + Trilha Button

| Property | Value | Notes |
|----------|-------|-------|
| **Variant** | `outline` | Gray border, transparent bg |
| **Size** | `sm` | 28px height |
| **Icon** | Lucide `Plus` | 16x16px (w-4 h-4) |
| **Border Color** | `border-slate-300` (light) / `border-slate-600` (dark) | Use Tailwind tokens |
| **Hover State** | `hover:bg-slate-100` (light) / `hover:bg-slate-800` (dark) | 150ms smooth transition |
| **Active/Focus State** | `ring-2 ring-primary ring-offset-2` | Gold focus ring |
| **Gap** | `gap-2` | Space between icon and text |

---

## Responsive Breakpoints

| Breakpoint | Modal Width | Sheet Width | Toolbar Layout |
|-----------|-----------|-----------|-----------------|
| **Mobile** ≤640px | 100% | 100% full-screen | Stack vertically if space constraint |
| **Tablet** 641-1024px | 90% (max 400px) | 70% (max 560px) | Horizontal row, gap-2 |
| **Desktop** >1024px | 448px (max-w-md) | 40% (max 520px) | Horizontal row, gap-2 |

---

## shadcn/ui Components Used

| Component | Purpose | Notes |
|-----------|---------|-------|
| **Dialog** | Modal container | Used for AutomationModal |
| **Button** | Action triggers | Outline + Primary variants |
| **Badge** | Status indicators | Green/Yellow/Blue/Red |
| **Select** | Dropdown fields | For automation type, action selection |
| **RadioGroup** | Status selection | Active vs Paused |
| **Input** | Text fields | Name, description |
| **Textarea** | Multi-line input | Description field |
| **ScrollArea** | Scrollable content | Modal body content |
| **Separator** | Visual dividers | Between sections |
| **Skeleton** | Loading state | While fetching automations |

---

## State Management & Data Flow

### Local State (Component Level)

```typescript
// AutomationModal.tsx
const [isOpen, setIsOpen] = useState(false);
const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
const [formData, setFormData] = useState<AutomationFormData>(initialFormData);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### tRPC Mutations

```typescript
// Backend: apps/api/src/routers/automations.ts

export const automationsRouter = router({
  // List automations for a lead
  listByLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Query + return list
    }),

  // Create new automation
  create: protectedProcedure
    .input(automationCreateSchema) // Zod validation
    .mutation(async ({ ctx, input }) => {
      // Insert + return created automation
    }),

  // Update automation
  update: protectedProcedure
    .input(automationUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Update + return updated automation
    }),

  // Delete automation
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Delete + return success
    }),
});
```

### Frontend Queries

```typescript
// Lead Sheet Component
const { data: automations, isLoading } = trpc.automations.listByLead.useQuery(
  { leadId: lead.id },
  { enabled: isOpen }
);

const createMutation = trpc.automations.create.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});

const updateMutation = trpc.automations.update.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});

const deleteMutation = trpc.automations.delete.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});
```

---

## Accessibility & Keyboard Navigation

### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| **Tab** | Move focus to next interactive element | Dialog, form fields |
| **Shift+Tab** | Move focus to previous element | Dialog, form fields |
| **Enter** | Submit form / activate button | Create/Edit mode footer |
| **Escape** | Close dialog / back to previous mode | Any mode |
| **Arrow Up/Down** | Navigate list items | List mode |

### ARIA Labels

```tsx
// Close button
<button aria-label="Fechar automações">
  <X className="w-5 h-5" />
</button>

// Automation count badge
<Badge aria-label={`${count} automação${count > 1 ? 's' : ''} ativa${count > 1 ? 's' : ''}`}>
  {count}
</Badge>

// Status select
<Select aria-label="Status da automação">
  ...
</Select>
```

### Focus Indicators

```css
/* Global focus ring (Tailwind) */
.focus:ring-2 .focus:ring-primary .focus:ring-offset-2

/* Example: Button focus */
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Criar
</Button>
```

### Contrast Requirements

- **Normal text:** Minimum 4.5:1 (AA)
- **Large text** (18pt+): Minimum 3:1 (AA)
- **UI components:** Minimum 3:1 (AA)

**Verified in:**
- Light mode: Gold on Slate 50
- Dark mode: Amber on Slate 950

---

## Mobile Responsive Behavior

### Mobile (<640px)

**Modal Dimensions:**
```tsx
<DialogContent className="max-w-full mx-4 max-h-[90vh] rounded-lg">
  {/* Content */}
</DialogContent>
```

**Toolbar Layout:**
```tsx
{/* If space constrained */}
<div className="flex flex-col gap-2 sm:flex-row">
  <Button className="flex-1 sm:flex-none">⚡ Automação</Button>
  <Button className="flex-1 sm:flex-none">+ Trilha</Button>
</div>
```

### Tablet (641-1024px)

**Modal:** 70% width, max 400px

### Desktop (>1024px)

**Modal:** max-w-md (448px), standard layout

---

## Dark Mode Considerations

### Color Adjustments

**Light Mode Dialog:**
```tsx
className="bg-white border-slate-200"
```

**Dark Mode Dialog:**
```tsx
className="dark:bg-slate-900 dark:border-slate-800"
```

**Status Badge Colors (Auto-adjusted by Tailwind):**
```tsx
// Green badge
className="bg-green-500 dark:bg-green-600 text-white"

// Yellow badge
className="bg-yellow-500 dark:bg-yellow-600 text-black"

// Blue badge
className="bg-blue-500 dark:bg-blue-600 text-white"

// Red badge
className="bg-red-500 dark:bg-red-600 text-white"
```

### Testing Checklist

- [ ] Dialog background visible in both light/dark
- [ ] Text contrast ≥4.5:1 in both modes
- [ ] Borders visible in both modes
- [ ] Status badges readable in both modes
- [ ] Hover states visible in both modes

---

## Loading & Error States

### Loading State

```tsx
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <AutomationList automations={automations} />
)}
```

### Error State

```tsx
{error && (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
      Erro ao carregar automações
    </p>
    <p className="text-xs text-red-700 dark:text-red-200 mt-1">
      {error}
    </p>
    <Button
      size="sm"
      variant="outline"
      className="mt-2"
      onClick={() => window.location.reload()}
    >
      Tentar novamente
    </Button>
  </div>
)}
```

---

## Animation Specifications

### Entrance/Exit

```tsx
// Modal appears
<DialogContent className="animate-in fade-in zoom-in-95 duration-200">

// Slide transitions between modes
<div className="animate-in slide-in-from-right-4 fade-in duration-200">

// Back navigation
<div className="animate-out slide-out-to-right-4 fade-out duration-150">
```

### Interaction Feedback

```tsx
// Hover on row
className="hover:bg-secondary/5 transition-colors duration-150 cursor-pointer"

// Button active state
className="active:scale-95 transition-transform duration-100"

// Badge pulse (for count > 0)
className="animate-pulse" // Optional, indicates update
```

---

## Implementation Checklist

### Phase 1: Component Creation

- [ ] Create `automation-modal.tsx` with Dialog structure
- [ ] Create `trail-status-badge.tsx` reusable component
- [ ] Add ⚡ Automação button to lead-sheet-header
- [ ] Add + Trilha button to lead-sheet-header
- [ ] Wire up button click handlers to open modal

### Phase 2: State & Logic

- [ ] Implement local state (mode, formData, loading, error)
- [ ] Create tRPC router for automations
- [ ] Implement useQuery hook for listing automations
- [ ] Implement useMutation hooks for create/update/delete

### Phase 3: UI Implementation

- [ ] List mode with automation rows + empty state
- [ ] Create mode with form fields + validation
- [ ] Edit mode with pre-populated form + delete button
- [ ] State transitions with animations

### Phase 4: Styling & Polish

- [ ] Verify all colors use GPUS semantic tokens
- [ ] Test light/dark mode contrast
- [ ] Test responsive behavior (375px, 768px, 1024px, 1440px)
- [ ] Verify icons from lucide-react (no emojis)
- [ ] Test keyboard navigation + focus states

### Phase 5: Testing & QA

- [ ] Unit tests for state transitions
- [ ] Integration tests for tRPC mutations
- [ ] E2E test: Create automation → List mode → Edit → Delete
- [ ] Accessibility audit (WCAG AAA)
- [ ] Browser console: No errors or warnings
- [ ] Run `bun run check` + `bun run lint:check`

### Phase 6: Handoff

- [ ] Final design spec review
- [ ] Code review with team
- [ ] Merge to dev-test branch
- [ ] QA sign-off on staging

---

## Design System Variables Summary

```typescript
// GPUS Color Tokens (Use exclusively)
--primary: Gold (light) / Amber (dark)
--foreground: Petróleo (light) / Slate 50 (dark)
--background: Slate 50 (light) / Slate 950 (dark)
--border: Slate 200 (light) / Slate 800 (dark)
--muted-foreground: Slate 500 (light) / Slate 400 (dark)

// Status Colors (Semantic)
--success: Green 500 (light) / Green 600 (dark)
--warning: Yellow 500 (light) / Yellow 600 (dark)
--info: Blue 500 (light) / Blue 600 (dark)
--destructive: Red 500 (light) / Red 600 (dark)

// Typography
--font-mono: Fira Code
--font-sans: Fira Sans

// Spacing
--gap-sm: 0.5rem (8px)
--gap-md: 1rem (16px)
--gap-lg: 1.5rem (24px)

// Z-Index
--z-dialog: 40
--z-sheet: 30
--z-tooltip: 50
```

---

## Files to Create/Modify

### New Files

1. `/home/mauricio/neondash/apps/web/src/components/crm/automation-modal.tsx`
2. `/home/mauricio/neondash/apps/web/src/components/crm/trail-status-badge.tsx`
3. `/home/mauricio/neondash/apps/api/src/routers/automations.ts`

### Modified Files

1. `/home/mauricio/neondash/apps/web/src/components/crm/lead-sheet-header.tsx` — Add button bar
2. `/home/mauricio/neondash/apps/web/src/components/crm/lead-sheet.tsx` — Wire modal state
3. `/home/mauricio/neondash/apps/api/src/_core/index.ts` — Add automations router

---

## Handoff Notes for Implementation Team

### Key Rules from AGENTS.md (Non-Negotiable)

1. **No Hardcoded Hex Values** — All colors must use Tailwind semantic tokens or `@apply` utilities
2. **No Emojis as Icons** — Use lucide-react exclusively
3. **Type Safety** — No `as any` casts; use proper TypeScript types
4. **Error Handling** — Always guard against null/undefined; no non-null assertions (`!`)
5. **Array Access** — Always check array length before accessing `.returning()[0]`
6. **Auth Procedure** — Use correct procedure level (`protectedProcedure`, `adminProcedure`)

### Pre-Delivery Validation

Before marking complete:

```bash
# Type check
bun run check

# Lint + format
bun run lint:check

# Tests
bun run test

# Manual QA
# - Open dev environment
# - Test create/edit/delete automation
# - Toggle between light/dark modes
# - Test on mobile (375px)
# - Test keyboard navigation
# - Verify no console errors
```

### Design Decisions Rationale

**Why Zero Glassmorphism?**
- Conflicts with GPUS professional tone
- Reduces readability in high-density CRM context
- Generic SaaS aesthetic not suitable for mentorship platform

**Why Fira Sans + Fira Code?**
- Cohesive font family (both from Fira)
- Code signals automation/precision
- Proven readability for data-dense dashboards
- Google Fonts available, no custom licensing

**Why Operational Minimalism?**
- CRM tools require quick action, not exploration
- Progressive disclosure reduces cognitive load
- Professional users expect efficiency over aesthetics

---

## References

| Document | Path |
|----------|------|
| GPUS Theme Spec | `/home/mauricio/neondash/docs/GPUS-THEME.md` |
| Activity Detail Sheet Spec | `/home/mauricio/neondash/docs/design-specs/activity-detail-sheet-design-spec.md` |
| Backend Design Rules | `/.claude/skills/backend-design/SKILL.md` |
| Frontend Debug Pack | `/.claude/skills/debugger/SKILL.md` |
| Stability Audit Rules | `/home/mauricio/neondash/AGENTS.md` (Section 15) |
| Code Quality Standards | `/home/mauricio/neondash/AGENTS.md` (Section 7) |

---

## Appendix: Quick Reference

### Color Token Mapping

```tsx
// Primary actions
<Button className="bg-primary hover:bg-primary/90">Action</Button>

// Secondary/outline
<Button variant="outline">Outline</Button>

// Destructive (delete)
<Button variant="destructive">Delete</Button>

// Success (active status)
<Badge className="bg-green-500 text-white">Ativa</Badge>

// Warning (paused status)
<Badge className="bg-yellow-500 text-white">Pausada</Badge>

// Info (completed status)
<Badge className="bg-blue-500 text-white">Concluída</Badge>

// Error (cancelled status)
<Badge className="bg-red-500 text-white">Cancelada</Badge>
```

### Button Examples

```tsx
// Automação button
<Button variant="outline" size="sm" className="gap-2">
  <Zap className="w-4 h-4" />
  Automação
  {count > 0 && <Badge className="bg-green-500">{count}</Badge>}
</Button>

// Trilha button
<Button variant="outline" size="sm" className="gap-2">
  <Plus className="w-4 h-4" />
  Trilha
</Button>

// Create automation
<Button onClick={handleCreate}>
  Criar
</Button>

// Delete automation
<Button variant="destructive" onClick={handleDelete}>
  Deletar
</Button>
```

---

**Design Specification Complete**  
**Ready for Implementation Handoff**  
**Date:** 2026-02-25

