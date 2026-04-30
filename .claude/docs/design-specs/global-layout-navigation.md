# NeonDash Global Layout & Navigation -- Design Specification

**Project:** NeonDash Mentorship Performance Dashboard
**Component:** DashboardLayout + Sidebar Navigation + PageContainer
**Feature Area:** Global / All Pages
**Created:** 2026-04-01
**Complexity:** L3 -- multi-section

---

## 1. Design System Overview

NeonDash uses the **GPUS Sovereign Architect** design system, combining two Stitch design systems into a unified shadcn/ui-compatible token set:

- **Light Mode -- "GrupoUS"** (Stitch asset `c852e07ec0444f10b9ab3015c94dbaf2`): Warm slate base with Azul Petroleo text and GPUS Gold actions.
- **Dark Mode -- "Executive Gilt"** (Stitch asset `4a5198c74b714d789767915ca3232125`): Slate 950 void where Amber 400 gold glows as a beacon.

**Creative North Star: "The Architectural Monolith"** -- permanence, weight, curated authority. Every surface, spacing decision, and color application serves this identity.

### Key Design Principles

| Principle | Application |
|-----------|-------------|
| Tonal Gravity | Depth via background shifts, never shadows or borders |
| Intentional Asymmetry | Sidebar is narrow (60px collapsed, 300px expanded); never 50/50 splits |
| Cinematic Whitespace | Content padding scales from `p-4` (mobile) to `p-8` (desktop) |
| Typography as Structure | Manrope headlines carry layout weight; Inter serves dense UI text |
| The No-Line Rule | Background shifts and negative space define boundaries, not `1px solid` borders |

### Anti-Slop Gates

All layout decisions must pass the Template Test:

1. "Could this be a Vercel/Stripe template?" -- YES = FAIL
2. "Would I scroll past this on Dribbble?" -- YES = FAIL
3. "Does this look like AI-generated slop?" -- YES = FAIL

---

## 2. Colors (GPUS Tokens Only)

### 2.1 Global Semantic Tokens

| Token | Light Mode HSL | Dark Mode HSL | Purpose |
|-------|---------------|--------------|---------|
| `--background` | `210 40% 98%` | `222 47% 6%` | Page background |
| `--foreground` | `203 65% 26%` | `210 40% 98%` | Primary text |
| `--primary` | `38 60% 45%` | `43 96% 56%` | Brand gold (CTAs, focus rings) |
| `--primary-foreground` | `0 0% 100%` | `222 47% 10%` | Text on primary |
| `--secondary` | `38 50% 85%` | `217 33% 17%` | Secondary surfaces |
| `--muted` | `210 40% 96%` | `217 33% 17%` | Muted backgrounds |
| `--muted-foreground` | `215 25% 40%` | `215 20% 65%` | Secondary text |
| `--card` | `0 0% 100%` | `222 47% 10%` | Card surfaces |
| `--border` | `214 32% 91%` | `217 33% 17%` | Borders |
| `--ring` | `38 60% 45%` | `43 96% 56%` | Focus ring (gold) |
| `--destructive` | `0 84% 60%` | `0 72% 51%` | Error states |
| `--success` | `142 76% 36%` | `142 76% 36%` | Success states |
| `--warning` | `38 92% 50%` | `43 96% 56%` | Warning states |

### 2.2 Sidebar Token Family

The sidebar has its own dedicated token family, separate from global tokens. Implementations MUST use the `--sidebar-*` tokens for all sidebar surfaces.

| Token | Light Mode HSL | Dark Mode HSL | Purpose |
|-------|---------------|--------------|---------|
| `--sidebar` | `0 0% 98%` | `222 47% 7%` | Sidebar background |
| `--sidebar-foreground` | `222 47% 11%` | `210 40% 98%` | Sidebar text |
| `--sidebar-primary` | `38 60% 45%` | `43 96% 56%` | Active item icon/accent |
| `--sidebar-primary-foreground` | `0 0% 100%` | `222 47% 10%` | Text on sidebar primary |
| `--sidebar-accent` | `38 60% 95%` | `217 33% 17%` | Hover/active backgrounds |
| `--sidebar-accent-foreground` | `222 47% 11%` | `210 40% 98%` | Text on sidebar accent |
| `--sidebar-border` | `214 32% 91%` | `217 33% 12%` | Sidebar border (right edge) |
| `--sidebar-ring` | `38 60% 45%` | `43 96% 56%` | Sidebar focus ring |

### 2.3 Neon Brand Utilities (Tailwind v4)

| Utility Class | Light Hex | Dark Hex | Usage |
|--------------|-----------|----------|-------|
| `text-neon-petroleo` | `#0f4c75` | `#0ea5e9` | Brand petroleo text |
| `text-neon-petroleo-light` | `#3282b8` | `#38bdf8` | Petroleo variant |
| `bg-neon-blue-dark` | `#0f172a` | `#020617` | Deep navy backgrounds |
| `text-neon-gold` | `#b45309` | `#fbbf24` | Brand gold text |
| `text-neon-gold-bright` | -- | `#fcd34d` | Highlight gold (dark only) |

### 2.4 Status Indicator Colors

Used in the WhatsApp status card and other connectivity indicators:

| State | Color | Token/Class |
|-------|-------|-------------|
| Connected | Emerald 400 | `text-emerald-400` |
| Disconnected | Amber 400 | `text-amber-400` |
| Loading | Sidebar foreground at 80% | `text-sidebar-foreground/80` |

### 2.5 Color Rules (Non-Negotiable)

- **No hardcoded hex values** in component code (`bg-[#0f4c75]` is FORBIDDEN)
- Use semantic tokens (`bg-primary`, `text-foreground`) or custom Neon utilities (`text-neon-petroleo`)
- Sidebar elements use `bg-sidebar`, `text-sidebar-foreground`, etc. -- never global tokens
- Active nav items use `bg-secondary` background with `text-primary` icon
- WhatsApp status card uses `bg-sidebar-accent/40` (rest) and `bg-sidebar-accent/60` (hover)

---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

**Loaded weights via `@fontsource/manrope`:**
- Latin 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Latin Extended 400, 600, 700

### 3.2 Font Role Mapping in Layout

| Element | Font | Weight | Size | Notes |
|---------|------|--------|------|-------|
| Logo text "Neondash" | Inherited (Manrope) | `font-medium` (500) | `text-sm` | Black in light, white in dark |
| Nav item labels | Inherited (Manrope) | Regular (400) | `text-base` (16px) | Uses `text-sidebar-foreground` |
| WhatsApp card title | Inherited (Manrope) | `font-medium` (500) | `text-xs` (12px) | Uses `text-sidebar-foreground` |
| WhatsApp card status | Inherited (Manrope) | Regular (400) | `text-[11px]` | Uses `text-sidebar-foreground/70` |
| User name | Inherited (Manrope) | Regular (400) | `text-sm` (14px) | Uses `text-muted-foreground` |
| Theme toggle label | Inherited (Manrope) | Regular (400) | `text-sm` (14px) | Uses `text-muted-foreground` |
| Context badge label | Inherited (Manrope) | `font-medium` (500) | `text-xs` (12px) | Uses `text-sidebar-foreground` |

### 3.3 Forbidden Fonts

| Font | Status | Reason |
|------|--------|--------|
| **Fira Sans** | FORBIDDEN | Confused with Fira Code; not part of the stack |
| Inter (as primary) | Forbidden as lead | Intentional fallback only; Manrope must lead |
| Roboto, Arial, Lato | Forbidden as explicit choices | Generic defaults; only appear in system fallback chain |

### 3.4 Font Loading Strategy

Manrope is loaded via `@fontsource` package imports in `index.css`, ensuring subset loading (Latin + Latin Extended) and no FOUT for the primary font. Inter falls through to system availability or the OS sans-serif chain.

---

## 4. Layout Architecture

### 4.1 Mandatory Component Hierarchy

```
<Route path="/_dashboard" beforeLoad={authGuards}>
  <DashboardLayout>                          // Root: h-screen, flex row
    <Sidebar>                                // Fixed position, left
      <SidebarBody>                          // Renders both Desktop + Mobile variants
        <DesktopSidebar />                   // Hidden on mobile, visible md+
        <MobileSidebar />                    // Visible below md, hidden md+
      </SidebarBody>
    </Sidebar>
    <main>                                   // flex-1, overflow-y-auto (SINGLE scroll owner)
      <MentorImpersonationBar />             // Conditional: admin/mentor only (lazy)
      <div class="p-4 sm:p-6 lg:p-8">       // Padding wrapper
        <PageContainer>                      // Width constraint + optional fill-screen
          <Outlet />                         // Page content (TanStack Router)
        </PageContainer>
      </div>
    </main>
    <GlobalAIChat />                         // Floating widget (lazy-loaded)
  </DashboardLayout>
</Route>
```

### 4.2 ScrollArea Rule (CRITICAL)

**ONE scroll owner per page.** The `<main>` element in DashboardLayout owns the scroll via `overflow-y-auto`. This is the ONLY vertical scroll container at the layout level.

- Individual pages MUST NOT introduce their own `ScrollArea` or `overflow-y-auto` wrapper unless they use `PageContainer fillScreen={true}` to opt into a contained scroll mode.
- When `fillScreen` is true, the `PageContainer` takes `h-full min-h-0 flex-col overflow-hidden`, allowing children to manage their own internal scroll (e.g., Kanban boards, chat interfaces).
- The default (`fillScreen=false`) uses `h-auto min-h-full` -- standard document flow within the main scroll.

### 4.3 Dimension Specifications

| Element | Measurement | Responsive |
|---------|-------------|------------|
| Root container | `h-screen`, `flex-row` (md+), `flex-col` (mobile) | Yes |
| Sidebar (collapsed) | `w-[60px]`, `fixed left-0 top-0` | Desktop only |
| Sidebar (expanded) | `w-[300px]`, `fixed left-0 top-0` | Desktop only |
| Main content margin | `md:ml-[60px]` | Offsets for collapsed sidebar |
| Main border | `border-l border-border`, `rounded-tl-2xl` | Desktop only |
| Content padding | `p-4` (mobile), `p-6` (sm), `p-8` (lg) | Progressive |
| Mobile sidebar header | `h-10` | Mobile only |

### 4.4 Z-Index Stack

| Layer | Z-Index | Element |
|-------|---------|---------|
| Desktop sidebar | `z-40` | Fixed position sidebar |
| Mobile overlay backdrop | `z-[99]` | Dark overlay behind mobile sidebar |
| Mobile sidebar panel | `z-[100]` | Slide-in full-screen sidebar |
| Mobile close button | `z-50` | Close (X) button in mobile sidebar |
| Logo | `z-20` | Logo link (relative positioning) |

---

## 5. Component Inventory (shadcn/ui Primitives)

### 5.1 Components Used in Layout

| Component | Source | Location in Layout | Purpose |
|-----------|--------|-------------------|---------|
| `Sidebar` | Custom (`components/ui/sidebar.tsx`) | Root wrapper | Provides SidebarContext |
| `SidebarBody` | Custom | Inside Sidebar | Renders Desktop + Mobile variants |
| `SidebarLink` | Custom | Nav items | Navigation link with active state |
| `Button` | shadcn/ui | Theme toggler, close buttons | Interactive controls |
| `Link` | TanStack Router | Logo, nav items, WhatsApp card | Client-side navigation |
| `UserButton` | Custom (wraps Clerk) | Sidebar footer | User avatar/menu |

### 5.2 Icons

| Library | Icons Used |
|---------|------------|
| `lucide-react` | LayoutDashboard, HeartPulse, BriefcaseBusiness, Wallet, MessagesSquare, CalendarRange, Megaphone, MessageCircle, Sparkles, GraduationCap, Settings2, UsersRound, Users, Loader2, CheckCircle2, WifiOff, Building2, Moon, Sun |
| `@tabler/icons-react` | IconMenu2 (hamburger), IconX (close) |

**Icon sizing convention:** `h-5 w-5 flex-shrink-0` for nav item icons, `h-4 w-4` for status indicators and utility icons.

### 5.3 Lazy-Loaded Widgets

| Widget | Module | Trigger |
|--------|--------|---------|
| `GlobalAIChat` | `@/components/ai-chat/global-ai-chat` | Always rendered (Suspense) |
| `MentorImpersonationBar` | `@/components/mentor/mentor-impersonation-bar` | Admin/mentor roles only |

Both use `React.lazy()` with `.then()` named export extraction to reduce initial bundle size.

---

## 6. Detailed Sections

### 6.1 Sidebar Navigation

#### Desktop Sidebar (`DesktopSidebar`)

- **Position:** `fixed top-0 left-0`, hidden below `md` breakpoint
- **Width transition:** `w-[60px]` (collapsed) to `w-[300px]` (expanded), `duration-300 ease-in-out`
- **Background:** `bg-sidebar` with `border-r border-sidebar-border`
- **Padding:** `px-4 py-4`
- **Text:** `text-sidebar-foreground`
- **Expand trigger:** Mouse enter (hover)
- **Collapse trigger:** Mouse leave
- **Content overflow:** `overflow-y-auto overflow-x-hidden` on the flex-1 inner container

#### Mobile Sidebar (`MobileSidebar`)

- **Header bar:** `h-10 w-full`, `bg-sidebar`, `border-b border-sidebar-border`, visible below `md`
- **Hamburger button:** Right-aligned `IconMenu2`, `aria-label="Abrir menu"`
- **Overlay:** `fixed inset-0 z-[99] bg-black/20`, closes on click or Escape key
- **Panel:** `fixed inset-0 z-[100]`, `bg-sidebar p-10`, slides in from left
- **Slide animation:** `translate-x-0 opacity-100` (open) to `-translate-x-full opacity-0` (closed), `duration-300 ease-in-out`
- **Close button:** `absolute top-10 right-10 z-50`, `IconX`, `aria-label="Fechar menu"`

#### Logo Section (`LogoSection`)

- **Expanded:** Brand symbol image (24x24 webp) + "Neondash" text label
- **Collapsed:** Brand symbol image only
- **Image source:** `/brand/neon-symbol-official.webp`
- **Text color:** `text-black dark:text-white`
- **Font:** `font-medium` (500), `text-sm`
- **Links to:** `/meu-dashboard`

### 6.2 Navigation Items (13 Total)

| # | Label | Route | Icon | Visibility | Notes |
|---|-------|-------|------|------------|-------|
| 1 | Meu Dashboard | `/meu-dashboard` | `LayoutDashboard` | `mentoradoOnly` | Requires `mentorado_neon` plan, `clinica_staff`, or admin/mentor |
| 2 | Clientes | `/clientes` | `HeartPulse` | All authenticated | `preserveContexto: true` (carries `?contexto=` param) |
| 3 | CRM | `/crm/leads` | `BriefcaseBusiness` | All authenticated | -- |
| 4 | Financeiro | `/financeiro` | `Wallet` | All authenticated | -- |
| 5 | Atividades | `/atividades` | `MessagesSquare` | All authenticated | -- |
| 6 | Agenda | `/agenda` | `CalendarRange` | All authenticated | -- |
| 7 | Marketing | `/marketing` | `Megaphone` | All authenticated | -- |
| 8 | Chat WhatsApp | `/chat` | `MessageCircle` | All authenticated | -- |
| 9 | Agentes IA | `/ai-agents` | `Sparkles` | All authenticated | -- |
| 10 | Academia Neon | `/academia-neon` | `GraduationCap` | `mentoradoOnly` | Same visibility as Meu Dashboard |
| 11 | Configuracoes | `/configuracoes` | `Settings2` | All authenticated | -- |
| 12 | Painel Administrativo | `/admin/mentorados` | `UsersRound` | `adminOnly` | Admin + mentor roles |
| 13 | Gestao de Usuarios | `/admin/users` | `Users` | `adminOnly` | Admin + mentor roles |

#### Visibility Rules

```
isPrivileged = user.role === "admin" || user.role === "mentor"

adminOnly items:
  - Visible when: isPrivileged === true
  - Hidden when: any other role

mentoradoOnly items:
  - Visible when: isPrivileged === true
  - Visible when: user.billingPlan === "mentorado_neon"
  - Visible when: user.role === "clinica_staff"
  - Hidden when: none of the above

clinica_staff page restrictions:
  - If user.role === "clinica_staff" AND user.allowedPages !== null:
    - Map nav href to page key (first URL segment, with "meu-dashboard" -> "dashboard")
    - Hide if page key is NOT in user.allowedPages array
```

#### Active State Styling

- Active nav item: `rounded-md bg-secondary` on the `SidebarLink` wrapper
- Active icon: `text-primary` (gold) instead of default `text-muted-foreground`
- Detection: exact pathname match (`location === item.href`)

### 6.3 Main Content Area

- **Element:** `<main>` with semantic landmark role
- **Sizing:** `flex w-full flex-1 flex-col`
- **Scroll:** `overflow-y-auto overflow-x-hidden` (THE single scroll owner)
- **Border:** `border-l border-border` left edge, `rounded-tl-2xl` top-left radius
- **Background:** `bg-background`
- **Left offset:** `md:ml-[60px]` to clear collapsed sidebar width

#### Content Padding Wrapper

Inside `<main>`, a `<div>` wraps `{children}` with responsive padding:

| Breakpoint | Padding |
|------------|---------|
| Default (mobile) | `p-4` (16px) |
| `sm` (640px+) | `p-6` (24px) |
| `lg` (1024px+) | `p-8` (32px) |

Additional flex properties: `min-h-0 min-w-0 flex-1 flex-col` to prevent overflow issues in nested flex layouts.

### 6.4 Sidebar Footer

The sidebar footer (bottom section) contains three items stacked vertically with `gap-2`:

1. **NotificationBell** -- Notification center trigger
2. **SidebarThemeToggle** -- Theme mode toggle (light/dark)
3. **UserInfo** -- Clerk avatar + user name

Each footer item follows the pattern: `flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-secondary`. When sidebar is collapsed, only the icon/button is visible. When expanded, a label fades in via `fade-in animate-in duration-200`.

### 6.5 WhatsApp Status Card

Positioned below the nav items, the WhatsApp status card shows connection status with provider detection.

**Provider priority:** Baileys > Z-API > Meta (Meta requires admin role)

| State | Icon | Label |
|-------|------|-------|
| Loading | `Loader2` (spinning) | "Verificando..." |
| Connected | `CheckCircle2` (emerald) | "Ativo via {provider}" |
| Disconnected | `WifiOff` (amber) | "Configurar conexao" |

**Card styling:** `border border-sidebar-border/70 bg-sidebar-accent/40 px-2 py-2 rounded-md`, hover: `bg-sidebar-accent/60`. Links to `/configuracoes`.

### 6.6 Context Indicator

Shows when a `?contexto=` URL parameter is present (either `clinica` or `mentoria`).

- **Icon:** `Building2` for `clinica`, `GraduationCap` for `mentoria`
- **Label:** From `CONTEXTO_LABELS` shared constant
- **Styling:** `border border-sidebar-border/70 bg-sidebar-accent/30 px-2 py-1.5 rounded-md`
- **Icon color:** `text-primary` (gold)

---

## 7. Animations & Interactions

### 7.1 Sidebar Width Transition

| Property | Value |
|----------|-------|
| CSS property | `width` (via `transition-[width]`) |
| Duration | `300ms` |
| Easing | `ease-in-out` |
| From | `60px` (collapsed) |
| To | `300px` (expanded) |
| Trigger | Mouse enter / mouse leave |

**Guard logic (AT-021):** `handleMouseEnter` only calls `setOpen(true)` if `!open`, and `handleMouseLeave` only calls `setOpen(false)` if `open`. This prevents redundant state updates and stabilizes hover transitions.

### 7.2 Label Fade-In (Sidebar Expansion)

When the sidebar opens, text labels (nav items, user name, theme toggle, status card, context badge) fade in:

| Property | Value |
|----------|-------|
| Animation | `fade-in animate-in` (tw-animate-css) |
| Duration | `200ms` |
| Easing | Default (ease) |

When collapsed, labels are hidden via `invisible opacity-0` (nav links) or conditional rendering (`{open && ...}`).

### 7.3 Nav Item Hover

| Property | Value |
|----------|-------|
| Effect | `group-hover/sidebar:translate-x-1` on label text |
| Transition | `transition-opacity duration-200 ease-in-out` on label |

### 7.4 Mobile Sidebar Slide

| Property | Value |
|----------|-------|
| CSS properties | `transform, opacity` (via `transition-[transform,opacity]`) |
| Duration | `300ms` |
| Easing | `ease-in-out` |
| Open | `translate-x-0 opacity-100` |
| Closed | `-translate-x-full opacity-0 pointer-events-none` |

### 7.5 Theme Toggle (View Transition API)

The `ThemeTogglerButton` uses the View Transition API for a cinematic circle-clip reveal:

| Property | Value |
|----------|-------|
| API | `document.startViewTransition()` |
| Animation | `clipPath` circle expansion from button position |
| Duration | `500ms` |
| Easing | `ease-in-out` |
| Fallback | Immediate theme swap if API not available |
| Reduced motion | Respects `prefers-reduced-motion: reduce` -- skips animation |

### 7.6 Motion Rules

- **GPU-accelerated only:** `transform` and `opacity` exclusively for animations
- **`prefers-reduced-motion` is MANDATORY** -- the theme toggler explicitly checks this
- **No framer-motion** in layout -- CSS transitions only (`tw-animate-css` for enter animations)
- **No JS-driven hover animations** -- all hover effects via CSS `transition` property

---

## 8. Responsive Behavior

### 8.1 Breakpoint Strategy

| Breakpoint | Sidebar | Main Content | Navigation |
|------------|---------|-------------|------------|
| < 768px (mobile) | Hidden; hamburger header bar | Full width, `p-4` | Mobile slide-in panel |
| >= 768px (md) | Fixed left, 60px collapsed / 300px hover | `ml-[60px]`, `p-6` | Desktop hover sidebar |
| >= 1024px (lg) | Same as md | Same + `p-8` | Same as md |

### 8.2 Desktop (md+)

- Sidebar fixed on left, collapsed at 60px showing only icons
- Main content offset by `ml-[60px]` to avoid overlap
- Sidebar expands to 300px on hover, pushing no content (absolute positioning)
- `rounded-tl-2xl` on main content creates visual separation from sidebar

### 8.3 Mobile (< md)

- `MobileSidebar` renders a `h-10` header bar with hamburger button (right-aligned)
- Tapping hamburger opens full-screen slide-in panel from left
- Dark overlay (`bg-black/20`) behind panel; click overlay or press Escape to close
- Panel is `p-10` with `bg-sidebar`; close button at `top-10 right-10`
- `DashboardLayout` root switches to `flex-col` (stacked) on mobile

### 8.4 Content Padding Progression

```
Mobile (default):  p-4  = 16px all sides
Small (sm 640px):  p-6  = 24px all sides
Large (lg 1024px): p-8  = 32px all sides
```

---

## 9. State Management

### 9.1 Sidebar Open/Close State

| Concern | Implementation |
|---------|---------------|
| State owner | `SidebarProvider` (React Context) |
| Default value | `false` (collapsed) |
| State type | `boolean` via `useState` |
| Consumer hook | `useSidebar()` returns `{ open, setOpen, animate }` |
| Desktop trigger | `onMouseEnter` / `onMouseLeave` on `DesktopSidebar` |
| Mobile trigger | Hamburger button click / overlay click / Escape key |
| Animation flag | `animate` prop (default `true`); when false, sidebar is always "open" |

**Architecture note (AT-019):** Sidebar state is owned internally by the `SidebarProvider`. The `DashboardLayout` does NOT manage sidebar state -- it delegates entirely to the `Sidebar` component.

### 9.2 Active Route Detection

| Method | Implementation |
|--------|---------------|
| Source | `useRouterState({ select: state => state.location.pathname })` |
| Comparison | Exact match: `location === item.href` |
| Visual | `bg-secondary` on link container, `text-primary` on icon |

### 9.3 WhatsApp Provider Status

Fetched via three tRPC queries:

| Query | Enabled Condition |
|-------|------------------|
| `trpc.baileys.getStatus` | `!!user` |
| `trpc.zapi.getStatus` | `!!user` |
| `trpc.metaApi.getStatus` | `!!user && isAdmin` |

Provider priority: Baileys > Z-API > Meta. Loading state is the OR of all enabled query loading states.

### 9.4 Auth & Access Control

The `_dashboard.tsx` route file enforces multi-layer access control in `beforeLoad`:

| Gate | Condition | Redirect |
|------|-----------|----------|
| Not authenticated | No user from `authMe` query | `/` (landing) |
| Onboarding incomplete | Non-privileged, non-staff, not on exempt route | `/primeiro-acesso` |
| No billing/trial | Non-privileged, non-staff, no active plan, no active trial | `/configuracoes/billing?reason=trial_expired` |
| Staff page restriction | `clinica_staff` with `allowedPages` set, page not in list | First allowed page or `/configuracoes` |

Admin routes (`/admin/*`) are additionally guarded in `DashboardLayout` -- non-privileged users on restricted routes are redirected to `/meu-dashboard`.

### 9.5 Contexto URL Parameter

The `contexto` search parameter (`clinica` | `mentoria`) is read from router state and:

1. Displayed as a badge in the sidebar via `ContextIndicator`
2. Preserved across navigation for `Clientes` route (`preserveContexto: true`)

---

## 10. Accessibility

### 10.1 ARIA Landmarks

| Landmark | Element | Notes |
|----------|---------|-------|
| `<main>` | Main content area | Semantic `<main>` element in DashboardLayout |
| `<nav>` | Not explicitly set | The sidebar `<div>` should have `role="navigation"` (current gap) |

### 10.2 ARIA Labels

| Element | `aria-label` |
|---------|-------------|
| Mobile hamburger button | `"Abrir menu"` |
| Mobile close button | `"Fechar menu"` |
| Mobile overlay | `"Fechar menu"` (clickable overlay) |
| Theme toggle (light mode) | `"Ativar modo escuro"` |
| Theme toggle (dark mode) | `"Ativar modo claro"` |
| Each nav link | `{link.label}` (dynamic) |

### 10.3 Keyboard Navigation

| Interaction | Key | Behavior |
|-------------|-----|----------|
| Close mobile sidebar | `Escape` | Overlay `onKeyDown` handler |
| Navigate links | `Tab` | Standard focus order through sidebar links |
| Activate link | `Enter` | Standard link activation |

### 10.4 Focus Management

- Focus ring uses `--ring` token (gold) for visibility
- All interactive elements are `<button>` or `<a>`/`<Link>` (no `href="#"`)
- Mobile overlay uses `tabIndex={-1}` (not focusable in tab order, but accepts programmatic focus)

### 10.5 Reduced Motion

- Theme toggle explicitly checks `window.matchMedia("(prefers-reduced-motion: reduce)")` and skips the View Transition animation
- Sidebar transitions use CSS `transition-[width]` which browsers automatically suppress when reduced motion is preferred (with `tw-animate-css` support)

### 10.6 Known Gaps (Improvement Opportunities)

- The desktop sidebar `<div>` should carry `role="navigation"` and an `aria-label`
- A skip-to-content link (`<a href="#main-content">`) should be added before the sidebar for keyboard users
- The mobile overlay uses `role="button"` which is not ideal; consider `role="presentation"` with a visually hidden close button

---

## 11. Anti-Patterns to Avoid

### 11.1 ScrollArea Violations (CRITICAL)

| Anti-Pattern | Consequence | Correct Approach |
|-------------|-------------|-----------------|
| Nested `ScrollArea` inside a page | Double scrollbars, broken scroll behavior | Use `<main>` scroll owner only |
| `overflow-y-auto` on page wrapper | Competes with layout scroll | Use `PageContainer` default mode (no overflow) |
| `overflow-y-auto` on page AND `fillScreen` | Double scroll contexts | Choose ONE: layout scroll OR `fillScreen` internal scroll |
| `h-screen` or fixed height on page content | Breaks flex layout, causes overflow | Use `flex-1 min-h-0` for contained layouts |

### 11.2 Sidebar Anti-Patterns

| Anti-Pattern | Consequence | Correct Approach |
|-------------|-------------|-----------------|
| Using global tokens (`bg-background`) in sidebar | Inconsistent theming | Always use `bg-sidebar`, `text-sidebar-foreground`, etc. |
| Managing sidebar open state from parent | State desync, re-renders | Sidebar owns its state internally (AT-019) |
| Calling `useSidebar()` outside `SidebarProvider` | Runtime crash | Only use in components rendered inside `<Sidebar>` |
| Tight reconnect loop in hover handlers | Flickering sidebar | Use guard logic: only toggle if state actually changes (AT-021) |

### 11.3 Layout Anti-Patterns

| Anti-Pattern | Consequence | Correct Approach |
|-------------|-------------|-----------------|
| Adding `ScrollArea` wrapper in `_dashboard.tsx` | Captures all scroll events | `<main>` handles scrolling already |
| Hardcoded hex colors in layout | Breaks dark mode, violates design system | Semantic tokens only |
| `backdrop-blur` on new components | Glass Trap violation | Solid tonal surfaces per Stitch No-Line Rule |
| `1px solid` borders for section dividers | Violates No-Line Rule | Background shifts + negative space |
| JS-driven hover animations on nav items | Kills INP < 200ms | CSS `transition` property only |

### 11.4 Performance Anti-Patterns

| Anti-Pattern | Consequence | Correct Approach |
|-------------|-------------|-----------------|
| Eager loading GlobalAIChat | Bloats initial bundle | Already lazy-loaded via `React.lazy()` |
| Barrel imports from `lucide-react` | Loads entire icon library | Import from `lucide-react/dist/esm/icons/` (NOTE: current code uses barrel imports -- this is a known tech debt item) |
| Creating `new Date()` in render path | Object churn on re-renders | Hoist to module scope or memoize |

---

## 12. File Structure

```
apps/web/src/
  components/
    dashboard-layout.tsx          # Main layout: DashboardLayout, Logo, LogoIcon,
                                  # WhatsAppStatusCard, SidebarThemeToggle, UserInfo,
                                  # ContextIndicator, LogoSection
    page-container.tsx            # PageContainer wrapper (fillScreen mode)
    ui/
      sidebar.tsx                 # SidebarProvider, Sidebar, SidebarBody,
                                  # DesktopSidebar, MobileSidebar, SidebarLink
      theme-toggler-button.tsx    # ThemeTogglerButton (View Transition API)
      button.tsx                  # shadcn Button primitive
    auth/
      user-button.tsx             # Clerk UserButton wrapper
    notifications/
      notification-bell.tsx       # NotificationBell component
    ai-chat/
      global-ai-chat.tsx          # GlobalAIChat (lazy-loaded)
    mentor/
      mentor-impersonation-bar.tsx # MentorImpersonationBar (lazy-loaded)
  routes/
    _dashboard.tsx                # Route layout with auth guards + DashboardLayout
  contexts/
    theme-context.tsx             # ThemeProvider (useTheme hook)
  _core/
    hooks/
      use-auth.ts                 # useAuth hook (Clerk wrapper)
  lib/
    trpc.ts                       # tRPC client
    utils.ts                      # cn() utility
    query-keys.ts                 # routeQueries factory
  index.css                       # Theme tokens (CSS variables), font imports, animations
```

---

## 13. Pre-Delivery Checklist

### Visual Quality

- [ ] Sidebar uses exclusively `--sidebar-*` token family
- [ ] No hardcoded hex colors anywhere in layout components
- [ ] Logo image loads correctly (`/brand/neon-symbol-official.webp`)
- [ ] Active nav item shows gold icon (`text-primary`) and `bg-secondary` background
- [ ] WhatsApp status card displays correct provider label and status icon
- [ ] Context indicator appears only when `?contexto=` param is present

### Light/Dark Mode

- [ ] Toggle via ThemeTogglerButton works (View Transition API with fallback)
- [ ] All sidebar elements switch correctly between light/dark tokens
- [ ] Logo text switches from `text-black` (light) to `text-white` (dark)
- [ ] No hardcoded colors that fail in either mode
- [ ] `prefers-reduced-motion` disables theme transition animation

### Responsive

- [ ] Desktop (md+): sidebar fixed left, collapsed at 60px, expands on hover to 300px
- [ ] Mobile (< md): header bar with hamburger, slide-in panel, overlay backdrop
- [ ] Content padding progresses: `p-4` -> `p-6` -> `p-8` across breakpoints
- [ ] Main content offset (`ml-[60px]`) only applies on desktop (md+)
- [ ] No horizontal scroll at any viewport width

### Interaction

- [ ] Sidebar hover expand/collapse is smooth (300ms ease-in-out)
- [ ] Mobile sidebar slide-in animation works (300ms ease-in-out)
- [ ] Hamburger and close buttons are accessible (aria-labels present)
- [ ] Overlay closes on click and Escape key
- [ ] Nav item hover shows translate-x-1 nudge on label text
- [ ] All sidebar footer items fade in labels on expand

### Accessibility

- [ ] `<main>` landmark present for main content area
- [ ] All interactive elements have `aria-label` attributes
- [ ] No `href="#"` links (buttons used for actions)
- [ ] Focus ring visible on keyboard navigation (gold `--ring` token)
- [ ] `prefers-reduced-motion` respected for all animations
- [ ] Touch targets meet minimum 44x44px (sidebar links have `py-2` + icon size)

### Performance

- [ ] GlobalAIChat and MentorImpersonationBar are lazy-loaded (`React.lazy`)
- [ ] No unnecessary re-renders from sidebar state changes (context isolation via AT-019)
- [ ] Hover guard logic (AT-021) prevents redundant state updates
- [ ] Font loading uses `@fontsource` subset imports (no full font download)

### Access Control

- [ ] Non-privileged users redirected from `/admin/*` routes
- [ ] `mentoradoOnly` items hidden for users without `mentorado_neon` plan
- [ ] `adminOnly` items hidden for non-admin/mentor users
- [ ] `clinica_staff` with restricted `allowedPages` sees only permitted nav items
- [ ] Billing/trial gate redirects expired users to `/configuracoes/billing`
- [ ] Onboarding gate redirects incomplete users to `/primeiro-acesso`

---

## 14. Success Criteria

### Functional

- [ ] All 13 nav items render correctly with proper icons and route paths
- [ ] Nav item visibility rules work for all role/plan combinations: `admin`, `mentor`, `mentorado_neon`, `clinica_staff` (with/without `allowedPages`), and basic authenticated users
- [ ] WhatsApp provider detection follows priority chain (Baileys > Z-API > Meta)
- [ ] Route guards prevent unauthorized access at both route level (`beforeLoad`) and layout level (redirect)
- [ ] Contexto parameter persists across Clientes navigation and shows badge

### Visual

- [ ] Design passes the Template Test -- layout feels intentional and branded, not generic
- [ ] Tonal layering creates depth: sidebar (`--sidebar`) sits below main content (`--background`)
- [ ] Gold accent consistently applied: active states, focus rings, primary actions
- [ ] Border radius is `rounded-md` for interactive elements, `rounded-tl-2xl` for main content top-left
- [ ] No visual regression in either light or dark mode

### Performance

- [ ] Layout renders without layout shift (CLS < 0.1)
- [ ] Sidebar transition does not cause jank (GPU-accelerated `width` transition)
- [ ] Lazy-loaded widgets do not block initial paint
- [ ] No unnecessary tRPC queries fire for non-applicable roles (e.g., Meta status for non-admins)

### Accessibility

- [ ] WCAG 2.1 AA compliance for all layout elements
- [ ] Keyboard-only navigation through all sidebar items
- [ ] Screen reader announces page structure via semantic landmarks
- [ ] Color contrast ratios meet 4.5:1 minimum for text elements
