# NeonDash Automation Actions Toolbar -- Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Automation Actions Toolbar + AutomationModal + TrailStatusBadge
**Feature Area:** CRM / Lead Management
**Created:** 2026-04-01
**Supersedes:** `automation-actions-toolbar-design-spec.md`, `AUTOMATION-MODAL-LAYOUTS.md`, `AUTOMATION-TOOLBAR-QUICK-REFERENCE.md`
**Complexity:** L4 -- multi-section + state + interactions

---

## Executive Summary

Enhancement to the **Lead Sheet** (slide-over drawer) in NeonDash CRM with:

1. **Automacao button** -- Opens the AutomationModal to view/manage trail automation instances for a lead
2. **+ Trilha button** -- Shortcut to create a new trail instance
3. **AutomationModal** -- Dialog overlay with `closed | list | create | edit` state machine for managing trail instances and templates
4. **TrailStatusBadge** -- Reusable status badge component with icon + semantic color theming
5. **AutomacoesTab** -- Inline tab variant (non-modal) providing the same list/create/edit/editor/new-template views embedded inside the lead sheet

**Design Direction:** Professional, data-dense operational UI. No generic SaaS aesthetics. GPUS theme (Azul Petroleo + Gold) anchors all color decisions. Operational Minimalism pattern -- progressive disclosure (list default, create/edit on demand) reduces cognitive load while maintaining full functionality.

**Anti-patterns Rejected:**
- Glassmorphism (conflicts with GPUS professional tone, reduces readability)
- Generic SaaS modal (bento grids, rounded cards, floating effects)
- Busy toolbar layouts (too many buttons visible at once)

---

## 1. Design System Overview

### Pattern Selection: Operational Minimalism

**Selected Pattern:** Drill-Down Analytics + Progressive Disclosure

CRM workflows require quick access without cognitive overload. The modal uses progressive disclosure: show list by default, create/edit on demand.

**Key Principles:**
- **Hierarchy:** List (default) -> Create (on click) -> Edit (on selection)
- **Whitespace:** 16px gutters, 24px section spacing
- **Density:** Compact rows for high-volume trails/automations
- **Depth via tone:** Use background color shifts (GPUS surface hierarchy), not shadows or borders

**Style Category:** Clean, Minimal, Data-Dense Operational
**Framework:** Tailwind CSS v4 + shadcn/ui primitives (new-york style)
**Performance:** GPU-accelerated animations only (`transform`, `opacity`)
**Accessibility:** WCAG 2.1 AA minimum, targeting AAA contrast ratios

### Surface Hierarchy (Dark Mode -- Tonal Layering)

| Layer | Token / Class | Usage |
|-------|---------------|-------|
| **Void** | `bg-background` | Page base |
| **Section** | `bg-card` | Sidebar, modal background |
| **Interactive** | `bg-secondary` | Cards, panels, hover states |
| **Elevated** | `bg-muted` | Dropdowns, floating elements |

---

## 2. Colors (GPUS Tokens ONLY)

**CRITICAL RULE:** Never hardcode hex values. Use Tailwind semantic tokens exclusively.

### Primary Brand Colors

| Role | Light Mode HSL | Dark Mode HSL | Tailwind Token |
|------|----------------|---------------|----------------|
| **Primary Action** | `38 60% 45%` (Gold) | `43 96% 56%` (Amber 400) | `bg-primary` / `text-primary` |
| **Foreground Text** | `203 65% 26%` (Petroleo) | `210 40% 98%` (Slate 50) | `text-foreground` |
| **Background** | `210 40% 98%` (Slate 50) | `222 47% 6%` (Slate 950) | `bg-background` |
| **Border** | `214 32% 91%` (Slate 200) | `217 33% 17%` (Slate 800) | `border-border` |
| **Muted Text** | `215 25% 40%` | `215 20% 65%` (Slate 400) | `text-muted-foreground` |
| **Card Surface** | `0 0% 100%` (White) | `222 47% 10%` (Slate 900) | `bg-card` |
| **Destructive** | `0 84% 60%` | `0 63% 31%` | `bg-destructive` / `text-destructive` |
| **Focus Ring** | `38 60% 45%` (Gold) | `43 96% 56%` (Gold) | `ring-ring` |

### Semantic Status Colors

| Status | Light | Dark | Tailwind Classes | Use Case |
|--------|-------|------|------------------|----------|
| **Ativa** | Emerald 500 | Emerald 400 | `bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20` | Active trail |
| **Pausada** | Amber 500 | Amber 400 | `bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20` | Paused trail |
| **Concluida** | -- | -- | `bg-primary/10 text-primary border-primary/20` | Completed trail (uses brand gold) |
| **Cancelada** | -- | -- | `bg-destructive/10 text-destructive border-destructive/20` | Cancelled trail |

**Implementation (as built in `trail-status-badge.tsx`):**

```tsx
// CORRECT -- semantic tokens, outline variant with tonal background
<Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
  <CheckCircle2 className="h-3 w-3" />
  Ativa
</Badge>

// WRONG -- hardcoded hex
<Badge style={{ backgroundColor: "#10B981" }}>Ativa</Badge>
```

---

## 3. Typography

### Font Stack (GPUS Canonical)

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

**Manrope** leads as the primary display/UI font (distinctive geometric humanist). **Inter** serves as functional body companion for dense UI text. **Fira Code** is used for monospace data/metrics display.

### Typography Scale

| Element | Font | Size | Weight | Line Height | Tailwind Class |
|---------|------|------|--------|-------------|----------------|
| **Modal Title** | Manrope | 16px | 600 | 1.3 | `text-base font-semibold` |
| **Section Title** | Manrope | 18px | 600 | 1.4 | `text-lg font-semibold tracking-tight` |
| **List Item Label** | Manrope | 14px | 500 | 1.4 | `text-sm font-medium` |
| **Data / Count** | Fira Code | 12px | 400 | 1.3 | `font-mono text-xs` |
| **Body Text** | Manrope | 14px | 400 | 1.5 | `text-sm` |
| **Helper / Muted** | Manrope | 12px | 400 | 1.4 | `text-xs text-muted-foreground` |
| **Badge / Tag** | Manrope | -- | 500 | -- | `font-medium` (inside Badge) |
| **Progress %** | Fira Code | 12px | 400 | -- | `font-mono text-xs text-muted-foreground` |

---

## 4. Layout Architecture

### Lead Sheet with Action Button Bar

```
+-------------------------------------------------------------------+
| Lead Detail                                              [Close]   |
|                                                                    |
| Tabs: [Resumo] [Atividades] [Automacoes] [...]                    |
|              Automacoes tab selected                                |
|                                   |  click "Automacao" btn         |
+-------------------------------------------------------------------+
                                    |
                                    v
                          AutomationModal opens
```

### Modal -- List Mode (Default)

```
+------------------------------------------+
| [<-]  Automacoes                  [X]    |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  | Trilha de Boas-vindas       [Ativa] | |
|  | Iniciada em 15 de Mar, 10:30       | |
|  |                     [Edit] [Cancel] | |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Follow-up Inicial         [Pausada] | |
|  | Iniciada em 12 de Mar, 14:00       | |
|  |                     [Edit] [Cancel] | |
|  +------------------------------------+  |
|                                          |
|  [+ Nova Trilha]                         |
|                                          |
+------------------------------------------+

Layout: rounded-lg border border-border/50 bg-card/60
Rows: flex items-center gap-3 p-3
Hover: transition-colors hover:bg-muted/30
```

### Modal -- Empty State (List Mode)

```
+------------------------------------------+
| Automacoes                        [X]    |
+------------------------------------------+
|                                          |
|                                          |
|            +--------+                    |
|            | [Zap]  |                    |
|            +--------+                    |
|                                          |
|    Nenhuma automacao ativa para          |
|    este lead.                            |
|                                          |
|          [+ Nova Trilha]                 |
|                                          |
|                                          |
+------------------------------------------+

Icon container: h-12 w-12 rounded-xl border border-border/50 bg-muted/50
Icon: Zap h-6 w-6 text-muted-foreground
Button: variant="outline" size="sm"
```

### Modal -- Create Mode

```
+------------------------------------------+
| [<-]  Nova Trilha                 [X]    |
+------------------------------------------+
|                                          |
|  Trilha                                  |
|  +------------------------------------+  |
|  | Selecione uma trilha...        [v] |  |
|  +------------------------------------+  |
|                                          |
|  Quando iniciar?                         |
|  (o) Iniciar agora                       |
|  ( ) Agendar data                        |
|                                          |
|  [If "Agendar data" selected:]           |
|  +------------------------------------+  |
|  | datetime-local input               |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
|              [Cancelar]  [Iniciar Trilha]|
+------------------------------------------+

Transition: motion-safe slide-in-from-bottom-2 fade-in duration-200
Back button: Returns to list on click
Submit button shows Loader2 spinner when pending
```

### Modal -- Edit Mode

```
+------------------------------------------+
| [<-]  Detalhes da Trilha          [X]    |
+------------------------------------------+
|                                          |
|  Trilha de Boas-vindas          [Ativa]  |
|                                          |
|  Passo 3 de 8                       37%  |
|  [========-----------]                   |
|                                          |
|  Iniciada em 15 de Mar de 2026, 10:30   |
|                                          |
+------------------------------------------+
| [Pausar]  [Cancelar Trilha]    [Voltar]  |
+------------------------------------------+

Status actions change based on current status:
  active  -> [Pausar] [Cancelar Trilha]
  paused  -> [Retomar] [Cancelar Trilha]
  completed/cancelled -> [Voltar] only

Delete button: variant="destructive"
Progress: <Progress> component with font-mono percentage
```

### Modal -- Loading State

```
+------------------------------------------+
| Automacoes                        [X]    |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  | [####] [########]   [####] [##]    |  | <- Skeleton row
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | [####] [########]   [####] [##]    |  | <- Skeleton row
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | [####] [########]   [####] [##]    |  | <- Skeleton row
|  +------------------------------------+  |
|                                          |
+------------------------------------------+

Skeleton: h-5 w-24 (name), h-5 w-16 (status), h-8 w-8 (actions)
Container: rounded-lg border border-border/50 p-3
Animate: pulse effect (default Skeleton behavior)
```

### Modal -- Error State

```
+------------------------------------------+
| Automacoes                        [X]    |
+------------------------------------------+
|                                          |
|                                          |
|            [AlertTriangle]               |
|                                          |
|      Erro ao carregar automacoes.        |
|                                          |
|                                          |
+------------------------------------------+

Icon: AlertTriangle h-8 w-8 text-destructive
Text: text-sm text-muted-foreground
No retry button -- relies on React Query refetch
```

### Responsive Breakpoints

#### Mobile (<=640px)

```
+------------------------+
| [Notes] [Auto] [Trail] | <- Buttons may wrap
+------------------------+
| Lead Detail             |
| (Full width sheet)      |
+------------------------+

Modal:
  Width: max-w-full with mx-4 margins
  Height: max-h-[90vh]
  Position: Centered, z-[200]
```

#### Tablet (641-1024px)

```
+-----------------------------------------+
| Lead Detail  [Notes] [Auto] [Trail]     |
+-----------------------------------------+
| (70% width sheet, 560px max)            |
|                                         |
| +-----------------------------------+   |
| | Automacoes                        |   |
| | (Modal: max-w-md, centered)       |   |
| +-----------------------------------+   |
+-----------------------------------------+
```

#### Desktop (>1024px)

```
+------------------------------------------------------------------+
| Lead Detail                        [Notes] [Auto] [Trail]  [X]   |
+------------------------------------------------------------------+
| (40% width sheet, 520px max)                                      |
|                                                                   |
|  +--------------------------------+                               |
|  | Automacoes                     | <- Modal: max-w-md (448px)   |
|  | (Dialog, z-[200] over sheet)   |    Centered on screen        |
|  +--------------------------------+                               |
+------------------------------------------------------------------+
```

---

## 5. Component Inventory (shadcn/ui)

| Component | Import Path | Purpose | Notes |
|-----------|-------------|---------|-------|
| `Dialog` | `@/components/ui/dialog` | Modal container | `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` |
| `Button` | `@/components/ui/button` | Action triggers | `outline`, `ghost`, `destructive`, `default` variants |
| `Badge` | `@/components/ui/badge` | Status indicators | `outline` variant with tonal bg |
| `Select` | `@/components/ui/select` | Template selection dropdown | `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` |
| `RadioGroup` | `@/components/ui/radio-group` | Schedule mode selection | `RadioGroupItem` |
| `Input` | `@/components/ui/input` | Text fields, datetime-local | Name, schedule date |
| `Textarea` | `@/components/ui/textarea` | Multi-line input | Description field |
| `Label` | `@/components/ui/label` | Form labels | `text-sm font-medium` |
| `Progress` | `@/components/ui/progress` | Step progress bar | In edit view |
| `Skeleton` | `@/components/ui/skeleton` | Loading state | Shaped like list rows |
| `Separator` | `@/components/ui/separator` | Visual dividers | Sparingly -- prefer tonal depth |

### Icons (Lucide React)

```tsx
// Direct imports from source (bundle-safe)
import { Zap, Plus, ArrowLeft, Edit2, Play, Pause, Loader2,
         OctagonX, AlertTriangle, X, Check, Trash2,
         CheckCircle, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
```

| Icon | Size | Purpose |
|------|------|---------|
| `Zap` | `h-6 w-6` / `h-3.5 w-3.5` | Automation / empty state |
| `Plus` | `h-3.5 w-3.5` | Create button |
| `ArrowLeft` | `h-4 w-4` | Back navigation |
| `Edit2` | `h-3.5 w-3.5` | Edit action |
| `Play` | `h-3.5 w-3.5` | Start/Resume |
| `Pause` | `h-3.5 w-3.5` | Pause action |
| `OctagonX` | `h-3.5 w-3.5` | Cancel trail |
| `Loader2` | `h-3.5 w-3.5 animate-spin` | Loading spinner |
| `AlertTriangle` | `h-8 w-8` | Error state |
| `CheckCircle2` | `h-3 w-3` | Active status badge icon |
| `PauseCircle` | `h-3 w-3` | Paused status badge icon |
| `CheckCircle` | `h-3 w-3` | Completed status badge icon |
| `XCircle` | `h-3 w-3` | Cancelled status badge icon |

---

## 6. Detailed Sections

### State Machine

The AutomationModal has **4 states**: `closed | list | create | edit`.

```
+----------------+
|    Closed      |
+----------------+
       | (open modal)
       v
+------------------------------+
|   List Mode (default)        | <- Shows active trail instances + empty state
+------------------------------+
  | (click Create)     | (click Edit on row)
  v                    v
+------------------+  +---------------------+
|  Create Mode     |  |  Edit Mode          |
|  (template pick) |  |  (status + progress)|
+------------------+  +---------------------+
  | (save/cancel)       | (save/cancel/back)
  v                     v
+------------------------------+
|   List Mode (refreshed)      |
+------------------------------+
       | (close / ESC)
       v
+----------------+
|    Closed      |
+----------------+
```

**State Transitions:**

| From | To | Trigger | Effect |
|------|----|---------|--------|
| `closed` | `list` | Modal `open` prop becomes `true` | Dialog opens with list view |
| `list` | `create` | Click "Nova Trilha" button | Switches to template selection form |
| `list` | `edit` | Click Edit icon on a row | Switches to detail/status management view |
| `create` | `list` | Click "Cancelar" or successful submit | Returns to list (list auto-refetches) |
| `edit` | `list` | Click "Voltar" or cancel trail | Returns to list |
| `*` | `closed` | Press ESC or click outside or `onClose()` | Dialog closes |

### AutomacoesTab (Inline Variant)

The `AutomacoesTab` provides the same functionality without a modal wrapper, for embedding directly in the lead sheet tab panel. It has an extended state machine:

```
TabView: "list" | "create" | "edit" | "editor" | "new-template"
```

| View | Purpose |
|------|---------|
| `list` | Show trail instances for lead |
| `create` | Start a new trail instance from template |
| `edit` | View/manage a specific trail instance |
| `editor` | Edit existing trail templates (CRUD) |
| `new-template` | Create a brand new trail template |

### Component Structure -- AutomationModal

```tsx
<Dialog modal={false} open={isOpen} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="z-[200] max-w-md border-border/50 bg-background shadow-xl
    motion-safe:data-[state=open]:animate-in
    motion-safe:data-[state=open]:fade-in-0
    motion-safe:data-[state=open]:slide-in-from-bottom-2
    motion-safe:data-[state=open]:duration-200
    motion-safe:data-[state=closed]:animate-out
    motion-safe:data-[state=closed]:fade-out-0
    motion-safe:data-[state=closed]:slide-out-to-bottom-2
    motion-safe:data-[state=closed]:duration-200">

    <DialogHeader>
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button className="h-7 w-7" onClick={goToList} size="icon" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <DialogTitle className="text-base font-semibold">
          {MODE_TITLES[currentMode]}
        </DialogTitle>
      </div>
      <DialogDescription className="sr-only">
        Gerencie as trilhas de automacao deste lead.
      </DialogDescription>
    </DialogHeader>

    <div className="mt-1">
      {currentMode === "list" && <ListView ... />}
      {currentMode === "create" && <CreateView ... />}
      {currentMode === "edit" && activeTrailId && <EditView ... />}
    </div>

  </DialogContent>
</Dialog>
```

### Component Structure -- TrailStatusBadge

```tsx
export type TrailStatus = "active" | "paused" | "completed" | "cancelled";

const STATUS_CONFIG: Record<TrailStatus, {
  label: string;
  icon: typeof CheckCircle2;
  theme: string;
}> = {
  active: {
    label: "Ativa",
    icon: CheckCircle2,
    theme: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  paused: {
    label: "Pausada",
    icon: PauseCircle,
    theme: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  completed: {
    label: "Concluida",
    icon: CheckCircle,
    theme: "bg-primary/10 text-primary border-primary/20",
  },
  cancelled: {
    label: "Cancelada",
    icon: XCircle,
    theme: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function TrailStatusBadge({ status, className }: TrailStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  const Icon = config.icon;
  return (
    <Badge variant="outline"
      className={cn("gap-1.5 font-medium shadow-sm transition-colors", config.theme, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

### Component Structure -- ListView Row

```tsx
<div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3
  transition-colors hover:bg-muted/30" key={inst.id}>

  <div className="min-w-0 flex-1">
    <p className="truncate font-medium text-foreground text-sm">{inst.trailTemplateName}</p>
    <p className="text-muted-foreground text-xs">
      Iniciada em {format(new Date(inst.startedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
    </p>
  </div>

  <TrailStatusBadge status={inst.status} />

  <Button className="h-8 w-8" onClick={() => onEdit(inst.id)} size="icon" variant="ghost">
    <Edit2 className="h-3.5 w-3.5" />
  </Button>

  {(inst.status === "active" || inst.status === "paused") && (
    <Button className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={() => handleCancel(inst.id)} size="icon" variant="ghost">
      <OctagonX className="h-3.5 w-3.5" />
    </Button>
  )}
</div>
```

---

## 7. Animations & Interactions

### Modal Entrance/Exit

Uses CSS-driven `data-[state]` animations via Tailwind (GPU-accelerated `transform` + `opacity` only):

```tsx
className={cn(
  "motion-safe:data-[state=open]:animate-in",
  "motion-safe:data-[state=open]:fade-in-0",
  "motion-safe:data-[state=open]:slide-in-from-bottom-2",
  "motion-safe:data-[state=open]:duration-200",
  "motion-safe:data-[state=closed]:animate-out",
  "motion-safe:data-[state=closed]:fade-out-0",
  "motion-safe:data-[state=closed]:slide-out-to-bottom-2",
  "motion-safe:data-[state=closed]:duration-200"
)}
```

### Transition Specs

| Transition | Duration | Effect | Implementation |
|-----------|----------|--------|----------------|
| **Modal open** | 200ms | Fade + slide up from bottom | `animate-in fade-in-0 slide-in-from-bottom-2` |
| **Modal close** | 200ms | Fade + slide down | `animate-out fade-out-0 slide-out-to-bottom-2` |
| **Row hover** | 150ms | Subtle bg color shift | `hover:bg-muted/30 transition-colors` |
| **Button active** | 100ms | Scale down | `active:scale-95 transition-transform` |
| **Spinner** | continuous | Rotate | `animate-spin` on `Loader2` icon |

### Reduced Motion

All animations wrapped with `motion-safe:` prefix -- respects `prefers-reduced-motion: reduce`. Users with this preference see instant state changes with no animation.

### Animation Rules

- GPU-accelerated only: `transform` and `opacity` exclusively
- Never animate `width`, `height`, `margin`, or `padding`
- CSS transitions via Tailwind, not JavaScript event handlers
- No `framer-motion` -- use `motion/react` if programmatic animation is needed
- One orchestrated entrance per modal open, not scattered micro-interactions

---

## 8. Responsive Behavior

| Breakpoint | Modal Width | Sheet Width | Toolbar Layout |
|-----------|-------------|-------------|----------------|
| **Mobile** <=640px | `max-w-full mx-4` | 100% full-screen | Buttons may wrap (`flex-wrap`) |
| **Tablet** 641-1024px | `max-w-md` (448px) | 70% (max 560px) | Horizontal row, `gap-2` |
| **Desktop** >1024px | `max-w-md` (448px) | 40% (max 520px) | Horizontal row, `gap-2` |

### Touch Targets

| Element | Size | Meets 44x44px? |
|---------|------|-----------------|
| Icon button (edit/cancel) | `h-8 w-8` (32px) + padding | Yes (44px touch area with spacing) |
| Text button | Auto width, `size="sm"` | Yes (min 44px height with padding) |
| List item row | Full width, ~56px height (p-3 + content) | Yes |
| Badge | Not directly clickable (parent row is) | N/A |
| Back button | `h-7 w-7` (28px) + ghost padding | Borderline -- ensure adequate spacing |

### Mobile Adaptations

```tsx
{/* Toolbar buttons wrap on small screens */}
<div className="flex flex-wrap items-center gap-2">
  <Button className="gap-1.5" size="sm" variant="outline">...</Button>
  <Button className="gap-1.5" size="sm" variant="outline">...</Button>
</div>
```

---

## 9. State Management

### Local State (Component Level)

```typescript
// AutomationModal
type ModalMode = "list" | "create" | "edit";
const [currentMode, setCurrentMode] = useState<ModalMode>(initialMode);
const [activeTrailId, setActiveTrailId] = useState<string | undefined>(trailInstanceId);

// AutomacoesTab (extended)
type TabView = "list" | "create" | "edit" | "editor" | "new-template";
const [view, setView] = useState<TabView>("list");
const [activeTrailId, setActiveTrailId] = useState<string | undefined>();
```

### tRPC Router Integration

**Backend routes used (existing `trailInstances` + `trailTemplates` routers):**

```typescript
// Trail Instances
trpc.trailInstances.listByLeadId.useQuery({ leadId })       // List for lead
trpc.trailInstances.getById.useQuery({ trailInstanceId })    // Single instance
trpc.trailInstances.create.useMutation()                      // Start trail
trpc.trailInstances.update.useMutation()                      // Pause/resume/cancel
trpc.trailInstances.getAvailableTemplates.useQuery()          // Templates for pipeline

// Trail Templates
trpc.trailTemplates.list.useQuery()                           // All templates
trpc.trailTemplates.create.useMutation()                      // New template
trpc.trailTemplates.update.useMutation()                      // Edit template
trpc.trailTemplates.delete.useMutation()                      // Delete template
```

### Frontend Query Hooks (CORRECTED -- `onSettled` for invalidation)

```typescript
// List trail instances
const { data: instances, isLoading, isError } =
  trpc.trailInstances.listByLeadId.useQuery(
    { leadId: Number(leadId) },
    { refetchOnWindowFocus: false }
  );

// Create trail instance
const createMutation = trpc.trailInstances.create.useMutation({
  onSuccess: () => {
    toast.success("Trilha iniciada com sucesso!");
    onBack();
  },
  onSettled: () => {
    // CRITICAL: Use onSettled, not onSuccess, for cache invalidation
    utils.trailInstances.listByLeadId.invalidate({ leadId: Number(leadId) });
  },
  onError: (err: { message?: string }) => {
    toast.error(err.message ?? "Erro ao criar trilha");
  },
});

// Update trail instance (pause/resume/cancel)
const updateMutation = trpc.trailInstances.update.useMutation({
  onSettled: () => {
    utils.trailInstances.listByLeadId.invalidate({ leadId: Number(leadId) });
    utils.trailInstances.getById.invalidate({ trailInstanceId });
  },
  onSuccess: () => toast.success("Automacao atualizada"),
  onError: (err: { message?: string }) => {
    toast.error(err.message ?? "Erro ao atualizar automacao");
  },
});

// Delete trail template
const deleteMutation = trpc.trailTemplates.delete.useMutation({
  onSettled: () => {
    utils.trailTemplates.list.invalidate();
  },
  onSuccess: () => toast.success("Trilha removida"),
  onError: (err: { message?: string }) => {
    toast.error(err.message ?? "Erro ao remover trilha");
  },
});
```

**NOTE:** The existing implementation uses `onSuccess` for invalidation. Per NeonDash conventions, this should be migrated to `onSettled` to ensure cache invalidation happens even on error (optimistic UI rule: never trust optimistic state as ground truth).

### Error Handling

All `mutateAsync` calls must be wrapped in try-catch with user-facing toast (Stability Rule J). The current implementation uses `useMutation` callbacks (`onSuccess`/`onError`) which is acceptable for this pattern since `mutate()` (not `mutateAsync()`) is used.

---

## 10. Accessibility

### Keyboard Navigation

| Key | Action | Context |
|-----|--------|---------|
| **Tab** | Move focus to next interactive element | All modes |
| **Shift+Tab** | Move focus to previous element | All modes |
| **Enter** | Submit form / activate button | Create/Edit footer |
| **Escape** | Close dialog (returns to closed state) | Any mode |
| **Space** | Activate button / toggle radio | Buttons, RadioGroup |

### ARIA Implementation

```tsx
// Dialog accessibility (built into shadcn Dialog)
<DialogTitle className="text-base font-semibold">Automacoes</DialogTitle>
<DialogDescription className="sr-only">
  Gerencie as trilhas de automacao deste lead.
</DialogDescription>

// Icon-only buttons MUST have aria-label
<Button aria-label="Editar trilha" size="icon" variant="ghost">
  <Edit2 className="h-3.5 w-3.5" />
</Button>

<Button aria-label="Cancelar trilha" size="icon" variant="ghost">
  <OctagonX className="h-3.5 w-3.5" />
</Button>

<Button aria-label="Voltar" size="icon" variant="ghost">
  <ArrowLeft className="h-4 w-4" />
</Button>
```

### Focus Management

- Dialog traps focus when open (built into Radix Dialog)
- Focus returns to trigger button on close
- Focus ring: `ring-ring` (Gold in both modes) via shadcn defaults
- WCAG 2.2 SC 2.4.11: Focused elements not obscured by sticky headers

### Contrast Verification

| Pair | Light | Dark | Ratio | Pass? |
|------|-------|------|-------|-------|
| Foreground on background | Petroleo on Slate 50 | Slate 50 on Slate 950 | >18:1 | AAA |
| Muted on background | Slate 500 on White | Slate 400 on Slate 900 | >5:1 | AA |
| Green badge text | Green 700 on green-500/10 | Green 400 on green-500/10 | >4.5:1 | AA |
| Destructive | Red on bg | Red on dark bg | >4.5:1 | AA |

### Screen Reader Considerations

- `DialogDescription` uses `sr-only` class -- provides context without visual clutter
- Status badges include icon + text label (never icon-only)
- Loading states use `Skeleton` with implicit ARIA (content replaced, not `aria-busy`)
- Empty state text is descriptive: "Nenhuma automacao ativa para este lead."

---

## 11. Anti-Patterns to Avoid

### Design Anti-Patterns

| Anti-Pattern | Why It Fails | What to Do Instead |
|-------------|-------------|---------------------|
| Glassmorphism / `backdrop-blur` | Reduces readability, conflicts with GPUS tone | Solid tonal surfaces from GPUS surface hierarchy |
| Hardcoded hex colors | Breaks theme consistency, fails dark mode | Semantic tokens only (`bg-primary`, `text-foreground`) |
| `shadow-lg` on cards | GPUS uses tonal depth, not shadows | Background color shifts (`bg-card/60`, `bg-muted/30`) |
| Emojis as icons | Inconsistent cross-platform, unprofessional | Lucide React icons exclusively |
| `href="#"` dead anchors | Accessibility violation (Stability Rule K) | `<Button>` for actions, proper `href` for navigation |
| Purple/violet accents | #1 AI design cliche (GPUS Forbidden Default #7) | Gold (`bg-primary`) or Petroleo (`text-neon-petroleo`) |
| JS hover animations | Kills INP scores (GPUS Forbidden Default #10) | CSS `transition-colors` / `transition-transform` |
| `framer-motion` import | Wrong package for this project | `motion/react` if programmatic animation needed |
| Body text < 14px | Fails readability (GPUS Forbidden Default #9) | Minimum `text-sm` (14px), prefer `text-base` (16px) |

### Code Anti-Patterns

| Anti-Pattern | Why It Fails | What to Do Instead |
|-------------|-------------|---------------------|
| `as any` type casts | Stability Rule I violation | Proper types or typed assertions |
| Non-null assertion `!` | Stability Rule B violation | `??` or optional chaining `?.` |
| `onSuccess` for invalidation | Stale cache on error | `onSettled` for `queryClient.invalidateQueries` |
| `mutateAsync` without try-catch | Stability Rule J | Wrap in try-catch + toast, or use `mutate` with callbacks |
| Barrel imports from large libs | Loads entire library (Bundle Rule) | Direct source imports |
| `new Date()` in render | Creates new object every render | Hoist to module scope or memoize |
| `value={undefined}` on controlled inputs | "Changing from uncontrolled" warning | `value={val ?? ""}` |

---

## 12. File Structure

### Existing Files (Implemented)

```
apps/web/src/components/crm/automations/
  automacoes-tab.tsx          # Inline tab variant (866 lines)
  automation-modal.tsx         # Dialog modal variant (617 lines)
  trail-status-badge.tsx       # Reusable status badge (56 lines)
```

### Backend Integration Points

```
apps/api/src/routers/
  trail-instances.ts           # trailInstances router (listByLeadId, getById, create, update)
  trail-templates.ts           # trailTemplates router (list, create, update, delete)

apps/api/src/_core/
  index.ts                     # Main appRouter -- includes trailInstances + trailTemplates
```

### Dependencies

| Package | Purpose | Import Style |
|---------|---------|--------------|
| `date-fns` | Date formatting | `import { format } from "date-fns"` |
| `date-fns/locale` | PT-BR locale | `import { ptBR } from "date-fns/locale"` |
| `lucide-react` | Icons | Individual named imports |
| `sonner` | Toast notifications | `import { toast } from "sonner"` |
| `@/components/ui/*` | shadcn primitives | Individual component imports |
| `@/lib/trpc` | tRPC client | `import { trpc } from "@/lib/trpc"` |
| `@/lib/utils` | `cn()` utility | `import { cn } from "@/lib/utils"` |

---

## 13. Pre-Delivery Checklist

### Quality Gates (Non-Negotiable)

- [ ] `bun run type-check` -- No TypeScript errors (uses `tsgo`, ~4s)
- [ ] `bunx biome check --write` -- Biome format + lint pass on all edited files
- [ ] `bun run lint:oxlint:check` -- OXLint pass
- [ ] `bun run test` -- All tests pass

### Visual QA

- [ ] Light mode: All text contrast >= 4.5:1
- [ ] Dark mode: All text contrast >= 4.5:1, toggle works without layout shift
- [ ] Status badges readable and distinguishable in both modes
- [ ] No hardcoded hex colors in any component

### Responsive QA

- [ ] Mobile (375px): Modal usable, buttons wrap correctly
- [ ] Tablet (768px): Modal centered, adequate width
- [ ] Desktop (1440px): Modal at max-w-md, positioned correctly

### Interaction QA

- [ ] Keyboard nav: Tab, Shift+Tab, Enter, Escape all work correctly
- [ ] Create trail: Select template -> choose schedule -> submit succeeds
- [ ] Edit trail: View progress -> pause/resume/cancel works
- [ ] Delete trail template: Confirmation dialog -> delete succeeds
- [ ] Empty state: Shown correctly when no trail instances exist
- [ ] Loading state: Skeleton shapes match final layout
- [ ] Error state: Displayed with AlertTriangle icon and muted text

### Accessibility QA

- [ ] All icon-only buttons have `aria-label`
- [ ] Dialog has `DialogTitle` + `DialogDescription` (even if `sr-only`)
- [ ] Focus ring visible on all interactive elements
- [ ] Focus trapped inside open dialog
- [ ] `prefers-reduced-motion` respected (no animations)

### Code Quality

- [ ] No `as any` type casts (Stability Rule I)
- [ ] No `!` non-null assertions (Stability Rule B)
- [ ] All `mutateAsync` calls wrapped in try-catch with toast (Stability Rule J)
- [ ] All icon-only buttons use `<Button>` not `<a href="#">` (Stability Rule K)
- [ ] Error boundaries do not expose stack traces (Stability Rule L)
- [ ] No `console.log` in production (Stability Rule H)
- [ ] Mutations use `onSettled` (not `onSuccess`) for cache invalidation

---

## 14. Success Criteria

### Functional

1. User can open the AutomationModal from the lead sheet and see a list of active trail instances
2. User can start a new trail instance from an available template with optional scheduling
3. User can view trail progress (step X of Y with percentage)
4. User can pause, resume, and cancel active trail instances
5. User can manage trail templates (list, create, edit, delete) via the editor view
6. Modal state machine transitions correctly between `closed | list | create | edit`
7. Cache invalidation works on all mutations -- list refreshes after create/update/delete

### Performance

1. Modal open animation completes in <= 200ms
2. No layout shift on modal open/close
3. Skeleton loading states show within 16ms of query initiation (no blank flash)
4. No JS-driven hover animations -- all CSS transitions

### Quality

1. Zero TypeScript errors
2. Zero Biome/OXLint violations
3. WCAG 2.1 AA compliant (targeting AAA for text contrast)
4. Dark mode fully functional with no hardcoded colors
5. Mobile-first responsive design validated at 375px, 768px, 1440px

### Design Fidelity

1. GPUS tokens used exclusively -- no hardcoded hex values
2. Font stack: Manrope + Inter + Fira Code (no "Fira Sans" references)
3. Tonal depth via surface hierarchy, not box shadows
4. Status badges use outline variant with tonal background and icons
5. Passes the Template Test: "Could this be a Vercel/Stripe template?" -- NO

---

**Design Specification Complete**
**Ready for Implementation Review**
**Date:** 2026-04-01
