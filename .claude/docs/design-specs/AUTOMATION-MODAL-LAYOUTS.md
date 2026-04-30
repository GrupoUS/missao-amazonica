# Automation Modal — Layout Diagrams

**For:** Visual Reference During Implementation

---

## Lead Sheet with Action Button Bar

```
┌─────────────────────────────────────────────────────────────────┐
│ Lead Detail                                            [Close]   │
│                                                                   │
│ Buttons:  [📝 Nota]  [⚡ Automação]  [+ Trilha]                 │
│                                            ↓ click
└─────────────────────────────────────────────────────────────────┘
                                              │
                                              ↓
                                    AutomationModal opens
```

---

## Modal — List Mode (Default)

```
┌──────────────────────────────────────────┐
│ Automações Ativas                 [✕]    │
├──────────────────────────────────────────┤
│                                          │
│  [⚡] Automação 1                  [→]   │
│      Enviar convite calendário           │
│                             [Ativa]      │
│                                          │
│  ────────────────────────────────────    │
│                                          │
│  [⚡] Automação 2                  [→]   │
│      Contato follow-up                   │
│                           [Pausada]      │
│                                          │
│  ────────────────────────────────────    │
│                                          │
│  [⚡] Automação 3                  [→]   │
│      Marcar reunião                      │
│                          [Concluída]     │
│                                          │
├──────────────────────────────────────────┤
│            [+ Nova Automação]            │
└──────────────────────────────────────────┘

Color Coding:
  [Ativa] = Green (#10B981)
  [Pausada] = Yellow (#F59E0B)
  [Concluída] = Blue (#3B82F6)
  [Cancelada] = Red (#EF4444)
```

---

## Modal — Empty State (List Mode)

```
┌──────────────────────────────────────────┐
│ Automações Ativas                 [✕]    │
├──────────────────────────────────────────┤
│                                          │
│                                          │
│                  ⚡                       │
│                                          │
│       Nenhuma automação ativa            │
│                                          │
│  Crie uma automação para automatizar     │
│         ações neste lead.                │
│                                          │
│         [Criar Automação]                │
│                                          │
│                                          │
└──────────────────────────────────────────┘

Icon: Faded Zap (opacity-50)
Button: Outline variant
```

---

## Modal — Create Mode

```
┌──────────────────────────────────────────┐
│ [←] Nova Automação                [✕]    │
├──────────────────────────────────────────┤
│                                          │
│  Nome da Automação *                     │
│  ┌──────────────────────────────────┐   │
│  │ ex: Enviar convite de calendário │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Descrição                               │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │ Descrição opcional               │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Tipo de Acionamento *                   │
│  ┌──────────────────────────────────┐   │
│  │ Selecione...                 [▼] │   │
│  └──────────────────────────────────┘   │
│    ├─ Quando estágio muda               │
│    ├─ Quando há interação               │
│    └─ Acionamento manual                │
│                                          │
│  Status                                  │
│  ◉ Ativa                                 │
│  ◯ Pausada                               │
│                                          │
├──────────────────────────────────────────┤
│              [Cancelar]  [Criar]         │
└──────────────────────────────────────────┘

Transition: slide-in-from-right 200ms
Back button: Returns to list on click
```

---

## Modal — Edit Mode

```
┌──────────────────────────────────────────┐
│ [←] Editar Automação              [✕]    │
├──────────────────────────────────────────┤
│                                          │
│  Nome da Automação *                     │
│  ┌──────────────────────────────────┐   │
│  │ Enviar convite de calendário     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Descrição                               │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │ Envia convite automaticamente    │   │
│  │ quando lead muda para estágio    │   │
│  │ "qualificado".                   │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Tipo de Acionamento *                   │
│  ┌──────────────────────────────────┐   │
│  │ Quando estágio muda          [▼] │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Status                                  │
│  ◉ Ativa                                 │
│  ◯ Pausada                               │
│                                          │
├──────────────────────────────────────────┤
│ [Deletar]       [Cancelar]  [Salvar]     │
└──────────────────────────────────────────┘

Transition: slide-in-from-right 200ms
Delete button: Red/destructive variant, left-aligned
```

---

## Modal — Loading State

```
┌──────────────────────────────────────────┐
│ Automações Ativas                 [✕]    │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │ ← Skeleton
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │ ← Skeleton
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │ ← Skeleton
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘

Skeleton height: 12px (h-3) for rows
Animate: pulse effect
```

---

## Modal — Error State

```
┌──────────────────────────────────────────┐
│ Automações Ativas                 [✕]    │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ ⚠️  Erro ao carregar automações  │   │
│  │                                  │   │
│  │  Falha na requisição. Tente      │   │
│  │  novamente mais tarde.           │   │
│  │                                  │   │
│  │      [Tentar novamente]          │   │
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘

Background: bg-red-50 (light) / bg-red-900/20 (dark)
Border: 1px border-red-200 (light) / border-red-800 (dark)
Text: text-red-900 (light) / text-red-100 (dark)
```

---

## Color Palette Reference

```
PRIMARY BUTTON (Outline):
  Light:  Border: #CBD5E1 (slate-300)   BG: transparent
  Dark:   Border: #475569 (slate-600)   BG: transparent
  Hover:  Light: bg-slate-100   Dark: bg-slate-800

STATUS BADGES (All modes):
  Ativa:      #10B981 (emerald-500)     / #34D399 (emerald-400)
  Pausada:    #F59E0B (amber-500)       / #FBBF24 (amber-400)
  Concluída:  #3B82F6 (blue-500)        / #60A5FA (blue-400)
  Cancelada:  #EF4444 (red-500)         / #F87171 (red-400)

TEXT:
  Foreground: #0F172A (light)   / #F8FAFC (dark)
  Muted:      #64748B (light)   / #94A3B8 (dark)

BACKGROUNDS:
  Primary:    #FFFFFF (light)   / #1E293B (dark)
  Secondary:  #F1F5F9 (light)   / #334155 (dark)

BORDERS:
  Default:    #E2E8F0 (light)   / #475569 (dark)
```

---

## Responsive Breakpoints

### Mobile (≤640px)

```
┌────────────────────────┐
│ [📝] [⚡] [+]          │ ← Buttons stack or wrap
├────────────────────────┤
│ Lead Detail            │
│ (Full width sheet)     │
└────────────────────────┘

Modal:
  Width: 90% with 16px margins
  Max-width: None (full-screen)
  Height: max-h-[90vh]
```

---

### Tablet (641-1024px)

```
┌─────────────────────────────────────────┐
│ Lead Detail  [📝] [⚡] [+]              │
├─────────────────────────────────────────┤
│ (70% width sheet, 560px max)            │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ Automações Ativas                 │  │
│ │ (Modal: 400px max, centered)      │  │
│ └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

### Desktop (>1024px)

```
┌──────────────────────────────────────────────────────────────────┐
│ Lead Detail                              [📝] [⚡] [+]  [✕]      │
├──────────────────────────────────────────────────────────────────┤
│ (40% width sheet, 520px max)                                     │
│                                                                  │
│  ┌────────────────────────────────┐                             │
│  │ Automações Ativas              │ ← Modal: 448px (max-w-md)  │
│  │ (Dialog, z-40 over sheet)      │   Centered on screen       │
│  └────────────────────────────────┘                             │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Animation Sequences

### List → Create

```
Timeline (200ms):
┌─────────────────────────────────┐
│ 0ms    50ms    100ms    150ms 200ms
│  │      │      │        │      │
│  └──────────────────────────────┘
│        Fade in: 0 → 1
│  ─────────────────────────────────
│  Slide: translateX: 100% → 0
│
Result: Form enters from right with fade-in
```

---

### Create → List (Back Button)

```
Timeline (150ms):
┌────────────────────────────┐
│ 0ms    50ms    100ms    150ms
│  │      │      │        │
│  └────────────────────────┘
│      Fade out: 1 → 0
│  ──────────────────────────
│  Slide: translateX: 0 → 100%
│
Result: Form exits to right with fade-out
```

---

### Row Hover

```
Timeline (150ms):
Normal state:  bg-transparent
               ↓ (150ms easing)
Hover state:   bg-secondary/5 (Slate 100 light / Slate 800 dark)

Cursor: pointer
Shadow: None
```

---

## Touch Interaction Targets (Mobile)

```
Minimum touch target: 44×44px
Button touch area:    44×44px
List item height:     56px (3 rows per screen on 375px)
Modal width:          90% with 16px side margins

Examples:
  Icon button:    44×44px ✓
  Text button:    44×44px ✓
  List row:       56px height (16px padding) ✓
  Badge click:    Not directly clickable (parent row is)
```

---

## Dark Mode Verification Checklist

**AutomationModal Light Mode:**
```
Background:     #FFFFFF
Text:           #0F172A (foreground)
Muted text:     #64748B (muted-foreground)
Border:         #E2E8F0 (border)
Hover:          #F1F5F9 (secondary/5)
Button border:  #CBD5E1 (slate-300)
Status badge:   Green/Yellow/Blue/Red (500 series)
```

**AutomationModal Dark Mode:**
```
Background:     #1E293B (slate-800 equivalent)
Text:           #F8FAFC (slate-50)
Muted text:     #94A3B8 (slate-400)
Border:         #475569 (slate-600)
Hover:          #334155 (secondary/5, dark)
Button border:  #475569 (slate-600)
Status badge:   Green/Yellow/Blue/Red (400 series)
```

**Contrast Verification:**
- Foreground on background: #0F172A on #FFFFFF = 18:1 ✓
- Foreground on background: #F8FAFC on #1E293B = 18:1 ✓
- Muted on background: #64748B on #FFFFFF = 6.5:1 ✓
- Muted on background: #94A3B8 on #1E293B = 5.2:1 ✓

---

## File Structure Reference

```
apps/web/src/components/crm/
├── lead-sheet.tsx                    (existing, wire modal state)
├── lead-sheet-header.tsx             (modified, add buttons)
├── automation-modal.tsx              (NEW)
├── trail-status-badge.tsx            (NEW)
└── index.ts                          (export new components)

apps/api/src/routers/
├── automations.ts                    (NEW)
└── (add to _core/index.ts router)
```

---

**END LAYOUT DIAGRAMS**

