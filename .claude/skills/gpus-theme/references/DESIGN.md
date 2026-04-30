# DESIGN.md — NeonDash / Portal Grupo US

## 1. Visual Theme & Atmosphere

NeonDash is a **dark-first premium performance dashboard** — the interface of a private command center for mentors tracking revenue, student progress, and business intelligence. The entire experience is built on a deep navy-charcoal canvas (`#0D1C2D`) that creates a void where gold can shine as a beacon of value. Where most dashboard products lean into flat gray surfaces and generic blue accents, NeonDash radiates **curated authority**, as if the data itself has been etched into obsidian and gilded with precision.

The signature move is the three-font hierarchy — **Sora** for headlines (geometric, commanding, modern), **Inter** for body text (clinical precision, dense-data readability), and **Manrope** for labels and badges (distinctive geometric humanist, uppercase architectural tags). Combined with the warm architectural gold (`#AC9469`) on near-black surfaces, the visual language says "sovereign architect" rather than "another SaaS dashboard."

What makes NeonDash truly distinctive is its **tonal gravity**. Depth comes from luminance stepping across five surface tiers — never from heavy drop shadows. Borders are near-invisible ghost edges. The gold accent is used with surgical restraint: primary actions, active navigation, and high-signal KPI values only. Every other element recedes, creating a natural visual hierarchy where important data pulls the eye without competition.

Both modes — dark ("Executive Gilt") and light ("GrupoUS") — share the same identity anchors: Sovereign Gold for actions, Azul Petróleo for text authority, Sora/Inter/Manrope for typography, and tonal layering for depth. The modes differ in canvas polarity and surface progression, but the brand personality is identical.

**Creative North Star: "The Architectural Monolith"**

Permanence, weight, and curated authority. We reject the "bootstrap" look. We embrace high-end editorial aesthetics defined by tonal gravity.

**Key Characteristics:**
- Deep navy canvas (dark) / warm slate canvas (light) — polarity changes, identity stays
- Warm architectural gold (`#AC9469` dark / `#8B6914` light text) — signal-only, never decorative
- Five-tier tonal layering for depth in both modes — luminance, not shadows
- Sora/Inter/Manrope typographic triad — command, precision, architecture
- Ghost borders at 6–10% opacity — boundaries you feel, not see
- Strict 4px spacing grid — architectural precision in every dimension
- WCAG AA minimum on every text/background pair — no exceptions

---

## 2. Color Palette & Roles

### 2.1 Dark Mode — "Executive Gilt"

The dark palette creates the void. Gold and data emerge from it.

#### Primary Accent
- **Sovereign Gold** (`#AC9469`): The core brand action color — warm, architectural gold-brown for primary CTA buttons, active navigation, and high-signal KPI values. Deliberately restrained and never decorative.
- **Gold Hover** (`#C4AA7A`): Lighter warm gold for hover states — subtle lift without losing warmth.
- **Gold Active** (`#8F7A52`): Deeper pressed state — the gold sinks, confirming the action.
- **Gold Muted** (`rgba(172,148,105,0.15)`): Translucent gold wash for selected states, active nav backgrounds, and subtle emphasis without solid color blocks.

#### Surfaces & Backgrounds
- **Canvas** (`#0D1C2D`): The deepest void — page background. Everything floats above this.
- **Surface** (`#111f30`): First elevation — sidebar, major sections, sheet backgrounds.
- **Card** (`#162538`): Standard card and panel background — the workhorse container surface.
- **Elevated** (`#1c2e42`): Dropdowns, popovers, floating elements — noticeably above cards.
- **Offset** (`#243548`): Active states, pressed rows, highest interactive surfaces.

#### Text Hierarchy
- **Text Primary** (`#E8E4DC`): Warm near-white — the default readable text. Never pure `#ffffff`.
- **Text Muted** (`#8FA3B8`): Cool slate — secondary text, descriptions, metadata.
- **Text Faint** (`#617A8A`): Placeholder text, disabled states, tertiary information.
- **Text Inverse** (`#0D1C2D`): Dark text on gold buttons and light surfaces.

#### Borders & Dividers
- **Border** (`rgba(255,255,255,0.10)`): Standard container borders — barely visible structure.
- **Divider** (`rgba(255,255,255,0.06)`): Section dividers — even more subtle than borders.
- **Border Focus** (`rgba(172,148,105,0.40)`): Gold-tinted focus rings for inputs and interactive elements.

#### Semantic States
- **Success** (`#3DAA6C`): Positive outcomes, growth indicators, completed states.
- **Warning** (`#D4935A`): Caution states, approaching limits, needs attention.
- **Error** (`#C75464`): Destructive actions, failures, critical alerts.
- **Info** (`#4E8DC4`): Informational callouts, neutral indicators.

#### Chart Colors (Dark)
| Slot | Token | Hex | Usage |
|------|-------|-----|-------|
| 1 | `--chart-1` | `#AC9469` | Primary metric (gold) |
| 2 | `--chart-2` | `#4E8DC4` | Secondary metric (blue) |
| 3 | `--chart-3` | `#3DAA6C` | Tertiary metric (green) |
| 4 | `--chart-4` | `#C75464` | Quaternary metric (red) |
| 5 | `--chart-5` | `#D4935A` | Quinary metric (amber) |

---

### 2.2 Light Mode — "GrupoUS"

The light palette is rooted in warm, architectural tones. Professional, clean, premium. Gold shifts darker to maintain contrast on light surfaces.

#### Primary Accent
- **Sovereign Gold (light)** (`#8B6914`): Darkened gold for text and small UI elements on light surfaces — passes WCAG AA at 5.2:1 on white. The same hue family as `#AC9469` but optimized for light-mode contrast.
- **Gold Button Surface** (`#b8860b`): Background fill for primary buttons — paired with white text for large text (18px+) or dark text (`#1a1207`) for small text. Contrast on white: 3.8:1 (large text AA).
- **Gold Hover (light)** (`#9A750C`): Slightly deeper for hover on light surfaces.
- **Gold Active (light)** (`#745810`): Pressed state — noticeably darker confirmation.
- **Gold Muted (light)** (`rgba(139,105,20,0.10)`): Translucent gold wash for selected states on light surfaces.

#### Surfaces & Backgrounds
- **Canvas** (`#f8fafc`): Warm slate-white — page background. The lightest layer.
- **Surface** (`#f1f5f9`): First depth step — sidebar, section backgrounds, muted areas.
- **Card** (`#ffffff`): Standard card surface — pure white, one tier above canvas.
- **Elevated** (`#ffffff`): Popovers, dropdowns — same fill as card but with shadow for lift.
- **Offset** (`#e8ecf1`): Active states, pressed rows, table header backgrounds.

#### Text Hierarchy
- **Text Primary** (`#0f4c75`): Azul Petróleo — the default text color. Rich, warm-tinted dark blue, not generic black. Contrast on white: 7.5:1 ✅ AAA.
- **Text Secondary** (`#475569`): Slate 600 — descriptions, metadata, secondary content. Contrast on white: 6.0:1 ✅ AA.
- **Text Muted** (`#64748b`): Slate 500 — tertiary text, timestamps. Contrast on white: 4.6:1 ✅ AA.
- **Text Placeholder** (`#94a3b8`): Slate 400 — placeholder text, disabled. Contrast on white: 3.0:1 (meets non-text minimum).
- **Text Inverse** (`#ffffff`): White text on dark/gold button surfaces.

#### Borders & Dividers
- **Border** (`#e2e8f0`): Slate 200 — standard container borders. Visible but gentle.
- **Border Strong** (`#cbd5e1`): Slate 300 — emphasized borders, input focus fallback.
- **Divider** (`#f1f5f9`): Slate 100 — section dividers, barely visible on canvas.
- **Border Focus** (`#b8860b`): Gold border on input focus — solid, not translucent.

#### Semantic States (Light)
- **Success** (`#16a34a`): Green 600 — darker than dark-mode to maintain contrast on white (4.5:1 ✅).
- **Warning** (`#d97706`): Amber 600 — text-safe on white (3.5:1, large text AA).
- **Warning Text** (`#92400e`): Amber 800 — for warning text on white surfaces (5.8:1 ✅ AA).
- **Error** (`#dc2626`): Red 600 — text-safe on white (4.6:1 ✅ AA).
- **Info** (`#2563eb`): Blue 600 — text-safe on white (4.6:1 ✅ AA).

#### Chart Colors (Light)
| Slot | Token | Hex | Usage |
|------|-------|-----|-------|
| 1 | `--chart-1` | `#8B6914` | Primary metric (dark gold) |
| 2 | `--chart-2` | `#16a34a` | Secondary metric (green) |
| 3 | `--chart-3` | `#2563eb` | Tertiary metric (blue) |
| 4 | `--chart-4` | `#dc2626` | Quaternary metric (red) |
| 5 | `--chart-5` | `#d97706` | Quinary metric (amber) |

---

### 2.3 Surface Hierarchy — Dark Mode (Tonal Layering)

Depth is achieved by stacking surface tones — **never** by drop shadows alone.

| Level | Name | Hex | Usage |
|-------|------|-----|-------|
| 0 | Canvas (void) | `#0D1C2D` | Page background |
| 1 | Surface | `#111f30` | Sidebar, sections |
| 2 | Card | `#162538` | Cards, panels |
| 3 | Elevated | `#1c2e42` | Dropdowns, floating |
| 4 | Offset | `#243548` | Active states, pressed |

---

### 2.4 Surface Hierarchy — Light Mode (Tonal Layering)

The light mode uses the inverse: depth is achieved by **darkening** from the bright canvas.

| Level | Name | Hex | Usage |
|-------|------|-----|-------|
| 0 | Canvas | `#f8fafc` | Page background (Slate 50) |
| 1 | Surface | `#f1f5f9` | Sidebar, sections (Slate 100) |
| 2 | Card | `#ffffff` | Cards, panels (White) |
| 3 | Elevated | `#ffffff` | Dropdowns, floating (White + shadow) |
| 4 | Offset | `#e8ecf1` | Active states, pressed (Slate 200) |

**Key difference:** In dark mode, floating elements are lighter than their parent. In light mode, floating elements use shadow (`0 4px 16px rgba(0,0,0,0.08)`) because white-on-white lacks tonal contrast. This is the one place shadows are the primary depth mechanism in light mode.

---

### 2.5 Contrast Validation Table

Every text/background pair must meet WCAG AA minimum. This table is the source of truth.

#### Dark Mode Contrast Pairs

| Foreground | Background | Ratio | Level | Pass | Usage |
|------------|------------|-------|-------|------|-------|
| `#E8E4DC` | `#0D1C2D` | 11.9:1 | AAA | ✅ | Primary text on canvas |
| `#E8E4DC` | `#162538` | 9.5:1 | AAA | ✅ | Primary text on card |
| `#E8E4DC` | `#1c2e42` | 7.8:1 | AAA | ✅ | Primary text on elevated |
| `#8FA3B8` | `#0D1C2D` | 5.7:1 | AA | ✅ | Muted text on canvas |
| `#8FA3B8` | `#162538` | 4.5:1 | AA | ✅ | Muted text on card |
| `#8FA3B8` | `#1c2e42` | 3.7:1 | AA-lg | ⚠️ | Muted text on elevated (large text only) |
| `#617A8A` | `#0D1C2D` | 3.4:1 | AA-lg | ⚠️ | Faint text on canvas (placeholder/disabled) |
| `#617A8A` | `#162538` | 2.7:1 | — | 🔶 | Faint text on card (placeholder only) |
| `#AC9469` | `#0D1C2D` | 4.7:1 | AA | ✅ | Gold accent on canvas |
| `#AC9469` | `#162538` | 3.8:1 | AA-lg | ⚠️ | Gold accent on card (large text/icons only) |
| `#0D1C2D` | `#AC9469` | 4.7:1 | AA | ✅ | Button text on gold surface |
| `#E8E4DC` | `#AC9469` | 2.5:1 | — | ❌ | DO NOT USE — white text on gold |
| `#3DAA6C` | `#162538` | 4.8:1 | AA | ✅ | Success text on card |
| `#C75464` | `#162538` | 3.6:1 | AA-lg | ⚠️ | Error text on card (use with icon or large) |
| `#D4935A` | `#162538` | 4.2:1 | AA | ✅ | Warning text on card |
| `#4E8DC4` | `#162538` | 3.9:1 | AA-lg | ⚠️ | Info text on card (pair with icon) |

#### Light Mode Contrast Pairs

| Foreground | Background | Ratio | Level | Pass | Usage |
|------------|------------|-------|-------|------|-------|
| `#0f4c75` | `#ffffff` | 7.5:1 | AAA | ✅ | Primary text on card |
| `#0f4c75` | `#f8fafc` | 7.3:1 | AAA | ✅ | Primary text on canvas |
| `#475569` | `#ffffff` | 6.0:1 | AA | ✅ | Secondary text on card |
| `#475569` | `#f8fafc` | 5.8:1 | AA | ✅ | Secondary text on canvas |
| `#64748b` | `#ffffff` | 4.6:1 | AA | ✅ | Muted text on card |
| `#94a3b8` | `#ffffff` | 3.0:1 | AA-lg | ⚠️ | Placeholder on card (non-text/large only) |
| `#8B6914` | `#ffffff` | 5.2:1 | AA | ✅ | Gold text on card |
| `#8B6914` | `#f8fafc` | 5.1:1 | AA | ✅ | Gold text on canvas |
| `#AC9469` | `#ffffff` | 2.97:1 | — | ❌ | DO NOT USE — #AC9469 text on white |
| `#b8860b` | `#ffffff` | 3.8:1 | AA-lg | ⚠️ | Gold button bg (large text or with dark text) |
| `#1a1207` | `#b8860b` | 7.2:1 | AAA | ✅ | Dark text on gold button |
| `#ffffff` | `#b8860b` | 3.8:1 | AA-lg | ⚠️ | White text on gold (large/bold only) |
| `#ffffff` | `#0f4c75` | 7.5:1 | AAA | ✅ | White text on Petróleo button |
| `#16a34a` | `#ffffff` | 4.5:1 | AA | ✅ | Success text on white |
| `#dc2626` | `#ffffff` | 4.6:1 | AA | ✅ | Error text on white |
| `#92400e` | `#ffffff` | 5.8:1 | AA | ✅ | Warning text on white |
| `#2563eb` | `#ffffff` | 4.6:1 | AA | ✅ | Info text on white |

#### Contrast Rules
1. **Primary body text**: Must be ≥ 4.5:1 (AA) on its background — no exceptions.
2. **Muted/secondary text**: Must be ≥ 4.5:1 (AA) on its immediate background.
3. **Placeholder/disabled text**: Minimum 3:1 for non-text contrast. Acceptable to be below 4.5:1 since it's not persistent content, but must still be readable.
4. **Gold as text**: Use `#AC9469` in dark mode (4.7:1 on canvas ✅). Use `#8B6914` in light mode (5.2:1 on white ✅). **Never** use `#AC9469` on white — it fails at 2.97:1.
5. **Gold as button surface**: In dark mode, use `#0D1C2D` text on `#AC9469` (4.7:1 ✅). In light mode, use `#1a1207` text on `#b8860b` for small text (7.2:1 ✅) or `#ffffff` text for large/bold text (3.8:1 AA-lg).
6. **Semantic colors as text**: In dark mode, pair semantic text with icons for borderline ratios (3.6–4.2:1). In light mode, use the 600–800 shade variants which all pass 4.5:1+.
7. **Never pair**: White text on gold surface in either mode at small sizes. Always use dark text on gold.

---

### 2.6 Extended Brand Tokens

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--neon-petroleo` | `#0f4c75` | `#0ea5e9` | Azul Petróleo |
| `--neon-petroleo-light` | `#3282b8` | `#38bdf8` | Petróleo variant |
| `--neon-petroleo-dark` | `#1b262c` | `#0369a1` | Petróleo deep |
| `--neon-gold` | `#b45309` | `#fbbf24` | Brand gold |
| `--neon-gold-bright` | — | `#fcd34d` | Highlight gold |
| `--neon-gold-text` | `#8B6914` | `#AC9469` | Contrast-safe gold for text |
| `--neon-blue-dark` | `#0f172a` | `#020617` | Dark navy |

---

### 2.7 Gradient System

NeonDash is **gradient-free** in the traditional sense. Depth and visual richness come from the interplay of five surface tones, warm gold accents, and deliberate luminance stepping. The tonal layering itself creates a natural "gradient" effect.

The only permitted gradient is `bg-mesh` — radial gradients at 5–10% opacity using brand tokens, anchored to fixed corners for atmospheric depth. Full-screen aurora blobs are forbidden.

---

## 3. Typography Rules

### Font Family
- **Headline**: `Sora` — geometric, commanding, modern authority
- **Body / UI**: `Inter` — clinical precision, optimized for dense data at small sizes
- **Label / Badge**: `Manrope` — geometric humanist, distinctive uppercase architectural tags
- **Code / Metrics**: `JetBrains Mono` / `Fira Code` — technical identifiers and code blocks

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | Sora | 48–72px (3–4.5rem) | 700–900 | 1.05–1.10 | `tracking-tighter` | Maximum impact — the headline IS the design |
| Section Heading | Sora | 28–36px (1.75–2.25rem) | 700 | 1.15–1.20 | `tracking-tight` | Section authority |
| Card Title | Sora / Manrope | 20–24px (1.25–1.5rem) | 600–700 | 1.20–1.25 | `tracking-tight` | Card-level heading |
| Body Large | Inter | 18px (1.125rem) | 400 | 1.60 | normal | Intro paragraphs, descriptions |
| Body / UI Text | Inter | 14–16px (0.875–1rem) | 400–500 | 1.50–1.60 | normal | All functional UI text, paragraphs |
| Body Small | Inter | 13px (0.8125rem) | 400 | 1.40 | normal | Compact body text, table cells |
| Label / Badge | Manrope | 11–12px (0.6875–0.75rem) | 500–600 | 1.25 | `tracking-[0.1em]` uppercase | Architectural tags, status badges, table headers |
| Caption | Inter | 12px (0.75rem) | 400 | 1.30 | normal | Metadata, timestamps, secondary info |
| Code / Metric | JetBrains Mono | 13–14px (0.8125–0.875rem) | 400 | 1.50 | normal | Technical identifiers, code blocks |
| KPI Number | Sora | 28–48px (1.75–3rem) | 700 | 1.00 | `tracking-tight` | Large metric values — gold for key KPIs |

### Principles
- **Sora is headlines only**: Never use Sora below 20px. It commands attention at large sizes but loses clarity at body scale.
- **Inter handles everything functional**: Body text, UI labels, descriptions, form text, table data — clinical precision at any size.
- **Manrope is architectural tags**: Uppercase labels, badges, table headers, metadata — always with `tracking-[0.1em]`. Manrope in lowercase body text is a misuse.
- **Scale contrast must be dramatic**: Headline-to-body ratio 3x+ minimum. Never incremental 1.5x steps.
- **Weight extremes are intentional**: `font-thin` (100) / `font-extralight` (200) for captions vs `font-extrabold` (800) / `font-black` (900) for hero headlines. The 300–600 range for display text reads as indecisive.
- **Warm text in dark mode**: Use `#E8E4DC` (warm near-white) — never pure `#ffffff`.
- **Petróleo text in light mode**: Use `#0f4c75` (Azul Petróleo) — never pure `#000000`.
- **Tabular numerals for data**: All numeric columns, KPIs, and financial metrics use `font-variant-numeric: tabular-nums`.

---

## 4. Component Stylings

> Every component is specified for **both modes**. When a property is identical across modes, it is listed once. When it differs, `Dark:` and `Light:` variants are explicit.

### Buttons

**Primary (Gold)**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#AC9469` | `#b8860b` |
| Text | `#0D1C2D` (dark inverse) | `#1a1207` (dark inverse) |
| Hover bg | `#C4AA7A` | `#9A750C` |
| Active bg | `#8F7A52` | `#745810` |
| Border | None | None |
| Padding | 10px 20px | 10px 20px |
| Radius | 8px | 8px |
| Font | Inter 14px 500 | Inter 14px 500 |

> **Contrast note:** Gold buttons always use dark text in both modes. Never use white text on gold — it fails WCAG in both modes.

**Secondary**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `rgba(255,255,255,0.06)` | `#f1f5f9` (Slate 100) |
| Text | `#E8E4DC` | `#0f4c75` |
| Border | 1px `rgba(255,255,255,0.12)` | 1px `#e2e8f0` (Slate 200) |
| Hover bg | `rgba(255,255,255,0.10)` | `#e2e8f0` (Slate 200) |
| Hover border | `rgba(255,255,255,0.20)` | `#cbd5e1` (Slate 300) |

**Inverted**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#ffffff` | `#0f4c75` (Azul Petróleo) |
| Text | `#0D1C2D` | `#ffffff` |
| Usage | High-contrast CTA on dark surfaces | High-contrast CTA on light surfaces |

**Outlined**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | transparent | transparent |
| Text | `#E8E4DC` | `#0f4c75` |
| Border | 1px `rgba(255,255,255,0.20)` | 1px `#cbd5e1` (Slate 300) |
| Hover border | `#AC9469` | `#8B6914` |
| Hover text | `#AC9469` | `#8B6914` |

**Icon Button (Circular)** — Both modes
- Size: 36×36px, radius: full circle
- Variants: gold-filled (primary) or ghost (secondary)
- Icon: 18–20px, centered
- Dark ghost: `rgba(255,255,255,0.06)` bg, `#8FA3B8` icon
- Light ghost: `#f1f5f9` bg, `#64748b` icon

**Destructive** — Both modes
- Dark: `#C75464` bg, `#E8E4DC` text
- Light: `#dc2626` bg, `#ffffff` text
- Radius: 8px

### Cards & Containers

**Standard Card**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#162538` | `#ffffff` |
| Border | 1px `rgba(255,255,255,0.08)` | 1px `#e2e8f0` |
| Radius | 12px (`rounded-xl`) | 12px (`rounded-xl`) |
| Padding | 20–24px | 20–24px |
| Shadow | None (tonal layering) | `0 1px 3px rgba(0,0,0,0.04)` (subtle) |

**Elevated Card**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#1c2e42` | `#ffffff` |
| Border | 1px `rgba(255,255,255,0.12)` | 1px `#e2e8f0` |
| Shadow | `0 4px 24px rgba(0,0,0,0.15)` | `0 4px 16px rgba(0,0,0,0.08)` |

**Selected Card** — Both modes
- Dark: `rgba(172,148,105,0.15)` background tint
- Light: `rgba(139,105,20,0.08)` background tint + `#b8860b` left border 2px (exception: left border IS the light-mode selection signal because tints are too subtle on white)
- Never use colored side borders in dark mode — the gold tint on the entire card IS the dark-mode selection signal

**KPI Widget Card**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Container | `#162538`, 12px radius | `#ffffff`, 12px radius, subtle shadow |
| Main metric | Sora 28–48px bold | Sora 28–48px bold |
| Metric color | `#AC9469` for key values | `#8B6914` for key values |
| Label | Manrope uppercase 11px `#8FA3B8` | Manrope uppercase 11px `#64748b` |
| Trend | Semantic color + Inter 13px | Semantic color (light variants) + Inter 13px |

No dividers inside cards — ever. Use vertical spacing (`gap-4` to `gap-6`) for internal structure.

### Tables

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Header bg | `#111f30` | `#f8fafc` (Canvas) |
| Header text | Manrope uppercase 11px `#8FA3B8` | Manrope uppercase 11px `#64748b` |
| Body text | Inter 14px `#E8E4DC` | Inter 14px `#0f4c75` |
| Row hover | `rgba(255,255,255,0.03)` | `rgba(0,0,0,0.02)` |
| Row selected | `rgba(172,148,105,0.15)` | `rgba(139,105,20,0.06)` |
| Row divider | 1px `rgba(255,255,255,0.06)` | 1px `#f1f5f9` |
| Cell padding | 12px 16px | 12px 16px |
| Numeric cols | `tabular-nums`, right-aligned | `tabular-nums`, right-aligned |
| Empty state | Inter 14px `#8FA3B8` | Inter 14px `#94a3b8` |

### Navigation & Sidebar

**Sidebar**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#111f30` | `#ffffff` |
| Border (right) | 1px `rgba(255,255,255,0.06)` | 1px `#e2e8f0` |
| Width | 240–280px, collapsible to 64px | 240–280px, collapsible to 64px |

**Nav Item — Active**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `rgba(172,148,105,0.15)` | `rgba(139,105,20,0.08)` |
| Text | `#AC9469` | `#8B6914` |
| Icon | `#AC9469` | `#8B6914` |

**Nav Item — Inactive**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | transparent | transparent |
| Text | `#8FA3B8` | `#64748b` |
| Icon | `#8FA3B8` | `#64748b` |
| Hover bg | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.03)` |

**Mobile Bottom Tab Bar**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `#111f30` | `#ffffff` |
| Top border | 1px `rgba(255,255,255,0.06)` | 1px `#e2e8f0` |
| Height | 64px + safe area | 64px + safe area |
| Active icon | `#AC9469` + gold-muted bg circle | `#8B6914` + gold-muted bg circle |
| Inactive icon | `#8FA3B8` | `#94a3b8` |

### Inputs & Forms

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `rgba(255,255,255,0.04)` | `#ffffff` |
| Border | 1px `rgba(255,255,255,0.10)` | 1px `#e2e8f0` |
| Text | `#E8E4DC` | `#0f4c75` |
| Placeholder | `#617A8A` | `#94a3b8` |
| Focus border | `rgba(172,148,105,0.40)` | `#b8860b` |
| Focus ring | Gold outer glow (subtle) | `0 0 0 3px rgba(184,134,11,0.15)` |
| Error border | `#C75464` | `#dc2626` |
| Disabled | opacity 0.5 | opacity 0.5 |
| Padding | 10px 14px | 10px 14px |
| Radius | 8px | 8px |

**Search Field** — Same as input with left magnifier icon
- Dark rest icon: `#617A8A` → focus: `#8FA3B8`
- Light rest icon: `#94a3b8` → focus: `#64748b`

### Badges & Status Pills

Shape: rounded pill, Manrope uppercase 11px weight 500, `tracking-[0.1em]`, padding 2px 10px.

| Semantic | Dark bg | Dark text | Light bg | Light text |
|----------|---------|-----------|----------|------------|
| Success | `rgba(61,170,108,0.15)` | `#3DAA6C` | `rgba(22,163,74,0.10)` | `#16a34a` |
| Warning | `rgba(212,147,90,0.15)` | `#D4935A` | `rgba(217,119,6,0.10)` | `#92400e` |
| Error | `rgba(199,84,100,0.15)` | `#C75464` | `rgba(220,38,38,0.10)` | `#dc2626` |
| Info | `rgba(78,141,196,0.15)` | `#4E8DC4` | `rgba(37,99,235,0.10)` | `#2563eb` |
| Neutral | `rgba(255,255,255,0.06)` | `#8FA3B8` | `rgba(0,0,0,0.05)` | `#64748b` |
| Gold | `rgba(172,148,105,0.15)` | `#AC9469` | `rgba(139,105,20,0.08)` | `#8B6914` |

### Progress Bars & Dividers

**Progress Bar**

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Track | `rgba(255,255,255,0.06)` | `#e2e8f0` |
| Fill (primary) | `#AC9469` | `#b8860b` |
| Height | 6px, `rounded-full` | 6px, `rounded-full` |

**Dividers**
- Dark: 1px `rgba(255,255,255,0.06)`
- Light: 1px `#f1f5f9`
- Prefer spacing (`gap-6`, `py-6`) over visible dividers whenever possible

### Skeletons & Loading

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| Background | `rgba(255,255,255,0.04)` | `#e2e8f0` |
| Shimmer | Linear gradient sweep, 1.5s | Linear gradient sweep, 1.5s |

Shape must match expected content shape. Progress labels for AI: `Thinking... → Searching... → Writing...`

---

## 5. Layout Principles

### Spacing System
- **Base unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- **No arbitrary values**: 7px, 13px, 19px are forbidden unless explicitly defined
- **Card internal padding**: 20–24px minimum
- **Section vertical spacing**: 48–80px between major sections
- **Component gap**: `gap-4` (16px) standard, `gap-6` (24px) for cards in grid

### Grid & Container
- Max container width: 1280px, centered
- Sidebar + content: sidebar 240–280px fixed, content fills remainder
- Dashboard grid: 12-column with `gap-4` (16px) or `gap-6` (24px)
- Card grids: auto-fill with `min-width: 280px`

### Asymmetry Preference
- **Never 50/50 splits** for hero or feature layouts
- Preferred ratios: 8/4, 7/5, or 90/10 for asymmetric interest
- Dashboard data grids are the exception — even splits acceptable for KPI cards
- Bento grid OK for dashboards, forbidden for marketing/landing pages

### Whitespace Philosophy
- **Cinematic whitespace**: More space = more premium. If the layout feels crowded, add space before adding borders.
- **Density extremes**: Maximum whitespace (landing/marketing) OR maximum density (data tables/dashboards). Never "comfortable medium."
- **Padding as luxury**: Cards use `p-5` to `p-6` minimum. `p-3` feels cheap.

### Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small inline elements, badges |
| `--radius-md` | 6px | Inputs, compact buttons |
| `--radius` | 8px | Standard buttons, cards (base) |
| `--radius-lg` | 8px | Standard containers |
| `--radius-xl` | 12px | Feature cards, panels |
| `rounded-full` | 9999px | Avatars, pills, circular buttons |

> **Rule**: Never use rounded corners above `rounded-xl` (12px) for containers. Exception: pills and avatars use `rounded-full`.

---

## 6. Depth & Elevation

### 6.1 Dark Mode — Tonal Layering (Primary)

| Level | Surface | Hex | Usage |
|-------|---------|-----|-------|
| 0 — Void | Canvas | `#0D1C2D` | Page background — the deepest layer |
| 1 — Ground | Surface | `#111f30` | Sidebar, section backgrounds |
| 2 — Content | Card | `#162538` | Standard cards, panels, containers |
| 3 — Float | Elevated | `#1c2e42` | Dropdowns, popovers, sheets |
| 4 — Peak | Offset | `#243548` | Active/pressed states, tooltips |

Every UI layer sits exactly one surface tier above its parent. A card on canvas has natural lift. A dropdown above a card has further lift. This is depth without shadows.

**Dark ambient shadows** (secondary — use sparingly):

| Level | Shadow | Use |
|-------|--------|-----|
| None | — | Standard cards, inline elements |
| Whisper | `0 2px 8px rgba(0,0,0,0.10)` | Subtle lift |
| Ambient | `0 4px 24px rgba(0,0,0,0.15)` | Dropdowns, popovers |
| Deep | `0 8px 40px rgba(0,0,0,0.25)` | Overlays, sheets |

### 6.2 Light Mode — Shadow Layering (Primary)

In light mode, white-on-white lacks tonal contrast. Shadows become the **primary** depth mechanism, replacing tonal layering.

| Level | Surface | Shadow | Use |
|-------|---------|--------|-----|
| 0 — Base | Canvas `#f8fafc` | None | Page background |
| 1 — Ground | Surface `#f1f5f9` | None | Sidebar, sections (tonal shift) |
| 2 — Content | Card `#ffffff` | `0 1px 3px rgba(0,0,0,0.04)` | Standard cards (whisper shadow) |
| 3 — Float | Elevated `#ffffff` | `0 4px 16px rgba(0,0,0,0.08)` | Dropdowns, popovers (clear shadow) |
| 4 — Peak | Overlay `#ffffff` | `0 8px 32px rgba(0,0,0,0.12)` | Modals, sheets (prominent shadow) |

**Key difference**: Dark mode achieves depth via background lightening. Light mode achieves depth via shadow intensity. Both use the same 5-level system.

### 6.3 Ghost Border Fallback — Both Modes

When a container lacks contrast against its parent:

| Context | Dark Mode | Light Mode |
|---------|-----------|------------|
| Standard container | `rgba(255,255,255,0.08)` | `#e2e8f0` (Slate 200) |
| Elevated container | `rgba(255,255,255,0.12)` | `#cbd5e1` (Slate 300) |
| Section divider | `rgba(255,255,255,0.06)` | `#f1f5f9` (Slate 100) |

These create a "glint" — not a drawn line. Never use opaque colored borders for section dividers in either mode.

---

## 7. Do's and Don'ts

### Do
- Use the correct canvas for each mode — `#0D1C2D` dark / `#f8fafc` light
- Use contrast-safe gold — `#AC9469` dark text / `#8B6914` light text
- Use dark text on gold buttons — never white text on gold in either mode
- Use tonal layering (dark) and shadow layering (light) for elevation
- Use Sora at 22px+ for headlines, Inter for body, Manrope uppercase for labels
- Use `#E8E4DC` warm near-white text in dark mode — never pure `#ffffff`
- Use `#0f4c75` Azul Petróleo text in light mode — never pure `#000000`
- Use ghost borders at 6–10% opacity (dark) / Slate 200 (light)
- Use `font-variant-numeric: tabular-nums` for all numeric data
- Use semantic color variants appropriate to each mode (see §2.5 Contrast Table)
- Validate contrast ratios against the table in §2.5 before shipping
- Test BOTH modes for every component change — no exception
- Use CSS `transition` for all hover/focus animations
- Use `prefers-reduced-motion` on every animation

### Don't
- Don't use `#AC9469` as text on white/light surfaces — use `#8B6914` instead
- Don't use white/light text on gold buttons — always dark text
- Don't use identical tokens across modes — each mode has its own token set
- Don't use pure white or pure black for text in either mode
- Don't use gold decoratively — it's signal-only (actions, active states, key values)
- Don't use colored left borders for card selection in dark mode (use gold tint)
- Don't use Sora for body text, Manrope for lowercase body text
- Don't use `1px solid` opaque borders for section dividers
- Don't use drop shadows as primary depth in dark mode — use tonal layering
- Don't use purple/violet/indigo as primary or accent
- Don't use generic blue/teal as primary — GPUS Gold or Azul Petróleo only
- Don't use rounded corners above `rounded-xl` (12px) on containers
- Don't use JS hover animations — CSS transitions only (INP)
- Don't animate layout properties — GPU properties only (`transform`, `opacity`)
- Don't use mesh/aurora gradient blobs at high opacity
- Don't use 50/50 hero layout splits
- Don't use arbitrary spacing (7px, 13px, 19px) — strict 4px scale
- Don't add inline hex colors — use semantic tokens exclusively
- Don't use zebra striping — use subtle hover + selected states
- Don't skip `prefers-reduced-motion` wrappers

### The Five Traps (Rejection Gates)

| Trap | Trigger | Required Fix |
|------|---------|--------------|
| **Safe Split** | 50/50 or 60/40 hero grid splits | 90/10 asymmetry, massive typographic hero, or vertical narrative |
| **Glass Trap** | `backdrop-blur` without solid borders | Remove blur → solid tonal surfaces + ghost border |
| **Glow Trap** | Soft gradients to "pop" elements | High-contrast tonal layering or `bg-mesh` at 5–10% |
| **Bento Trap** | Rounded box grid as marketing layout | OK for dashboards; marketing → editorial columns, asymmetric |
| **Blue Trap** | Generic blue/teal as primary | GPUS Gold or Azul Petróleo only |

### Template Test
- "Could this be a Vercel/Stripe template?" → **FAIL — delete and restart**
- "Would I scroll past this on Dribbble?" → **FAIL — delete and restart**
- "Does this look like AI-generated slop?" → **FAIL — delete and restart**

---

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | < 640px | Single column, bottom tab nav, stacked KPIs, compact tables |
| Tablet | 640–1024px | 2-column grids, collapsible sidebar, condensed nav |
| Desktop | > 1024px | Full sidebar + content, multi-column KPIs, expanded tables |

### Touch Targets
- Minimum touch target: **44×44px** — no exceptions
- Buttons: minimum height 40px (mobile), 36px (desktop)
- Nav items: minimum height 44px
- Table rows: minimum height 48px for touch interaction
- Icon buttons: 44×44px touch area even if visual size is 36×36px

### Collapsing Strategy
- **Sidebar**: Full (240px) → icon-only (64px) → hidden + hamburger on mobile
- **Bottom tab bar**: Appears on mobile (< 640px) to replace sidebar
- **KPI grid**: 4-column → 2-column → single column stacked
- **Data tables**: Full columns → priority columns + horizontal scroll → card-based stacked
- **Hero typography**: 72px → 48px → 36px progressive scaling
- **Card padding**: `p-6` → `p-5` → `p-4` but never below `p-4`
- **Section spacing**: Reduces proportionally, maintains breathing room

### Mobile-Specific Rules
- Bottom tab bar: 64px height + safe area inset, max 5 items
- Swipe gestures: left swipe for delete/archive on list items
- Pull-to-refresh: gold spinner on canvas surface
- Sheets: bottom sheet pattern for mobile actions, not full modals
- Search: full-screen overlay on mobile, inline on desktop

---

## 9. Agent Prompt Guide

### Quick Color Reference — Dark Mode
| Role | Token |
|------|-------|
| Page Background | `#0D1C2D` (canvas) |
| Card Surface | `#162538` (card) |
| Sidebar | `#111f30` (surface) |
| Primary Accent | `#AC9469` (sovereign gold) |
| Primary Text | `#E8E4DC` (warm near-white) |
| Secondary Text | `#8FA3B8` (cool slate muted) |
| Placeholder | `#617A8A` (text-faint) |
| Border | `rgba(255,255,255,0.10)` |
| Success | `#3DAA6C` |
| Error | `#C75464` |

### Quick Color Reference — Light Mode
| Role | Token |
|------|-------|
| Page Background | `#f8fafc` (canvas) |
| Card Surface | `#ffffff` (card) |
| Sidebar | `#ffffff` (surface) |
| Primary Accent | `#8B6914` (gold text) / `#b8860b` (gold button bg) |
| Primary Text | `#0f4c75` (Azul Petróleo) |
| Secondary Text | `#475569` (Slate 600) |
| Muted Text | `#64748b` (Slate 500) |
| Placeholder | `#94a3b8` (Slate 400) |
| Border | `#e2e8f0` (Slate 200) |
| Success | `#16a34a` (Green 600) |
| Error | `#dc2626` (Red 600) |
| Button text on gold | `#1a1207` (dark brown) |

### Token Sync Checklist
Before making any UI changes, verify:
1. ✅ All colors map to tokens defined in this file — no raw hex values
2. ✅ Typography follows Sora/Inter/Manrope role assignments
3. ✅ Spacing uses the 4px grid scale only
4. ✅ Border radius follows the defined scale
5. ✅ Gold is used for signal only — actions, active states, key values
6. ✅ Gold text uses contrast-safe variant per mode (`#AC9469` dark / `#8B6914` light)
7. ✅ Button text on gold is always dark — never white
8. ✅ Tonal layering (dark) / shadow layering (light) for depth
9. ✅ Ghost borders use mode-appropriate opacity/color
10. ✅ Every text/background pair validates against §2.5 Contrast Table

### Example Component Prompts — Dark Mode
- "Create a KPI card on `#162538` with 1px `rgba(255,255,255,0.08)` border and `rounded-xl`. Main metric in Sora 36px bold `#AC9469`. Label in Manrope uppercase 11px `#8FA3B8`. Trend in Inter 13px `#3DAA6C` with upward arrow."
- "Build a sidebar on `#111f30`. Active item: `rgba(172,148,105,0.15)` bg with `#AC9469` text. Inactive: `#8FA3B8` text. Right border 1px `rgba(255,255,255,0.06)`."
- "Design a data table with `#111f30` header. Headers: Manrope uppercase 11px `#8FA3B8`. Body: Inter 14px `#E8E4DC`. Hover: `rgba(255,255,255,0.03)`. Selected: `rgba(172,148,105,0.15)`."
- "Primary button: `#AC9469` bg, `#0D1C2D` text, Inter 14px 500, 8px radius, 10px 20px padding. Hover: `#C4AA7A`."

### Example Component Prompts — Light Mode
- "Create a KPI card on `#ffffff` with 1px `#e2e8f0` border, `rounded-xl`, shadow `0 1px 3px rgba(0,0,0,0.04)`. Main metric in Sora 36px bold `#8B6914`. Label in Manrope uppercase 11px `#64748b`. Trend in Inter 13px `#16a34a`."
- "Build a sidebar on `#ffffff`. Active item: `rgba(139,105,20,0.08)` bg with `#8B6914` text. Inactive: `#64748b` text. Right border 1px `#e2e8f0`."
- "Design a data table with `#f8fafc` header. Headers: Manrope uppercase 11px `#64748b`. Body: Inter 14px `#0f4c75`. Hover: `rgba(0,0,0,0.02)`. Selected: `rgba(139,105,20,0.06)`."
- "Primary button: `#b8860b` bg, `#1a1207` text, Inter 14px 500, 8px radius, 10px 20px padding. Hover: `#9A750C`."

### Audit Process (Per Component)
For each component touched, an agent must:
1. Inspect current implementation against this DESIGN.md
2. Identify every violation (wrong color, wrong font role, wrong spacing, wrong depth)
3. **Check contrast**: validate text/background pair against §2.5 table
4. **Check both modes**: verify the component renders correctly in dark AND light
5. Refactor using only approved tokens
6. Verify responsive behavior at mobile/tablet/desktop
7. Self-audit before marking complete

Output format per component:
```
### [Component Name]
Violations: [list]
Changes: [list]
Token mapping (dark): bg / border / text / accent / radius / spacing / typography
Token mapping (light): bg / border / text / accent / radius / spacing / typography
Contrast check: [pass/fail per pair, referencing §2.5]
Responsive: [notes]
Status: COMPLIANT | PARTIAL (with remaining issues)
```

### Iteration Guide
1. Focus on ONE component at a time
2. Always specify WHICH MODE — "in dark mode, use..." / "in light mode, use..."
3. Reference specific color names — "use Sovereign Gold `#AC9469`" not "make it gold"
4. Always specify font role — "Sora for the heading, Inter for the label"
5. For depth, specify the mechanism — "tonal layering" (dark) or "shadow" (light)
6. Specify the parent surface for contrast validation
7. Gold is signal-only — if you're about to use it decoratively, stop and reconsider
8. When in doubt, check §2.5 Contrast Table before committing a color pair

---

## 10. Stitch Design System Integration

### Design System IDs

| Name | Asset ID | Color Mode | Primary Color | Fonts |
|------|----------|------------|---------------|-------|
| **Executive Gilt** | `4a5198c74b714d789767915ca3232125` | DARK | `#D4AF37` | Sora + Inter |
| **GrupoUS** | `c852e07ec0444f10b9ab3015c94dbaf2` | LIGHT | `#AC9469` | Sora + Inter + Montserrat |

### Stitch Project
- **Project ID**: `14494421539354595743`

### Applying via Stitch MCP
```
mcp_stitch_apply_design_system(
  projectId: "14494421539354595743",
  assetId: "<asset_id>",
  selectedScreenInstances: [...]
)
```

### Screen IDs
| Screen ID | Title |
|-----------|-------|
| `f26bbcca2f8f48b2b0778e7bf50cc0f1` | GPUS Group - Premium Landing Page Refined |
| `4220db53af424d9f90117d53463768a5` | GPUS Group - Optimized Corporate Standard |
| `b054c51ee20c402e869a9691dcee9e3c` | GPUS Premium Landing Page Variant 1 |
| `622ee96b29d346929e391cb493d82183` | GPUS Premium Landing Page Variant 2 |

---

## 11. shadcn/ui Configuration

### Setup

- **Style:** `new-york` · **Base color:** `zinc` · **CSS Variables:** enabled · **Icons:** `lucide`
- Config file: `assets/components.json`

### Path Aliases

| Alias | Path |
|-------|------|
| `@/components` | `src/components` |
| `@/components/ui` | `src/components/ui` |
| `@/lib` | `src/lib` |
| `@/hooks` | `src/hooks` |

### Adding Components

```bash
# From shadcn/ui
bunx shadcn@latest add button

# From registries
bunx shadcn@latest add @aceternity/hero-parallax
bunx shadcn@latest add @magicui/marquee
```

### Component Inventory (43 core + 9 extended)

**Core:** accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, command, dialog, dropdown-menu, form, input, label, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, tooltip

**Extended:** aceternity-sidebar, date-range-picker, flip-button, floating-navbar, hero-parallax, hover-border-gradient, macbook-scroll, motion-wrapper, ripple-button

### HSL Variable Usage

All semantic colors use HSL format without the `hsl()` wrapper. Apply with:

```css
background-color: hsl(var(--background));
color: hsl(var(--foreground));
background-color: hsl(var(--primary) / 0.5); /* with opacity */
```

In Tailwind v4, `bg-primary` resolves to `hsl(var(--primary))` via `@theme inline`.
