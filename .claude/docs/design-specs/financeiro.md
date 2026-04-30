# NeonDash Financeiro -- Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Financeiro (Financial Management)
**Feature Area:** Financeiro
**Created:** 2026-04-01
**Complexity:** L4 -- multi-section + state + interactions + charts + AI

---

## 1. Design System Overview

The Financeiro module is the financial nerve center of NeonDash. It tracks receitas (income), despesas (expenses), saldo (balance), and margem (profit margin) for mentorship clinics. The design language is **numbers-first**: every surface prioritizes quantitative data rendered in monospace numerals, with income and expense given clear directional visual cues beyond color alone.

### Financial Aesthetic Principles

- **Quantitative dominance.** Currency values, percentages, and counts are always the largest elements in any card or row. Labels are subordinate.
- **Directional language.** Income is positive (upward arrows, emerald tones, `+` prefix). Expense is negative (downward arrows, destructive tones, `-` prefix). Balance is neutral (foreground color) unless negative.
- **AI Coach integrated.** Neon Coach (Gemini-powered) is woven into the financial workflow -- not a separate tool but an embedded advisor that appears contextually in cards, analysis pages, and per-KPI drill-downs.
- **Temporal framing.** Every financial view is scoped to a period (daily through total). The PeriodSelector is always visible and controls the data context for the active view.
- **Progressive disclosure.** KPI cards expand to show descriptions. Onboarding cards dismiss permanently. AI analysis generates on demand, never auto-loads heavy content.

### Sub-Page Architecture

The Financeiro feature spans three distinct routes:

| Route | Page | Purpose |
|-------|------|---------|
| `/financeiro` | Main Financeiro | KPI strip + 6 tabs (Transacoes, Categorias, Pagamentos, Insumos, Precificacao, Procedimentos) |
| `/financeiro/analise` | Analise Financeira | Charts (line, bar, pie) + Neon Coach full analysis |
| `/financeiro/insights` | Financial Insights | KPI health grid + auto-diagnosis + financial calendar + per-KPI AI analysis |

---

## 2. Colors

All colors use GPUS semantic tokens. No hardcoded hex values in component code.

### Financial State Colors

| State | Token | Light | Dark | Usage |
|-------|-------|-------|------|-------|
| Income (positive) | `text-emerald-500` / `hsl(var(--success))` | `#10B981` | `#10B981` | Receita values, positive saldo, upward trends |
| Expense (negative) | `text-destructive` | `hsl(0 84% 60%)` | `hsl(0 63% 31%)` | Despesa values, negative saldo, downward trends |
| Balance neutral | `text-foreground` | Azul Petroleo `#0f4c75` | Slate 50 `#f8fafc` | Saldo when zero or context-neutral |
| Attention | `text-neon-gold` / `text-amber-500` | `#b45309` | `#fbbf24` | Warning KPIs, streak fire, mixed day (receita+despesa) |
| AI Coach accent | `text-neon-gold` | `#b45309` | `#fbbf24` | Neon Coach icon, badge, CTA gradient |
| Muted secondary | `text-muted-foreground` | `hsl(215 25% 40%)` | `hsl(215 20% 65%)` | Labels, descriptions, inactive states |

### Chart Tokens

| Token | Light HSL | Dark HSL | Chart Use |
|-------|-----------|----------|-----------|
| `--chart-1` | `38 60% 45%` | `43 96% 56%` | Primary series (Gold) |
| `--chart-2` | `142 76% 36%` | `217 91% 60%` | Receitas line / success series |
| `--chart-3` | `38 92% 50%` | `142 76% 36%` | Secondary gold / green |
| `--chart-4` | `0 84% 60%` | `280 84% 60%` | Despesas line / error series |
| `--chart-5` | `217 91% 60%` | `0 84% 60%` | Balance line / info series |

### Surface Tokens (Cards & Containers)

| Surface | Token | Purpose |
|---------|-------|---------|
| Page | `bg-background` | Base page behind all cards |
| Cards | `bg-card` via `NeonCard` | Transaction rows, KPI cards |
| KPI strip cells | `bg-card/80` + `border-border/60` | Compact KPI cells |
| AI Coach card | `bg-gradient-to-br from-card to-primary/5` | Subtle gold wash for AI surfaces |
| Onboarding card | `bg-primary/5 border-primary/20` | Introductory tip card |
| Calendar day (receita) | `bg-emerald-500/5 border-emerald-500/30` | Days with only income |
| Calendar day (despesa) | `bg-destructive/5 border-destructive/30` | Days with only expenses |
| Calendar day (both) | `bg-amber-500/5 border-amber-500/40` | Days with both |
| Calendar day (today) | `bg-primary/10 border-primary ring-2 ring-primary/40` | Current date highlight |

---

## 3. Typography

### Font Stack

| Role | Font | Weight | Usage in Financeiro |
|------|------|--------|---------------------|
| Headlines | **Manrope** | Bold (700) | Page titles ("Financeiro", "Analise Financeira", "Saude Financeira") |
| Body / Labels | **Inter** | Regular (400), Medium (500) | Tab labels, card descriptions, table headers |
| Currency values | **Fira Code** | Bold (700) | ALL `R$` amounts, percentages, counts, account numbers |
| KPI labels | **Inter** | Medium (500) | Uppercase tracking-wide labels ("SALDO", "RECEITAS") |

### CRITICAL: Fira Code for All Financial Numbers

Every currency value, percentage, and numeric metric MUST use `font-mono` (which resolves to `"Fira Code", "JetBrains Mono", monospace`) combined with `tabular-nums` for aligned columns.

```tsx
// Correct
<span className="font-bold font-mono text-2xl tabular-nums">R$ 5.234,00</span>

// WRONG -- never use sans-serif for currency
<span className="font-bold text-2xl">R$ 5.234,00</span>
```

**NEVER use Fira Sans.** The project uses Fira Code (monospace). Fira Sans is a different font family entirely.

### BRL Currency Formatting

All Brazilian Real values MUST use `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`. The formatter MUST be hoisted to module scope -- never instantiated inside render.

```tsx
// Module-level (hoisted)
const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Compact variant (no decimals for KPI strip)
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
```

Format: `R$ 1.234,56` (period for thousands, comma for decimals). Values stored in cents in the database; divide by 100 before display.

### Typography Scale

| Element | Classes | Example |
|---------|---------|---------|
| Page heading | `font-bold text-3xl text-foreground` | "Financeiro" |
| KPI strip label | `text-[11px] uppercase tracking-wide text-muted-foreground` | "SALDO" |
| KPI strip value | `font-bold text-xl tabular-nums` | "R$ 12.450" |
| KPI card value | `font-bold text-2xl text-foreground tabular-nums` | "42.3%" |
| KPI card name | `font-medium text-muted-foreground text-sm` | "Margem Liquida" |
| Table cell value | `font-medium tabular-nums` | "R$ 350,00" |
| Badge text | `text-[10px] uppercase font-medium` | "SAUDAVEL" |
| Chart axis | `fontSize={12}` + `text-muted-foreground` | "Jan", "R$ 5k" |
| Calendar day net | `text-[11px] font-semibold tabular-nums` | "+R$1.2k" |

---

## 4. Layout Architecture

### 4a. Main `/financeiro` Page

```
+---------------------------------------------------------------+
| DashboardLayout > ScrollArea > PageContainer                  |
+---------------------------------------------------------------+
|  [TrendingUp icon]  Financeiro                               |
+---------------------------------------------------------------+
|                                                               |
|   +-----+----------+----------+--------+----------+---------+ |
|   |Trans.|Categorias|Pagamentos| Insumos|Precific. |Proced.  | |
|   +-----+----------+----------+--------+----------+---------+ |
|                                                               |
|   Active Tab Content (one of 6):                              |
|                                                               |
|   TRANSACOES TAB (default, eagerly loaded):                   |
|   +----------------------------------------------------------+|
|   | OnboardingCard (dismissible, first-time only)            ||
|   +----------------------------------------------------------+|
|   | FinancialKpiStrip                                        ||
|   | [Saldo][Receitas][Despesas][Margem][Streak][Meta]        ||
|   +----------------------------------------------------------+|
|   | PeriodSelector   [Hoje|7d|Mensal|Tri|Sem|YTD|12m|24m|T] ||
|   +----------------------------------------------------------+|
|   | Action bar: [+Nova] [Agendar] [Importar CSV] [Exportar] ||
|   +----------------------------------------------------------+|
|   | Filter bar: [Tipo v] [Categoria v] + bulk actions        ||
|   +----------------------------------------------------------+|
|   | Transaction Table                                        ||
|   | [x] | Data | Tipo | Categoria | Descricao | Valor | ... ||
|   |     | ...rows...                                         ||
|   +----------------------------------------------------------+|
|   | Calendar toggle + Financial Calendar                     ||
|   +----------------------------------------------------------+|
|   | DailyBalanceChart (Area chart)                            ||
|   +----------------------------------------------------------+|
|   | AnaliseTab (lazy loaded)                                 ||
|   +----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

### 4b. `/financeiro/analise` Page

```
+---------------------------------------------------------------+
| DashboardLayout > ScrollArea > PageContainer                  |
+---------------------------------------------------------------+
|  [Bot icon]  Analise Financeira        [Periodo: 01/01-31/03]|
+---------------------------------------------------------------+
|                                                               |
|  KPI Row (grid-cols-1 sm:2 lg:4):                            |
|  +-----------+-----------+-----------+-----------+            |
|  |Saldo Mes  |Marg.Liq.  |Tendencia  |Custo MDR |            |
|  |R$ 45.230  |32.1%      |+5.2%      |R$ 1.820  |            |
|  +-----------+-----------+-----------+-----------+            |
|                                                               |
|  Charts Row (grid-cols-1 lg:2):                              |
|  +---------------------------+---------------------------+    |
|  | Evolucao Mensal           | Formas de Pagamento       |    |
|  | (LineChart: Rec/Desp/Sal) | (BarChart horizontal)     |    |
|  +---------------------------+---------------------------+    |
|                                                               |
|  Category Breakdown (grid-cols-1 lg:2):                      |
|  +---------------------------+---------------------------+    |
|  | Receitas por Categoria    | Despesas por Categoria    |    |
|  | (PieChart donut)          | (PieChart donut)          |    |
|  +---------------------------+---------------------------+    |
|                                                               |
|  Neon Coach Full Analysis Card:                              |
|  +-----------------------------------------------------------+|
|  | [Bot] Neon Coach [Analise Completa]                       ||
|  |                                                           ||
|  | [Empty state: PiggyBank icon + CTA]                       ||
|  | -- OR --                                                  ||
|  | [Shaped skeleton during generation]                       ||
|  | -- OR --                                                  ||
|  | [Markdown-rendered full analysis]                         ||
|  |                                           [Atualizar btn] ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

### 4c. `/financeiro/insights` Page

```
+---------------------------------------------------------------+
| DashboardLayout > ScrollArea > PageContainer                  |
+---------------------------------------------------------------+
|  Saude Financeira [sparkle]   [Periodo: Abril 2026]          |
+---------------------------------------------------------------+
|                                                               |
|  Auto-Diagnosis Banner (conditional, dismissible):           |
|  +-----------------------------------------------------------+|
|  | [AlertTriangle] Diagnostico Automatico           [X]     ||
|  | "3 indicadores criticos identificados..."                 ||
|  | [Badge: Margem: -5%] [Badge: ROI: 0.8x]                  ||
|  +-----------------------------------------------------------+|
|                                                               |
|  Summary Strip (grid-cols-1 md:4):                           |
|  +----------+----------+----------+----------+               |
|  |Positivos |Atencao   |Criticos  |Tend.Geral|               |
|  |  12      |  4       |  3       | Estavel  |               |
|  +----------+----------+----------+----------+               |
|                                                               |
|  Neon Coach Card (full-width, with gradient):                |
|  +-----------------------------------------------------------+|
|  | [Bot] Neon Coach [Insights IA] [Powered by Gemini]       ||
|  |                                [Gerar Analise Completa]   ||
|  | [Empty state / Skeleton / Markdown analysis]              ||
|  +-----------------------------------------------------------+|
|                                                               |
|  KPI Grid (grid-cols-1 sm:2 lg:3 xl:4):                     |
|  +--------+--------+--------+--------+                       |
|  | KPI 1  | KPI 2  | KPI 3  | KPI 4  |                       |
|  | Value  | Value  | Value  | Value  |                       |
|  |[status]|[status]|[status]|[status]|                       |
|  +--------+--------+--------+--------+                       |
|  | ... up to 19 KPI cards ...        |                       |
|  +-----------------------------------+                       |
|                                                               |
|  Financial Calendar (full-width):                            |
|  +-----------------------------------------------------------+|
|  | [<] Abril de 2026 [>]                          [Hoje]     ||
|  | Dom  Seg  Ter  Qua  Qui  Sex  Sab                        ||
|  |      1    2    3    4    5    6                            ||
|  |      [bars][bars]    [bars]                               ||
|  | 7    8    9    ...                                        ||
|  +-----------------------------------------------------------+|
|                                                               |
|  Per-KPI Analysis Sheet (slides from right):                 |
|  +-----------------------------------------------------------+|
|  | [Bot] Analise: Margem Liquida                             ||
|  | [Markdown analysis content]                               ||
|  +-----------------------------------------------------------+|
|                                                               |
+---------------------------------------------------------------+
```

---

## 5. Component Inventory

### shadcn/ui Components Used

| Component | Import | Usage |
|-----------|--------|-------|
| `NeonCard` / `NeonCardContent` / `NeonCardHeader` / `NeonCardTitle` | `@/components/ui/neon-card` | All cards (KPI, Coach, Calendar, Charts) |
| `NeonTabs` / `NeonTabsList` / `NeonTabsTrigger` / `NeonTabsContent` | `@/components/ui/neon-tabs` | Main page 6-tab navigation |
| `Button` | `@/components/ui/button` | All actions (CTA, filter, navigate) |
| `Badge` | `@/components/ui/badge` | KPI status, period display, payment status |
| `Table` / `TableBody` / `TableCell` / `TableHead` / `TableHeader` / `TableRow` | `@/components/ui/table` | Transaction list |
| `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` | `@/components/ui/dialog` | New transaction form, NFS-e dialog |
| `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` / `SheetDescription` | `@/components/ui/sheet` | Per-KPI AI analysis slide-over |
| `Select` / `SelectContent` / `SelectItem` / `SelectTrigger` / `SelectValue` | `@/components/ui/select` | Filter dropdowns, form selects |
| `Input` | `@/components/ui/input` | Form inputs (valor, descricao) |
| `Textarea` | `@/components/ui/textarea` | Multi-line form inputs |
| `Label` | `@/components/ui/label` | Form labels |
| `Checkbox` | `@/components/ui/checkbox` | Bulk selection in transaction table |
| `Skeleton` | `@/components/ui/skeleton` | Loading states for all async sections |
| `Tooltip` / `TooltipContent` / `TooltipTrigger` / `TooltipProvider` | `@/components/ui/tooltip` | KPI formula tooltips, calendar day details |
| `Calendar` | `@/components/ui/calendar` | Date picker in recurring form |
| `Popover` / `PopoverContent` / `PopoverTrigger` | `@/components/ui/popover` | Calendar popover wrapper |
| `Form` / `FormControl` / `FormField` / `FormItem` / `FormLabel` / `FormMessage` | `@/components/ui/form` | Recurring transaction form (react-hook-form integration) |
| `AnimatedCounter` | `@/components/ui/animated-counter` | KPI strip count-up animations |

### Recharts Components (ALWAYS React.lazy + Suspense)

| Component | Chart Type | Page |
|-----------|------------|------|
| `AreaChart` + `Area` | Daily balance flow | Transacoes tab |
| `LineChart` + `Line` | Monthly trend (receitas/despesas/saldo) | Analise page |
| `BarChart` + `Bar` | Payment methods distribution | Analise page |
| `PieChart` + `Pie` + `Cell` | Category breakdown (receitas/despesas) | Analise page |
| `ResponsiveContainer` | Wrapper for all charts | All chart surfaces |
| `CartesianGrid` / `XAxis` / `YAxis` / `Tooltip` / `Legend` | Chart infrastructure | All charts |

### Custom Financial Components

| Component | File | Purpose |
|-----------|------|---------|
| `FinancialKpiStrip` | `financial-kpi-strip.tsx` | 6-cell compact KPI bar (Saldo, Receitas, Despesas, Margem, Streak, Meta) |
| `KPICard` | `kpi-card.tsx` | Expandable KPI card with status badge, trend, formula tooltip, AI analyze action |
| `KPIGrid` | `kpi-grid.tsx` | Grid layout for KPICard collection |
| `FinancialCalendar` | `financial-calendar.tsx` | Monthly calendar with per-day revenue/expense mini-bars |
| `DailyBalanceChart` | `daily-balance-chart.tsx` | Area chart showing daily net flow |
| `PeriodSelector` | `period-selector.tsx` | 9-option period picker (diario through total) |
| `OnboardingCard` | `onboarding-card.tsx` | Dismissible first-time setup guide |
| `RecurringTransactionForm` | `recurring-transaction-form.tsx` | Dialog form for scheduled/recurring transactions |
| `FileImportDialog` | `file-import-dialog.tsx` | CSV import dialog with column mapping |
| `NeonCoachCard` | `cards/neon-coach-card.tsx` | Compact AI coach card with quick analysis |
| `GoalCard` | `cards/goal-card.tsx` | Monthly revenue goal progress bar |
| `StreakCard` | `cards/streak-card.tsx` | Consecutive-days recording streak |
| `InsightCard` | `cards/insight-card.tsx` | Individual AI insight display |
| `FinancialSummaryCard` | `cards/financial-summary-card.tsx` | Summary statistics card |
| `QuickActionCard` | `cards/quick-action-card.tsx` | Quick financial action shortcuts |

---

## 6. Detailed Sections

### 6a. KPI Strip (FinancialKpiStrip)

**Grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2`

Six compact cells with staggered entrance animation (50ms delay between children, 300ms per cell):

| Cell | Label | Value Format | Color Logic |
|------|-------|-------------|-------------|
| Saldo | "SALDO" | `R$ X.XXX` | emerald-500 if >= 0, destructive if < 0 |
| Receitas | "RECEITAS" | `R$ X.XXX` | Always emerald-500 |
| Despesas | "DESPESAS" | `R$ X.XXX` | Always destructive |
| Margem | "MARGEM" | `XX.X%` | emerald-500 if > 20%, amber-500 if 10-20%, destructive if < 10% |
| Streak | "STREAK" | `X dias` | amber-500 if > 0, muted-foreground if 0 |
| Meta | "META" | `XX%` | emerald-500 if >= 80%, amber-500 if >= 50%, muted-foreground otherwise |

Each value uses `AnimatedCounter` with `duration={1}` (1 second count-up from 0). The counter respects `prefers-reduced-motion` via `useReducedMotion()` from `motion/react`.

**Data source:** `trpc.financeiro.transacoes.resumo` (staleTime: 30s) + `trpc.mentorados.me` (for meta).

### 6b. Period Selector

**Type:** `PeriodType = "diario" | "semanal" | "mensal" | "trimestral" | "semestral" | "ytd" | "12m" | "24m" | "total"`

**Visual:** Horizontal pill bar with `CalendarDays` icon. Active period uses `variant="secondary"`, inactive uses `variant="ghost"`. Each button is `h-7 px-2.5 text-xs`.

**Behavior:** Selection changes `dataInicio`/`dataFim` computed by `getDateRangeForPeriod()`, which recalculates date ranges using local timezone formatting (avoids UTC date-shift). Default: `"mensal"`.

### 6c. Transactions Tab (TransacoesTab)

**Eagerly loaded** (not lazy) since it is the default tab.

**Sub-sections:**

1. **OnboardingCard** -- dismissible via `localStorage`, 4-step guide
2. **FinancialKpiStrip** -- compact KPI bar
3. **PeriodSelector** -- controls date range
4. **Action bar** -- `+Nova Transacao` dialog, `Agendar` recurring form, CSV Import, Export
5. **Filter bar** -- Tipo (all/receita/despesa), Categoria dropdown
6. **Bulk actions** -- When selections active: selected count, total, bulk tipo/categoria edit, bulk delete
7. **Transaction table** -- Checkbox | Data | Tipo | Categoria | Descricao | Cliente/Fornecedor | Forma Pgto | Valor | Status badge | Actions (edit/delete/NFS-e)
8. **Inline editing** -- Click edit icon to transform row cells into inputs
9. **External payments section** -- Asaas/Kiwify synced payments with sync buttons
10. **Financial Calendar** -- togglable via button
11. **DailyBalanceChart** -- Area chart of daily flow
12. **AnaliseTab** -- lazy-loaded analysis sub-tab

**Transaction form dialog fields:** Data, Tipo (receita/despesa), Descricao, Valor (BRL), Categoria, Forma de Pagamento, Cliente/Fornecedor.

**Payment status badges:**

| Status | Variant | Color |
|--------|---------|-------|
| confirmado | `default` | Primary |
| pendente | `secondary` | Muted |
| atrasado | `destructive` | Red |
| estornado | `outline` | Border only |
| cancelado | `outline` | Border only |

### 6d. Categories Tab (CategoriasTab)

Lazy-loaded. Pie chart showing category distribution + CRUD list of categories (nome, tipo, description). Categories are filtered by tipo (receita/despesa).

### 6e. Payment Methods Tab (FormasPagamentoTab)

Lazy-loaded. CRUD list of payment methods (nome, MDR percentage, description). MDR costs calculated and displayed alongside totals.

### 6f. Daily Balance Chart (DailyBalanceChart)

**Chart type:** `AreaChart` (Recharts) with gradient fill.

**Gradient:** Linear from `hsl(var(--primary))` at 30% opacity to 0% opacity (top to bottom).

**Axes:**
- X: Day of month (`format(date, "dd")`)
- Y: Currency (`R$ {value}`)

**Tooltip:** Custom component showing full date (`dd 'de' MMMM` in pt-BR locale) and formatted saldo.

**Grid:** Dashed, `hsl(var(--border) / 0.5)`, horizontal only.

**Data:** Values stored in cents, divided by 100 for display. Source: `trpc.financeiro.transacoes.dailyFlow`.

### 6g. Financial Calendar (FinancialCalendar)

**Custom component** (not shadcn Calendar). Full-month view with:

- **Weekday headers:** Dom, Seg, Ter, Qua, Qui, Sex, Sab
- **Day cells:** Minimum 76px height. Show proportional mini-bars (receita bar in emerald, despesa bar in destructive). Bars scale relative to month's maximum daily value (max 24px height).
- **Net value label:** `text-[11px] font-semibold tabular-nums` showing `+R$X.Xk` or `-R$X.Xk`.
- **Today highlight:** `border-primary bg-primary/10 ring-2 ring-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.25)]` + "HOJE" badge.
- **Tooltips:** Full date, receitas total, despesas total, net saldo, transaction count.
- **Month navigation:** `AnimatePresence` with directional slide (24px X offset, 220ms). "Hoje" button appears when not on current month.
- **Legend:** Color-coded indicator bar for Receitas, Despesas, Ambos, Hoje.
- **Reduced motion:** `useReducedMotion()` disables slide animation (0 offset, 0 duration).

**Data sources:** `trpc.financeiro.transacoes.calendar` + `trpc.financeiro.transacoes.calendarExternalPayments` (combined).

### 6h. AI Insights Page (Financial Insights)

Three AI-powered features:

1. **Auto-Diagnosis banner** -- `trpc.financeiro.coach.autoDiagnosis` (staleTime: 5min, no refetchOnWindowFocus). Shows critical KPI badges. Dismissible per session.
2. **Full Analysis** -- `trpc.financeiro.coach.getFullAnalysis` mutation. Renders Markdown via `react-markdown`. Shows shaped skeleton during generation.
3. **Per-KPI Analysis** -- `trpc.financeiro.coach.analyzeKPI` mutation. Opens in a `Sheet` (slide-over from right, max-width `sm:max-w-lg`). Accepts KPI context (id, name, value, status, formula, negativeMessage).

**Streaming skeleton pattern (during AI generation):**

```tsx
// Paragraph-shaped skeleton (not a spinner)
<div className="space-y-2">
  <Skeleton className="h-4 w-full bg-primary/10" />
  <Skeleton className="h-4 w-[95%] bg-primary/10" />
  <Skeleton className="h-4 w-[90%] bg-primary/10" />
  <Skeleton className="h-4 w-[85%] bg-primary/10" />
</div>
```

Each skeleton line is slightly shorter than the previous, creating a paragraph shape. Background uses `bg-primary/10` (gold tint) to differentiate from generic loading.

**Progress label during AI generation:**
```tsx
<div className="flex items-center gap-2 text-neon-gold/80 italic">
  <Sparkles className="h-4 w-4 animate-spin" />
  Gerando analise completa...
</div>
```

### 6i. Neon Coach Card

**Placement:** Can appear in Transacoes tab, Analise page, and Insights page.

**Visual structure:**
- Gold gradient icon container (`bg-gradient-to-br from-neon-gold/20 to-amber-500/10 border border-neon-gold/30`)
- "Neon Coach" heading with "IA" badge (gold gradient, `text-[9px] uppercase tracking-wider`)
- Quick stats badges (saldo + margem) shown before analysis
- Content area: empty state / skeleton / markdown
- CTA button: `bg-gradient-to-r from-neon-gold to-amber-500 text-neon-navy shadow-lg shadow-neon-gold/20`

**Background decoration:** Subtle animated glow (pulse on gold blur) + faded Sparkles icon at top-right (`opacity-[0.07]`).

### 6j. Goal and Streak Cards

**GoalCard:**
- Shows monthly revenue target percentage with animated progress bar
- Progress bar animates from 0 to target width over 1.2s with custom ease `[0.22, 1, 0.36, 1]`
- Color: emerald >= 80%, amber >= 50%, muted otherwise
- Goal value from `trpc.mentorados.me` (metaFaturamento field)

**StreakCard:**
- Shows consecutive days with financial entries
- Fire icon (`Flame`) fills with amber when streak > 0
- Pulse animation on fire icon container when active
- Badge showing "X dias seguidos" when streak > 3

### 6k. Onboarding Card

**Props:** `title`, `steps[]`, `storageKey`, `actionLabel?`, `onAction?`, `expandedContent?`, `expandedLabel?`

**Behavior:**
- Persists dismissal in `localStorage` using `storageKey`
- Returns `null` when dismissed
- Steps rendered as ordered list
- Optional expandable section (collapsible guide)
- Optional action button with loading spinner

**Financeiro-specific steps:**
1. Use 'Nova Transacao' para registrar uma receita ou despesa
2. Informe data, tipo (receita/despesa) e valor
3. Selecione categoria e forma de pagamento (opcional)
4. Ou importe varias transacoes de uma vez via CSV

### 6l. Recurring Transaction Form

**Dialog form** using `react-hook-form` + `@hookform/resolvers/zod`.

**Schema:**
- `descricao`: string, required
- `tipo`: enum (receita/despesa)
- `valor`: number, positive (in Reais, converted to cents on submit)
- `categoriaId`: optional number
- `formaPagamentoId`: optional number
- `frequencia`: enum (unica/parcelada/mensal)
- `dataVencimento`: Date (must be future)
- `totalParcelas`: 2-120 (shown only for "parcelada")
- `intervaloMeses`: >= 1 (shown only for "mensal")

**Layout:** 2-column grid for tipo+valor, 2-column for categoria+pagamento. Date picker uses Calendar popover. Categories filter by selected tipo.

---

## 7. Animations

### KPI Strip Stagger Entrance

```typescript
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const cellVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};
```

Total sequence: ~380ms (80ms delay + 6 cells x 50ms stagger). GPU-accelerated (`opacity` + `transform` only).

### AnimatedCounter (KPI Values)

Duration: 600ms-1000ms (configurable per KPI). Eases from 0 to target value. Formatted via `formatFn` callback (BRL currency or plain number).

### Calendar Month Slide

```typescript
const slideVariants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};
// Duration: 220ms, ease: "easeInOut"
```

Uses `AnimatePresence` with `mode="wait"` and directional custom value.

### Goal Progress Bar

```typescript
initial: { width: 0 }
animate: { width: `${percentage}%` }
transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }
```

### Chart Load Animation

Charts appear within `NeonCard` containers. Loading state uses `animate-pulse` on the card container with a `Loader2` spinner (animate-spin).

### AI Skeleton Animation

Paragraph-shaped skeleton lines with `bg-primary/10`. Skeleton component uses built-in shimmer animation. Sparkles icon uses `animate-spin` during generation.

### Reduced Motion Support (MANDATORY)

All animations check `useReducedMotion()` from `motion/react`:
- KPI strip: `initial={prefersReduced ? false : "hidden"}`
- Calendar slide: `x: dir * (prefersReduced ? 0 : 24)`, `duration: prefersReduced ? 0 : 0.22`
- Goal bar: `initial={prefersReduced ? {} : { width: 0 }}`

---

## 8. Responsive Behavior

### Breakpoint Strategy (Mobile-First)

| Component | Mobile (< 640px) | Tablet (640-1023px) | Desktop (>= 1024px) |
|-----------|-------------------|---------------------|----------------------|
| KPI Strip | `grid-cols-2` | `grid-cols-3` | `grid-cols-6` |
| Summary cards | `grid-cols-1` | `grid-cols-2` | `grid-cols-4` |
| Tabs | Horizontally scrollable | Full width | Full width |
| Charts row | `grid-cols-1` stacked | `grid-cols-1` | `grid-cols-2` |
| KPI Grid | `grid-cols-1` | `grid-cols-2` | `grid-cols-3 xl:grid-cols-4` |
| Calendar | Hidden (list view) | Full calendar | Full calendar |
| Period Selector | Scrollable overflow | Full inline | Full inline |
| Transaction table | Horizontally scrollable | Full | Full |
| Page header | Column layout | Row with gap-4 | Row with space-between |

### Mobile-Specific Adaptations

- **Tabs overflow:** The 6-tab NeonTabsList scrolls horizontally on mobile. Each trigger maintains minimum touch target of 44x44px.
- **Calendar mobile:** On screens < 640px, the financial calendar should collapse to a list view showing only days with transactions. The 7-column grid is too dense for small screens.
- **Period selector:** Wraps into a scrollable container on mobile. Button size `h-7 px-2.5` maintains touch targets.
- **Table actions:** Edit/delete actions collapse into a dropdown menu on mobile.
- **Dialog forms:** `max-w-md` ensures forms don't stretch on mobile. Form fields stack vertically.

---

## 9. State Management

### Server State (tRPC + TanStack Query)

| Query | Router Path | staleTime | Notes |
|-------|-------------|-----------|-------|
| Transaction list | `financeiro.transacoes.list` | 30s | Filtered by `dataInicio`/`dataFim` |
| Transaction summary | `financeiro.transacoes.resumo` | 30s | Current month totals |
| Daily flow | `financeiro.transacoes.dailyFlow` | 30s | Chart data |
| Calendar events | `financeiro.transacoes.calendar` | default | Internal transactions |
| External payments calendar | `financeiro.transacoes.calendarExternalPayments` | default | Asaas/Kiwify synced |
| External payments list | `financeiro.transacoes.listExternalPayments` | 5min | Synced payment list |
| Categories | `financeiro.categorias.list` | 5min | Rarely changes |
| Payment methods | `financeiro.formasPagamento.list` | 5min | Rarely changes |
| All KPIs | `financeiro.kpis.getAll` | default | 19 financial health indicators |
| Auto-diagnosis | `financeiro.coach.autoDiagnosis` | 5min | AI-generated, no refetchOnWindowFocus |
| Detailed metrics | `financeiro.coach.getDetailedMetrics` | default | Charts + KPI data for analise page |
| Mentorado profile | `mentorados.me` | 30s | For metaFaturamento goal |

### Mutations (tRPC)

| Mutation | Purpose | Invalidates |
|----------|---------|-------------|
| `financeiro.transacoes.create` | New transaction | list, resumo, calendar, dailyFlow, kpis, autoDiagnosis, external |
| `financeiro.transacoes.update` | Edit single transaction | Same as create |
| `financeiro.transacoes.delete` | Delete single | Same |
| `financeiro.transacoes.deleteAll` | Bulk delete | Same |
| `financeiro.transacoes.bulkUpdate` | Bulk edit tipo/categoria | Same |
| `financeiro.transacoes.batchImportGeneric` | CSV import | Same |
| `financeiro.transacoes.createRecurring` | Scheduled/recurring | list, resumo, calendar, dailyFlow, kpis, autoDiagnosis |
| `financeiro.nfse.emitir` | Emit NFS-e | All financeiro |
| `financeiro.nfse.consultar` | Check NFS-e status | All financeiro |
| `financeiro.coach.getFullAnalysis` | AI full analysis | None (sets local state) |
| `financeiro.coach.analyzeKPI` | Per-KPI AI analysis | None (sets local state) |
| `asaasPayment.syncRecent` | Sync Asaas payments | External payments |
| `kiwifySync.syncSales` | Sync Kiwify sales | External payments |

### Local UI State

| State | Location | Type | Purpose |
|-------|----------|------|---------|
| `activeTab` | `financeiro-page.tsx` | `useState("transacoes")` | Active tab in main page |
| `periodType` | `transacoes-tab.tsx` | `useState<PeriodType>("mensal")` | Selected period |
| `selectedIds` | `transacoes-tab.tsx` | `useState<Set<number>>` | Bulk selection |
| `editingIds` | `transacoes-tab.tsx` | `useState<Set<number>>` | Inline edit mode rows |
| `editValues` | `transacoes-tab.tsx` | `useState<Record<number, Partial<...>>>` | Inline edit values |
| `filterCategoria` | `transacoes-tab.tsx` | `useState("all")` | Category filter |
| `filterTipo` | `transacoes-tab.tsx` | `useState("all")` | Tipo filter |
| `showCalendar` | `transacoes-tab.tsx` | `useState(true)` | Calendar visibility toggle |
| `showRecurringForm` | `transacoes-tab.tsx` | `useState(false)` | Recurring form dialog |
| `isDialogOpen` | `transacoes-tab.tsx` | `useState(false)` | New transaction dialog |
| `formData` | `transacoes-tab.tsx` | `useState({...INITIAL_FORM_DATA})` | New transaction form |
| `currentMonth` | `financial-calendar.tsx` | `useState(() => new Date())` | Calendar month view |
| `directionRef` | `financial-calendar.tsx` | `useRef<1\|-1>(1)` | Slide direction |
| `fullAnalysis` | `analise-financeira-page.tsx` | `useState<string\|null>(null)` | AI analysis result |
| `aiAnalysis` | `financial-insights-page.tsx` | `useState<string\|null>(null)` | AI analysis result |
| `kpiAnalysis` | `financial-insights-page.tsx` | `useState<{name, content}\|null>(null)` | Per-KPI analysis |
| `isDiagnosisDismissed` | `financial-insights-page.tsx` | `useState(false)` | Session-level dismissal |
| `analysis` | `neon-coach-card.tsx` | `useState<string\|null>(null)` | Quick analysis result |

### AI Streaming State

The Analise page supports dual-path AI generation:

1. **AI Gateway path (preferred):** `useAgentChat("financial")` hook provides `send()`, `isLoading`, `isGatewayEnabled`.
2. **tRPC fallback path:** `trpc.financeiro.coach.getFullAnalysis.useMutation()` for when gateway is disabled.

Both paths set `fullAnalysis` state with the response string. The loading state is `gatewayLoading || legacyLoading`.

---

## 10. Accessibility

### Screen Reader Labels for Financial Data

Every KPI value MUST communicate both the metric name and its direction:

```tsx
// KPI Strip cells use visible labels + tabular-nums
<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
  Receitas
</span>
<span className="font-bold text-emerald-500 text-xl tabular-nums"
      aria-label="Receitas: R$ 5.234 - positivo">
  R$ 5.234
</span>
```

### Color is NOT the Only Indicator

Income and expense are distinguished by THREE redundant signals:

1. **Color** -- emerald-500 for income, destructive for expense
2. **Icon** -- `TrendingUp` / `ArrowUpRight` for income, `TrendingDown` / `ArrowDownRight` for expense
3. **Label text** -- "Receita" / "Despesa" label, `+`/`-` prefix on values

Calendar day cells use the same triple redundancy: bar color + net value sign + tooltip text.

### Keyboard Navigation

- **Tab navigation** -- All interactive elements (buttons, inputs, tabs) are keyboard-focusable
- **Calendar navigation** -- Month prev/next buttons have `aria-label` ("Mes anterior", "Proximo mes")
- **Dialog trap** -- All Dialog and Sheet components trap focus within when open
- **KPI card expand** -- Expand/collapse button is a proper `<Button>` with text label
- **Bulk selection** -- Checkboxes in table rows are keyboard-accessible

### Focus Management

- Dialog opening moves focus to first interactive element
- Sheet closing returns focus to trigger element
- Tab switching uses `NeonTabs` built-in keyboard handling (arrow keys)

### ARIA Attributes

| Element | ARIA | Value |
|---------|------|-------|
| Calendar nav buttons | `aria-label` | "Mes anterior" / "Proximo mes" / "Ir para o mes atual" |
| Dismiss buttons | `aria-label` | "Fechar dica" |
| KPI formula info | `cursor-help` | Tooltip on hover/focus |
| Status badges | Semantic text | "Saudavel" / "Atencao" / "Critico" |

### Touch Targets

- All buttons: minimum 44x44px effective area (achieved via padding on smaller visual buttons)
- Period selector buttons: `h-7 px-2.5` (28px height) -- adequate spacing between options provides effective 44px touch targets
- Calendar day cells: `min-h-[76px]` provides ample touch area
- Table row actions: standard icon button size with padding

---

## 11. Anti-Patterns

### Things to NEVER Do

| # | Anti-Pattern | Why It Fails | Correct Pattern |
|---|-------------|-------------|-----------------|
| 1 | Using color alone to distinguish income/expense | Fails WCAG 1.4.1 (Use of Color). 8% of males are colorblind. | Triple redundancy: color + icon + text label. Always show `+`/`-` prefix and "Receita"/"Despesa" label alongside color. |
| 2 | Importing Recharts at page level | Recharts is ~200KB+. Importing at page level means it loads even when the chart tab is not active. | `React.lazy(() => import("recharts"))` with `<Suspense fallback={<ChartSkeleton />}>`. Charts are lazy-loaded tab content. |
| 3 | Hardcoding BRL currency format | `"R$ " + value.toFixed(2)` breaks for values >= 1000 (missing thousands separator) and ignores locale conventions. | `new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` hoisted to module scope. |
| 4 | Using `framer-motion` package | The project uses `motion/react` (the renamed package). Importing from `framer-motion` creates duplicate bundles. | Import from `motion/react`: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"` |
| 5 | Using `onSuccess` for query invalidation in mutations | `onSuccess` does not fire on network errors. Stale cache persists after failed rollback. | Use `onSettled` for `queryClient.invalidateQueries()` to ensure cache freshness regardless of success/failure. |
| 6 | Creating `new Intl.NumberFormat()` inside render | Instantiates a new formatter on every render cycle. Causes GC pressure on lists with many formatted values. | Hoist formatter to module scope: `const fmt = new Intl.NumberFormat(...)` then use `fmt.format(value)`. |
| 7 | Using `new Date()` in render path | Creates garbage every render. Can cause hydration mismatches. Timestamp changes between renders cause unnecessary re-renders. | Hoist `const now = new Date()` to component body (not JSX) or use `useMemo`. For static references, hoist to module scope. |
| 8 | Spinner for AI loading states | AI responses take 5-30 seconds. A spinner gives no shape prediction. Users cannot gauge progress. | Shaped skeleton loaders that match expected output format (paragraph skeleton for text, list skeleton for lists) + progress label ("Gerando analise..."). |
| 9 | Hardcoded hex colors in chart configs | `stroke="#10B981"` bypasses the design system. Does not adapt to light/dark mode changes. | Use `hsl(var(--chart-N))` tokens or semantic colors: `hsl(var(--success))`, `hsl(var(--destructive))`. |
| 10 | `console.log` in financial service code | Production leak. Financial data in console is a security risk. Stability rule H violation. | Use pino logger from `_core/logger`. Never log financial values at info level. |

---

## 12. File Structure

```
apps/web/src/
  pages/financeiro/
    financeiro-page.tsx              # Main /financeiro route (tabs)
    analise-financeira-page.tsx      # /financeiro/analise route (charts + AI)
    financial-insights-page.tsx      # /financeiro/insights route (KPI health + calendar)

  components/financeiro/
    transacoes-tab.tsx               # Transaction list, filters, actions, import
    categorias-tab.tsx               # Category management (lazy)
    formas-pagamento-tab.tsx         # Payment methods management (lazy)
    insumos-tab.tsx                  # Supplies management (lazy)
    precificacao-config-tab.tsx      # Pricing config (lazy)
    precificacao-tab.tsx             # Procedure pricing (lazy)
    analise-tab.tsx                  # Analysis sub-tab (lazy)
    financial-kpi-strip.tsx          # 6-cell compact KPI bar
    kpi-card.tsx                     # Individual expandable KPI card
    kpi-grid.tsx                     # Grid layout for KPI cards
    financial-calendar.tsx           # Monthly calendar with mini-bars
    daily-balance-chart.tsx          # Area chart (daily net flow)
    period-selector.tsx              # 9-option period picker
    onboarding-card.tsx              # Dismissible onboarding guide
    recurring-transaction-form.tsx   # Scheduled transaction dialog (react-hook-form + zod)
    file-import-dialog.tsx           # CSV import dialog
    financial-coach-settings-card.tsx # Coach settings
    ai-insights-section.tsx          # AI insights container
    cards/
      neon-coach-card.tsx            # Compact AI coach card
      goal-card.tsx                  # Monthly goal progress
      streak-card.tsx                # Consecutive recording days
      insight-card.tsx               # Individual AI insight
      financial-summary-card.tsx     # Summary statistics
      quick-action-card.tsx          # Quick actions
```

### Component Dependency Tree

```
FinanceiroPage
  ErrorBoundary
    NeonTabs
      TransacoesTab (eager)
        OnboardingCard
        FinancialKpiStrip
          AnimatedCounter
        PeriodSelector
        RecurringTransactionForm
        FileImportDialog
        Table (transactions)
        FinancialCalendar
        DailyBalanceChart (Recharts Area)
        AnaliseTab (lazy)
      CategoriasTab (lazy)
      FormasPagamentoTab (lazy)
      InsumosTab (lazy)
      PrecificacaoConfigTab (lazy)
      PrecificacaoTab (lazy)

AnaliseFinanceiraPage
  ErrorBoundary
    NeonCard x4 (KPIs)
    RechartsLineChart (lazy)
    BarChart (lazy)
    PieChart x2 (lazy)
    NeonCoachCard (full analysis)

FinancialInsightsPage
  ErrorBoundary
    Auto-Diagnosis NeonCard
    Summary NeonCard x4
    Neon Coach NeonCard (glow variant)
    KPIGrid
      KPICard x19
    FinancialCalendar
    Sheet (per-KPI analysis)
```

---

## 13. Pre-Delivery Checklist

### Visual Quality
- [ ] All currency values use `font-mono tabular-nums` (Fira Code)
- [ ] BRL format verified: `R$ 1.234,56` (period for thousands, comma for decimals)
- [ ] No hardcoded hex colors -- all semantic tokens or GPUS utilities
- [ ] Income/expense colors match spec (emerald-500 / destructive)
- [ ] AI Coach card uses gold gradient treatment (not generic card style)
- [ ] Chart tooltips use card background + border token styling
- [ ] KPI strip uses staggered entrance animation

### Interaction
- [ ] Period selector updates all date-dependent queries
- [ ] Tab switching lazy-loads content with fallback spinner
- [ ] Transaction CRUD operations show toast feedback
- [ ] Bulk selection shows count + total + action bar
- [ ] Calendar month navigation slides directionally
- [ ] AI analysis shows shaped skeleton during generation
- [ ] Per-KPI analysis opens in Sheet from right

### Responsive
- [ ] KPI strip: 2-col mobile, 3-col tablet, 6-col desktop
- [ ] Tabs horizontally scrollable on mobile
- [ ] Charts stack vertically on mobile (grid-cols-1)
- [ ] Calendar readable on tablet (hidden/list on mobile)
- [ ] Transaction table horizontally scrollable on mobile

### Dark Mode
- [ ] Toggle light/dark verified for all surfaces
- [ ] Chart colors adapt via CSS variable tokens
- [ ] Gold gradient on AI Coach card visible in both modes
- [ ] Calendar day borders visible in dark mode
- [ ] Skeleton `bg-primary/10` visible in both modes

### Accessibility
- [ ] All financial values have screen reader context (metric name + direction)
- [ ] Color never sole indicator (icon + text label always present)
- [ ] Touch targets >= 44x44px effective area
- [ ] Focus trapped in dialogs and sheets
- [ ] `prefers-reduced-motion` disables all motion animations
- [ ] Calendar navigation buttons have aria-labels

### Performance
- [ ] Recharts lazy-loaded with React.lazy + Suspense
- [ ] Intl.NumberFormat hoisted to module scope (never in render)
- [ ] Date objects not created in render path
- [ ] KPICard wrapped in `React.memo`
- [ ] FinancialCalendar wrapped in `React.memo`
- [ ] `staleTime` >= `refetchInterval` on all polling queries
- [ ] `gcTime` >= `staleTime` on all queries

### Stability
- [ ] All mutations wrapped in try-catch with user-facing toast (Rule J)
- [ ] No `href="#"` -- all actions use `<button>` (Rule K)
- [ ] Error boundaries on all page components (Rule L)
- [ ] No `as any` casts (Rule I)
- [ ] No `!` non-null assertions (Rule B)
- [ ] `.returning()` guarded against empty arrays (Rule C)

---

## 14. Success Criteria

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| 1 | BRL format correct | Manual verification: all currency values show `R$ X.XXX,XX` format with periods for thousands and comma for decimals | 100% of visible currency values |
| 2 | Financial numbers in Fira Code | Visual inspection: all `R$` amounts, percentages, and numeric counts render in monospace font | 100% of financial numerals use `font-mono tabular-nums` |
| 3 | AI streaming visible | Generate full analysis: shaped skeleton appears immediately, transitions to markdown content | Skeleton visible within 100ms of click, content streams progressively |
| 4 | KPI strip animation | Page load: 6 KPI cells stagger in with count-up counters | Total animation sequence < 400ms, values count from 0 to target |
| 5 | Period selector controls all data | Switch from "Mensal" to "Trimestral": transaction list, KPI strip, calendar, and chart all update | All 4 data surfaces reflect new period within 2 seconds |
| 6 | Triple redundancy on income/expense | Every income/expense indication includes color + icon + text label | Zero instances of color-only financial state communication |
| 7 | Reduced motion respected | Enable `prefers-reduced-motion`: all animations disabled, counters show final value instantly | Zero motion when accessibility preference is set |
| 8 | Recharts bundle isolated | Lighthouse treemap: Recharts chunk loads only when chart tab/page is active | Recharts not in initial bundle; lazy chunk loads on demand |
| 9 | Calendar proportional bars | Enter 5 transactions across 3 days with varying amounts: bars reflect relative magnitudes | Bar heights proportional to amounts, max bar = 24px |
| 10 | Dark mode financial surfaces | Toggle to dark: all cards, charts, calendar, and AI Coach card render correctly | No broken colors, invisible text, or missing borders in dark mode |
| 11 | Onboarding dismissal persists | Dismiss onboarding card, reload page: card does not reappear | `localStorage` flag persists across page reloads |
| 12 | Per-KPI AI analysis | Click "Analisar" on any KPI card: Sheet opens with AI-generated markdown analysis | Sheet opens, skeleton shows during loading, markdown renders on completion |
