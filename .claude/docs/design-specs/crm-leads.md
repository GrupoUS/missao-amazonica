# NeonDash CRM / Leads — Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** CRM Pipeline + Lead Management
**Feature Area:** CRM
**Created:** 2026-04-01
**Complexity:** L4 — multi-section + state + interactions + drag-and-drop

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Colors](#2-colors)
3. [Typography](#3-typography)
4. [Layout Architecture](#4-layout-architecture)
5. [Component Inventory](#5-component-inventory)
6. [Detailed Sections](#6-detailed-sections)
7. [Animations](#7-animations)
8. [Responsive Behavior](#8-responsive-behavior)
9. [State Management](#9-state-management)
10. [Accessibility](#10-accessibility)
11. [Anti-Patterns](#11-anti-patterns)
12. [File Structure](#12-file-structure)
13. [Pre-Delivery Checklist](#13-pre-delivery-checklist)
14. [Success Criteria](#14-success-criteria)

---

## 1. Design System Overview

The CRM / Leads feature is the operational backbone of NeonDash. Its design philosophy prioritizes **operational clarity** and **pipeline visibility** while managing a high density of actionable data without visual clutter.

### Design Principles for CRM

| Principle | Application |
|-----------|-------------|
| **Data-dense but scannable** | KPI strip provides instant health snapshot; kanban columns group leads visually by pipeline stage |
| **Action proximity** | Contextual actions (WhatsApp, schedule, edit) surface on hover/focus within each lead card, not behind menus |
| **Progressive disclosure** | Filters are collapsible; lead detail opens as a Sheet overlay; advanced filters expand on demand |
| **Operational cadence** | Design supports rapid scan-act-move workflow: see a lead, assess status, drag to next stage |
| **Dual-mode architecture** | Kanban for visual pipeline management; Table for bulk operations and data analysis |

### Aesthetic DNA

The CRM adheres to the GPUS Sovereign Architect system: Azul Petroleo text, Gold accents for primary actions, tonal surface layering for depth. The high information density demands the **data-rich density extreme** (maximum useful information per viewport) rather than cinematic whitespace. Cards are compact (`p-4`), headers are uppercase with wide tracking, and value displays use monospace type.

### Stitch System Alignment

- Dark mode: Executive Gilt (Slate 950 void, Amber 400 gold, tonal layering)
- Light mode: GrupoUS (Slate 50 base, GPUS Gold `38 60% 45%`, Petroleo foreground)
- Surface hierarchy: Void > Section > Interactive > Elevated (no border dividers -- tonal shifts define boundaries)

---

## 2. Colors

### GPUS Semantic Tokens (All CRM Surfaces)

| Element | Light Token | Dark Token | Notes |
|---------|------------|------------|-------|
| Page background | `bg-background` (Slate 50) | `bg-background` (Slate 950) | Radial gradient overlay from `primary/8` at top |
| Card surfaces | `bg-card` / `bg-card/80` | `bg-card/20` / `bg-card/25` | Kanban column headers, lead cards, KPI cards |
| Primary actions | `bg-primary` (Gold) | `bg-primary` (Amber 400) | "Novo Pipeline" button, save actions |
| Focus ring | `ring-primary` | `ring-primary` | Gold ring on focused elements |
| Muted text | `text-muted-foreground` | `text-muted-foreground` (Slate 400) | Labels, secondary info |
| Borders | `border-border/40` to `border-border/60` | `border-white/10` | Ghost borders per Stitch No-Line rule |

### Lead Status Colors (Pipeline Stages)

| Status | Kanban Accent | Badge (Detail Modal) | Usage |
|--------|--------------|---------------------|-------|
| `novo` | `bg-blue-500` | `bg-amber-500/15 text-amber-500 border-amber-500/30` | New leads entering pipeline |
| `primeiro_contato` | `bg-indigo-500` | `bg-orange-500/15 text-orange-500 border-orange-500/30` | First outreach made |
| `qualificado` | `bg-teal-500` | `bg-violet-500/15 text-violet-500 border-violet-500/30` | Qualified opportunity |
| `proposta` | `bg-orange-500` | `bg-blue-500/15 text-blue-500 border-blue-500/30` | Proposal sent |
| `negociacao` | `bg-amber-500` | `bg-pink-500/15 text-pink-500 border-pink-500/30` | Active negotiation |
| `fechado` | `bg-emerald-500` | `bg-emerald-500/15 text-emerald-500 border-emerald-500/30` | Won / Converted |
| `perdido` | `bg-red-500` | `bg-red-500/15 text-red-500 border-red-500/30` | Lost / Disqualified |

### Temperature Indicators

| Temperature | Icon | Color | Background |
|------------|------|-------|------------|
| `frio` | Snowflake emoji | `text-blue-500` | `bg-blue-500/10` |
| `morno` | Sun emoji | `text-amber-500` | `bg-amber-500/10` |
| `quente` | Fire emoji | `text-red-500` | `bg-red-500/10` |

### KPI Status Dots

| Status | Class | Threshold Example |
|--------|-------|-------------------|
| Green | `bg-emerald-500` | Conversion > 25%, Response < 2h |
| Yellow | `bg-amber-400` | Conversion 15-25%, Response 2-24h |
| Red | `bg-rose-500` | Conversion < 15%, Response > 24h |

### Chart Tokens (Funnel + Origem Charts)

Uses the `CRM_CHART_COLORS` ramp defined in `crm-constants.ts`:

```
chart-1: hsl(var(--primary))         -- Gold (full opacity)
chart-2: hsl(var(--primary) / 0.85)  -- Gold 85%
chart-3: hsl(var(--primary) / 0.7)   -- Gold 70%
chart-4: hsl(var(--primary) / 0.55)  -- Gold 55%
chart-5: hsl(var(--primary) / 0.4)   -- Gold 40%
chart-6: hsl(var(--primary) / 0.3)   -- Gold 30%
chart-7: hsl(var(--primary) / 0.2)   -- Gold 20%
chart-8: hsl(var(--chart-2))         -- Green
chart-9: hsl(var(--chart-3))         -- Bright gold
```

Tooltip style uses semantic tokens: `backgroundColor: hsl(var(--card))`, `border: 1px solid hsl(var(--border) / 0.3)`.

### Forbidden Color Patterns

- No hardcoded hex values anywhere (e.g., `bg-[#0f4c75]`)
- No purple/violet/indigo as primary or brand accent
- No fintech blue/cyan as primary escape palette
- Status colors above are Tailwind palette classes, not raw hex

---

## 3. Typography

### Font Stack

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

**Brand Exception:** Inter is the intentional body fallback per GPUS design system. Manrope leads as the distinctive geometric humanist. Fira Code (NOT Fira Sans) handles all monospace needs.

### Typographic Scale in CRM

| Element | Font | Weight | Size | Tracking | Example |
|---------|------|--------|------|----------|---------|
| Page title | Manrope | Bold (700) | `text-2xl` / `text-3xl` | `tracking-tight` | "LEADS CRM" |
| KPI label | Manrope/Inter | Semibold (600) | `text-[10px]` | `tracking-wider`, uppercase | "LEADS ATIVOS" |
| KPI value | Fira Code | Bold (700) | `text-lg` / `text-2xl` | Default | "R$ 45K" |
| Column header | Manrope | Bold (700) | `text-sm` | `tracking-widest`, uppercase | "QUALIFICADO" |
| Column count badge | Fira Code | Bold (700) | `text-[10px]` | Default | "23" |
| Column total value | Fira Code | Bold (700) | `text-xs` | Default | "R$ 120K" |
| Lead card name | Manrope | Bold (700) | `text-sm` | `tracking-tight` | "Maria Silva" |
| Lead card company | Inter | Medium (500) | `text-xs` | Default | "Clinica Bella" |
| Lead card cargo | Inter | Regular (400) | `text-[10px]` | `tracking-wide`, uppercase | "DERMATOLOGISTA" |
| Lead card value | Fira Code | Bold (700) | `text-sm` | `tracking-tight` | "R$ 5.000,00" |
| Lead card tags | Inter | Medium (500) | `text-[10px]` | Default | "instagram", "vip" |
| Follow-up date | Fira Code | Medium (500) | `text-[10px]` | Default | "em 3d", "Vencido 2d" |
| Filter labels | Manrope | Medium (500) | `text-sm` | Default | "Status" |
| Filter section titles | Inter | Medium (500) | `text-sm` | `tracking-wider`, uppercase | "FILTROS AVANCADOS" |
| Detail modal name | Manrope | Bold (700) | `text-2xl` | `tracking-tight` | "Joao Costa" |
| Detail modal tabs | Inter | Regular/Semibold | `text-sm` | Default | "Detalhes / Historico / Chat / Automacoes" |
| Phone numbers | Fira Code | Regular (400) | `text-sm` | Default | "(11) 99999-9999" |
| Lead IDs | Fira Code | Regular (400) | `text-xs` | Default | "#1234" |
| Currency values everywhere | Fira Code | Bold (700) | Varies | `tracking-tight` | "R$ 1.250,00" |

### Typography Rules

- Scale contrast: KPI values (`text-2xl`) vs labels (`text-[10px]`) = 3x+ ratio
- Weight extremes: labels use `font-semibold` (600) at tiny sizes; values use `font-bold` (700) at large sizes
- Monospace for all numeric/currency data -- creates visual rhythm and ensures digit alignment
- All-caps with wide tracking for architectural labels (column headers, KPI labels, filter sections)

---

## 4. Layout Architecture

### View A: Kanban View (Default)

The kanban is the primary CRM interface. It uses a horizontal flex container with overflow scroll -- NOT CSS Grid.

```
+------------------------------------------------------------------+
| HEADER: "LEADS CRM 2.0"              [Filters] [List|Kanban]     |
+------------------------------------------------------------------+
| Pipeline ativo: [Select ▼]  [Settings] [Edit] [+ Novo Pipeline]  |
|                 | [Tags & Objecoes] [Import] [Export] [Sync] ... |
+------------------------------------------------------------------+
| KPI STRIP (2-col mobile / 5-col desktop)                         |
| [Leads Ativos] [Pipeline R$] [Conversao] [Ciclo Medio] [Ticket]  |
| [Taxa Perda] [Novos/Periodo] [Velocidade] [Qualificados] [Resp]  |
+------------------------------------------------------------------+
| CHARTS (2-col grid, conditional)                                  |
| [Funnel por Etapa]              | [Leads por Origem]             |
+------------------------------------------------------------------+
| KANBAN: flex overflow-x-auto                                      |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| | NOVO     | | 1o CONT  | | QUALIF   | | PROPOSTA | | NEGOC    | |
| | Count:23 | | Count:15 | | Count:8  | | Count:5  | | Count:3  | |
| |[+NewLead]| |          | |          | |          | |          | |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
| |          | |          | |          | |          | |          | |
| | LeadCard | | LeadCard | | LeadCard | | LeadCard | | LeadCard | |
| | LeadCard | | LeadCard | | LeadCard | |          | |          | |
| | LeadCard | | LeadCard | |          | |          | |          | |
| | LeadCard | |          | |          | |          | |          | |
| | [More..] | | [More..] | |          | |          | |          | |
| |          | |          | |          | |          | |          | |
| +----------+ +----------+ +----------+ +----------+ +----------+ |
|                                                                    |
| Total R$12K  Total R$8K   Total R$15K  Total R$6K   Total R$3K  |
+------------------------------------------------------------------+

When leads are selected:
+------------------------------------------------------------------+
|                    BULK BAR (fixed bottom, floating)               |
| "3 selecionado(s)"  | [Mover para... ▼] [Editar Campos] [Excluir]|
+------------------------------------------------------------------+
```

**Kanban Column Layout:**
- Container: `flex h-full min-w-full w-max gap-5 px-2`
- Each column: `w-[280px] min-w-[280px] shrink-0 flex-col`
- Max 5 columns visible at typical desktop width (1400px); additional columns accessible via horizontal scroll
- Drop zone: `min-h-[150px] flex-1 flex-col gap-3 overflow-y-auto`
- Wrapped in `custom-scrollbar overflow-x-auto overflow-y-auto`

### View B: Table View

```
+------------------------------------------------------------------+
| HEADER (same as Kanban)                                           |
+------------------------------------------------------------------+
| KPI STRIP (same as Kanban)                                        |
+------------------------------------------------------------------+
| CHARTS (same as Kanban)                                           |
+------------------------------------------------------------------+
| TABLE (rounded-xl border, full-height)                            |
| +--------------------------------------------------------------+ |
| | Checkbox | Nome | Email | Telefone | Status | Origem | Valor | |
| +--------------------------------------------------------------+ |
| | [ ] | Maria Silva | maria@.. | (11)... | Novo | IG | R$5k  | |
| | [ ] | Joao Costa  | joao@..  | (21)... | Qual | WA | R$8k  | |
| | ...                                                           | |
| +--------------------------------------------------------------+ |
| | Pagination: [< 1 2 3 ... 10 >]                               | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+

With selection:
+------------------------------------------------------------------+
| BULK BAR (table-specific bulk actions bar)                        |
+------------------------------------------------------------------+
```

### View Toggle

Located in the action toolbar, rendered as a segmented button group:
- Two `7x7` icon buttons (`List` and `LayoutGrid` icons)
- Active state: `variant="secondary"` with `shadow-sm`
- Container: `rounded-lg border border-border/20 bg-muted/30 p-0.5`

### Filters Panel (Right-side overlay)

```
+--------- Filters Panel (300px, right edge) ---------+
| [X close]                              "Filtros"     |
+------------------------------------------------------+
| Busca Global: [Search input_________________]        |
|                                                      |
| FILTROS RAPIDOS                                      |
| [Meus Leads] [Sem Dono]                             |
|                                                      |
| FILTROS BASICOS                                      |
| Tipo de Lead:   [Select ▼]                          |
| Status:         [Select ▼]                          |
| Origem:         [Select ▼]                          |
| Periodo:        [Select ▼]                          |
| Vendedor:       [Combobox ▼]                        |
|                                                      |
| [v] FILTROS AVANCADOS                                |
|   Valor Estimado: R$ 0 ----[====]---- R$ 100.000    |
|   Tags: [input, comma-separated]                    |
|                                                      |
| [Limpar]  [Aplicar]                                 |
+------------------------------------------------------+
```

Desktop: `motion/react` animated sidebar (`AnimatePresence`, spring transition, 300px fixed right).
Mobile: shadcn `Sheet` component, `side="right"`, full-width up to `sm:w-[400px]`.

---

## 5. Component Inventory

### shadcn/ui Primitives Used

| Primitive | Where | Notes |
|-----------|-------|-------|
| `Button` | Actions, toolbar, bulk bar, card actions | Multiple variants: `default`, `ghost`, `outline` |
| `Select` / `SelectContent` / `SelectItem` | Pipeline selector, filters, bulk status move | Controlled with `value` + `onValueChange` |
| `Dialog` / `DialogContent` | Bulk edit fields dialog, create lead, pipeline form, tags/objections | `lazy()` loaded |
| `Sheet` / `SheetContent` | Lead detail modal (right side), mobile filters | `side="right"` |
| `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Detail modal tabs: Detalhes, Historico, Chat, Automacoes | Underline style, not boxed |
| `Input` | Filters search, edit fields, value inputs | |
| `Checkbox` | Lead selection (card + column header), bulk edit toggles | |
| `Badge` | Status badge, tags, version badge | |
| `Avatar` / `AvatarFallback` / `AvatarImage` | Lead card avatar, responsible person avatar | Color-coded by lead ID |
| `Tooltip` / `TooltipContent` / `TooltipTrigger` | Objections list, follow-up date, responsible name | |
| `ScrollArea` | Detail modal content tabs | |
| `AlertDialog` | Delete lead confirmation | |
| `Popover` / `PopoverContent` / `PopoverTrigger` | Field visibility settings | |
| `Switch` | Toggle section visibility in detail modal | |
| `Skeleton` | KPI card loading state | |
| `Slider` | Value range filter (advanced) | Dual-thumb |
| `Collapsible` / `CollapsibleContent` / `CollapsibleTrigger` | Advanced filters expand/collapse | |
| `Alert` / `AlertDescription` / `AlertTitle` | Admin mode warning banner | |
| `Label` | Bulk edit field labels | |
| `FlipButton` | "Novo Lead" button in first kanban column | Custom component with front/back flip |

### Drag-and-Drop Library

**`@dnd-kit/core`** + **`@dnd-kit/sortable`** (confirmed from source imports).

Components used:
- `DndContext` -- wraps the entire kanban
- `DragOverlay` -- renders floating card during drag
- `useDroppable` -- each column is a droppable zone
- `useSortable` -- each lead card is sortable within and across columns
- `SortableContext` with `verticalListSortingStrategy`
- Sensors: `PointerSensor` (distance: 8px), `TouchSensor` (delay: 250ms, tolerance: 8px), `KeyboardSensor` (sortableKeyboardCoordinates)
- Collision detection: `rectIntersection`

### Chart Library

**Recharts** -- used for `CrmFunnelChart` (horizontal `BarChart`) and `CrmOrigemChart`.
- Components: `Bar`, `BarChart`, `Cell`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`
- NOT lazy-loaded currently (imported directly in `crm-funnel-chart.tsx`)

### Animation Library

**`motion/react`** -- used in `FiltersPanel` for sidebar enter/exit animation.
- `AnimatePresence`, `motion.div` for backdrop and sliding panel
- Spring-based transition: `damping: 25, stiffness: 300, mass: 0.8`

### Custom Components

| Component | Purpose |
|-----------|---------|
| `FlipButton` | Animated flip button for "New Lead" action |
| `ContextBadge` | Displays "Clinica" / "Mentoria" context badge |
| `ResponsavelCombobox` | Searchable combobox for assigning responsible users |
| `ErrorBoundary` / `CrmErrorBoundary` | Error boundary wrappers for graceful failure |

---

## 6. Detailed Sections

### 6a. KPI Strip

**Component:** `CrmKpiCards` (`crm-kpi-cards.tsx`)

10 KPI cards arranged in a responsive grid: `grid-cols-2 gap-2 md:grid-cols-5 md:gap-4`.

| KPI | Icon | Value Format | Status Thresholds | Delta Comparison |
|-----|------|-------------|-------------------|-----------------|
| Leads Ativos | `Users` | Integer | None | vs anterior |
| Pipeline R$ | `DollarSign` | BRL compact (`R$ 45K`) | None | vs anterior |
| Conversao | `TrendingUp` | Percentage (`12.5%`) | >25% green, 15-25% yellow, <15% red | vs anterior |
| Ciclo Medio | `Timer` | Days (`14 dias`) | <14d green, 14-30d yellow, >30d red (inverted) | vs anterior |
| Ticket Medio | `Target` | BRL compact | None | None |
| Taxa de Perda | `TrendingDown` | Percentage | <30% green, 30-50% yellow, >50% red (inverted) | None |
| Novos/Periodo | `Plus` | Integer | None | None |
| Velocidade | `Zap` | BRL/dia compact | None | None |
| Qualificados | `Star` | Integer | >10 green, 5-10 yellow, <5 red | None |
| Tempo Resposta | `Clock` | Hours or days | <2h green, 2-24h yellow, >24h red (inverted) | None |

**Card anatomy:**
```
+-------------------------------------------+
| [Icon] KPI LABEL                    [dot] |
| R$ 45.200                                 |
| ^ +12.5 (+8.2%) vs anterior              |
+-------------------------------------------+
```

- Status dot: 2x2 rounded circle in top-right, colored per thresholds
- Delta arrow: `ArrowUp` (green) or `ArrowDown` (red), with inverted logic for "lower is better" metrics
- Loading state: `KpiCardSkeleton` using `Skeleton` primitives matching card structure
- Memoized: both individual `KpiCard` and container `CrmKpiCards` wrapped in `memo()`
- Module-level `Intl.NumberFormat` instance for BRL compact formatting

### 6b. View Toggle + Action Bar

**Location:** Header section of `LeadsPageContent`

Layout: Two-row structure.

**Row 1:** Page title ("LEADS CRM 2.0") left-aligned, action toolbar right-aligned.
- Toolbar container: `rounded-xl border border-border/40 bg-card/80 p-1.5 shadow-sm dark:bg-card/50`
- Filter toggle: `Button size="icon" variant="ghost"`, active state `bg-primary/10 text-primary`
- View toggle: segmented `div` with two `7x7` buttons, active state `variant="secondary"` + `shadow-sm`

**Row 2:** Pipeline selector, column management, CRM action buttons.
- Pipeline selector: `Select` with `h-9 w-[260px]`, shows pipeline name + context badge
- Actions separated by `border-l border-border/50 pl-4 ml-4`
- Buttons: `variant="ghost"` with `text-xs`, icons at `h-3.5 w-3.5`
- "Novo Pipeline": `variant="default"` (primary gold)

### 6c. Filters Panel (Collapsible)

**Component:** `FiltersPanel` (`filters-panel.tsx`)

**Desktop mode:** Animated right-sidebar overlay (300px, fixed position, z-50).
- Backdrop: `fixed inset-0 bg-black/20` with fade animation
- Panel: spring animation (`x: "100%"` to `x: 0`)
- Close via backdrop click or X button

**Mobile mode:** shadcn `Sheet side="right"`, `w-full sm:w-[400px]`

**Filter sections:**
1. **Busca Global** -- Search input with `Search` icon, 300ms debounce
2. **Filtros Rapidos** -- "Meus Leads" + "Sem Dono" toggle buttons
3. **Filtros Basicos** -- Type (clinica/mentoria), Status (7 options), Origem (6 options), Periodo (4 options), Vendedor (combobox)
4. **Filtros Avancados** (collapsible) -- Valor Estimado dual-thumb slider (R$ 0 to R$ 100,000), Tags (comma-separated input with Badge chips)
5. **Actions** -- "Limpar" (outline) + "Aplicar" (primary) buttons, separated by `border-t pt-4`

### 6d. Kanban Columns + Lead Cards

**Column Component:** `KanbanColumn` (`kanban-column.tsx`) -- wrapped in `memo()`

**Column header anatomy:**
```
+-------------------------------------------+
| [2px accent color bar at top]             |
| COLUMN TITLE           COUNT    [checkbox]|
| [+ Novo Lead (flip button)] -- col 0 only|
+-------------------------------------------+
```

- Width: `w-[280px] min-w-[280px]`
- Header: `rounded-xl border border-border/60 bg-card p-4 shadow-sm` with hover state
- Top accent: 2px bar using column's `accentColor`, with `shadow-[0_0_10px]` neon glow
- Count badge: `rounded-full border bg-background px-2 py-0.5 font-bold text-[10px]`
- Select-all checkbox: hidden by default, `opacity-0 group-hover:opacity-100` on column hover
- Drop zone: `min-h-[150px]`, dashed border when drag active, `custom-scrollbar overflow-y-auto`
- Footer: total value pill (`font-mono text-xs`) -- only if `totalValue > 0`
- Data: `useInfiniteQuery` with `limit: 20`, `staleTime: 30s`
- "Carregar mais" button: `rounded-full` at bottom when `hasNextPage`
- Empty state: dashed border container with `Plus` icon and "Arraste leads para ca"

**Lead Card Component:** `LeadCard` (`lead-card.tsx`) -- wrapped in `memo()` with custom comparison

**Card anatomy:**
```
+-------------------------------------------+
|                               [checkbox]  |
| [Avatar] Name Surname                     |
|          Company Name                     |
|          CARGO                            |
|                                           |
| [Clinica] [2 objecoes] [tag1] [tag2] [+1]|
|                                           |
| [Resp Avatar] Resp   [Clock icon] em 3d  |
|                                           |
| ---------------------------------------- |
| R$ 5.000,00        [Schedule] [WhatsApp] |
+-------------------------------------------+
```

- Container: `rounded-xl border gap-3 p-4`
- Default: `border-border/60 bg-card shadow-sm dark:border-white/10 dark:bg-card/25`
- Hover: `-translate-y-0.5 border-primary/30 shadow-md`
- Selected: `border-primary bg-primary/5 ring-1 ring-primary`
- Dragging ghost: `scale-[0.97] opacity-40`
- Avatar: `h-10 w-10` with color-coded fallback (5-tone palette based on `lead.id % 5`)
- Status dot: 3x3 circle on avatar corner (blue for novo, emerald for qualificado, muted otherwise)
- Tags: max 3 shown, `+N` overflow badge
- Objections: amber-tinted pill with `AlertTriangle` icon, tooltip listing all objections
- Follow-up: `Fira Code` monospace, color-coded: destructive (past-due), amber (today), muted (future)
- Action buttons: `opacity-0 group-hover:opacity-100`, slide-in from right (`translate-x-2` to `translate-x-0`)
- Keyboard: `role="button" tabIndex={0}`, Enter/Space activate, respects interactive child elements
- Sortable: `useSortable` from `@dnd-kit/sortable`, ID format `lead-{id}`, disabled in select mode

### 6e. Lead Detail Modal/Sheet

**Component:** `LeadDetailModal` (`lead-detail-modal.tsx`)

Opens as a right-side `Sheet` (`side="right"`, width `sm:w-[600px] md:w-[700px]`).

**Header section:**
```
+---------------------------------------------------+
| [0.5px gold gradient line]                        |
| [Avatar 80x80]  Name [Status Badge]   [Gear][Edit][Delete] |
| [Temp emoji]    Company                            |
|                 email@domain.com                   |
|                 R$ 5.000,00                        |
|                 [Responsavel Combobox]              |
+---------------------------------------------------+
| [WhatsApp] [Objecao] [Agendar] ... [+ Nota]      |
+---------------------------------------------------+
```

**Tabs:**
1. **Detalhes** -- `LeadInfoModules` with configurable field visibility (persisted to `localStorage`)
2. **Historico** -- `LeadTimeline` merged with WhatsApp messages
3. **Chat** -- `LeadChatWindow` (full-height, provider-aware: Z-API / Meta / Baileys)
4. **Automacoes** -- `AutomacoesTab` showing automation trails

**Features:**
- Inline editing: toggle via Edit button, fields become `Input` components
- Field visibility: `Settings` popover with `Switch` toggles per section, persisted in `localStorage` key `crm_field_visibility`
- Delete confirmation: `AlertDialog` with destructive action
- Quick actions bar: WhatsApp (emerald hover), Objecao (destructive hover), Agendar (primary hover), Nota (primary filled)
- Tab underline style: `border-b-2 data-[state=active]:border-primary`
- Loading: centered `Loader2` spinner
- Error: `AlertTriangle` icon with error message and close button

### 6f. Create Lead Dialog

**Component:** `CreateLeadDialog` (lazy-loaded)

Standard shadcn `Dialog` with form fields for new lead creation. Receives `defaultPipelineId` and `defaultStageId` from the current pipeline context.

### 6g. Bulk Actions Bar

**Location:** Fixed to bottom center of viewport when `selectedLeads.size > 0`

```
+-----------------------------------------------------------+
| "3 selecionado(s)" | [Mover para... ▼] [Editar] [Excluir]|
+-----------------------------------------------------------+
```

- Container: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`
- Style: `rounded-full border bg-popover/90 px-6 py-3 shadow-2xl shadow-primary/10 backdrop-blur-md`
- Entrance animation: `slide-in-from-bottom-10 fade-in animate-in`
- "Mover para": `Select` with all pipeline columns as options, triggers `bulkUpdateStage` mutation
- "Editar Campos": opens `Dialog` with checkbox-gated field editors (responsavel, temperatura, origem, produto, valor, contexto)
- "Excluir": destructive ghost button, triggers `bulkDelete` mutation
- Count separator: `border-r border-border pr-4`

### 6h. Import/Export Dialogs

**Import:** `ImportLeadsDialog` (lazy-loaded) -- CSV/spreadsheet import interface
**Export:** `ExportLeadsButton` -- inline button, receives current filters + pipeline context
**Google Sheets Sync:** `GoogleSheetsSyncDialog` (lazy-loaded) + "Sync Rapido" inline button for bilateral sync
**Template Download:** `DownloadTemplateButton` -- downloads CSV template

### 6i. CRM Funnel Chart

**Component:** `CrmFunnelChart` (`crm-funnel-chart.tsx`)

- Horizontal bar chart (Recharts `BarChart layout="vertical"`)
- Data: `stats.leadsPorStage` array of `{ stageNome, count }`
- Height: dynamic `Math.max(stages.length * 36, 120)`
- Colors: `getCrmChartColor(index)` from gold opacity ramp
- Axis style: `fontSize: 11, fill: hsl(var(--muted-foreground))`
- Tooltip: semantic `CRM_CHART_TOOLTIP_STYLE`
- Container: `rounded-lg border border-border/30 bg-card/80 p-4 dark:bg-card/30`
- Displayed conditionally: only when `stats.leadsPorStage` has data
- Grid position: `grid-cols-1 lg:grid-cols-2` alongside `CrmOrigemChart`

**Current gap:** Recharts is NOT lazy-loaded in `crm-funnel-chart.tsx` -- it should be wrapped in `React.lazy` + `Suspense` per project rules.

### 6j. Pipeline Config Dialogs

**Column Edit:** `ColumnEditDialog` (lazy-loaded) -- manages stage order, names, and colors for current pipeline
**Pipeline Form:** `PipelineFormDialog` (lazy-loaded) -- create or edit pipeline metadata (name, context, default status)
**New Pipeline:** Same `PipelineFormDialog` opened without a `pipeline` prop

### 6k. Tag + Objection Selectors

**Tags/Objections Management:** `TagsObjectionsDialog` (lazy-loaded) -- CRUD for tags and objections
**Tag Selector:** `tag-selector.tsx` -- used within lead forms
**Objection Selector:** `objection-selector.tsx` -- used within lead forms
**Add Objection:** `AddObjectionDialog` -- quick-add from lead detail modal

---

## 7. Animations

### DnD Drag Animation

| Phase | Property | Duration | Easing | Notes |
|-------|----------|----------|--------|-------|
| Drag start | `setActiveLead` state update | Immediate | -- | Overlay appears |
| Drag overlay | `scale(1.05)` | CSS class | -- | Applied via `scale-105` on `DragOverlay` child |
| Drag overlay shadow | `shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]` | CSS class | -- | Elevated depth + primary glow |
| Drop animation | `duration: 250ms` | 250ms | `cubic-bezier(0.25, 1, 0.5, 1)` | `DragOverlay dropAnimation` config |
| Ghost placeholder | `scale-[0.97] opacity-40` | CSS class | -- | Remaining card in original position |
| All transitions on drag | `transition: none` | -- | -- | Prevents jitter during reordering |

### Column Scroll Indicator

- Drop zone border changes when drag is active over a different column: `border-2 border-primary/20 border-dashed bg-primary/5`
- Transparent border when inactive: `border-2 border-transparent`

### Lead Card Hover

| Property | From | To | Duration |
|----------|------|-----|----------|
| `transform` | `translateY(0)` | `translateY(-2px)` | 200ms |
| `border-color` | `border-border/60` | `border-primary/30` | 200ms |
| `background-color` | `bg-card` | `bg-card/95` | 200ms |
| `box-shadow` | `shadow-sm` | `shadow-md` | 200ms |
| Action buttons opacity | `0` | `1` | 200ms |
| Action buttons transform | `translateX(8px)` | `translateX(0)` | 200ms |
| Avatar scale | `1` | `1.05` | 200ms |
| Name color | `text-foreground` | `text-primary` | CSS transition |

All wrapped in `motion-safe:transition-[...]` with `motion-safe:duration-200 motion-safe:ease-out`.
`motion-reduce:` variant suppresses all card animations.

### Modal Enter/Exit (Filters Panel)

- Backdrop: `opacity: 0 -> 1` (200ms ease)
- Sidebar: `x: "100%" -> 0` (spring: damping 25, stiffness 300, mass 0.8)
- Exit: reverse of enter via `AnimatePresence`

### Lead Detail Sheet

Uses shadcn Sheet's built-in slide animation (right to left). Header has a `0.5px` gold gradient line animating via `opacity-60`.

### Bulk Bar Entrance

- `slide-in-from-bottom-10 fade-in animate-in` (Tailwind CSS animation classes)
- No JS animation -- pure CSS keyframe

### Column Header Hover

- `border-color`: transitions to `border-primary/30`
- `background-color`: transitions to slightly lighter card surface
- Duration: 300ms via `motion-safe:transition-[border-color,background-color] motion-safe:duration-300`

### `prefers-reduced-motion` Support

All CSS transitions are gated behind `motion-safe:` Tailwind variant. Users with `prefers-reduced-motion: reduce` see no hover animations, card lifts, or sliding panels. The `motion-reduce:transition-none` class is applied on sortable card wrappers.

---

## 8. Responsive Behavior

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes |
|------------|-------|---------------|
| Base (mobile) | < 768px | 2-col KPI grid, single kanban column with swipe, stacked header |
| `md` (tablet) | >= 768px | 5-col KPI grid, horizontal kanban scroll, side-by-side header |
| `lg` (desktop) | >= 1024px | Charts in 2-col grid, full kanban experience |

### KPI Strip

- Mobile: `grid-cols-2 gap-2` -- 5 rows of 2 cards
- Desktop: `grid-cols-5 gap-4` -- 2 rows of 5 cards
- Card padding: `p-3` mobile, `p-4` desktop
- Value size: `text-lg` mobile, `text-2xl` desktop

### Kanban View

- **Mobile:** Columns remain `w-[280px]` but only ~1.1 columns visible in viewport. Users swipe horizontally to navigate. The `overflow-x-auto` container enables native horizontal scroll.
- **Desktop:** Up to 5 columns visible at 1400px+ width. Horizontal scrollbar (`custom-scrollbar` CSS class) for additional columns.
- Column cards scroll vertically within each column (`overflow-y-auto` on drop zone)

### Table View

- Mobile: horizontal scroll on table container (`overflow-hidden rounded-xl`)
- Desktop: full-width table with pagination
- Table container: `h-full p-2 md:p-4`

### Header Layout

- Mobile: `flex-col items-start gap-4` -- title above, toolbar below (self-end)
- Desktop: `flex-row items-end justify-between` -- side by side

### Pipeline Selector Row

- Mobile: wraps naturally via flex
- Desktop: single row with `border-l` separator before CRM action buttons

### Charts

- Mobile: `grid-cols-1` -- stacked vertically
- Desktop: `grid-cols-1 lg:grid-cols-2 gap-4` -- side by side

### Filters Panel

- Mobile: shadcn `Sheet` component, full-width (`w-full sm:w-[400px]`)
- Desktop: Fixed-position 300px sidebar with backdrop overlay

### Lead Detail Modal

- Mobile: Full-width Sheet (`w-full`)
- Desktop: `sm:w-[600px] md:w-[700px]`, max `sm:max-w-[700px]`

### Touch Targets

- All icon buttons: minimum `h-7 w-7` (28px) for card actions, `h-8 w-8` (32px) for modal actions, `h-9 w-9` (36px) for toolbar
- `TouchSensor` configured with `delay: 250ms, tolerance: 8px` for drag-and-drop on touch devices
- Filter buttons: full-width on mobile (`flex-1`)

---

## 9. State Management

### URL State (Primary -- TanStack Router Search Params)

The route `_dashboard.crm.leads` validates search params with Zod:

| Param | Type | Default | Purpose |
|-------|------|---------|---------|
| `view` | `"table" \| "kanban"` | `"kanban"` | Active view mode |
| `page` | `number` | `1` | Table pagination |
| `pipelineId` | `number?` | Auto-selected | Active pipeline |
| `leadId` | `string?` | -- | Open lead detail modal |
| `busca` | `string?` | -- | Search query |
| `status` | `StatusFilterValue` | `"all"` | Status filter |
| `origem` | `OrigemFilterValue` | `"all"` | Origin filter |
| `periodo` | `"7d" \| "30d" \| "90d" \| "all"` | `"30d"` | Time period |
| `contexto` | `"clinica" \| "mentoria"?` | -- | Lead type |
| `valorMin` | `number?` | -- | Min estimated value |
| `valorMax` | `number?` | -- | Max estimated value |
| `tags` | `string?` | -- | Comma-separated tags |
| `responsavelUserId` | `number?` | -- | Assigned salesperson |
| `mentoradoId` | `string?` | -- | Admin impersonation |

Navigation managed by `useCrmNavigation()` hook, which provides:
- `switchView(view)` -- changes view mode
- `patchSearch(params, options?)` -- patches search params
- `openLead(id)` / `closeLead()` -- opens/closes lead detail
- `applyFilters(filters)` -- batch-updates all filter params

### Server State (tRPC + TanStack Query)

| Query | Cache Strategy | Notes |
|-------|---------------|-------|
| `leads.list` | `useInfiniteQuery`, `staleTime: 30s`, per-column | Each kanban column has its own query with `stageId` or `status` parameter |
| `leads.stats` | `staleTime: 60s`, `refetchInterval: 60s`, `placeholderData: prev` | KPI data auto-refreshes every minute |
| `leads.getById` | `placeholderData: prev`, no auto-refetch | Detail modal data |
| `pipelines.list` | `staleTime: 10min`, `gcTime: 15min` | Slow-moving config data |
| `mentorados.me` | `staleTime: 5min`, non-admin only | User context |
| `googleSheets.getConfig` | `staleTime: 60s` | Sheets sync config |

### Mutations and Invalidation

| Mutation | Optimistic Update | `onSettled` Invalidation |
|----------|-------------------|--------------------------|
| `leads.updateStatus` | Remove from source column, add to target column (cache manipulation) | `leads.list` (all columns with matching queryInput) |
| `leads.updateStage` | Same as above | `leads.list` |
| `leads.update` | Instant cache update via `setData` on `leads.getById` | `leads.list` |
| `leads.delete` | -- | `leads.list` |
| `leads.bulkUpdateStage` | -- | `leads.list` |
| `leads.bulkUpdateFields` | -- | `leads.list` |
| `leads.bulkDelete` | -- | `leads.list` |
| `googleSheets.bilateralSync` | -- | `leads.list` |

### DnD State (Local Component State)

| State | Location | Purpose |
|-------|----------|---------|
| `activeId` | `PipelineKanban` | Currently dragged card ID |
| `activeLead` | `PipelineKanban` | Full lead data for `DragOverlay` rendering |
| `localOrder` | `PipelineKanban` | Per-column reorder map (lead IDs) for same-column reordering |

### Selection State (Local Component State)

| State | Location | Purpose |
|-------|----------|---------|
| `selectedLeads` | `PipelineKanban` | `Set<number>` of selected lead IDs |
| `selectionVersion` | `PipelineKanban` | Increment counter to trigger re-render of memoized columns |
| `selectedLeadsRef` | `PipelineKanban` | Ref mirror for stable `isLeadSelected` callback |

### Ephemeral UI State (Local)

Multiple `useState` booleans in `LeadsPageContent` control dialog visibility:
`createDialogOpen`, `scheduleDialogOpen`, `columnEditOpen`, `pipelineDialogOpen`, `createPipelineOpen`, `tagsObjectionsOpen`, `importDialogOpen`, `sheetsSyncOpen`, `addToAudienceOpen`, `filtersOpen`

### Derived State

- `selectedPipeline`: derived from `pipelines` array + `search.pipelineId` (with default fallback)
- `activeStages`: derived from `selectedPipeline?.stages`
- `activeColumns`: derived from `activeStages`, mapped to column config objects
- `effectiveMentoradoId`: admin impersonation logic
- `filters`: derived from `search` params via `useMemo` in `useCrmLeadsState`

### Custom Hook: `useCrmLeadsState`

Encapsulates all state derivation:
- Auth state (`useAuth`)
- Impersonation state (`useImpersonation`)
- URL search params (`Route.useSearch()`)
- Navigation utilities (`useCrmNavigation()`)
- Derived `filters` object
- `selectedLeadId` parsing

---

## 10. Accessibility

### Keyboard DnD Alternative

`@dnd-kit/core` provides built-in `KeyboardSensor` with `sortableKeyboardCoordinates`:
- **Tab** to focus a lead card
- **Space** to pick up (start drag)
- **Arrow keys** to move between positions
- **Space** to drop
- **Escape** to cancel

The `useSortable` hook is disabled during `isSelectMode` to prevent conflicts between selection and drag behavior.

### Bulk Selection with Keyboard

- **Tab** navigates through lead cards (each has `tabIndex={0}`)
- **Enter/Space** on a card: in select mode, toggles selection; otherwise opens detail
- Column-level "Select All" checkbox: keyboard-accessible via standard checkbox behavior
- Bulk bar actions: all standard `Button` components, fully keyboard accessible

### Lead Card Focus States

- Cards have `role="button"` and `tabIndex={0}`
- `onKeyDown` handler responds to Enter and Space
- Interactive children (checkboxes, action buttons) prevent event bubbling via `closest()` checks
- `group-focus-within:` CSS classes reveal action buttons on keyboard focus (same as hover)

### Modal Focus Trap

- shadcn `Sheet` component provides automatic focus trap
- `SheetTitle` and `SheetDescription` with `sr-only` class for screen readers
- Focus returns to trigger element on close

### Screen Reader Support

- `aria-label` on all icon-only buttons ("Filtros", "Visualizar como lista", "Visualizar como kanban", "Editar colunas", "Agendar Procedimento", "Enviar WhatsApp", "Selecionar [lead name]", "Fechar filtros")
- Avatar `aria-label` with lead name
- Status dot has implied context via card structure
- Tooltip content available for objections and follow-up dates
- Delete confirmation dialog has clear title and description

### Color Contrast

- Status colors use sufficiently contrasted foreground/background pairs (e.g., `text-amber-500` on `bg-amber-500/15`)
- Card text uses `text-foreground` on `bg-card` -- meets WCAG AA
- Muted text at `text-muted-foreground` -- Slate 400 on Slate 950 in dark mode meets 4.5:1

### WCAG 2.2 Compliance

- **SC 2.4.11 (Focus Not Obscured):** Bulk bar is positioned at `bottom-6`, not overlapping page header. Filters panel has its own z-layer with backdrop.
- **SC 2.5.7 (Dragging Movements):** DnD has a non-drag alternative: bulk actions bar with "Mover para" select dropdown allows moving selected leads without dragging.
- **SC 2.5.8 (Target Size):** Action buttons are minimum 28px (7x7), toolbar buttons 36px (9x9). Touch sensor has 250ms delay + 8px tolerance.
- **SC 3.3.7 (Redundant Entry):** Create lead dialog receives `defaultPipelineId` and `defaultStageId` to pre-populate context.

---

## 11. Anti-Patterns

### Forbidden Patterns

| # | Anti-Pattern | Why It Fails | Correct Pattern |
|---|-------------|--------------|-----------------|
| 1 | Loading all leads into JS for DnD calculations | O(n) memory, freezes UI with 1000+ leads | Each column uses `useInfiniteQuery` with `limit: 20`; only loaded pages participate in DnD |
| 2 | Recharts at page level (eager import) | Recharts is ~200KB; loading it blocks initial render | `React.lazy(() => import('./crm-funnel-chart'))` + `<Suspense>` (NOTE: current code does NOT do this -- it should be fixed) |
| 3 | `framer-motion` import path | Package was renamed to `motion/react` | Always `import { motion } from "motion/react"` |
| 4 | Multiple `ScrollArea` nesting in kanban | Nested scroll containers create confusing scroll behavior, broken DnD | Single `overflow-x-auto overflow-y-auto` on kanban container; `overflow-y-auto` only on individual column drop zones |
| 5 | `transition-all` on DnD elements | Causes jitter during drag reordering as every property animates | Explicit property lists: `motion-safe:transition-[transform,opacity,box-shadow,border-color,background-color]` |
| 6 | `new Intl.NumberFormat()` inside render | Creates a new object every render, triggers GC pressure | Hoist to module scope: `const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat(...)` |
| 7 | `new Date()` inside lead card render | Creates object on every render for follow-up calculation | Currently computed inline -- acceptable since cards are memoized, but should be hoisted if performance degrades |
| 8 | JS-driven hover animations | JavaScript `mouseenter`/`mouseleave` for hover state changes kills INP | All hover effects use CSS `transition` with `motion-safe:` variant |
| 9 | Unstable callback references breaking `memo()` | Passing inline arrow functions to memoized `LeadCard` children | `useCallback` for `handleLeadClick`, `handleToggleSelect`; stable `isLeadSelected` via ref pattern |
| 10 | Barrel imports from `lucide-react` | Imports like `import { Users } from "lucide-react"` load the entire icon library | Should use direct imports: `import Users from "lucide-react/dist/esm/icons/users"` (NOTE: current code uses barrel imports -- should be migrated) |
| 11 | `as any` type assertions in tRPC data | `as any` on `useInfiniteQuery` return type and page data | Should define proper generic types for the query response shape |
| 12 | Hardcoded hex in shadows | `shadow-[0_0_8px_rgba(59,130,246,0.6)]` uses raw color values | Should use CSS custom properties: `shadow-[0_0_8px_hsl(var(--chart-5)/0.6)]` |

### Performance Anti-Patterns Avoided (Correctly Implemented)

- `memo()` with custom comparator on `LeadCard` -- prevents re-render when only unrelated props change
- `memo()` on `KanbanColumn` -- prevents full column re-render on parent state changes
- Module-scope `Intl.NumberFormat` instances
- Hoisted regex constants (`DIACRITIC_REGEX`, `STAGE_*_REGEX`)
- `useRef` + `useCallback` pattern for selection state (`selectedLeadsRef` avoids re-render cascade)
- `selectionVersion` counter triggers `useMemo` recomputation without breaking `useCallback` stability
- `placeholderData: (prev) => prev` on stats and pipeline queries prevents flash of empty state

---

## 12. File Structure

```
apps/web/src/
  components/crm/
    crm-constants.ts                  # CRM_STATUS_KEYS, CRM_STATUS_COLORS, DEFAULT_KANBAN_COLUMNS,
    |                                   CrmFilters, CRM_CHART_COLORS, getCrmChartColor
    |
    pipeline-kanban.tsx               # DndContext + columns container + DragOverlay + bulk actions bar
    kanban-column.tsx                  # Individual column: droppable + infinite query + lead cards
    kanban-skeleton.tsx               # Loading skeleton for kanban view
    lead-card.tsx                     # LeadCard (sortable) + LeadCardStatic (overlay) + LeadCardContent
    |
    leads-table.tsx                   # DataTable view with pagination
    leads-table-bulk-bar.tsx          # Table-specific bulk actions
    |
    crm-kpi-cards.tsx                 # 10 KPI cards with delta comparison
    crm-funnel-chart.tsx              # Horizontal bar chart (Recharts)
    crm-origem-chart.tsx              # Origin distribution chart (Recharts)
    |
    filters-panel.tsx                 # Filters sidebar/sheet with debounced search
    |
    lead-detail-modal.tsx             # Sheet-based lead detail with tabs
    lead-details/
      lead-info-modules.tsx           # Configurable field sections for detail tab
      lead-timeline.tsx               # Interaction + WhatsApp message timeline
      field-display.tsx               # Reusable field display component
    |
    create-lead-dialog.tsx            # New lead form dialog
    column-edit-dialog.tsx            # Pipeline stage management dialog
    pipeline-form-dialog.tsx          # Pipeline create/edit dialog
    pipeline-default-field-row.tsx    # Default field row for pipeline config
    |
    tags-objections-dialog.tsx        # Tag and objection CRUD management
    tag-selector.tsx                  # Tag multiselect component
    objection-selector.tsx            # Objection multiselect component
    add-interaction-dialog.tsx        # Quick interaction add dialog
    add-objection-dialog.tsx          # Quick objection add dialog
    |
    import-leads-dialog.tsx           # CSV/spreadsheet import
    export-leads-button.tsx           # Export filtered leads
    download-template-button.tsx      # CSV template download
    google-sheets-sync-dialog.tsx     # Google Sheets bilateral sync config
    google-sheets-connection-status.tsx # Connection status indicator
    |
    add-to-audience-dialog.tsx        # Facebook/Meta audience targeting
    |
    responsavel-combobox.tsx          # Searchable user assignment combobox
    interaction-templates-dialog.tsx  # Interaction template management
    crm-error-boundary.tsx            # CRM-scoped error boundary
    |
    automations/
      automacoes-tab.tsx              # Automation trails tab content
      automation-modal.tsx            # Automation detail modal
      step-status-badge.tsx           # Automation step status indicator
      trail-status-badge.tsx          # Automation trail status indicator
  |
  pages/crm/
    leads-page.tsx                    # Main page component (LeadsPage + LeadsPageContent)
  |
  routes/
    _dashboard.crm.leads.tsx          # TanStack Router route definition + Zod search schema
  |
  hooks/
    use-crm-leads-state.ts            # CRM state derivation hook (auth, search, nav, filters)
    use-crm-parser.ts                 # CRM data parsing utilities
  |
  lib/
    crm-navigation.ts                 # Navigation utilities (useCrmNavigation)
    currency.ts                       # parseCurrencyInput utility
    whats-app-utils.ts                # getWhatsAppUrl utility
```

### Component Size Assessment

| Component | Approximate Lines | Status |
|-----------|------------------|--------|
| `leads-page.tsx` | 600 | At limit -- well-structured with lazy imports |
| `pipeline-kanban.tsx` | 950 | Over 200-line limit -- consider extracting bulk edit dialog and mutation setup |
| `lead-card.tsx` | 509 | Over limit -- but split into 3 logical parts (Content, Static, Sortable) |
| `lead-detail-modal.tsx` | 860 | Over limit -- already partially decomposed with `lead-details/` subfolder |
| `kanban-column.tsx` | 268 | Over limit -- could extract header and footer into sub-components |
| `crm-kpi-cards.tsx` | 282 | Over limit -- but mostly data definitions, rendering is compact |
| `filters-panel.tsx` | 382 | Over limit -- could extract desktop vs mobile renderers |
| `crm-constants.ts` | 176 | OK -- data-only file |

---

## 13. Pre-Delivery Checklist

### Visual Quality

- [ ] KPI cards render correctly with skeleton loading state
- [ ] Kanban columns show proper accent color bar at top
- [ ] Lead cards display all zones: avatar, name/company, tags/context, meta row, value footer
- [ ] Status dots on avatars use correct colors for each status
- [ ] Temperature emoji renders correctly in detail modal avatar
- [ ] Charts use GPUS gold opacity ramp (no blue/purple defaults)
- [ ] Bulk bar floats correctly at viewport bottom center

### Interaction Quality

- [ ] Drag-and-drop works across columns (move lead between stages)
- [ ] Same-column reordering updates local order
- [ ] Optimistic update: card appears in target column before server confirms
- [ ] Drag overlay shows elevated card with scale and shadow
- [ ] Selection mode: checkbox appears, drag is disabled
- [ ] Bulk status change via "Mover para" dropdown works
- [ ] Bulk field edit dialog correctly toggles fields with checkboxes
- [ ] Bulk delete with confirmation works
- [ ] Filter panel opens/closes with animation
- [ ] Debounced search updates after 300ms pause
- [ ] Pipeline selector changes columns and reloads data
- [ ] View toggle switches between kanban and table with correct URL state
- [ ] Lead click opens detail sheet; URL updates with `leadId`
- [ ] Detail sheet tabs switch content correctly
- [ ] Inline editing: save persists, cancel reverts, error reverts with toast

### Responsive Behavior

- [ ] KPI grid: 2 columns on mobile, 5 on desktop
- [ ] Kanban: horizontal scroll on all screen sizes
- [ ] Table: horizontal scroll on mobile
- [ ] Filters: Sheet on mobile, animated sidebar on desktop
- [ ] Detail modal: full-width on mobile, 600-700px on desktop
- [ ] Header: stacked on mobile, side-by-side on desktop
- [ ] Charts: stacked on mobile, side-by-side on desktop

### Dark Mode

- [ ] Page background uses radial gradient from `primary/8`
- [ ] Cards use `dark:bg-card/20` to `dark:bg-card/25` (not opaque)
- [ ] Borders use `dark:border-white/10`
- [ ] Emerald value text has `dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]` glow
- [ ] Avatar tones have dark variants
- [ ] Bulk bar uses `backdrop-blur-md` with `bg-popover/90`
- [ ] Charts tooltip respects card token
- [ ] Toggle between light/dark produces no visual glitches

### Accessibility

- [ ] All icon buttons have `aria-label`
- [ ] Lead cards are keyboard-navigable (Tab, Enter/Space)
- [ ] DnD has keyboard alternative (Space to pick up, arrows to move)
- [ ] Bulk selection has non-drag alternative ("Mover para" dropdown)
- [ ] Detail sheet has `sr-only` title and description
- [ ] Delete confirmation dialog has clear labels
- [ ] Focus trap works in Sheet and Dialog components
- [ ] Color contrast meets WCAG AA (4.5:1 for text)

### Type Safety

- [ ] No `any` types in component props (check `as any` usages in `pipeline-kanban.tsx`)
- [ ] Zod search schema validates all URL params
- [ ] `CrmStatusKey` type used consistently (not raw strings)
- [ ] `CrmFilters` interface used for filter prop passing

### Performance

- [ ] Module-scope `Intl.NumberFormat` instances (no render-time allocation)
- [ ] `memo()` on `LeadCard`, `KanbanColumn`, `KpiCard`, `CrmKpiCards`, `CrmFunnelChart`
- [ ] `useCallback` on all handlers passed to memoized children
- [ ] `useMemo` on derived data (columns, query inputs, filters)
- [ ] Lazy imports for all dialogs (`React.lazy`)
- [ ] Infinite scroll with `limit: 20` per column (not loading all leads)
- [ ] `placeholderData` prevents flash of empty state
- [ ] No `transition-all` on DnD elements

### Quality Gates

- [ ] `bun run type-check` passes (tsgo, ~4s)
- [ ] `bunx biome check --write` applied to all edited files
- [ ] `bun run lint:oxlint:check` passes
- [ ] No browser console errors in CRM flows
- [ ] No hardcoded hex colors (only semantic tokens or Tailwind palette classes)

---

## 14. Success Criteria

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| 1 | **First Meaningful Paint** | Lighthouse FMP for CRM route | < 2.0s (lazy-loaded page + skeleton KPIs) |
| 2 | **Interaction to Next Paint (INP)** | Web Vitals INP during drag-and-drop | < 200ms (no JS hover animations, CSS-only transitions) |
| 3 | **Drag-and-Drop Completion** | User can move a lead between any two columns | 100% success rate with optimistic update visible < 100ms |
| 4 | **Keyboard-Only Pipeline Management** | All CRM operations achievable without mouse | DnD keyboard sensor + bulk bar "Mover para" dropdown + Tab navigation |
| 5 | **Filter-to-Result Latency** | Time from filter change to visible data update | < 500ms for status/origem filters; 300ms debounce + fetch for search |
| 6 | **Lead Detail Load Time** | Time from card click to fully rendered Sheet | < 1.0s with `placeholderData` for instant header, data fetch in background |
| 7 | **Bulk Operation Throughput** | Select 20 leads, move to new stage | Single mutation, toast confirmation < 2s |
| 8 | **Mobile Kanban Usability** | User can swipe through columns and tap to open detail | Native horizontal scroll, 250ms touch delay prevents accidental drag |
| 9 | **Dark Mode Visual Fidelity** | Toggle light/dark produces no broken colors or invisible text | All surfaces use semantic tokens; emerald values have dark glow |
| 10 | **Bundle Impact** | CRM route chunk size | < 150KB gzipped (excluding lazy-loaded dialogs and Recharts) |
| 11 | **Zero Console Errors** | No errors during standard CRM workflow | Verified on staging with ErrorBoundary + CrmErrorBoundary fallbacks |
| 12 | **Accessibility Score** | Axe/Lighthouse accessibility audit on CRM route | >= 90 (WCAG 2.1 AA compliance) |

---

## Appendix A: Known Technical Debt

| Issue | Severity | Location | Recommended Fix |
|-------|----------|----------|-----------------|
| Recharts not lazy-loaded | Medium | `crm-funnel-chart.tsx`, `crm-origem-chart.tsx` | Wrap in `React.lazy` + `Suspense` with chart-shaped skeleton |
| Barrel imports from `lucide-react` | Medium | All CRM components | Migrate to direct path imports |
| `as any` type assertions | Low | `pipeline-kanban.tsx` L70, L247, L479-512 | Define proper generic types for `useInfiniteQuery` response |
| Hardcoded shadow colors | Low | `lead-card.tsx` L229-233 | Replace `rgba(59,130,246,0.6)` with `hsl(var(--chart-5)/0.6)` |
| `pipeline-kanban.tsx` over 200 lines | Low | `pipeline-kanban.tsx` (950 lines) | Extract bulk edit dialog and mutation setup into separate files |
| `backdrop-blur-md` on bulk bar | Low | `pipeline-kanban.tsx` L677 | Per Stitch Glass Trap rule, audit for solid border fallback |

## Appendix B: CRM Status Enum (Backend Sync)

```typescript
// Source of truth: crm-constants.ts
export const CRM_STATUS_KEYS = [
  "novo",
  "primeiro_contato",
  "qualificado",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
] as const;
```

These values must stay synchronized with:
- Backend `status_lead` enum in Drizzle schema
- `leads-router.ts` Zod validation
- Route search schema in `_dashboard.crm.leads.tsx`

## Appendix C: Value Contract

`valorEstimado` is stored in **cents** (integer) in the database. All display code must divide by 100:
```typescript
BRL_CURRENCY_FORMATTER.format(lead.valorEstimado / 100)
```

The stats endpoint returns `valorPipeline` already in reais (not cents) -- this inconsistency is documented in `crm-constants.ts`.
