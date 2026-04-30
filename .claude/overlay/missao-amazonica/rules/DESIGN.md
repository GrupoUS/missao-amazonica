# DESIGN.md — Missão Amazônica · Sal da Terra

> Tier 2 design rules. Tokens canônicos: [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](../../docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md). Implementação CSS: [`src/styles/global.css`](../../src/styles/global.css).

---

## 1. Theme & Anti-Traps

**North Star:** "Sal da Terra — Stripe minimalism com calor humano." Autoridade calma e transparência. Confiança via densidade tipográfica + neutros quentes + fotografia real do Rio Negro. Sem sales-aggressive, sem clinical-cold.

**Marca anchors (todos os modos):**
- Deep Amazon Green (`primary`) — signal-only: actions, nav active, KPI hero
- River Teal (`secondary`) — secondary CTA, links, focus rings, in-transport
- Inter — single-family typography (Literata só wordmark)
- 8px grid estrito · warm neutrals (`#f9faf6`, jamais `#fff` em page bg)
- Ghost borders `outline-variant` @ 0.3 · WCAG AA mínimo · same identity light/dark

**Anti-traps:**
- Sales-loud: "DOE AGORA!", reds piscando → calm authority, single CTA
- Stock-clinical: `#fff` everywhere + tech-stock → warm neutrals + Rio Negro photography
- Dark-clone NeonDash/Linear → mantém identidade Sal da Terra (River Teal claro, não gold)
- Bento-marketing: grid de boxes em landing → narrativa editorial assimétrica

---

## 2. Color System — Material 3 (Light + Dark)

### 2.1 Mode Contract — REGRA DE OURO

> **NUNCA misture tokens entre modos.** Causa #1 de bug de contraste. Cada modo tem set completo e independente. Light `primary` = `#012d1d`; dark `primary` = `#a5d0b9`. Usar `#012d1d` em surface dark quebra contraste e marca.

- Tailwind v4: `@theme` (light default) + `@variant dark` (dark; pendente em §15)
- Astro: `<html data-theme="light|dark">` ou `class="dark"` via middleware
- **Proibido:** `dark:bg-stone-900`, `bg-zinc-50`, qualquer hex literal em componentes

### 2.2 Primary (Deep Amazon Green)

| Role | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `#012d1d` | `#a5d0b9` | CTA fill, nav active, KPI hero |
| `on-primary` | `#ffffff` | `#003828` | text on primary fill |
| `primary-container` | `#1b4332` | `#274e3d` | softer primary (donation buttons) |
| `on-primary-container` | `#86af99` | `#c1ecd4` | text on primary-container |
| `inverse-primary` | `#a5d0b9` | `#012d1d` | primary em surface invertida |

`primary-fixed` `#c1ecd4`, `primary-fixed-dim` `#a5d0b9`, `on-primary-fixed` `#002114`, `on-primary-fixed-variant` `#274e3d` — mode-invariant.

### 2.3 Secondary (River Teal)

| Role | Light | Dark | Uso |
|---|---|---|---|
| `secondary` | `#2c694e` | `#95d4b3` | secondary CTA, links, focus ring |
| `on-secondary` | `#ffffff` | `#003824` | text on secondary fill |
| `secondary-container` | `#aeeecb` | `#0e5138` | success badge bg |
| `on-secondary-container` | `#316e52` | `#b1f0ce` | text on secondary-container |

`secondary-fixed` `#b1f0ce`, `secondary-fixed-dim` `#95d4b3`, `on-secondary-fixed` `#002114`, `on-secondary-fixed-variant` `#0e5138` — mode-invariant.

### 2.4 Tertiary (Earthy Red-Brown)

| Role | Light | Dark | Uso |
|---|---|---|---|
| `tertiary` | `#401b1b` | `#f5b7b4` | high-priority callout text |
| `on-tertiary` | `#ffffff` | `#5e1411` | text on tertiary fill |
| `tertiary-container` | `#5a302f` | `#7d3a37` | high-priority callout bg |
| `on-tertiary-container` | `#d29895` | `#ffdad8` | text on tertiary-container |

`tertiary-fixed` `#ffdad8` (high badge bg), `tertiary-fixed-dim` `#f5b7b4` (in-transport), `on-tertiary-fixed` `#331111`, `on-tertiary-fixed-variant` `#673a39` — mode-invariant.

### 2.5 Surface Hierarchy (7 tiers)

| Tier | Role | Light | Dark | Uso |
|---|---|---|---|---|
| 0 | `background` / `surface` | `#f9faf6` | `#0f1411` | page bg |
| 0b | `surface-bright` | `#f9faf6` | `#353b37` | high-emphasis |
| 0c | `surface-dim` | `#dadad7` | `#0f1411` | low-emphasis |
| 1 | `surface-container-lowest` | `#ffffff` | `#0a0d0b` | cards, modals |
| 2 | `surface-container-low` | `#f3f4f1` | `#171c19` | alt section, input bg |
| 3 | `surface-container` | `#eeeeeb` | `#1b201d` | progress track, neutral badge |
| 4 | `surface-container-high` | `#e8e8e5` | `#252a27` | table headers |
| 5 | `surface-container-highest` | `#e2e3e0` | `#303531` | pressed/active row |

`surface-variant` (`#e2e3e0` light / `#414845` dark) — alias legado. Prefira `surface-container-highest` ou `outline-variant` em código novo.

### 2.6 Text & Outlines

| Role | Light | Dark | Uso |
|---|---|---|---|
| `on-surface` / `on-background` | `#1a1c1a` | `#e1e3df` | primary text (NEVER pure black/white) |
| `on-surface-variant` | `#414844` | `#c1c8c2` | secondary text, captions |
| `inverse-surface` | `#2f312f` | `#e1e3df` | inverted block bg |
| `inverse-on-surface` | `#f0f1ee` | `#2f312f` | text on inverse-surface |
| `surface-tint` | `#3f6653` | `#a5d0b9` | M3 elevation overlay |
| `outline` | `#717973` | `#8b918c` | strong borders, focus fallback |
| `outline-variant` | `#c1c8c2` | `#414845` | subtle dividers, ghost borders |

### 2.7 Status Mapping (M3 + semantic)

M3 fornece apenas `error` formal. Demais status mapeiam semanticamente:

| Semantic | Família | Light bg / text | Dark bg / text |
|---|---|---|---|
| Error / destructive | `error` / `on-error` | `#ba1a1a` / `#ffffff` | `#ffb4ab` / `#690005` |
| Error container | `error-container` | `#ffdad6` / `#93000a` | `#93000a` / `#ffdad6` |
| Urgent badge | `error-container` | `#ffdad6` / `#93000a` | `#93000a` / `#ffdad6` |
| In-transport | `tertiary-fixed-dim` | `#f5b7b4` / `#401b1b` | `#7d3a37` / `#ffdad8` |
| High priority | `tertiary-fixed` | `#ffdad8` / `#673a39` | `#5a302f` / `#f5b7b4` |
| Success / completed | `secondary-container` | `#aeeecb` / `#316e52` | `#0e5138` / `#b1f0ce` |
| Neutral | `surface-container` | `#eeeeeb` / `#414844` | `#1b201d` / `#c1c8c2` |
| Info | `secondary-container` @ 0.6 | `#aeeecb`/0.6 / `#316e52` | `#0e5138`/0.6 / `#b1f0ce` |

### 2.8 Contrast Validation — Light Mode

| Foreground | Background | Ratio | WCAG | Uso |
|---|---|---|---|---|
| `#1a1c1a` on-surface | `#f9faf6` background | ~17.0:1 | AAA | body text |
| `#1a1c1a` on-surface | `#ffffff` lowest | ~17.5:1 | AAA | card text |
| `#414844` on-surface-variant | `#f9faf6` | ~9.5:1 | AAA | secondary text |
| `#414844` on-surface-variant | `#ffffff` | ~9.8:1 | AAA | caption em card |
| `#012d1d` primary | `#f9faf6` | ~14.0:1 | AAA | primary text/link |
| `#012d1d` primary | `#ffffff` | ~14.5:1 | AAA | primary em card |
| `#2c694e` secondary | `#f9faf6` | ~5.5:1 | AA | secondary text/icon |
| `#2c694e` secondary | `#ffffff` | ~5.7:1 | AA | link em card |
| `#ffffff` on-primary | `#012d1d` | ~14.0:1 | AAA | CTA text |
| `#ffffff` on-primary | `#1b4332` container | ~9.1:1 | AAA | donation button |
| `#86af99` on-primary-container | `#1b4332` | ~3.4:1 | AA-lg ⚠️ | apenas large/icon |
| `#93000a` on-error-container | `#ffdad6` | ~7.2:1 | AAA | urgent badge |
| `#316e52` on-secondary-container | `#aeeecb` | ~4.8:1 | AA | success badge |
| `#673a39` | `#ffdad8` tertiary-fixed | ~5.3:1 | AA | high-priority badge |
| `#ba1a1a` error | `#f9faf6` | ~5.8:1 | AA | error message |
| `#717973` outline | `#f9faf6` | ~3.5:1 | AA-lg ⚠️ | borders only — non-text |
| `#c1c8c2` outline-variant | `#ffffff` | ~1.6:1 | 🔶 | sub-pixel divider — non-text |

### 2.9 Contrast Validation — Dark Mode

| Foreground | Background | Ratio | WCAG | Uso |
|---|---|---|---|---|
| `#e1e3df` on-surface | `#0f1411` | ~17.5:1 | AAA | body text |
| `#e1e3df` on-surface | `#0a0d0b` lowest | ~18.5:1 | AAA | card text |
| `#c1c8c2` on-surface-variant | `#0f1411` | ~13.0:1 | AAA | secondary text |
| `#c1c8c2` on-surface-variant | `#1b201d` | ~12.0:1 | AAA | caption em badge |
| `#a5d0b9` primary | `#0f1411` | ~12.5:1 | AAA | primary text/link |
| `#a5d0b9` primary | `#0a0d0b` | ~13.3:1 | AAA | primary em card |
| `#95d4b3` secondary | `#0f1411` | ~11.0:1 | AAA | secondary text |
| `#003828` on-primary | `#a5d0b9` | ~9.5:1 | AAA | CTA text |
| `#c1ecd4` on-primary-container | `#274e3d` | ~7.2:1 | AAA | donation button |
| `#ffb4ab` error | `#0f1411` | ~9.8:1 | AAA | error text |
| `#ffdad6` on-error-container | `#93000a` | ~7.2:1 | AAA | urgent badge |
| `#b1f0ce` on-secondary-container | `#0e5138` | ~7.5:1 | AAA | success badge |
| `#ffdad8` | `#7d3a37` tertiary-container | ~6.0:1 | AA | high-priority badge |
| `#8b918c` outline | `#0f1411` | ~5.0:1 | AA | borders + small UI |
| `#414845` outline-variant | `#0a0d0b` | ~2.8:1 | 🔶 | sub-pixel divider — non-text |

### 2.10 Contrast & Token Rules

1. Body text mínimo 4.5:1 — sem exceções
2. Large text (18pt+ / 14pt+ bold) mínimo 3:1
3. Non-text UI (icons, borders) mínimo 3:1 quando informativo standalone
4. Nunca usar `outline-variant` como text color
5. Nunca mode-bleed — `dark:` variant é único caminho
6. Sempre validar par antes de commit (WebAIM)
7. Ícones com cor semântica sempre acompanhados de texto — color is never the sole indicator
8. Sempre semantic tokens (`bg-surface-container-lowest`, `text-on-surface`, `border-outline-variant`)
9. Nunca hex inline em componentes — apenas em `@theme` ou `@variant dark`
10. Mockups Stitch usam hex literais — **não copiar para código**

---

## 3. Typography

- **Single family:** Inter para 100% UI (h1 → caption)
- **Wordmark exception:** Literata APENAS no logo do header
- **Nunito Sans:** legacy (token `--font-nav` em CSS) — não usar em código novo
- **Sentence case** em headlines: "Transformando vidas…" não "TRANSFORMANDO…"
- **UPPERCASE** APENAS em badges/status pills via `tracking-[0.04em]`

| Role | Family | Size | Weight | Line | Letter | Casing | Uso |
|---|---|---|---|---|---|---|---|
| Wordmark | Literata | 20px | 700 | 1.2 | 0 | Sentence | logo header |
| Display / h1 | Inter | 48px | 700 | 1.2 | -0.02em | Sentence | hero |
| Section / h2 | Inter | 32px | 600 | 1.3 | -0.01em | Sentence | section title |
| Card / h3 | Inter | 24px | 600 | 1.4 | 0 | Sentence | card heading |
| Body Large | Inter | 18px | 400 | 1.6 | 0 | Sentence | intro |
| Body Base | Inter | 16px | 400 | 1.6 | 0 | Sentence | paragraph |
| Label-sm | Inter | 14px | 500 | 1.2 | 0.02em | Sentence | UI label, button |
| Caption | Inter | 12px | 400 | 1.2 | 0 | Sentence | metadata |
| Badge | Inter | 11–12px | 500 | 1.2 | 0.04em | UPPERCASE | status pills |
| KPI | Inter | 36–48px | 700 | 1.0 | -0.02em | — | metric value |
| Tabular | Inter (`tabular-nums`) | inherit | inherit | — | — | — | money, counters |

**Regras:** Inter < 12px proibido · headline-to-body ratio ≥ 2x · tabular-nums obrigatório em R$/%/contadores · light text `#1a1c1a` (never `#000`) · dark text `#e1e3df` (never `#fff`).

Tokens em CSS: `--text-h1` etc. via Tailwind classes `text-h1`, `text-body-base`, `text-label-sm`. Utilities `.type-h1` em `@layer utilities`.

---

## 4. Components (Property | Light | Dark)

### 4.1 Buttons

**Primary**

| Property | Light | Dark |
|---|---|---|
| Background | `primary` `#012d1d` | `primary` `#a5d0b9` |
| Text | `on-primary` `#ffffff` | `on-primary` `#003828` |
| Hover bg | `primary-container` `#1b4332` | `primary-fixed-dim` @ 0.92 |
| Active bg | darken 5% | lighten 5% |
| Shadow CTA hero | `--shadow-cta` `0 4px 12px rgba(27,67,50,0.15)` | `0 4px 12px rgba(0,0,0,0.40)` |

Common: focus ring 2px `secondary` + 2px offset · disabled opacity 0.4 · padding `12px 24px` (label-sm) ou `12px 32px` (CTA hero) · `rounded-lg` · Inter 14px 500.

**Secondary (Outlined)**

| Property | Light | Dark |
|---|---|---|
| Border + Text | `secondary` `#2c694e` | `secondary` `#95d4b3` |
| Hover bg | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Active bg | `surface-container` `#eeeeeb` | `surface-container` `#1b201d` |

Background transparent · padding/radius/font idem Primary.

**Ghost** — text `secondary`, transparent bg, hover `surface-container-low`. Uso: low-priority nav, "Saiba mais" inline.

**Destructive**

| Property | Light | Dark |
|---|---|---|
| Background | `error` `#ba1a1a` | `error-container` `#93000a` |
| Text | `on-error` `#ffffff` | `on-error-container` `#ffdad6` |
| Hover | darken 5% | lighten 5% |

Uso: "Excluir item", "Cancelar doação".

**Icon Button** — 40×40 desktop / 44×44 mobile · `rounded-full` · variants filled (primary) / ghost (transparent + `on-surface-variant` icon) · `aria-label` obrigatório.

### 4.2 Cards

**Standard**

| Property | Light | Dark |
|---|---|---|
| Background | `#ffffff` lowest | `#0a0d0b` lowest |
| Shadow | `--shadow-card` `0 4px 12px rgba(0,0,0,0.02)` | `0 4px 12px rgba(0,0,0,0.30)` |

Common: 1px `outline-variant` @ 0.3 border · `rounded-xl` (12px) · `p-md` mobile / `p-lg` desktop.

**KPI Card** — Standard + `border-l-4 secondary` · KPI number `text-h1` Inter 700 · label `label-sm` UPPERCASE `on-surface-variant`.

**Donation Item Card** — bg lowest, `rounded-xl`, shadow Level 2. Hero image aspect 4:3 `rounded-t-xl` (w/h explicit, CLS 0). Status badge absolute top-md right-md (`error-container` family). Title h3 600 `on-surface`. Description Inter 14px `on-surface-variant`. Progress 8px (light: track `surface-container` / fill `primary-container`; dark: `#1b201d` / `#274e3d`). CTA full-width `primary-container` filled.

**Selected** — `border-l-4 secondary` + tint `secondary-container` overlay 0.3.

### 4.3 Tables (Admin)

| Property | Light | Dark |
|---|---|---|
| Header bg | `surface-container-high` `#e8e8e5` | `surface-container-high` `#252a27` |
| Row hover | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |

Common: header text `label-sm on-surface-variant UPPERCASE` · body `body-base on-surface` · selected row `secondary-container` overlay 0.3 · divider 1px `outline-variant` @ 0.5 · cell padding 12px 16px · numeric col `tabular-nums right-aligned` · empty state italic `on-surface-variant`.

### 4.4 Inputs & Forms

| Property | Light | Dark |
|---|---|---|
| Background | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Text | `on-surface` `#1a1c1a` | `on-surface` `#e1e3df` |

Common: border transparent (rest) → 2px `secondary` (focus) · placeholder `on-surface-variant` @ 0.6 · focus ring 2px `secondary` outline + 2px offset (no glow) · error border 2px `error` · padding 12px 16px · `rounded-lg` · disabled opacity 0.5 + cursor-not-allowed.

**Search** — input + left magnifier `<Icon name="search" />` 20px (rest `on-surface-variant`, focus `secondary`).

### 4.5 Badges & Status Pills

Pill (`rounded-full`) · Inter 11–12px 500 · padding `4px 10px` · `tracking-[0.04em]` UPPERCASE.

| Semantic | Light bg / text | Dark bg / text |
|---|---|---|
| Urgent | `#ffdad6` / `#93000a` | `#93000a` / `#ffdad6` |
| High priority | `#ffdad8` / `#673a39` | `#5a302f` / `#f5b7b4` |
| In-transport | `#f5b7b4` / `#401b1b` | `#7d3a37` / `#ffdad8` |
| Success | `#aeeecb` / `#316e52` | `#0e5138` / `#b1f0ce` |
| Neutral | `#eeeeeb` / `#414844` | `#1b201d` / `#c1c8c2` |
| Info | `#aeeecb` @ 0.6 / `#316e52` | `#0e5138` @ 0.6 / `#b1f0ce` |

### 4.6 Progress Bars

| Property | Light | Dark |
|---|---|---|
| Track | `surface-container` `#eeeeeb` | `surface-container` `#1b201d` |
| Fill | `primary-container` `#1b4332` | `primary-container` `#274e3d` |

Common: 8px height · `rounded-full`.

### 4.7 Navigation

**Top Nav (header)**

| Property | Light | Dark |
|---|---|---|
| Bg | `#ffffff` lowest | `#0a0d0b` lowest |
| Wordmark | Literata 20px 700 `primary` `#012d1d` | `primary` `#a5d0b9` |
| Active link | text `primary` + underline 2px primary | (idem dark variant) |

Common: bottom border 1px `outline-variant` @ 0.3 · inactive link `on-surface-variant` · hover link `primary` + bg `surface-container-low` · CTA "Contribuir" Primary button (small).

**Footer** — bg `surface-container-low` · text `on-surface-variant` · links `secondary` (hover `primary`) · divider `outline-variant` @ 0.3.

### 4.8 Modals / Sheets

| Property | Light | Dark |
|---|---|---|
| Overlay | `rgba(15,20,17,0.5)` | `rgba(0,0,0,0.7)` |
| Container shadow | `--shadow-modal` `0 12px 24px rgba(0,0,0,0.04)` | `0 16px 40px rgba(0,0,0,0.40)` |

Common: container bg `surface-container-lowest` · `rounded-2xl` (1rem) · `p-xl` desktop / `p-lg` mobile · close button top-right ghost icon (`<Icon name="x" />`).

**Donation Modal (Pix QR)** — `border-l-4 secondary` + countdown timer label-sm + QR centrado `rounded-xl` border.

### 4.9 Toasts

Stack bottom-right desktop / bottom-center mobile. Auto-dismiss 5s.

| Variant | Light bg / border / text | Dark bg / border / text |
|---|---|---|
| Success | `#aeeecb` / `#2c694e` / `#316e52` | `#0e5138` / `#95d4b3` / `#b1f0ce` |
| Error | `#ffdad6` / `#ba1a1a` / `#93000a` | `#93000a` / `#ffb4ab` / `#ffdad6` |
| Warning | `#ffdad8` / `#5a302f` / `#673a39` | `#5a302f` / `#f5b7b4` / `#ffdad8` |
| Info | `#eeeeeb` / `#717973` / `#414844` | `#1b201d` / `#8b918c` / `#c1c8c2` |

---

## 5. Layout

- **Container:** max 1280px (`max-w-7xl`), `px-6 lg:px-8`
- **Spacing scale (8px grid):** `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 32` · `xxl 48` · `huge 64`
- **Section vertical:** `py-huge` desktop / `py-xxl` mobile
- **Card padding:** `p-md` mobile / `p-lg` desktop / nunca `< p-md`
- **Asymmetry preferred** — nunca 50/50 hero (use 7/5 ou 8/4)
- **Whitespace = luxury** — calm + trust

| Pattern | Tailwind | Uso |
|---|---|---|
| KPI grid | `grid-cols-1 md:grid-cols-3 gap-md` | landing stats |
| Donation listing | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg` | `/doar` |
| Settings | `grid-cols-1 lg:grid-cols-2 gap-lg` | admin/settings |
| Hero asymmetric | `grid-cols-1 lg:grid-cols-12` (texto `col-span-7`, media `col-span-5`) | landing |
| Detail | `grid-cols-1 lg:grid-cols-3` (content `col-span-2`, sidebar `col-span-1`) | `/doar/[slug]` |

---

## 6. Border Radius

| Token | CSS | Uso |
|---|---|---|
| `--radius-sm` | 0.25rem | badges, micro-pills |
| `--radius-md` | 0.375rem | inputs compactos |
| `--radius-lg` | 0.5rem | buttons, inputs (default) |
| `--radius-xl` | 0.75rem | standard cards |
| `--radius-2xl` | 1rem | large containers, modals |
| `--radius-3xl` | 1.5rem | media-prominent |
| `--radius-full` | 9999px | pills, avatars, icon buttons |

Nunca exceder `radius-3xl` em containers; `rounded-full` apenas em pills/avatars/circular icon buttons.

---

## 7. Depth & Elevation

**Light:** shadow primary, tonal suporte (white-on-white precisa shadow). **Dark:** tonal primary (lighter = elevated), shadow apenas em overlays.

| Level | Light Surface | Light Shadow | Dark Surface | Dark Shadow |
|---|---|---|---|---|
| 0 — Base | `#f9faf6` | none | `#0f1411` | none |
| 1 — Section | `#f3f4f1` low | none (tonal) | `#171c19` low | none (tonal) |
| 2 — Card | `#ffffff` lowest | `0 4px 12px rgba(0,0,0,0.02)` | `#0a0d0b`/`#1b201d` | `0 4px 12px rgba(0,0,0,0.30)` |
| 3 — Hover | `#ffffff` | `0 12px 24px rgba(0,0,0,0.05)` | tier acima | `0 4px 12px rgba(0,0,0,0.40)` |
| 4 — Modal | `#ffffff` | `0 12px 24px rgba(0,0,0,0.04)` | `#252a27` high | `0 12px 24px rgba(0,0,0,0.40)` |
| 5 — Toast | `#ffffff` | `0 16px 40px rgba(0,0,0,0.08)` | `#252a27` | `0 16px 40px rgba(0,0,0,0.50)` |
| CTA halo | `primary-container` btn | `0 4px 12px rgba(27,67,50,0.15)` | — | `0 4px 12px rgba(0,0,0,0.40)` |

**Ghost Borders (cross-mode):** standard `outline-variant` @ 0.3 · elevated @ 0.5 · section divider @ 0.2 · focus ring `secondary` solid 2px + 2px offset (sempre visível).

---

## 8. Iconography

- **Lucide-only** via `<Icon name="…" />` em `src/components/ui/Icon.astro`
- Mapping table em `src/lib/icons.tsx` (Material Symbols → Lucide)
- Sizes: 16 / 20 / 24 / 32 / 48 (via `class="size-{n}"`)
- Color herda parent ou explicit `text-secondary` / `text-on-surface-variant`
- `aria-label` obrigatório em icon-only buttons
- **Proibido:** emoji, Material Symbols font, Font Awesome, SVG inline custom

---

## 9. Motion & Interaction

- **`prefers-reduced-motion` em TODA animação** (já em `global.css` `@layer utilities`)
- Allowed: `transform`, `opacity` (GPU)
- **Forbidden:** `width`, `height`, `top`, `left`, `padding`, `margin`
- Accordion: `grid-template-rows: 0fr ↔ 1fr` (não `height: auto`)
- Transitions: `150ms ease` standard · `300ms ease-out` reveals
- Focus ring: `outline 2px solid var(--color-secondary)` + `outline-offset 2px`
- Hover: `transform: scale(0.98)` em buttons no `:active` · opacity em cards
- Reveal: fade-in (opacity 0→1, translateY 8px→0) APENAS em intersection, skip sob reduced-motion

---

## 10. Imagery

- Hero: `<Image>` (`astro:assets`) `loading="eager"` + `fetchpriority="high"`
- Below fold: `loading="lazy"` + `fetchpriority="low"`
- Aspect ratios: hero 16:9 ou 21:9 · card 4:3 · avatar 1:1
- Border radius: `rounded-xl` cards · `rounded-3xl` media-prominent
- Tone: real Rio Negro/Amazônia — **nunca** stock-clinical-tech
- Always explicit `width` + `height` (CLS = 0)
- Decorative: `alt=""` + `aria-hidden="true"` · meaningful: descriptive alt em pt-BR

---

## 11. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Semantic M3 tokens (`bg-surface-container-lowest`, `text-on-surface`) | Hardcoded hex fora de `@theme` |
| Sentence case em headlines | UPPERCASE fora de badges |
| `tabular-nums` em currency/counters | Pure black `#000` ou white `#fff` em body |
| Inter para tudo, Literata só wordmark | Material Symbols, Font Awesome, emoji icons |
| `prefers-reduced-motion` guard sempre | `href="#"` (use `<button>` ou real `<a>`) |
| Lucide via `<Icon>` component | Cross-mode bleed (`bg-stone-900` em light) |
| 8px grid estrito | Pure white page bg — usar `#f9faf6` |
| Soft shadows + tonal layering | "DOE AGORA!!!" + reds piscantes |
| Validar contraste contra §2.8/§2.9 antes de commit | 50/50 hero splits |
| Testar ambos modos | Animar width/height/top/left/padding/margin |
| `<button>` actions / `<a>` nav | Decorative gold/yellow accents |
| Focus rings sempre visíveis | `client:load` em islands abaixo do fold |
| Extend before create (LEVER) | SPA frameworks (cardinal #4) |

### Five Traps (Rejection Gates)

| Trap | Trigger | Fix |
|---|---|---|
| **Sales-Loud** | "DOE AGORA!" + reds piscando | Calm: single primary CTA, urgência só onde real |
| **Stock-Clinical** | `#fff` everywhere + tech-stock | Warm neutrals + Rio Negro photography |
| **Token-Drift** | Inline `#4a7c59` ou variantes não-M3 | Semantic token only |
| **Icon-Mix** | Material Symbols + Lucide + emoji | Lucide-only via `<Icon>` |
| **Mode-Bleed** | `bg-stone-900` em light, ou tokens light em dark | Strict mode contract — `dark:` variant |

### Template Test
- "Generic NGO template?" → **FAIL — restart**
- "Stripe with calor humano?" → **SUCCESS**
- "Calm and trustworthy?" → **SUCCESS**
- "AI-generated slop?" → **FAIL — restart**

---

## 12. Responsive

| Breakpoint | Width | Tailwind | Comportamento |
|---|---|---|---|
| Mobile | < 640 | (default) | single column, hamburger nav, bottom-fixed CTA em detail |
| Tablet | 640–1024 | `sm:` `md:` | 2-col, condensed nav, KPI 2x2, sidebar collapsible |
| Desktop | ≥ 1024 | `lg:` `xl:` | full layout, 3-col donation grid, sidebar 240px |
| Wide | ≥ 1280 | `xl:` `2xl:` | edge-to-edge max-width, generous gutters |

**Touch targets:** min 44×44px mobile · button height 40px mobile / 36px desktop · card padding ≥ `p-md`. Hero typography 48 → 40 → 32 progressive.

**Mobile-specific:** donation modal bottom-sheet (não overlay) · hero image 4:3 (não esticar) · search/filters full-screen overlay · Pix QR full-width centrado · bottom CTA fixed em `/doar/[slug]`.

---

## 13. Accessibility

- WCAG AA contrast em todo par (validar §2.8 / §2.9)
- One `<h1>` per page · semantic `<section>/<article>/<nav>/<main>`
- Focus rings sempre visíveis: `outline 2px solid var(--color-secondary)` + 2px offset (já em `*:focus-visible` global)
- Skip link `.skip-link` → `<main id="conteudo-principal" tabindex="-1">`
- All form fields: `<label for="...">` · all icon-only buttons: `aria-label`
- Forms: error em pt-BR — color + icon + text (nunca color-only)
- Keyboard: full nav FAQ / accordion / table / modal
- Screen reader: `aria-live="polite"` para Pix QR countdown
- **Color is never the sole status indicator**

---

## 14. Agent Prompt Guide

### 14.1 Quick Token Reference

| Role | Light | Dark |
|---|---|---|
| Page bg | `background` `#f9faf6` | `background` `#0f1411` |
| Card bg | `surface-container-lowest` `#ffffff` | `surface-container-lowest` `#0a0d0b` |
| Section alt bg | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Primary CTA bg | `primary` `#012d1d` (or `primary-container` `#1b4332`) | `primary` `#a5d0b9` (or `primary-container` `#274e3d`) |
| Primary CTA text | `on-primary` `#ffffff` | `on-primary` `#003828` |
| Secondary CTA | outlined `secondary` `#2c694e` | outlined `secondary` `#95d4b3` |
| Body text | `on-surface` `#1a1c1a` | `on-surface` `#e1e3df` |
| Muted text | `on-surface-variant` `#414844` | `on-surface-variant` `#c1c8c2` |
| Border | `outline-variant` `#c1c8c2` @ 0.3 | `outline-variant` `#414845` @ 0.3 |
| Focus ring | `secondary` `#2c694e` 2px | `secondary` `#95d4b3` 2px |
| Success | bg `#aeeecb` / text `#316e52` | bg `#0e5138` / text `#b1f0ce` |
| Urgent | bg `#ffdad6` / text `#93000a` | bg `#93000a` / text `#ffdad6` |
| Error | bg `#ba1a1a` / text `#ffffff` | bg `#ffb4ab` / text `#690005` |

### 14.2 Token Sync Checklist (antes de commit UI)

1. Cores são tokens semânticos — sem hex inline
2. Tipografia segue role (Inter; Literata só wordmark)
3. Spacing usa 8px grid (xs/sm/md/lg/xl/xxl/huge)
4. Border radius usa scale `--radius-{sm..3xl,full}`
5. Mode strict — sem cross-mode tokens
6. Focus ring em todo elemento interativo
7. Contraste validado contra §2.8 (light) ou §2.9 (dark)
8. `prefers-reduced-motion` guard
9. Lucide-only via `<Icon>`
10. Sentence case headlines, UPPERCASE só badges

### 14.3 Example Prompts

**Light:**
- "KPI card on `surface-container-lowest`, `border-l-4 secondary`, `rounded-xl`, `p-lg`, `--shadow-card`. Number Inter 48px 700 `on-surface`. Label Inter 14px 500 UPPERCASE `on-surface-variant`. Icon 48px Lucide `text-primary-container`."
- "Donation card — bg lowest, `rounded-xl`, image aspect-4:3 `rounded-t-xl`, badge urgent absolute top-md right-md (`bg-error-container text-on-error-container`), title h3 600, description caption `text-on-surface-variant`, progress 8px (track `surface-container`, fill `primary-container`), CTA full-width `bg-primary-container text-on-primary`."
- "Primary button: `bg-primary` `text-on-primary` Inter 14px 500 padding 12px 24px `rounded-lg` hover `bg-primary-container`."

**Dark:** mesmo prompt, swap tokens (e.g., `bg-primary` resolve `#a5d0b9`, `text-on-primary` `#003828`). Specs idênticas — só hex muda via `@variant dark`.

### 14.4 Audit Process (per component)

1. Inspect implementação contra DESIGN.md
2. Identificar violações (token, font, spacing, depth)
3. Validar contraste contra §2.8 E §2.9
4. Verificar render em ambos modos
5. Refactor com approved tokens
6. Verificar responsive breakpoints
7. Self-audit antes de complete

Output:
```text
### [Component]
Violations: [list]
Changes: [list]
Tokens (light): bg / border / text / accent / radius / spacing / typography
Tokens (dark): bg / border / text / accent / radius / spacing / typography
Contrast: [pass/fail per pair, ref §2.8/§2.9]
Responsive: [notes]
Status: COMPLIANT | PARTIAL
```

### 14.5 Iteration Guide

1. Foco em UM componente por vez
2. Sempre especificar MODO ("in light…" / "in dark…")
3. Referenciar token names ("use `primary` `#012d1d`") não "make it green"
4. Sempre font role ("Inter h3, label-sm caption")
5. Depth: "shadow Level 2" (light) ou "tonal tier 2" (dark)
6. Especificar parent surface para validar contraste
7. Em dúvida, checar §2.8/§2.9 antes de commit

---

## 15. Implementation Pointers + Drift

- **Tokens light (atual):** [`src/styles/global.css`](../../src/styles/global.css) `@theme { ... }`
- **Tokens dark (futuro):** adicionar `@variant dark { ... }` mesmo arquivo (gated em §16)
- **Icons:** [`src/components/ui/Icon.astro`](../../src/components/ui/Icon.astro) + [`src/lib/icons.tsx`](../../src/lib/icons.tsx)
- **Typography:** `<link rel="preconnect">` + Google Fonts Inter `400/500/600/700` + Literata `600/700`
- **Mockups:** `docs/stitch-design/{landing,doar_list,doar_detail,prestacao,admin}_desktop/`
- **Canon:** [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](../../docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md)
- **Foundation:** [`../docs/design-specs/00-design-system-foundation.md`](../docs/design-specs/00-design-system-foundation.md)
- **Cardinal rules:** [`AGENTS.md`](../../AGENTS.md) · **Tier 1 config:** [`CLAUDE.md`](../CLAUDE.md) · **Frontend rules:** [`frontend.md`](frontend.md) · **Product spec:** [`PROMPT.md`](../../docs/PROMPT.md)

### Known Drift CSS vs Spec

| Item | CSS atual | Spec | Decisão |
|---|---|---|---|
| `--font-nav: 'Nunito Sans'` | presente | descontinuado | manter token (legacy paridade), não usar em código novo |
| `@variant dark` | ausente | spec'd em §2 | adicionar quando dark for ativado (§16) |

---

## 16. Future Activation: Dark Mode (gated, out of MVP)

> Status: spec'd, não shipped. `AGENTS.md` mantém "Dark mode is **not** a goal in MVP — light surfaces only". Spec dark existe para evitar drift quando ativada.

**Pré-requisitos:**
1. `@variant dark { ... }` em `src/styles/global.css` (tokens § 2.2–2.6)
2. Astro middleware injeta `data-theme` via cookie + `prefers-color-scheme`
3. UI toggle em `/admin/settings` e header (opcional MVP+1)
4. Mockups dark gerados em `docs/stitch-design/` (não existem ainda)
5. Lighthouse contrast audit + WebAIM real revalidação dos pares §2.9
6. `prefers-reduced-motion` re-check em mode-toggle animation

**Migration path:** componentes existentes já usam tokens semânticos → quase zero refactor. Páginas com hex hardcoded (se houver) → migrar antes do dark ship. Tokens fixed (`primary-fixed`, `secondary-fixed`, `tertiary-fixed*`) são mode-invariant — não precisam swap.
