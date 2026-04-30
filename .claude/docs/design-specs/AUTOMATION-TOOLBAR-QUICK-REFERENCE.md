# Automation Toolbar — Quick Reference

**For:** Frontend Implementation Team  
**Date:** 2026-02-25  
**Complexity:** L4

---

## What's Being Built

**Lead Sheet Enhancement** with 2 new action buttons:

```
Current:                              New:
┌────────────────────────┐           ┌────────────────────────────┐
│ Lead Detail  [Close]   │           │ Lead Detail  [Close]       │
│              [📝 Nota] │    →       │    [📝 Nota][⚡ Auto][+ Tri]│
└────────────────────────┘           └────────────────────────────┘
```

**+ New Modal Component:** `AutomationModal` with 3 states (list, create, edit)

---

## Color Palette (GPUS Tokens ONLY)

| Element | Light | Dark | Tailwind |
|---------|-------|------|----------|
| **Primary Btn** | Gold `hsl(38 60% 45%)` | Amber `hsl(43 96% 56%)` | `bg-primary` |
| **Foreground** | Petróleo `hsl(203 65% 26%)` | Slate 50 `hsl(210 40% 98%)` | `text-foreground` |
| **Background** | Slate 50 | Slate 950 | `bg-background` |
| **Border** | Slate 200 | Slate 800 | `border-border` |
| **Status: Active** | `#10B981` | `#34D399` | `bg-green-500` |
| **Status: Paused** | `#F59E0B` | `#FBBF24` | `bg-yellow-500` |
| **Status: Completed** | `#3B82F6` | `#60A5FA` | `bg-blue-500` |
| **Status: Cancelled** | `#EF4444` | `#F87171` | `bg-red-500` |

**🚨 CRITICAL:** Never use hex fallbacks. ALWAYS use semantic tokens.

```tsx
// ✅ CORRECT
<Badge className="bg-green-500 text-white">Ativa</Badge>

// ❌ WRONG
<Badge style={{ backgroundColor: "#10B981" }}>Ativa</Badge>
```

---

## Typography (Fira Sans + Fira Code)

| Element | Font | Size | Weight | Use |
|---------|------|------|--------|-----|
| Dialog Title | Fira Sans | 20px | 700 | "Automações Ativas" |
| Section Header | Fira Sans | 14px | 600 | "Trilhas em Progresso" |
| List Item Label | Fira Sans | 13px | 500 | Automation name |
| Data / Count | Fira Code | 12px | 500 | "5 steps", "2/8 done" |
| Body Text | Fira Sans | 13px | 400 | Description |
| Badge / Tag | Fira Code | 11px | 600 | Status ("Ativa") |

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

---

## Component Structure

### 1. Lead Sheet Header (Modified)

**File:** `apps/web/src/components/crm/lead-sheet-header.tsx`

```tsx
<div className="flex items-center justify-between gap-2">
  <h2 className="text-xl font-bold">Lead Detail</h2>
  <div className="flex gap-2">
    <Button variant="outline" size="sm" className="gap-2">
      <FileText className="w-4 h-4" />
      Nota
    </Button>
    
    {/* NEW */}
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => setAutomationModalOpen(true)}
    >
      <Zap className="w-4 h-4" />
      Automação
      {activeCount > 0 && (
        <Badge className="bg-green-500 text-white text-xs">
          {activeCount}
        </Badge>
      )}
    </Button>
    
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => setTrialModalOpen(true)}
    >
      <Plus className="w-4 h-4" />
      Trilha
    </Button>
  </div>
</div>
```

---

### 2. AutomationModal Component (NEW)

**File:** `apps/web/src/components/crm/automation-modal.tsx`

**State Machine:**
```
Closed → List (default) ↔ Create ↔ Edit
```

**Structure:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    
    {/* Header with back button (non-list modes only) */}
    <header className="flex items-center gap-2 pb-4 border-b">
      {mode !== 'list' && <BackButton />}
      <h2>{modeTitle}</h2>
      <CloseButton />
    </header>

    {/* Content area (scrollable) */}
    <ScrollArea className="h-[400px]">
      {mode === 'list' && <ListMode />}
      {mode === 'create' && <CreateMode />}
      {mode === 'edit' && <EditMode />}
    </ScrollArea>

    {/* Footer with actions */}
    <footer className="flex justify-end gap-2 pt-4 border-t">
      {/* Buttons based on mode */}
    </footer>

  </DialogContent>
</Dialog>
```

---

### 3. List Mode (Default)

**If no automations:**
```tsx
<div className="py-16 text-center">
  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
  <h3 className="font-semibold text-sm mb-2">Nenhuma automação ativa</h3>
  <p className="text-xs text-muted-foreground mb-4">
    Crie uma automação para automatizar ações neste lead.
  </p>
  <Button variant="outline" size="sm" onClick={() => setMode('create')}>
    Criar Automação
  </Button>
</div>
```

**If automations exist:**
```tsx
<div className="space-y-1">
  {automations.map(automation => (
    <div
      key={automation.id}
      className="flex items-center justify-between gap-3 py-3 px-3 border-b hover:bg-secondary/5 cursor-pointer transition-colors"
      onClick={() => handleEdit(automation)}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-sm">{automation.name}</h3>
        <p className="text-xs text-muted-foreground">{automation.description}</p>
      </div>
      <Badge className={statusBadgeClass(automation.status)}>
        {statusLabel(automation.status)}
      </Badge>
      <ChevronRight className="w-4 h-4" />
    </div>
  ))}
</div>
```

---

### 4. Create Mode

```tsx
<form className="space-y-4">
  <div>
    <label className="text-sm font-medium">Nome da Automação *</label>
    <input
      type="text"
      placeholder="ex: Enviar convite de calendário"
      className="w-full px-3 py-2 border border-border rounded-md text-sm"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    />
  </div>

  <div>
    <label className="text-sm font-medium">Descrição</label>
    <textarea
      placeholder="Descrição opcional"
      className="w-full px-3 py-2 border border-border rounded-md text-sm"
      rows={3}
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    />
  </div>

  <div>
    <label className="text-sm font-medium">Tipo de Acionamento *</label>
    <Select value={formData.triggerType} onValueChange={(v) => setFormData({ ...formData, triggerType: v })}>
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
    <RadioGroup value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="active" id="active" />
        <label htmlFor="active" className="text-sm cursor-pointer">Ativa</label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paused" id="paused" />
        <label htmlFor="paused" className="text-sm cursor-pointer">Pausada</label>
      </div>
    </RadioGroup>
  </div>
</form>
```

**Footer:**
```tsx
<footer className="flex justify-end gap-2 pt-4 border-t">
  <Button variant="ghost" onClick={() => setMode('list')}>
    Cancelar
  </Button>
  <Button onClick={handleCreate} disabled={!formData.name}>
    Criar
  </Button>
</footer>
```

---

### 5. Edit Mode

**Same as Create, but:**
- Pre-populate form fields
- Add "Deletar" button (destructive variant)
- Title says "Editar Automação"

---

### 6. Trail Status Badge Component (NEW)

**File:** `apps/web/src/components/crm/trail-status-badge.tsx`

```tsx
type TrailStatus = 'active' | 'paused' | 'completed' | 'cancelled';

const statusConfig: Record<TrailStatus, { label: string; className: string }> = {
  active: { label: 'Em Progresso', className: 'bg-green-500 text-white' },
  paused: { label: 'Pausada', className: 'bg-yellow-500 text-white' },
  completed: { label: 'Concluída', className: 'bg-blue-500 text-white' },
  cancelled: { label: 'Cancelada', className: 'bg-red-500 text-white' },
};

export function TrailStatusBadge({ status }: { status: TrailStatus }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
```

---

## Animation Specs

| Transition | Duration | Effect |
|-----------|----------|--------|
| List → Create | 200ms | `animate-in slide-in-from-right-4 fade-in` |
| Create → List | 150ms | `animate-out slide-out-to-right-4 fade-out` |
| Row hover | 150ms | `hover:bg-secondary/5 transition-colors` |
| Button active | 100ms | `active:scale-95 transition-transform` |

---

## shadcn/ui Components

- `Dialog` — Modal container
- `Button` — Actions (outline + primary)
- `Badge` — Status indicators
- `Select` / `RadioGroup` — Form inputs
- `Input` / `Textarea` — Text fields
- `ScrollArea` — Scrollable content
- `Separator` — Visual dividers
- `Skeleton` — Loading state

---

## Icons (Lucide React)

```tsx
import { Zap, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
```

- **Zap** (⚡) — Automation button icon
- **Plus** (+) — Trail button icon
- **ChevronLeft** (←) — Back button in non-list modes
- **ChevronRight** (→) — List item chevron
- **X** (✕) — Close button

---

## tRPC Router (Backend)

**File:** `apps/api/src/routers/automations.ts`

```typescript
export const automationsRouter = router({
  listByLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Return automations for lead
    }),

  create: protectedProcedure
    .input(automationCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Create automation
    }),

  update: protectedProcedure
    .input(automationUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Update automation
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Delete automation
    }),
});
```

**Add to main router:**
```typescript
// apps/api/src/_core/index.ts
export const appRouter = router({
  // ... existing routers
  automations: automationsRouter,
});
```

---

## Frontend Query Hooks

```typescript
// List automations
const { data: automations, isLoading } = trpc.automations.listByLead.useQuery(
  { leadId },
  { enabled: modalOpen }
);

// Create
const createMutation = trpc.automations.create.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});

// Update
const updateMutation = trpc.automations.update.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});

// Delete
const deleteMutation = trpc.automations.delete.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['automations.listByLead'] });
    setMode('list');
  },
});
```

---

## Key Rules (NON-NEGOTIABLE)

### 1. Colors
- ❌ Never hardcode hex values
- ✅ Always use Tailwind semantic tokens (`bg-primary`, `text-foreground`)
- ✅ Status colors use standard Tailwind (`bg-green-500`, `bg-yellow-500`, etc.)

### 2. Icons
- ❌ No emojis as UI icons
- ✅ Use lucide-react exclusively

### 3. Type Safety
- ❌ No `as any` type casts
- ❌ No non-null assertions (`!`)
- ✅ Use proper TypeScript types + optional chaining (`?.`)

### 4. Error Handling
- ❌ Don't assume data exists
- ✅ Always guard against null/undefined
- ✅ Always check array length before accessing index

### 5. Procedure Levels
- ✅ Use `protectedProcedure` for authenticated routes
- ✅ Use `adminProcedure` for admin-only routes
- ❌ Don't use manual role checks in protected procedures

---

## Testing Checklist

- [ ] `bun run check` — TypeScript passes
- [ ] `bun run lint:check` — Biome + OXLint pass
- [ ] Light mode: contrast ≥4.5:1
- [ ] Dark mode: contrast ≥4.5:1
- [ ] Mobile (375px): modal still usable
- [ ] Tablet (768px): modal centered
- [ ] Desktop (1440px): modal at max-w-md
- [ ] Keyboard nav: Tab, Shift+Tab, Enter, Escape work
- [ ] Create automation: successful
- [ ] Edit automation: successful
- [ ] Delete automation: successful
- [ ] Empty state: shown when no automations
- [ ] Loading state: skeleton shown
- [ ] Error state: error message shown
- [ ] Dark mode toggle: works without layout shift

---

## Files to Create/Modify

### New Files
1. `apps/web/src/components/crm/automation-modal.tsx`
2. `apps/web/src/components/crm/trail-status-badge.tsx`
3. `apps/api/src/routers/automations.ts`

### Modified Files
1. `apps/web/src/components/crm/lead-sheet-header.tsx` — Add buttons
2. `apps/web/src/components/crm/lead-sheet.tsx` — Wire modal state
3. `apps/api/src/_core/index.ts` — Add router

---

## Estimated Complexity

- **Frontend:** L3-L4 (Modal state machine + form handling)
- **Backend:** L2-L3 (CRUD queries + validation)
- **Database:** L1-L2 (Schema extension if needed)

**Total estimated effort:** 6-8 hours implementation + 2 hours QA

---

**END QUICK REFERENCE**

