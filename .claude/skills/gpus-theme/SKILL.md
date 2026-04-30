---
name: gpus-theme
description: Use for GPUS branding, Portal Grupo US and NeonDash themes, shadcn tokens, light and dark mode styling, WCAG contrast, and anti-generic SaaS UI review.
---

# GPUS Theme — The Sovereign Architect

Canonical design system for Portal Grupo US (Neondash). Two Stitch design systems — **Executive Gilt** (dark) + **GrupoUS** (light) — unified into a shadcn/ui-compatible token set.

> **Identity:** Azul Petróleo + Sovereign Gold · Professional, premium, architectural
> **North Star:** "The Architectural Monolith" — permanence, weight, curated authority
> **Stitch Project:** `14494421539354595743`

---

## Quick Start

### Option 1: Copy CSS Variables (Tailwind v4)

Copy `assets/theme-tokens.css` and import it:

```css
@import "tailwindcss";
@import "./theme-tokens.css";
```

### Option 2: Use shadcn Configuration

```bash
cp .agent/skills/gpus-theme/assets/components.json ./components.json
```

### Option 3: Reference Only

Read `references/DESIGN.md` for the complete specification without copying files.

---

## Brand Anchors (Quick Reference)

Core tokens per mode. For full token tables → `references/css-variables.md`. For detailed color roles → `references/DESIGN.md` §2.

| Role | Dark Mode | Light Mode |
| --- | --- | --- |
| **Canvas** | `#0D1C2D` (navy void) | `#f8fafc` (warm slate) |
| **Card** | `#162538` | `#ffffff` |
| **Primary text** | `#E8E4DC` (warm near-white, never `#fff`) | `#0f4c75` (Azul Petróleo, never `#000`) |
| **Gold accent** | `#AC9469` (Sovereign Gold) | `#8B6914` (contrast-safe gold text) |
| **Gold button bg** | `#AC9469` | `#b8860b` |
| **Button text on gold** | `#0D1C2D` (dark) | `#1a1207` (dark) |
| **Muted text** | `#8FA3B8` | `#64748b` |
| **Border** | `rgba(255,255,255,0.10)` | `#e2e8f0` |
| **Focus ring** | `#fbbf24` | `#b8860b` |

### Extended Brand Tokens

| Token | Light | Dark |
| --- | --- | --- |
| `--neon-petroleo` | `#0f4c75` | `#0ea5e9` |
| `--neon-gold` | `#b45309` | `#fbbf24` |
| `--neon-gold-text` | `#8B6914` | `#AC9469` |

---

## Contrast Safety (Non-Negotiable)

Full contrast validation table with every pair → `references/DESIGN.md` §2.5

| Rule | Detail |
| --- | --- |
| **Gold text on white → ❌ NEVER use `#AC9469`** | Fails at 2.97:1. Use `#8B6914` (5.2:1 ✅) in light mode. |
| **Button text on gold → always dark** | Never white text on gold in either mode. Dark text: `#0D1C2D` / `#1a1207`. |
| **No pure white or pure black text** | Dark mode: `#E8E4DC`. Light mode: `#0f4c75`. |
| **Gold on card (dark) → large text only** | `#AC9469` on `#162538` = 3.8:1 (AA-lg ⚠️). Use on headings/icons, not body. |
| **Semantic colors as text (dark)** | Pair with icons for borderline ratios (3.6–4.2:1). Light mode 600–800 shades pass AA. |

---

## Typography

Font stack and role assignments. Full hierarchy with sizes/weights/spacing → `references/DESIGN.md` §3.

```css
--font-sans: "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
```

| Role | Font | Key Rules |
| --- | --- | --- |
| **Headlines** | Sora (700-900) | 20px+ only. `tracking-tighter`. Typography IS the design. |
| **Body / UI** | Inter (400-500) | Clinical precision for dense data. 14-16px standard. |
| **Labels / Badges** | Manrope (500-600) | Always uppercase + `tracking-[0.1em]`. Architectural tags. |
| **Code / Metrics** | Fira Code (400) | `tabular-nums` for all numeric data columns. |

**Scale contrast:** Headline-to-body ratio 3x+ minimum (e.g. `text-5xl` + `text-base`). Never incremental 1.5x steps.

**Weight extremes:** `font-thin`/`font-extralight` for captions vs `font-extrabold`/`font-black` for headlines. The 300–600 range for display text = indecisive.

> **Inter exception:** Inter is a "generic font" per anti-slop rules, but is GPUS's intentional body fallback. Manrope leads; Inter is the functional companion. For landing/marketing surfaces, prefer editorial alternatives from `references/anti-slop-aesthetics.md` §3.

---

## Design Principles

Compact rules. Full component specifications (both modes) → `references/DESIGN.md` §4-6. Layout details → §5.

### Depth System

- **Dark mode:** Tonal layering — 5 surface tiers (`#0D1C2D` → `#243548`). No shadows as primary depth.
- **Light mode:** Shadow layering — white-on-white needs `box-shadow` for float/elevated surfaces.
- **Ghost borders:** Dark `rgba(255,255,255,0.08)` / Light `#e2e8f0`. Never opaque colored section dividers.

### Layout

- **Asymmetry preferred:** 8/4 or 70/30 ratios. Never 50/50 hero splits.
- **Cinematic whitespace:** More space = more premium. Cards `p-5`+ minimum.
- **Spacing grid:** Strict 4px increments. No arbitrary values (7px, 13px).
- **Radius:** `--radius: 0.5rem` (8px) base. Never above `rounded-xl` (12px) on containers.
- **Density extremes:** Maximum whitespace (marketing) OR maximum density (data). Never "comfortable medium."

### Component Quick Rules

| Component | Rule |
| --- | --- |
| **Primary Button** | Gold bg + dark text. No border. `rounded-md`. |
| **Ghost Button** | `outline-variant` 20% opacity border + `text-primary`. |
| **Cards** | No internal dividers. Tonal bg + padding `p-5`+. |
| **Inputs** | Ghost border at rest → gold border on focus. |
| **Lists** | Vertical whitespace (`gap-6`) only, never `<hr>`. |

---

## Anti-AI-Slop Rejection Gates

Philosophy and full alternatives → `references/anti-slop-aesthetics.md`. AI UX patterns → §9.

**Template Test** — before shipping, if YES to any → delete and restart:
1. "Could this be a Vercel/Stripe template?"
2. "Would I scroll past this on Dribbble?"
3. "Does this look like AI-generated slop?"

**Key Forbidden Defaults** (10 total in reference):

| Trap | Trigger | Fix |
| --- | --- | --- |
| **Hero Split** | 50/50 or 60/40 layout | Massive Typographic Hero, Layered Depth, 90/10 Asymmetry |
| **Blue/Purple Trap** | Generic blue/teal/purple as primary | GPUS Gold or Azul Petróleo only |
| **Glass Trap** | `backdrop-blur` without solid border | Solid tonal surfaces + ghost border |
| **Mesh/Aurora** | High-opacity colored blobs | `bg-mesh` at 5-10% opacity only |
| **JS Hover** | JS event handlers for hover animations | CSS `transition` only (INP budget) |

> **`backdrop-blur` legacy:** 42 existing files use it. Gradual migration — new components use solid surfaces; existing need border audit.

**The Creative Space:** GPUS tokens are fixed brand anchors. Diversity lives in layouts, composition, animation choreography, typography scale, and spatial composition — not in color variation.

---

## Motion Rules

3 key rules. Full motion patterns + scroll reveals + hover states → `references/anti-slop-aesthetics.md` §6.

1. **GPU-only properties:** Animate `transform` and `opacity` exclusively. Never `width`/`height`/`margin`/`padding`.
2. **`prefers-reduced-motion` is mandatory** on every animation. Use `motion-reduce:` Tailwind variant.
3. **One orchestrated entrance per page:** Stagger 80-120ms between elements, total ≤800ms. CSS-first (`transition`, `@keyframes`). The project has `animation-variants.ts` for complex sequences.

---

## shadcn/ui Configuration

- **Style:** `new-york` · **Base color:** `zinc` · **CSS Variables:** enabled · **Icons:** `lucide`
- Full config + component inventory (43 core + extended) → `references/DESIGN.md` §11
- Registries: @kokonutui, @aceternity, @magicui, @tweakcn, @shadcnui-blocks, @cult-ui, @originui, @tailark

---

## Resources

### Assets (copy to project)

| File | Purpose |
| --- | --- |
| `assets/theme-tokens.css` | Portable CSS — Tailwind v4 `@theme inline`, light/dark vars, Clerk vars, neon utilities, `bg-mesh` |
| `assets/components.json` | shadcn/ui configuration with extended registries |

### References (read on demand)

| File | Content | When to Read |
| --- | --- | --- |
| `references/DESIGN.md` | Complete spec: color palette, contrast table, component stylings (both modes), layout, depth, responsive, agent prompts, shadcn inventory | Implementing/auditing components, need exact token values |
| `references/anti-slop-aesthetics.md` | Anti-slop philosophy: 10 forbidden defaults, alternative layouts/fonts, motion, backgrounds, usability research, AI UX patterns | Designing new pages/features, reviewing layout decisions |

---

## Stitch Design System IDs

| Name | Asset ID | Mode | Custom Color |
| --- | --- | --- | --- |
| **Executive Gilt** | `4a5198c74b714d789767915ca3232125` | Dark | `#D4AF37` |
| **GrupoUS** | `c852e07ec0444f10b9ab3015c94dbaf2` | Light | `#AC9469` |

```
apply_design_system(
  projectId: "14494421539354595743",
  assetId: "<asset_id>",
  selectedScreenInstances: [...]
)
```
