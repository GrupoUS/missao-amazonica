# NeonDash Meu Dashboard — Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** Meu Dashboard (Personal Dashboard)
**Feature Area:** Dashboard
**Created:** 2026-04-01
**Complexity:** L4 — multi-section + state + interactions + charts

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

### Visual Direction

Meu Dashboard is the **personal command center** for each mentorado in the NeonDash mentorship platform. The aesthetic is **data-rich, metric-forward, and gamification-integrated** — not a marketing page, but a dense working surface that rewards engagement.

**YES Patterns:**
- Data density with clear hierarchy — numbers dominate, labels recede
- Tonal surface layering via Stitch surface hierarchy (no border-first dividers)
- Gamification woven into the data layer (streak counter, badges, progress rings)
- Tabbed navigation for progressive disclosure of deep sections
- Gold accent on primary actions and progress indicators
- Azul Petroleo as authoritative text anchor
- Charts and tables as first-class content, not decorative
- Card-based composition with generous `p-6` / `p-8` internal padding
- Asymmetric layout in Evolucao: main content (flex-1) + gamification sidebar (w-80)

**NO Patterns:**
- No hero split layouts — this is an operational dashboard
- No mesh/aurora gradient blobs — surfaces use flat tonal shifts
- No purple/violet anywhere — gold + petroleo only
- No bento grids for the main page — tabs handle section separation
- No neumorphism — Stitch tonal layering for depth
- No tiny text — minimum `text-sm` (14px) for any readable content
- No JS-driven hover animations — CSS `transition` only
- No glassmorphism as primary surface — solid card backgrounds with optional subtle blur on specific legacy components (audit in progress)

### Creative North Star

"The Architectural Monolith" — permanence, weight, curated authority. Each tab reveals a progressively deeper layer of the mentorado's journey. The dashboard must feel like a **personal cockpit**, not a generic analytics template.

### Template Test

1. "Could this be a Vercel/Stripe template?" — NO. The tab-locked diagnostico gate, gamification sidebar with confetti, and Brazilian mentorship-specific metrics (faturamento, procedimentos, NEON score) are unique.
2. "Would I scroll past this on Dribbble?" — NO. The NeonTabs animated indicator, gold-accented progress rings, and streak counter create visual interest.
3. "Does this look like AI-generated slop?" — NO. The color palette is brand-anchored (GPUS Gold + Azul Petroleo), never the default blue/purple AI cliche.

---

## 2. Colors

### Semantic Token Table

| Token | Light Mode | Dark Mode | Usage in Meu Dashboard |
|-------|-----------|-----------|----------------------|
| `--background` | `210 40% 98%` (#f8fafc) | `222 47% 6%` (#020617) | Page base behind all content |
| `--foreground` | `203 65% 26%` (#0f4c75) | `210 40% 98%` (#f8fafc) | Headlines, primary text, mentorado name |
| `--primary` | `38 60% 45%` (#b8860b) | `43 96% 56%` (#fbbf24) | Gold actions, streak number, progress rings, tab indicator |
| `--primary-foreground` | `0 0% 100%` (#ffffff) | `222 47% 10%` (#0f172a) | Text on primary buttons |
| `--card` | `0 0% 100%` (#ffffff) | `222 47% 10%` (#0f172a) | All Card surfaces (KPI, chart wrappers, gamification cards) |
| `--card-foreground` | `203 65% 26%` (#0f4c75) | `210 40% 98%` (#f8fafc) | Card body text |
| `--muted` | `210 40% 96%` (#f1f5f9) | `217 33% 17%` (#1e293b) | Skeleton loaders, muted backgrounds, locked badge circles |
| `--muted-foreground` | `215 25% 40%` | `215 20% 65%` (#94a3b8) | Secondary labels, "meses" text, metric descriptions |
| `--border` | `214 32% 91%` (#e2e8f0) | `217 33% 17%` (#1e293b) | Card borders, table borders, dividers |
| `--ring` | `38 60% 45%` | `43 96% 56%` (#fbbf24) | Focus ring on interactive elements (gold) |
| `--destructive` | `0 84% 60%` | `0 63% 31%` | Error states, "Perfil nao encontrado" alert |
| `--success` | `142 76% 36%` | `142 76% 36%` | Positive trends, high-score badges |
| `--warning` | `38 92% 50%` | `43 96% 56%` | Warning states, amber score ranges |
| `--accent` | `38 60% 95%` | `217 33% 17%` | Subtle highlights, hover states |

### Chart Tokens

| Token | Light Mode | Dark Mode | Chart Usage |
|-------|-----------|-----------|-------------|
| `--chart-1` | `38 60% 45%` (Gold) | `43 96% 56%` (Gold) | Primary metric line (Faturamento) |
| `--chart-2` | `142 76% 36%` (Green) | `217 91% 60%` (Blue) | Secondary metric line (Lucro) |
| `--chart-3` | `38 92% 50%` (Bright gold) | `142 76% 36%` (Green) | Tertiary data series |
| `--chart-4` | `0 84% 60%` (Red) | `280 84% 60%` (Purple) | Negative/warning series |
| `--chart-5` | `217 91% 60%` (Blue) | `0 84% 60%` (Red) | Additional series |

### Extended Brand Tokens (Used in Charts and Data)

| Token | Light | Dark | Dashboard Usage |
|-------|-------|------|-----------------|
| `--color-neon-blue` | `#0f4c75` | `#0ea5e9` | Chart line strokes, "Voce" bars in comparativo |
| `--color-neon-gold` | `#b45309` | `#fbbf24` | Chart line strokes, "Media" bars in comparativo |
| `--color-neon-petroleo` | `#0f4c75` | `#0ea5e9` | Text accents |
| `--color-neon-gold-bright` | n/a | `#fcd34d` | Highlight gold on dark mode |

### Color Rules

- NEVER hardcode hex values in component JSX — use semantic tokens or `@utility` neon classes
- Chart strokes use `var(--color-neon-blue)` and `var(--color-neon-gold)`, not raw hex
- Tooltip `contentStyle` references `hsl(var(--card))`, `hsl(var(--border))`, `hsl(var(--foreground))`
- Score badge colors (emerald/blue/amber/red) are Tailwind utilities, not hardcoded — acceptable as semantic state indicators
- Comparativo uses `text-slate-*` in several places — these should migrate to `text-muted-foreground` / `text-foreground` for dark mode compliance

---

## 3. Typography

### Font Stack

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

**NEVER use Fira Sans.** The monospace font is `Fira Code` — a completely different typeface. Confusing the two is a common error.

### Typography Scale

| UI Element | Font | Weight | Size | Class | Usage |
|-----------|------|--------|------|-------|-------|
| Page title ("Meu Dashboard") | Manrope | Bold (700) | 24-30px | `font-bold text-2xl md:text-3xl tracking-tight` | Main page heading |
| Tab trigger text | Manrope | Medium (500) | 14px | NeonTabsTrigger default | Tab labels |
| Section title ("Evolucao Financeira") | Manrope | Semibold (600) | 18px | `text-lg font-semibold` | Card titles |
| Mentorado name | Manrope | Bold (700) | 24-36px | `font-bold text-2xl lg:text-3xl xl:text-4xl tracking-tight` | Profile header |
| Streak number | Manrope | Bold (700) | 48px | `font-bold text-5xl text-primary` | Gamification prominent number |
| Metric values (currency) | Fira Code | Bold (700) | 20-30px | `font-bold text-xl lg:text-2xl xl:text-3xl` | KPI numbers, ROI percentage |
| Body text / descriptions | Inter | Regular (400) | 14px | `text-sm text-muted-foreground` | Descriptions, helper text |
| Micro labels ("meses", "Score") | Inter | Medium (500) | 10-12px | `text-xs uppercase tracking-wider` | Metric labels, tags |
| Table cells | Inter | Regular (400) | 14px | `text-sm` default | Historical data table |
| Table headers | Inter | Medium (500) | 14px | TableHead default | Column labels |
| Empty state text | Inter | Regular (400) | 14px | `text-sm text-muted-foreground italic` | "Nenhuma conquista ainda" |

### Typography Rules

- **Headline-to-body ratio:** 3x+ minimum. Page title at `text-2xl` (24px) vs body at `text-sm` (14px) = 1.7x. Consider bumping title to `text-3xl` (30px) or larger on desktop for stronger visual hierarchy
- **Weight extremes:** Streak at `font-bold text-5xl` vs "meses" at `text-muted-foreground` regular — good polarity
- **Tracking:** Headlines use `tracking-tight` for authority. Labels use `tracking-wider` for architectural tag feel
- **Monospace for metrics:** Use `tabular-nums` on all numeric displays (score badge already does this)
- **Scale contrast in Comparativo:** "Top X%" at `text-xl font-bold` with color-coded state creates visual punch

---

## 4. Layout Architecture

### ASCII Layout Diagram

```
+------------------------------------------------------------------+
| DASHBOARD LAYOUT (from _dashboard route)                         |
| +--------------------------------------------------------------+ |
| | SCROLL AREA (single — page-level)                            | |
| | +----------------------------------------------------------+ | |
| | | PAGE CONTAINER                                            | | |
| | | +------------------------------------------------------+ | | |
| | | | HEADER                                               | | | |
| | | | [icon] Meu Dashboard                                 | | | |
| | | |        Acompanhe sua evolucao e progresso            | | | |
| | | +------------------------------------------------------+ | | |
| | |                                                          | | |
| | | +------------------------------------------------------+ | | |
| | | | NEON TABS                                            | | | |
| | | | +--------------------------------------------------+ | | |
| | | | | TAB LIST (centered, horizontal scroll mobile)   | | | |
| | | | | [Visao Geral] [Diagnostico] [Evolucao]          | | | |
| | | | | [Atividades] [Planejamento] [Mentoria]           | | | |
| | | | +--------------------------------------------------+ | | |
| | | |                                                      | | |
| | | | +--------------------------------------------------+ | | |
| | | | | TAB CONTENT (active tab only)                    | | | |
| | | | |                                                  | | | |
| | | | | === VISAO GERAL TAB ===                          | | | |
| | | | | +----------------------------------------------+ | | |
| | | | | | Profile Header (gradient card)               | | | |
| | | | | | [Avatar][Name - Specialty]      [Score Badge]| | | |
| | | | | | ─────────────────────────────────            | | | |
| | | | | | Upcoming Classes Section                     | | | |
| | | | | +----------------------------------------------+ | | |
| | | | | grid-cols-1 lg:grid-cols-3                       | | | |
| | | | | +---------------------------+ +-----------+      | | | |
| | | | | | LEFT (col-span-2)         | | RIGHT     |      | | | |
| | | | | | Financial History Chart   | | AI Tasks  |      | | | |
| | | | | | Roadmap View              | | ROI Card  |      | | | |
| | | | | +---------------------------+ | Revenue   |      | | | |
| | | | |                               | Notes     |      | | | |
| | | | |                               +-----------+      | | | |
| | | | |                                                  | | | |
| | | | | === EVOLUCAO TAB ===                             | | | |
| | | | | flex-col lg:flex-row                             | | | |
| | | | | +---------------------------+ +-----------+      | | | |
| | | | | | MAIN (flex-1)             | | GAMIF.    |      | | | |
| | | | | | MonthComparison           | | SIDEBAR   |      | | | |
| | | | | | EvolutionChart            | | (w-80)    |      | | | |
| | | | | | SubmitMetricsForm         | | Streak    |      | | | |
| | | | | | Historical Table         | | Badges    |      | | | |
| | | | | +---------------------------+ | Locked    |      | | | |
| | | | |                               | Next      |      | | | |
| | | | |                               +-----------+      | | | |
| | | | +--------------------------------------------------+ | | |
| | | +------------------------------------------------------+ | | |
| | +----------------------------------------------------------+ | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Responsive Dimensions Table

| Element | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---------|----------------|--------------------|--------------------|
| Page container | `px-4` | `px-6` | `px-8` |
| Header gap | `gap-4` flex-col | `gap-4` flex-row | `gap-4` flex-row |
| Tab list | Horizontal scroll, `overflow-x-auto` | Inline flex | Inline flex |
| Visao Geral grid | `grid-cols-1` | `grid-cols-1` | `grid-cols-3` (2+1) |
| Evolucao layout | `flex-col` (stacked) | `flex-col` (stacked) | `flex-row` (main + sidebar) |
| Gamification sidebar | Hidden (Sheet overlay via FAB) | Hidden (Sheet) | `w-80 shrink-0` sticky sidebar |
| KPI cards (Comparativo) | `grid-cols-2` | `grid-cols-2` | `grid-cols-4` |
| Chart height | 250px | 300px | 350px |
| Card padding | `p-4` | `p-5` | `p-6` to `p-8` |
| Tab content padding | `px-1 pb-4` | `px-1 pb-4` | `px-1 pb-4` |

### Grid Patterns

| Pattern | Grid | Used In |
|---------|------|---------|
| KPI cards (Comparativo) | `grid-cols-2 gap-4 lg:grid-cols-4` | ComparativoView overview stats |
| Overview main | `grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8` | MenteeOverview (2 + 1 split) |
| Evolucao split | `flex-col lg:flex-row gap-6` | EvolucaoView (main + sidebar) |
| Charts side-by-side | `grid gap-6 md:grid-cols-2` | ComparativoView (bar + radar) |
| Atividades steps | Single column, `space-y-1` | Step items within accordion |

---

## 5. Component Inventory

### shadcn/ui Primitives Used

| Component | Import Path | Usage |
|-----------|-------------|-------|
| `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` | `@/components/ui/card` | Every section wrapper |
| `Button` | `@/components/ui/button` | Retry, support, generate tasks, gamification FAB |
| `Skeleton` | `@/components/ui/skeleton` | Loading states for all data |
| `Alert`, `AlertDescription`, `AlertTitle` | `@/components/ui/alert` | Error state ("Perfil nao encontrado") |
| `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` | `@/components/ui/tooltip` | Locked tabs, badge details |
| `Progress` | `@/components/ui/progress` | Streak milestone, badge progress |
| `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetTrigger` | `@/components/ui/sheet` | Mobile gamification panel |
| `Avatar`, `AvatarFallback`, `AvatarImage` | `@/components/ui/avatar` | Mentorado profile picture |
| `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` | `@/components/ui/table` | Historical metrics table |
| `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` | `@/components/ui/select` | Month/year filters (Comparativo) |
| `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` | `@/components/ui/accordion` | Activity groups (Atividades) |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/components/ui/tabs` | AI Tasks sub-tabs |
| `Badge` | `@/components/ui/badge` | Status indicators |
| `Checkbox` | `@/components/ui/checkbox` | Task completion toggles |
| `Textarea` | `@/components/ui/textarea` | Weekly planning notes |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger` | `@/components/ui/dialog` | Edit metrics, class details |
| `ScrollArea` | `@/components/ui/scroll-area` | AI Tasks internal scroll only |

### Custom Components

| Component | Path | Purpose |
|-----------|------|---------|
| `NeonTabs` / `NeonTabsList` / `NeonTabsTrigger` / `NeonTabsContent` | `@/components/ui/neon-tabs` | Animated tab system with motion layout indicator |
| `AnimatedProgressBar`, `AnimatedProgressRing` | `@/components/ui/animated-progress` | Count-up animated progress displays |
| `CelebrationEffect` | `@/components/ui/celebration-effect` | Canvas-based celebration on step completion |
| `ErrorBoundary` | `@/components/error-boundary` | Top-level error boundary wrapper |

### Recharts Components (MUST be React.lazy + Suspense)

| Chart Component | Used In | Chart Type |
|----------------|---------|------------|
| `LineChart` + `Line` + `ResponsiveContainer` | `EvolutionChart` | Multi-line time series |
| `BarChart` + `Bar` | `ComparativoView` | Horizontal comparative bars |
| `RadarChart` + `Radar` + `PolarGrid` | `ComparativoView` | Skills radar comparison |
| `AreaChart` + `Area` | `InstagramAnalyticsView` | Filled area time series |
| `FinancialHistoryChart` (wraps Recharts internally) | `MenteeOverview` | Financial line/area chart |

> **CRITICAL:** Recharts is ~200KB+. `EvolutionChart`, `ComparativoView`, and `InstagramAnalyticsView` currently import Recharts at the component top level. These MUST be wrapped in `React.lazy()` + `<Suspense>` at the point of consumption, or the components themselves must be lazy-loaded. The route file (`_dashboard.meu-dashboard.tsx`) already lazy-loads the page — chart-heavy sub-tabs (Evolucao, Comparativo) should additionally be lazy-split.

### Icon Imports (Lucide)

All Lucide icons are imported by direct named import from `lucide-react`. Per frontend rules, these should import from the specific ESM path for tree-shaking:

```tsx
// Current (loads entire library)
import { Trophy } from "lucide-react";

// Preferred (loads only the icon)
import Trophy from "lucide-react/dist/esm/icons/trophy";
```

---

## 6. Detailed Sections

### 6a. Visao Geral (MenteeOverview)

**Component:** `MenteeOverview`
**File:** `apps/web/src/components/dashboard/mentee-overview.tsx`

**Profile Header Card:**
- Gradient background: `bg-gradient-to-r from-primary/10 to-primary/5`
- Dark mode variant: `dark:from-slate-900 dark:to-slate-800`
- `rounded-2xl border border-border shadow-xl`
- Avatar with gold border: `border-2 border-[#D4AF37]` (NOTE: hardcoded hex — should use `border-primary`)
- Gold gradient glow behind avatar: `bg-gradient-to-r from-[#D4AF37] to-[#F2D06B]` (NOTE: hardcoded — should use GPUS gold tokens)
- Score badge: color-coded by score tier (emerald >=80, blue >=60, amber >=40, red <40)
- Upcoming class section embedded below profile

**Grid Layout:**
- `grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8`
- Left column (`lg:col-span-2`): Financial History Chart + Roadmap View
- Right column: AI Tasks Card (top priority), ROI Card, Revenue Card, Mentor Notes, Meeting History

**KPI Cards (Right Column):**
- ROI Card: Calculates ROI based on R$20,000 mentorship cost
- Revenue Card: Latest month faturamento
- Each card: `border-border bg-card shadow-sm` with hover state `hover:border-primary/30 hover:bg-accent/50`
- Icon container: `rounded-xl border border-border bg-muted` with `group-hover:scale-110`

**GPUS Tokens Used:**
- `text-primary` — gold accents on section titles
- `text-foreground` — headline text
- `text-muted-foreground` — secondary labels
- `bg-card` — card surfaces
- `border-border` — card and section borders

**Conditional Rendering:**
- `!mentorado` and `!isAdmin` → `NewMentoradoWelcome` screen with diagnostico CTA
- Loading → `OverviewSkeleton` (shaped like the expected output)
- `!stats` → fallback skeleton
- Zero data: Full overview renders with zero values (no blocking empty state)

**Spacing:**
- `space-y-4 lg:space-y-6 xl:space-y-8` — progressive gap scaling

### 6b. Evolution Chart Section

**Component:** `EvolutionChart`
**File:** `apps/web/src/components/dashboard/evolution-chart.tsx`

**Chart Configuration:**
- `ResponsiveContainer height={350} width="100%"`
- `LineChart` with two `Line` series: Faturamento (neon-blue) + Lucro (neon-gold)
- `CartesianGrid`: `className="stroke-muted"` with `strokeDasharray="3 3"`
- X/Y Axes: `stroke="hsl(var(--muted-foreground))"`, `axisLine={false}`, `tickLine={false}`, `fontSize={12}`
- Tooltip: styled with `hsl(var(--card))` background, `hsl(var(--border))` border, `var(--radius)` border-radius
- Legend: default Recharts legend

**States:**
- Loading: `Skeleton className="h-[350px] w-full"` — shaped like the chart
- Empty: Centered message "Nenhum dado disponivel para o periodo" at `h-[350px]`

**Card Wrapper:**
- `col-span-4` (legacy grid span — used when chart was in a 4-col grid)
- `CardHeader` + `CardTitle` "Evolucao de Performance"

### 6c. Atividades Section

**Component:** `AtividadesContent`
**File:** `apps/web/src/components/dashboard/atividades-content.tsx`

**Header:**
- Gradient banner: `rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6`
- "PLAY NEON" title at `font-bold text-2xl text-foreground`
- Sparkles icon positioned `absolute top-4 right-4 text-primary/50`

**Progress Section:**
- `AnimatedProgressRing` at `size={140} strokeWidth={10}` — circular progress ring
- Completed count: `font-bold text-2xl text-primary` / total: `font-medium text-foreground`
- Motivational message with emoji, animated with `motion/react`

**Activity Groups (by etapa):**
- Each etapa: colored dot (`h-3 w-3 rounded-full`) + `font-semibold text-lg text-foreground`
- `Accordion type="multiple"` with `space-y-3`
- Each `AccordionItem`: `rounded-xl border bg-card border-l-4` with etapa-specific border color
- Complete items: `ring-2 ring-primary/20`
- `AccordionTrigger`: activity icon (emoji), title, `AnimatedProgressBar`, completion count
- Expand button: ghost variant, opens `AtividadeDetailSheet`

**Step Items:**
- Toggle checkbox (click to mark complete)
- Note saving capability
- Grade/feedback system (admin mode)
- Task creation from step
- Expanded view with step guide content (oQue, como, exemplo, criterio)

**Motion:**
- Uses `motion/react` (NOT framer-motion) throughout: `motion.div` with `animate`, `initial`, `transition`
- `useReducedMotion()` checked — all `initial` props become `undefined` when reduced motion is active
- `AnimatePresence` wraps step list for enter/exit animations
- Stagger delay: `delay: Math.min(0.05 * etapaIndex, 0.05)` — capped to prevent long sequences

**Special Features:**
- `CelebrationEffect` — canvas-based particle burst on step completion
- `Confetti` (react-confetti) — NOT used in Atividades (used in gamification)

### 6d. Weekly Planning Section

**Component:** `WeeklyPlanningView`
**File:** `apps/web/src/components/dashboard/weekly-planning-view.tsx`

**Content Structure:**
- AI-generated weekly plan parsed from structured text
- Day headers (`DIA X`) parsed via `DAY_HEADER_REGEX`
- Steps categorized by type: G (Gestao), R (Relacionamento), V (Vendas), M (Mindset)
- Category color coding: blue/pink/emerald/teal

**UI Components:**
- `Card` + `CardContent` for each day block
- `Checkbox` for step completion tracking
- `Progress` bar for overall completion
- `Badge` for category labels
- `Textarea` for notes/annotations
- `motion/react` for enter/exit animations

**State:**
- tRPC query for weekly plan content
- Mutation for step completion toggling
- `useMemo` for parsed content (avoids re-parsing on every render)
- RegExp constants hoisted to module scope (performance rule compliance)

### 6e. Comparativo View

**Component:** `ComparativoView`
**File:** `apps/web/src/components/dashboard/comparativo-view.tsx`

**Filters:**
- Month selector: `Select` with 12 months (Janeiro-Dezembro)
- Year selector: `Select` with 2024-2026
- `useState` with `currentDate.getMonth() + 1` and `getFullYear()` defaults

**KPI Strip (Overview Stats):**
- `grid grid-cols-2 gap-4 lg:grid-cols-4`
- 4 cards: Ranking (percentile), Faturamento, Leads, Participantes
- Each: `Card border-none shadow-sm`, `p-4 pt-4`
- Labels: `text-xs uppercase tracking-wider text-slate-500`
- Values: `font-bold text-xl`
- Trend icons: `TrendingUp` (green), `TrendingDown` (red), `Minus` (slate)

**Charts (Side by Side):**
- `grid gap-6 md:grid-cols-2`
- Left: Horizontal `BarChart` — "Comparativo Geral" (Voce vs Turma)
  - Bar fills: `var(--color-neon-blue)` (Voce) + `var(--color-neon-gold)` (Media)
  - `barSize={12}` with `radius={[0, 4, 4, 0]}`
- Right: `RadarChart` — "Radar de Skills" (6 axes: Faturamento, Lucro, Leads, Procedimentos, Posts, Stories)
  - Fill: `var(--color-neon-blue)` opacity 0.4 (Voce) + `var(--color-neon-gold)` opacity 0.2 (Media)

**Empty State:**
- `Target` icon + "Sem dados para este periodo" message
- CTA: "Envie suas metricas de {month} para ver o comparativo"

**Dark Mode Concerns:**
- Uses `text-slate-900`, `text-slate-500`, `text-slate-700`, `text-slate-300` — hardcoded slate values that do NOT adapt to dark mode
- Should migrate to `text-foreground`, `text-muted-foreground`, etc.

### 6f. Diagnostico Section

**Component:** `DiagnosticoForm`
**File:** `apps/web/src/components/dashboard/diagnostico-form.tsx`

**Purpose:** Onboarding questionnaire that must be completed before other tabs unlock. Key fields: `objetivo6Meses`, `atuacaoSaude`, `rendaMensal`.

**Gate Logic (in parent `my-dashboard.tsx`):**
- `isDiagnosticoCompleted = Boolean(diagnostico?.objetivo6Meses || diagnostico?.atuacaoSaude || diagnostico?.rendaMensal)`
- Non-completed → tabs "Visao Geral", "Evolucao", "Atividades", "Planejamento", "Mentoria" show `LockedTab` with `Lock` icon
- Auto-redirect to "diagnostico" tab on first visit if not completed

**Conditional Rendering:**
- Admin: `<DiagnosticoForm mentoradoId={targetMentoradoId} />`
- Self: `<DiagnosticoForm />` (no mentoradoId prop)

### 6g. Instagram Analytics Section

**Component:** `InstagramAnalyticsView`
**File:** `apps/web/src/components/dashboard/instagram-analytics-view.tsx`

**Data Sources:**
- tRPC queries for Instagram metrics, engagement snapshots, top posts
- Meta connection status check

**UI Sections:**
- Meta Connection Card (OAuth flow trigger)
- KPI strip with `KpiCard` primitives: followers, reach, impressions, engagement rate
- `DeltaBadge` for period-over-period changes
- `BenchmarkBar` for benchmark comparisons
- `AreaChart` for time-series metrics (4 chart modes: posts_stories, engagement, reach_impressions, followers_growth)
- `Select` for chart mode switching

**Chart Mode Selector:**
- `Select` component with 4 modes
- Charts use `AreaChart` with `Area` fills at varying opacities

**Motion:**
- Uses `motion/react` with `fadeIn`, `slideUp`, `staggerContainer` from `@/lib/animation-variants`

### 6h. Gamification Sidebar

**Component:** `GamificationSidebar`
**File:** `apps/web/src/components/dashboard/gamification-sidebar.tsx`

**Desktop Layout:**
- `aside` with `w-80 shrink-0 lg:block hidden`
- `sticky top-24` — sticks below header during scroll
- Contains 4 stacked cards in `space-y-6`

**Mobile Layout:**
- Fixed FAB: `fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg lg:hidden`
- Trophy icon trigger
- `Sheet` overlay from right: `w-[320px] overflow-y-auto`

**Streak Counter Card:**
- `border-primary/20`
- `Flame` icon (orange-500) + "Streak" title
- Streak number: `font-bold text-5xl text-primary`
- "meses" label: `text-muted-foreground`
- Record: `text-muted-foreground text-xs`
- Next milestone: `Progress className="h-2"` with computed percentage

**Earned Badges Card:**
- `border-green-500/20`
- `Trophy` icon (yellow-500) + "Conquistas" title + count badge
- Badge grid: `flex flex-wrap gap-2`
- Each badge: `size-10 rounded-full` with color-coded ring based on `badge.cor` (gold/silver/bronze/green/blue)
- Stagger animation: `animationDelay: ${index * 50}ms`
- Hover: `hover:scale-110` via CSS transition
- Tooltip: badge name, description, points

**Locked Badges Card:**
- `border-border/50`
- Grayscale badges: `grayscale` + `hover:grayscale-0`
- Shows up to 8 locked badges + overflow count `+{n}`
- Tooltip with progress bar for each

**Next Badge Card:**
- `border-primary/30 border-dashed bg-primary/5`
- Shows badge with highest progress toward unlock
- Progress bar: `Progress className="h-2"`

**Confetti:**
- `react-confetti` triggers when `earnedBadges.length` increases
- Window size tracked via resize listener
- Duration: 5 seconds, 200 pieces, `gravity={0.2}`, `recycle={false}`
- Toast notification for new badge: `toast.success` with badge name

### 6i. AI Tasks Card

**Component:** `AITasksCard`
**File:** `apps/web/src/components/dashboard/ai-tasks-card.tsx`

**Purpose:** AI-generated (Gemini) task list for the mentorado, placed prominently in right column of Visao Geral.

**UI Components:**
- `Card` + `CardHeader` + `CardTitle` with `BrainCircuit` icon
- Sub-tabs: "Ativas" and "Arquivadas" via `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`
- Task items: `Checkbox` + task text
- `Progress` bar for completion tracking
- `ScrollArea` for internal task list scroll (NOTE: this is the only acceptable ScrollArea within the page since the page itself uses the DashboardLayout scroll)
- Action buttons: Generate (Sparkles), Archive (Archive), Complete (CheckCircle2)

**AI Loading State:**
- `Loader2 animate-spin` during task generation
- Progressive labels: "Gerando tarefas..."
- `CelebrationEffect` on 100% completion
- `Confetti` on task set completion

**Motion:**
- `AnimatePresence` + `motion.div` for task enter/exit

### 6j. Upcoming Classes Section

**Component:** `UpcomingClassSection`
**File:** `apps/web/src/components/dashboard/upcoming-class-section.tsx`

**Purpose:** Shows next 2 upcoming mentor sessions from public calendar.

**UI:**
- Up to 2 `EventCard` components side by side
- Each card: date, time, relative time ("em 3 dias"), session title
- Live indicator for active sessions
- Link to external meeting URL
- `Dialog` for session detail editing (admin)

**Data:**
- tRPC query for upcoming sessions
- `date-fns` + `ptBR` locale for date formatting
- `formatDistanceToNow` for relative timestamps

---

## 7. Animations

### Animation Table

| Interaction | Duration | Easing | Effect | Library |
|-------------|----------|--------|--------|---------|
| Page fade-in | 500ms | `ease-in` | `fade-in animate-in` (Tailwind) | CSS |
| Tab indicator slide | Layout animation | Spring | NeonTabs `motion.div` `layoutId` | motion/react |
| Streak counter entry | 300ms | `ease-out` | `fade-in zoom-in-95 animate-in` (Tailwind) | CSS |
| Badge grid stagger | 50ms per badge | `ease-in` | `animationDelay: ${index * 50}ms` | CSS |
| Badge hover scale | default | default | `hover:scale-110 transition-transform` | CSS |
| Atividades header entry | 500ms | `ease-out` | `opacity: 0, y: -20` -> `opacity: 1, y: 0` | motion/react |
| Atividades progress ring | 500ms | `ease-out` | `opacity: 0, scale: 0.95` -> `opacity: 1, scale: 1` | motion/react |
| Activity etapa stagger | 400ms, delay capped at 50ms | `ease-out` | `opacity: 0, y: 20` -> visible | motion/react |
| Activity item stagger | 300ms, delay capped at 50ms | `ease-out` | `opacity: 0, x: -10` -> visible | motion/react |
| Motivational text change | default | `ease-out` | `opacity: 0, x: -10` -> visible, keyed | motion/react |
| Step toggle celebration | Instant trigger | n/a | Canvas particle burst | CelebrationEffect |
| Confetti (badge unlock) | 5000ms | `gravity: 0.2` | 200 pieces, no recycle | react-confetti |
| Chart count-up | 600ms | `ease-out` | AnimatedProgressRing value animation | Custom |
| Skeleton -> data | 300ms | `ease` | Skeleton replaced by content (no explicit transition, React unmount/mount) | React |
| Card hover state | default (150ms) | `ease` | `transition-all hover:border-primary/30 hover:bg-accent/50` | CSS |
| Group icon hover | default | `ease` | `group-hover:scale-110 transition-transform` | CSS |
| Locked badge hover | default | `ease` | `hover:bg-muted/80 hover:grayscale-0 transition-all` | CSS |

### Motion Rules

- **Library:** `motion/react` (the package name). NEVER import from `framer-motion` — it is the old package name.
- **`useReducedMotion()`:** MANDATORY. All `motion.div` `initial` props set to `undefined` when reduced motion is active.
- **GPU-accelerated only:** `transform` and `opacity` exclusively. No `width`, `height`, `margin`, `padding` animations.
- **Stagger cap:** All stagger delays are capped with `Math.min()` to prevent long animation sequences.
- **One orchestrated entrance per page:** The Atividades header -> callout -> progress section -> etapa groups form one staggered reveal sequence.
- **CSS-first for hover:** All hover effects use Tailwind `transition-*` utilities. No `mouseenter`/`mouseleave` JS.

---

## 8. Responsive Behavior

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px (`md`) | Single column everywhere. Tabs horizontally scrollable. Gamification sidebar hidden (FAB + Sheet). Profile header stacks vertically. Charts at 250px height. |
| Tablet | 768-1024px (`lg`) | Comparativo KPI grid becomes 2-col. Charts side-by-side in Comparativo. Overview grid still 1-col. |
| Desktop | > 1024px (`lg+`) | Overview becomes 3-col grid (2+1). Evolucao becomes flex-row (main + w-80 sidebar). Comparativo KPI goes 4-col. Full sticky sidebar. |
| Large Desktop | > 1280px (`xl`) | Increased padding (`xl:space-y-8`, `xl:p-8`). Larger typography on profile header (`xl:text-4xl`). |

### Gamification Sidebar Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| `< lg` (< 1024px) | Sidebar `hidden`. FAB button (`fixed right-6 bottom-6 z-50 size-14 rounded-full`) triggers `Sheet` from right (`w-[320px]`). |
| `>= lg` (1024px+) | Sidebar visible as `aside w-80 shrink-0`. `sticky top-24`. FAB hidden (`lg:hidden`). |

### Tab List Overflow

- Container: `overflow-x-auto px-2 pb-2` with centered `inline-flex`
- On mobile: horizontal scroll with touch/swipe
- No scroll indicators currently — consider adding fade edges for better affordance

### Profile Header Adaptations

- Mobile: `flex-col items-start gap-4`
- Desktop: `flex-row items-center gap-4` (avatar + name inline with score badge)

### Chart Responsiveness

- All charts use `ResponsiveContainer width="100%"` — auto-resize to parent
- Height fixed at 250-350px depending on chart
- Font size on axes: `fontSize: 10-12` — acceptable on mobile

---

## 9. State Management

### tRPC Query Signatures

| Query | Router | Purpose | Polling | staleTime | Enabled Condition |
|-------|--------|---------|---------|-----------|-------------------|
| `trpc.auth.me.useQuery()` | auth | Current user role check | None | Default | Always |
| `trpc.mentorados.me.useQuery()` | mentorados | Self mentorado data | None | Default | `!isAdmin` |
| `trpc.diagnostico.get.useQuery()` | diagnostico | Diagnostico completion check | None | `60_000` | `!!targetMentoradoId \|\| !isAdmin` |
| `trpc.mentorados.evolution.useQuery()` | mentorados | Monthly evolution data | None | Default | In Evolucao tab |
| `trpc.mentorados.comparativeStats.useQuery()` | mentorados | Comparative stats vs turma | None | Default | `!!mentorado` in Comparativo |
| `trpc.mentorados.getOverviewStats.useQuery()` | mentorados | Overview KPIs + financials | None | Default | In Visao Geral |
| `trpc.gamificacao.myStreak.useQuery()` | gamificacao | Self streak data | None | Default | `!mentoradoId` |
| `trpc.gamificacao.getStreak.useQuery()` | gamificacao | Target streak data | None | Default | `!!mentoradoId` |
| `trpc.gamificacao.allBadges.useQuery()` | gamificacao | All available badges | None | Default | Always in sidebar |
| `trpc.gamificacao.myBadges.useQuery()` | gamificacao | Self earned badges | None | Default | `!mentoradoId` |
| `trpc.gamificacao.mentoradoBadges.useQuery()` | gamificacao | Target earned badges | None | Default | `!!mentoradoId` |
| `trpc.atividades.getProgress.useQuery()` | atividades | Self progress map | None | Default | `!mentoradoId` |
| `trpc.atividades.getProgressById.useQuery()` | atividades | Target progress map | None | Default | `!!mentoradoId` |
| `trpc.atividades.getEnrichedSteps.useQuery()` | atividades | Enriched step guide content | None | `5 * 60_000` | Always |

### tRPC Mutation Signatures

| Mutation | Router | Purpose | Invalidation |
|----------|--------|---------|-------------|
| `trpc.atividades.toggleStep.useMutation()` | atividades | Toggle step completion | `progressQuery.refetch()` in `onSuccess` |
| `trpc.atividades.updateNote.useMutation()` | atividades | Save step note | `progressQuery.refetch()` in `onSuccess` |
| `trpc.atividades.updateGrade.useMutation()` | atividades | Save step grade (admin) | `progressQuery.refetch()` in `onSuccess` |
| `trpc.tasks.create.useMutation()` | tasks | Create task from atividade | `utils.tasks.list.invalidate()` in `onSuccess` |
| `trpc.tasks.createFromStep.useMutation()` | tasks | Create task from step | `utils.tasks.list.invalidate()` in `onSuccess` |

**NOTE:** Mutations use `onSuccess` for invalidation — per project rules, they should use `onSettled` to ensure invalidation happens even on error rollback. The `onError` handlers correctly show toasts. Each mutation wraps the call properly (Atividades uses `.mutate()` not `.mutateAsync()` so no try-catch needed, but if refactored to `mutateAsync` the J-rule applies).

### State Architecture

| State Type | Where | What |
|-----------|-------|------|
| Server state | tRPC + TanStack Query | All data (metrics, badges, progress, stats) |
| URL state | TanStack Router | Route `/meu-dashboard` |
| Local state (tabs) | `useState("visao-geral")` | Active tab selection |
| Local state (UI) | `useState` | Comparativo month/year, Atividades expanded steps, grade states, sheet open |
| Ref state | `useRef` | Retry counter, previous badge count, auto-switch flag |
| Impersonation context | `useImpersonation()` provider | Admin viewing as mentorado |

### Polling Rules

Currently, no queries in Meu Dashboard use polling (`refetchInterval`). If polling is added in the future:

- `staleTime` MUST equal `refetchInterval`
- `gcTime` MUST be >= `staleTime`
- Use `skipToken` from `@tanstack/react-query` for conditional queries instead of `enabled: false` (prevents type narrowing issues)
- Wrap list item renderers in `React.memo` to prevent unnecessary re-renders during polling cycles

### Race Condition Handling

The `mentorados.me` query has a retry mechanism for the race condition between `ensureMentorado` (Clerk webhook) and the first query:

- `useRef` tracks retry count (max 5)
- Progressive delay: 2s, 4s, 6s, 8s, 10s
- `useEffect` fires when: not admin, not loading, no mentorado, no error, retries < max
- Cleanup on unmount via `clearTimeout`

---

## 10. Accessibility

### WCAG 2.1 AA Compliance Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Color contrast 4.5:1** | Compliant for semantic tokens | GPUS tokens designed for contrast; gold on dark passes; gold on light passes |
| **Non-color information** | Partial | Trend icons (up/down/neutral) supplement color; badges use icons not just color |
| **Keyboard navigation** | Compliant | NeonTabs, Accordion, Sheet, Dialog all keyboard-accessible via Radix primitives |
| **Focus indicators** | Compliant | `--ring` (gold) focus ring on all interactive elements |
| **Screen reader text** | Partial | `aria-label="Ver gamificacao"` on FAB; `aria-hidden="true"` on decorative LayoutDashboard icon |
| **Semantic HTML** | Compliant | `<aside>` for sidebar, `<h1>` for page title, proper heading hierarchy |
| **Touch targets >= 44x44px** | Compliant | FAB is `size-14` (56px); badges are `size-10` (40px — slightly under, but tooltips add area) |
| **Form labels** | Compliant | Select components have visible labels; form inputs in DiagnosticoForm have labels |
| **Error identification** | Compliant | Alert with `AlertTitle` + `AlertDescription` for error states |
| **Loading announcements** | Missing | No `aria-live` regions for loading -> loaded transitions |
| **Chart accessibility** | Missing | Recharts lack `aria-label`, no data table alternative for screen readers |

### WCAG 2.2 Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| **SC 2.4.11 Focus Not Obscured** | Compliant | No sticky headers overlap focused tab content; sidebar is sticky but does not cover main content focus |
| **SC 2.5.7 Dragging Movements** | N/A | No drag interactions in Meu Dashboard (drag is in CRM Kanban) |
| **SC 2.5.8 Target Size 24x24px min** | Mostly compliant | Locked badge circles at `size-10` (40px) OK; accordion triggers span full width OK; chart dots at `r: 4` (8px) are decorative |
| **SC 3.3.7 Redundant Entry** | Compliant | DiagnosticoForm auto-populates from saved data; weekly planning preserves entered notes |

### Recommended Improvements

1. Add `aria-live="polite"` region to announce tab content loading/loaded transitions
2. Add `role="img" aria-label="..."` to charts with data summary text
3. Increase badge touch targets to 44x44px with padding or increase `size-10` to `size-11`
4. Add `aria-current="true"` to active tab (NeonTabs may already handle via Radix)
5. Screen reader alternative for confetti: `role="status" aria-label="Nova conquista desbloqueada"`
6. `alt` text improvements for MenteeOverview avatar: already has `alt={Foto de ${mentorado.nomeCompleto}}`

---

## 11. Anti-Patterns

### Forbidden Patterns for This Component

| # | Anti-Pattern | Why It's Harmful | What To Do Instead |
|---|-------------|-----------------|-------------------|
| 1 | **Importing Recharts at page level** | Recharts is ~200KB. Importing in `evolution-chart.tsx` and `comparativo-view.tsx` at the top level means the entire library loads even when the user is on the Visao Geral tab. | `React.lazy()` the chart components. Or lazy-load the entire tab content component so charts only load when the tab is activated. |
| 2 | **Multiple ScrollAreas** | `AITasksCard` uses a `ScrollArea` internally. The DashboardLayout already provides the page-level `ScrollArea`. Nesting scroll areas creates confusing UX — users don't know which area is scrolling. | Limit to the one page-level `ScrollArea`. AI Tasks internal scroll is acceptable ONLY if the card has a fixed max-height and the content genuinely overflows. |
| 3 | **`new Date()` in render path** | `ComparativoView` creates `new Date()` in `useState` initializer, which is acceptable. But `formatDistanceToNow(new Date(session.date))` in `UpcomingClassSection` EventCard creates a new Date on every render. | Hoist date parsing to a `useMemo` or compute once and store. Use the `useState(() => ...)` lazy initializer pattern for initial values. |
| 4 | **`staleTime !== refetchInterval` on polling queries** | Currently no polling is used, but if added: mismatched `staleTime` and `refetchInterval` causes unnecessary refetches or stale data display. | Always set `staleTime === refetchInterval` and `gcTime >= staleTime` for any polling query. |
| 5 | **Importing from `framer-motion`** | The project uses `motion/react` (the official package). Importing from `framer-motion` (the legacy name) would add a duplicate bundle. The codebase correctly uses `motion/react` — do NOT introduce `framer-motion` imports. | Always `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`. |
| 6 | **`Intl.NumberFormat` inside render** | `ComparativoView` defines `formatCurrency` as a local function that creates `new Intl.NumberFormat(...)` on every call inside the component body. | Hoist the `Intl.NumberFormat` instance to module scope: `const currencyFormat = new Intl.NumberFormat("pt-BR", { ... })`. |
| 7 | **Hardcoded hex in JSX** | `MenteeOverview` uses `border-[#D4AF37]`, `from-[#D4AF37]`, `to-[#F2D06B]`, `text-[#D4AF37]` — raw hex values instead of GPUS tokens. `ComparativoView` uses `text-slate-900`, `bg-slate-50` which don't adapt to dark mode. | Replace with `border-primary`, `from-primary/20`, `text-primary` etc. Replace `text-slate-900` with `text-foreground`, `text-slate-500` with `text-muted-foreground`. |
| 8 | **Mutation invalidation in `onSuccess` instead of `onSettled`** | Current mutations use `progressQuery.refetch()` in `onSuccess`. If the mutation errors, no refetch happens, potentially leaving stale optimistic state. | Move `refetch()` / `invalidate()` calls to `onSettled` callback. Keep error toast in `onError`. |
| 9 | **Lucide barrel import** | All icons imported via `import { X } from "lucide-react"` — loads the entire icon library. | Import from `lucide-react/dist/esm/icons/<name>` for tree-shaking. |

---

## 12. File Structure

```
apps/web/src/
  pages/
    my-dashboard.tsx                    # Main page component (MyDashboard + MyDashboardContent)
  routes/
    _dashboard.meu-dashboard.tsx        # TanStack Router route (lazy load, auth guard, data prefetch)
  components/
    dashboard/
      mentee-overview.tsx               # Visao Geral tab content (profile, financials, roadmap, AI tasks)
      evolucao-view.tsx                 # Evolucao tab (chart, metrics form, table, gamification sidebar)
      evolution-chart.tsx               # Recharts LineChart for financial evolution
      comparativo-view.tsx              # Comparativo view (bar + radar charts, KPI cards)
      atividades-content.tsx            # Atividades tab (PLAY NEON, progress ring, activity groups)
      atividade-detail-sheet.tsx        # Sheet overlay for activity detail view
      atividade-modulo-card.tsx         # Module metadata card within activity
      step-item.tsx                     # Individual step with toggle, notes, grade
      task-creation-popover.tsx         # Popover for creating tasks from activities
      weekly-planning-view.tsx          # Planejamento tab (AI-generated weekly plan)
      weekly-planning-admin.tsx         # Admin variant of weekly planning
      diagnostico-form.tsx              # Diagnostico tab (onboarding questionnaire)
      diagnostico-summary-card.tsx      # Summary card for diagnostico data
      my-mentorship.tsx                 # Mentoria tab content
      gamification-sidebar.tsx          # Sidebar (streak, badges, progress)
      badge-icon.tsx                    # Badge icon renderer (maps code to visual)
      ai-tasks-card.tsx                 # AI-generated tasks card (Gemini)
      upcoming-class-section.tsx        # Upcoming mentor sessions
      new-mentorado-welcome.tsx         # Welcome screen for new users
      financial-history-chart.tsx       # Financial chart in MenteeOverview
      month-comparison.tsx              # Month-over-month comparison card
      submit-metrics-form.tsx           # Monthly metrics submission form
      edit-metrics-dialog.tsx           # Dialog for editing historical metrics
      mentor-notes.tsx                  # Mentor notes display
      meeting-history.tsx               # Past meeting history
      roadmap-view.tsx                  # Mentorship journey roadmap
      roadmap-icons.tsx                 # Roadmap step icons
      instagram-analytics-view.tsx      # Instagram metrics and charts
      instagram-badge.tsx               # Instagram connection badge
      instagram-onboarding-modal.tsx    # Instagram OAuth onboarding
      ranking-view.tsx                  # Mentorado ranking
      achievements-view.tsx             # Full achievements gallery
      milestone-timeline.tsx            # Milestone timeline display
      metric-comparison.tsx             # Metric comparison primitives
      note-popover.tsx                  # Note editing popover
      class-list.tsx                    # Class listing component
      next-live-card.tsx                # Next live session card
      monthly-goals-card.tsx            # Monthly goals display
      monthly-goals-admin.tsx           # Admin goals management
      submit-metrics-sheet.tsx          # Sheet variant of metrics form
      playbook-view.tsx                 # Playbook content view
      notifications-view.tsx            # Notification management
      task-board.tsx                    # Task board (kanban-like)
      task-filter-toolbar.tsx           # Task filtering toolbar
      empty-filter-result.tsx           # Empty state for filtered results
    ui/
      neon-tabs.tsx                     # Custom animated tabs (NeonTabs)
      animated-progress.tsx             # AnimatedProgressBar + AnimatedProgressRing
      celebration-effect.tsx            # Canvas particle celebration
    error-boundary.tsx                  # Error boundary wrapper
    page-loader.tsx                     # Suspense fallback loader
  hooks/
    use-mobile.ts                       # useIsMobile() responsive hook
  lib/
    trpc.ts                             # tRPC client
    utils.ts                            # Utilities (cn, formatCurrency)
    query-keys.ts                       # Route query key factories
    step-guide.ts                       # Step guide content helpers
    animation-variants.ts              # Shared motion animation variants
  _core/
    providers/
      impersonation-provider.tsx        # Admin impersonation context
```

---

## 13. Pre-Delivery Checklist

### Visual Quality

- [ ] All Card surfaces use `bg-card` / `border-border` — no hardcoded hex backgrounds
- [ ] Typography follows Manrope (headlines) + Inter (body) + Fira Code (metrics) hierarchy
- [ ] Gold accent (`text-primary`) used consistently for actions and progress indicators
- [ ] Score badge colors are tier-appropriate (emerald/blue/amber/red)
- [ ] Chart tooltips styled with semantic tokens, not inline hex
- [ ] No `text-slate-*` values that break dark mode — use `text-foreground` / `text-muted-foreground`
- [ ] Profile avatar border uses `border-primary` not `border-[#D4AF37]`
- [ ] Gradient backgrounds use GPUS token references, not raw hex

### Interaction

- [ ] All 6 tabs navigate correctly and preserve state on switch
- [ ] Locked tabs show Lock icon and tooltip ("Complete o diagnostico primeiro")
- [ ] Activity step toggle fires celebration effect
- [ ] Badge unlock fires confetti + toast notification
- [ ] Monthly metrics form validates inputs before submission
- [ ] Edit metrics dialog pre-populates existing values
- [ ] Chart tooltips appear on hover with correct formatting
- [ ] Gamification FAB opens Sheet on mobile

### State

- [ ] Admin impersonation correctly switches mentoradoId across all tab components
- [ ] Diagnostico gate correctly locks/unlocks tabs
- [ ] Auto-redirect to diagnostico tab fires only once (ref guard)
- [ ] Retry mechanism for mentorado race condition works (progressive delay)
- [ ] All mutations show error toasts on failure
- [ ] Mutation invalidation uses `onSettled` (not just `onSuccess`)
- [ ] No stale data after form submission — queries refetch

### Performance

- [ ] Recharts lazy-loaded (React.lazy + Suspense)
- [ ] Lucide icons imported from ESM paths
- [ ] `Intl.NumberFormat` hoisted to module scope
- [ ] `RegExp` constants hoisted to module scope
- [ ] `useMemo` on computed data (progressMap calculations, parsed content)
- [ ] `useCallback` on handlers passed to memoized children
- [ ] No `new Date()` in render path (use `useMemo` or lazy state init)
- [ ] `staleTime === refetchInterval` if polling is added
- [ ] Static data (`atividadesByEtapa`) hoisted to module scope

### Responsive

- [ ] Mobile: single column, horizontally scrollable tabs, gamification in Sheet
- [ ] Tablet: partial grid layouts, charts side-by-side in Comparativo
- [ ] Desktop: full 3-column Overview, flex-row Evolucao with sidebar, 4-column KPI grid
- [ ] Large desktop: increased padding and typography scale
- [ ] FAB hidden on desktop (`lg:hidden`), visible on mobile
- [ ] Sidebar hidden on mobile (`hidden lg:block`), sticky on desktop

### Accessibility

- [ ] All interactive elements keyboard-navigable
- [ ] Focus ring visible (gold `--ring` token)
- [ ] `aria-label` on FAB button
- [ ] `aria-hidden="true"` on decorative icons
- [ ] Error alert has proper Alert structure with title + description
- [ ] Touch targets >= 44x44px for primary actions
- [ ] `useReducedMotion()` respected — no motion when user prefers reduced
- [ ] Screen reader alternative text for charts (recommended improvement)
- [ ] `aria-live` region for loading state transitions (recommended improvement)

### Dark Mode

- [ ] Toggle light to dark — all surfaces adapt
- [ ] Chart strokes visible in both modes
- [ ] Tooltip backgrounds use `hsl(var(--card))` — adapt correctly
- [ ] Score badge colors readable in both modes
- [ ] Profile gradient card has dark variant (`dark:from-slate-900`)
- [ ] No `text-slate-*` values that become invisible on dark backgrounds
- [ ] Gamification sidebar cards maintain contrast
- [ ] Skeleton loaders use `bg-muted` — adapt correctly

---

## 14. Success Criteria

### Measurable Outcomes

| # | Criterion | Measurement | Target |
|---|-----------|-------------|--------|
| 1 | **Page load time** | Time from route navigation to first meaningful paint (tab content visible) | < 1.5s on 3G throttled |
| 2 | **Lazy chunk size** | Recharts-containing tab chunks measured via Vite build output | < 100KB per lazy chunk (gzipped) |
| 3 | **Interaction to Next Paint (INP)** | Tab switches, accordion toggles, step toggles | < 200ms (Web Vitals good) |
| 4 | **Cumulative Layout Shift (CLS)** | Skeleton to data transitions, chart loading | < 0.1 (Web Vitals good) |
| 5 | **Accessibility score** | Lighthouse Accessibility audit on all 6 tabs | >= 95 |
| 6 | **Dark mode visual regression** | Manual or automated screenshot comparison, all 6 tabs | Zero broken surfaces (no invisible text, no contrast failures) |
| 7 | **Diagnostico gate correctness** | E2E test: new user sees locked tabs, completes diagnostico, tabs unlock | 100% pass rate |
| 8 | **Gamification real-time** | Badge earned -> confetti + toast fires within 1 refetch cycle | < 5s from server state change |
| 9 | **Mobile usability** | All tabs functional on 375px viewport (iPhone SE), touch targets pass | Zero horizontal overflow, all actions reachable |
| 10 | **Type safety** | `bun run type-check` (tsgo) | Zero errors |
| 11 | **Lint + format** | `bunx biome check && bun run lint:oxlint:check` | Zero errors |
| 12 | **No hardcoded hex** | Grep for `#[0-9a-fA-F]{6}` in component files | Zero matches outside Recharts data (chart strokes use CSS vars) |

---

## Appendix: Known Technical Debt

1. **`ComparativoView` dark mode:** Extensive use of `text-slate-*` hardcoded values that do not adapt to dark mode. Requires migration to semantic tokens.
2. **`MenteeOverview` hardcoded gold hex:** Avatar border and gradient use `#D4AF37` and `#F2D06B` instead of `border-primary` / `from-primary` tokens.
3. **Recharts not lazy-loaded:** `EvolutionChart` and `ComparativoView` import Recharts at module top level. Both are tab-content components that should be behind `React.lazy()`.
4. **`Intl.NumberFormat` in render:** `ComparativoView.formatCurrency` creates a new formatter on every call inside the component body.
5. **Mutation invalidation pattern:** All mutations use `onSuccess` for query refetching — should be `onSettled` per project convention.
6. **`react-use` dependency:** `AITasksCard` imports `useWindowSize` from `react-use` — verify if this dependency is justified or can be replaced with a lightweight custom hook.
7. **Gamification sidebar window resize listener:** Uses manual `addEventListener("resize")` instead of a debounced hook or `ResizeObserver`.
