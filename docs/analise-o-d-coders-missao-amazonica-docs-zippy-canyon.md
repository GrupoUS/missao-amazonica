# Plano — Aprimorar `.claude/docs/design-specs/DESIGN.md` com o Design System Oficial Missão Amazônica (Light + Dark)

## Context

O arquivo `.claude/docs/design-specs/DESIGN.md` é o documento de referência de design carregado por agentes de UI/frontend. Hoje ele está **incoerente com a marca**:

1. Mistura conteúdo "Terra — Organic Design" (forest green `#4a7c59`, cream `#faf6f0`, amber `#705c30`) que **não existe na fonte autoritativa** (`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`) nem em `AGENTS.md`.
2. Cita tokens corretos em prosa solta — sem tabelas, sem componentes mapeados, sem checklist de auditoria.
3. Ignora a profundidade do `docs/DESIGN.md` (NeonDash/GPUS): tabelas de propriedades por componente, contraste WCAG validado par-a-par, do's/don'ts, agent prompt guide.
4. Não define **dark mode** — o YAML de design system tem `inverse-primary`, `inverse-surface`, `inverse-on-surface` que exigem um pareamento dark formal.
5. Não incorpora `00-design-system-foundation.md` (Template Test, LEVER, motion, accessibility baseline).

**Outcome:** rewrite que documenta **light + dark** lado a lado, com tokens M3 completos para ambos os modos, **uma tabela de contraste WCAG por modo**, e regra cardinal: **nunca misturar tokens entre modos** (causa de bug de contraste em 90% dos sistemas duais). Após o rewrite, qualquer agente de design pode auditar uma tela em qualquer modo e mapear tokens 1:1 sem ambiguidade.

> Nota de escopo: `AGENTS.md` § Design System diz "Dark mode is **not** a goal in MVP — light surfaces only". Este plano **não muda a decisão de release** (light continua sendo o que ship em produção). Mas o documento de design **define dark formalmente** para (a) evitar drift futuro quando dark for adicionado, (b) dar referência clara aos agentes que perguntam "como ficaria se…", (c) garantir que `inverse-*` tokens já presentes no design system tenham par válido. Implementação dark fica explicitamente como §17 "Future Activation" — gated, não default.

---

## Fontes Autoritativas (read-only)

| Fonte | Papel | Caminho |
|---|---|---|
| **Tokens primários light** | YAML frontmatter | [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](../docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md) |
| **Tokens replicados light** | Tailwind config | [`docs/stitch-design/landing_page_desktop/code.html`](../docs/stitch-design/landing_page_desktop/code.html) |
| **Cardinal rules + design overview** | Marca + constraints | [`AGENTS.md`](../AGENTS.md) (seção "Design System") |
| **Estrutura de referência (não tokens)** | Template denso | [`docs/DESIGN.md`](../docs/DESIGN.md) |
| **Princípios de fundação** | Template Test, LEVER, motion, a11y | [`.claude/docs/design-specs/00-design-system-foundation.md`](../.claude/docs/design-specs/00-design-system-foundation.md) |
| **Implementação CSS atual** | `@theme` em Tailwind v4 | `src/styles/global.css` (validar antes do write) |
| **Mockups de referência** | Telas reais | `docs/stitch-design/{landing,doar_list,doar_detail,prestacao,admin}_desktop/` |

---

## Conflitos Identificados (resolver no rewrite)

| # | Conflito | Decisão |
|---|---|---|
| 1 | Tokens fantasmas (`#4a7c59`, `#faf6f0`, `#705c30`) | Remover. Não pertencem ao design system. |
| 2 | Hex divergente: prosa do stitch usa `#1B4332`/`#2D6A4F`; YAML usa `#012d1d`/`#2c694e` | YAML é canon. `#012d1d` = `primary`; `#1b4332` = `primary-container`. |
| 3 | Tipografia: Inter (YAML) vs Literata + Nunito Sans (HTML mockup) | Inter para 100% UI. Literata APENAS no wordmark do header. Nunito Sans descontinuado. |
| 4 | Material Symbols nos mockups vs cardinal rule "Lucide-only" | Lucide via `<Icon name="…" />`. Mapping table referenciada (não inline). |
| 5 | Dark mode ausente vs `inverse-*` tokens já existem no YAML | Dark mode formalmente derivado via M3 tonal palette — light é ship; dark é spec gated. |
| 6 | Sentence case (YAML diz "use sentence case") vs UPPERCASE em label-sm (alguns mockups) | Sentence case para titles/headlines; uppercase APENAS para badges/status pills (Manrope-like role) usando label-sm Inter 500 com `tracking-[0.04em]`. |
| 7 | Status colors: M3 só fornece `error`/`error-container`. Como representar success/warning? | Mapear semanticamente: success → `secondary-container` (verde água); warning → `tertiary-fixed` (rosa-terra suave); urgent → `error-container`; in-transport → `tertiary-fixed-dim`; neutral/completed → `surface-container`. Documentar essa convenção em §2 e §11 explicitamente. |
| 8 | Pure white `#ffffff` em pages vs `background #f9faf6` | `surface-container-lowest` (`#ffffff`) é apenas para CARDS. Page background é `#f9faf6`. Documentar como cardinal rule em §11 Don'ts. |

---

## Estrutura Final do Documento (17 seções, ~22–28KB)

```text
# DESIGN.md — Missão Amazônica · Sal da Terra
```

### 1. Visual Theme & Atmosphere
- Creative North Star: **"Sal da Terra — Stripe minimalism com calor humano"**
- Marca anchors permanentes (mesmas em ambos modos): Deep Amazon Green (action), River Teal (secondary signal), Inter (typography), 8px grid (spacing), warm earthy neutrals (surface family)
- 8 key characteristics:
  - Warm neutral surface family (jamais `#fff` page bg)
  - Deep Amazon Green como signal — actions, navigation active, KPI highlights
  - M3 tonal hierarchy de 7 surface tiers
  - Inter como single-family discipline
  - Ghost borders via `outline-variant` em ~20-30% opacity
  - Strict 8px spacing grid
  - WCAG AA mínimo em todo par texto/fundo
  - Same identity em light + dark (polaridade muda; marca não)
- Anti-traps:
  - **Sales-loud trap** — "DOE AGORA!!!" + reds piscantes → calm authority instead
  - **Stock-clinical trap** — `#fff` everywhere + tech-stock images → warm neutrals + real Rio Negro photography
  - **Dark-clone trap** — dark mode that looks like NeonDash → identidade Sal da Terra mantida

### 2. Color System — Material 3 (Light + Dark)
Estrutura paralela: cada role tem coluna **Light Mode** e **Dark Mode**.

#### 2.1 Mode Contract (regra de ouro)
- Cada modo tem token set **completo e independente**
- **Nunca** misturar tokens cross-mode (e.g., `--md-sys-color-primary` light = `#012d1d`, dark = `#a5d0b9`; nunca usar `#012d1d` em superfície dark)
- Tailwind v4 implementação: `@theme` para light (default), `@variant dark` para dark — não usar `dark:bg-stone-900` ad-hoc
- HTML/Astro: `<html data-theme="light|dark">` ou `class="dark"`; middleware decide via cookie + system preference

#### 2.2 Primary Family
| Role | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `#012d1d` | `#a5d0b9` | CTA fill, nav active text/icon |
| `on-primary` | `#ffffff` | `#003828` | text on primary fill |
| `primary-container` | `#1b4332` | `#274e3d` | softer primary bg (donation buttons) |
| `on-primary-container` | `#86af99` | `#c1ecd4` | secondary text on primary-container |
| `primary-fixed` | `#c1ecd4` | `#c1ecd4` | (mode-invariant — softest tint) |
| `primary-fixed-dim` | `#a5d0b9` | `#a5d0b9` | (mode-invariant) |
| `inverse-primary` | `#a5d0b9` | `#012d1d` | primary tone on inverted surface |

#### 2.3 Secondary Family (River Teal)
| Role | Light | Dark | Uso |
|---|---|---|---|
| `secondary` | `#2c694e` | `#95d4b3` | secondary CTA outline, links, focus ring |
| `on-secondary` | `#ffffff` | `#003824` | text on secondary fill |
| `secondary-container` | `#aeeecb` | `#0e5138` | success badge bg, in-transport highlight |
| `on-secondary-container` | `#316e52` | `#b1f0ce` | text on secondary-container |
| `secondary-fixed` | `#b1f0ce` | `#b1f0ce` | (mode-invariant) |
| `secondary-fixed-dim` | `#95d4b3` | `#95d4b3` | (mode-invariant) |

#### 2.4 Tertiary Family (Earthy Red-Brown — atenção/destaque seco)
| Role | Light | Dark | Uso |
|---|---|---|---|
| `tertiary` | `#401b1b` | `#f5b7b4` | high-priority callout text |
| `on-tertiary` | `#ffffff` | `#5e1411` | text on tertiary fill |
| `tertiary-container` | `#5a302f` | `#7d3a37` | high-priority callout bg |
| `on-tertiary-container` | `#d29895` | `#ffdad8` | text on tertiary-container |
| `tertiary-fixed` | `#ffdad8` | `#ffdad8` | (mode-invariant) high badge bg |
| `tertiary-fixed-dim` | `#f5b7b4` | `#f5b7b4` | (mode-invariant) in-transport |

#### 2.5 Surface Hierarchy
| Tier | Role | Light | Dark | Uso |
|---|---|---|---|---|
| 0 | `background` | `#f9faf6` | `#0f1411` | page bg |
| 0a | `surface` | `#f9faf6` | `#0f1411` | alias for background |
| 0b | `surface-bright` | `#f9faf6` | `#353b37` | high-emphasis surface |
| 0c | `surface-dim` | `#dadad7` | `#0f1411` | low-emphasis surface |
| 1 | `surface-container-lowest` | `#ffffff` | `#0a0d0b` | cards, modals |
| 2 | `surface-container-low` | `#f3f4f1` | `#171c19` | alt section bg |
| 3 | `surface-container` | `#eeeeeb` | `#1b201d` | progress track, neutral badge |
| 4 | `surface-container-high` | `#e8e8e5` | `#252a27` | table headers, dividers |
| 5 | `surface-container-highest` | `#e2e3e0` | `#303531` | pressed/active row |

#### 2.6 Text & On-Surface
| Role | Light | Dark | Uso |
|---|---|---|---|
| `on-surface` | `#1a1c1a` | `#e1e3df` | primary text (never pure black or pure white) |
| `on-background` | `#1a1c1a` | `#e1e3df` | alias |
| `on-surface-variant` | `#414844` | `#c1c8c2` | secondary text, captions |
| `inverse-surface` | `#2f312f` | `#e1e3df` | inverted block bg |
| `inverse-on-surface` | `#f0f1ee` | `#2f312f` | text on inverse-surface |
| `surface-tint` | `#3f6653` | `#a5d0b9` | derived overlay tint |

#### 2.7 Outlines & Dividers
| Role | Light | Dark | Uso |
|---|---|---|---|
| `outline` | `#717973` | `#8b918c` | strong borders, focus ring fallback |
| `outline-variant` | `#c1c8c2` | `#414845` | subtle dividers, ghost borders |

#### 2.8 Status Mapping (M3 + semantic)
| Semantic | Token (uniform across modes) | Light bg / text | Dark bg / text |
|---|---|---|---|
| Error / destructive | `error` / `on-error` | `#ba1a1a` / `#ffffff` | `#ffb4ab` / `#690005` |
| Error container | `error-container` / `on-error-container` | `#ffdad6` / `#93000a` | `#93000a` / `#ffdad6` |
| Urgent badge | `error-container` family | bg `#ffdad6`, text `#93000a` | bg `#93000a`, text `#ffdad6` |
| In-transport | `tertiary-fixed-dim` | bg `#f5b7b4`, text `#401b1b` | bg `#7d3a37`, text `#ffdad8` |
| High priority | `tertiary-fixed` | bg `#ffdad8`, text `#673a39` | bg `#5a302f`, text `#f5b7b4` |
| Success / completed | `secondary-container` | bg `#aeeecb`, text `#316e52` | bg `#0e5138`, text `#b1f0ce` |
| Neutral | `surface-container` | bg `#eeeeeb`, text `#414844` | bg `#1b201d`, text `#c1c8c2` |

#### 2.9 Contrast Validation — Light Mode
Tabela com 18+ pares texto/fundo, ratio calculado, WCAG level (AAA/AA/AA-lg), pass/fail, uso permitido.

| Foreground | Background | Ratio | Level | ✅ | Uso |
|---|---|---|---|---|---|
| `#1a1c1a` on-surface | `#f9faf6` background | ~17.0:1 | AAA | ✅ | body text |
| `#1a1c1a` on-surface | `#ffffff` surface-container-lowest | ~17.5:1 | AAA | ✅ | card text |
| `#1a1c1a` on-surface | `#eeeeeb` surface-container | ~16.0:1 | AAA | ✅ | text on neutral badge |
| `#414844` on-surface-variant | `#f9faf6` background | ~9.5:1 | AAA | ✅ | secondary text |
| `#414844` on-surface-variant | `#ffffff` | ~9.8:1 | AAA | ✅ | caption on card |
| `#414844` on-surface-variant | `#eeeeeb` | ~8.7:1 | AAA | ✅ | caption on badge |
| `#012d1d` primary | `#f9faf6` background | ~14.0:1 | AAA | ✅ | primary text/link |
| `#012d1d` primary | `#ffffff` | ~14.5:1 | AAA | ✅ | primary text on card |
| `#2c694e` secondary | `#f9faf6` background | ~5.5:1 | AA | ✅ | secondary text/icon |
| `#2c694e` secondary | `#ffffff` | ~5.7:1 | AA | ✅ | link/icon on card |
| `#ffffff` on-primary | `#012d1d` primary | ~14.0:1 | AAA | ✅ | CTA text on primary fill |
| `#ffffff` on-primary | `#1b4332` primary-container | ~9.1:1 | AAA | ✅ | donation button text |
| `#86af99` on-primary-container | `#1b4332` primary-container | ~3.4:1 | AA-lg | ⚠️ | apenas texto large/icone |
| `#93000a` on-error-container | `#ffdad6` error-container | ~7.2:1 | AAA | ✅ | urgent badge text |
| `#316e52` on-secondary-container | `#aeeecb` secondary-container | ~4.8:1 | AA | ✅ | success badge text |
| `#673a39` on-tertiary-fixed-variant | `#ffdad8` tertiary-fixed | ~5.3:1 | AA | ✅ | high-priority badge text |
| `#ba1a1a` error | `#f9faf6` background | ~5.8:1 | AA | ✅ | error message text |
| `#717973` outline | `#f9faf6` background | ~3.5:1 | AA-lg | ⚠️ | borders only — non-text |
| `#c1c8c2` outline-variant | `#ffffff` | ~1.6:1 | — | 🔶 | sub-pixel divider only — non-text |

#### 2.10 Contrast Validation — Dark Mode
Tabela paralela com pares dark validados.

| Foreground | Background | Ratio | Level | ✅ | Uso |
|---|---|---|---|---|---|
| `#e1e3df` on-surface | `#0f1411` background | ~17.5:1 | AAA | ✅ | body text |
| `#e1e3df` on-surface | `#0a0d0b` surface-container-lowest | ~18.5:1 | AAA | ✅ | card text |
| `#c1c8c2` on-surface-variant | `#0f1411` | ~13.0:1 | AAA | ✅ | secondary text |
| `#c1c8c2` on-surface-variant | `#0a0d0b` | ~13.8:1 | AAA | ✅ | caption on card |
| `#a5d0b9` primary | `#0f1411` background | ~12.5:1 | AAA | ✅ | primary text/link |
| `#a5d0b9` primary | `#0a0d0b` | ~13.3:1 | AAA | ✅ | primary on card |
| `#95d4b3` secondary | `#0f1411` | ~11.0:1 | AAA | ✅ | secondary text |
| `#003828` on-primary | `#a5d0b9` primary | ~9.5:1 | AAA | ✅ | CTA text on primary fill |
| `#c1ecd4` on-primary-container | `#274e3d` primary-container | ~7.2:1 | AAA | ✅ | donation button text |
| `#ffb4ab` error | `#0f1411` | ~9.8:1 | AAA | ✅ | error text |
| `#ffdad6` on-error-container | `#93000a` error-container | ~7.2:1 | AAA | ✅ | urgent badge text |
| `#b1f0ce` on-secondary-container | `#0e5138` secondary-container | ~7.5:1 | AAA | ✅ | success badge text |
| `#ffdad8` on-tertiary-fixed-variant | `#7d3a37` | ~6.0:1 | AA | ✅ | high-priority badge |
| `#8b918c` outline | `#0f1411` | ~5.0:1 | AA | ✅ | borders + small UI |
| `#414845` outline-variant | `#0a0d0b` | ~2.8:1 | — | 🔶 | sub-pixel divider — non-text |

#### 2.11 Contrast Rules (cross-mode)
1. Body text mínimo 4.5:1 — sem exceções.
2. Large text (18pt+ / 14pt+ bold) mínimo 3:1.
3. Non-text UI (icons, borders, divider): mínimo 3:1 quando standalone informativo; pode cair abaixo se decorativo.
4. **Nunca pair**: texto branco sobre `secondary` light (`#2c694e`) — usa `on-secondary` `#ffffff` que ainda passa, mas redobre check via `on-primary-container` para containers.
5. **Nunca usar** `outline-variant` como text color.
6. **Sempre validar** par antes de commit usando WebAIM ou ferramenta equivalente.

#### 2.12 Token Usage Rules
- Sempre semantic tokens (`bg-surface-container-lowest`, `text-on-surface`, `border-outline-variant`)
- Nunca hex inline em componentes — só em `@theme`
- Nunca tokens cross-mode (não usar `bg-stone-900` em modo light "para parecer dark")
- Tailwind v4 `dark:` variant configurado via `@variant dark (&:where(.dark, .dark *))` em `global.css`

### 3. Typography
- **Single-family discipline:** Inter para 100% UI
- **Wordmark exception:** Literata APENAS no logo do header (`<a href="/" class="font-literata">Missão Amazônica</a>`)
- **Nunito Sans:** descontinuado no rewrite (era legacy mockup parity); remover quando tocar componentes
- **Sentence case discipline** para headlines: "Transformando vidas nas margens do Rio Negro" — não "TRANSFORMANDO VIDAS…"
- **Uppercase APENAS** em badges/status pills via label-sm + `tracking-[0.04em]`

#### 3.1 Hierarchy Table
| Role | Family | Size | Weight | Line Height | Letter Spacing | Casing | Uso |
|---|---|---|---|---|---|---|---|
| Wordmark | Literata | 20px | 700 | 1.2 | 0 | Sentence | logo header |
| Display / Hero | Inter | 48–56px (3–3.5rem) | 700 | 1.05–1.10 | -0.02em | Sentence | hero h1 |
| Section heading | Inter | 32px (2rem) | 600 | 1.30 | -0.01em | Sentence | section h2 |
| Card title | Inter | 24px (1.5rem) | 600 | 1.40 | 0 | Sentence | card h3 |
| Body Large | Inter | 18px (1.125rem) | 400 | 1.6 | 0 | Sentence | intro paragraph |
| Body Base | Inter | 16px (1rem) | 400 | 1.6 | 0 | Sentence | paragraph default |
| Label-sm | Inter | 14px (0.875rem) | 500 | 1.2 | 0.02em | Sentence | UI label, button text |
| Caption | Inter | 12px (0.75rem) | 400 | 1.2 | 0 | Sentence | metadata |
| Badge / Status | Inter | 11–12px | 500 | 1.2 | 0.04em | UPPERCASE | only badges |
| KPI Number | Inter | 36–48px | 700 | 1.0 | -0.02em | — | metric value |
| Tabular | Inter (`font-variant-numeric: tabular-nums`) | inherits | inherits | inherits | inherits | — | money, counters |

#### 3.2 Principles
- Inter abaixo de 12px é proibido (legibilidade)
- Headline-to-body ratio mínimo 2x (h1 vs body-base)
- Tabular numerals obrigatório em colunas R$, percentuais, contadores
- Light mode text: `#1a1c1a` (warm near-black) — never `#000000`
- Dark mode text: `#e1e3df` (warm near-white) — never `#ffffff` em body
- Sentence case = humble + readable; UPPERCASE apenas em status pills

### 4. Component Stylings
Cada componente: tabela com **Property | Light | Dark** colunas para garantir paridade contrast-safe.

#### 4.1 Buttons
**Primary (Deep Amazon Green)**
| Property | Light | Dark |
|---|---|---|
| Background | `primary` `#012d1d` | `primary` `#a5d0b9` |
| Text | `on-primary` `#ffffff` | `on-primary` `#003828` |
| Hover bg | `primary-container` `#1b4332` | `primary-fixed-dim` `#a5d0b9` (com 0.92 opacity) |
| Active bg | `primary` darken 5% | `primary` lighten 5% |
| Focus ring | 2px `secondary` outline + 2px offset | 2px `secondary` outline + 2px offset |
| Disabled | opacity 0.4 | opacity 0.4 |
| Padding | 12px 24px (label-sm) ou 12px 32px (CTA hero) | (idem) |
| Radius | 0.5rem (`rounded-lg`) | (idem) |
| Font | Inter 14px 500, label-sm tracking | (idem) |

**Secondary (River Teal Outlined)**
| Property | Light | Dark |
|---|---|---|
| Background | transparent | transparent |
| Border | 1px `secondary` `#2c694e` | 1px `secondary` `#95d4b3` |
| Text | `secondary` `#2c694e` | `secondary` `#95d4b3` |
| Hover bg | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Active bg | `surface-container` `#eeeeeb` | `surface-container` `#1b201d` |
| Padding/radius/font | (idem Primary) | (idem) |

**Ghost (River Teal text-only)**
| Property | Light | Dark |
|---|---|---|
| Background | transparent | transparent |
| Text | `secondary` `#2c694e` | `secondary` `#95d4b3` |
| Hover bg | `surface-container-low` | `surface-container-low` |
| Border | none | none |
| Uso | low-priority nav, "Saiba mais" inline | (idem) |

**Destructive**
| Property | Light | Dark |
|---|---|---|
| Background | `error` `#ba1a1a` | `error-container` `#93000a` |
| Text | `on-error` `#ffffff` | `on-error-container` `#ffdad6` |
| Hover bg | darken 5% | lighten 5% |
| Uso | "Excluir item", "Cancelar doação" | (idem) |

**Icon Button**
- Tamanho 40x40 desktop / 44x44 mobile (touch target)
- Radius `rounded-full`
- Variants: filled (primary), ghost (transparent + on-surface-variant icon)
- aria-label sempre presente

#### 4.2 Cards
**Standard Card**
| Property | Light | Dark |
|---|---|---|
| Background | `surface-container-lowest` `#ffffff` | `surface-container-lowest` `#0a0d0b` |
| Border | 1px `outline-variant` 0.3 opacity | 1px `outline-variant` 0.3 opacity |
| Radius | 0.75rem (`rounded-md` mapping = 12px) | (idem) |
| Padding | 16–24px (`p-md` mobile / `p-lg` desktop) | (idem) |
| Shadow | `0 4px 12px rgba(0,0,0,0.02)` | `0 4px 12px rgba(0,0,0,0.30)` |

**Stat / KPI Card** — adiciona `border-l-4` `secondary` ao Standard.

**Donation Item Card** (hero pattern)
| Element | Light | Dark |
|---|---|---|
| Container | bg `surface-container-lowest`, radius `rounded-xl` (1.5rem), shadow Level 1 | (idem com dark shadow) |
| Hero image | aspect 4:3, `rounded-t-xl`, w/h explicit (CLS 0) | (idem) |
| Status badge | absolute top-md right-md, bg `error-container`, text `on-error-container` | bg `#93000a`, text `#ffdad6` |
| Title (h3) | Inter 24px 600 `on-surface` | Inter 24px 600 `on-surface` |
| Description | Inter 14px 400 `on-surface-variant` | (idem) |
| Progress | track `surface-container`, fill `primary-container`, 8px height | track `#1b201d`, fill `#274e3d` |
| Donate button | full-width `primary-container` filled | (idem dark variant) |

**Selected Card** — `border-l-4 secondary` + tint `secondary-container 0.3` opacity bg overlay.

#### 4.3 Tables (Admin)
| Property | Light | Dark |
|---|---|---|
| Header bg | `surface-container-high` `#e8e8e5` | `surface-container-high` `#252a27` |
| Header text | label-sm `on-surface-variant` UPPERCASE | (idem dark) |
| Body text | body-base `on-surface` | (idem dark) |
| Row hover | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Row selected | `secondary-container` 0.3 overlay | (idem dark) |
| Divider | 1px `outline-variant` 0.5 opacity | (idem dark) |
| Cell padding | 12px 16px | (idem) |
| Numeric col | tabular-nums right-aligned | (idem) |
| Empty state | body-base `on-surface-variant` italic | (idem) |

#### 4.4 Inputs & Forms
| Property | Light | Dark |
|---|---|---|
| Background | `surface-container-low` `#f3f4f1` | `surface-container-low` `#171c19` |
| Border | transparent (rest) → 2px `secondary` (focus) | (idem) |
| Text | `on-surface` | `on-surface` |
| Placeholder | `on-surface-variant` 0.6 opacity | (idem) |
| Focus ring | 2px `secondary` outline + 2px offset, no glow | (idem) |
| Error border | 2px `error` | 2px `error` |
| Padding | 12px 16px | (idem) |
| Radius | 0.5rem | (idem) |
| Disabled | opacity 0.5 + cursor-not-allowed | (idem) |

#### 4.5 Badges & Status Pills
Shape: pill (`rounded-full`), Inter 11–12px 500, padding 4px 10px, `tracking-[0.04em]` UPPERCASE.

| Semantic | Light bg / text | Dark bg / text |
|---|---|---|
| Urgent | `#ffdad6` / `#93000a` | `#93000a` / `#ffdad6` |
| High priority | `#ffdad8` / `#673a39` | `#5a302f` / `#f5b7b4` |
| In-transport | `#f5b7b4` / `#401b1b` | `#7d3a37` / `#ffdad8` |
| Success / Completed | `#aeeecb` / `#316e52` | `#0e5138` / `#b1f0ce` |
| Neutral | `#eeeeeb` / `#414844` | `#1b201d` / `#c1c8c2` |
| Info | `#aeeecb` 0.6 / `#316e52` | (idem dark) |

#### 4.6 Progress Bars
| Property | Light | Dark |
|---|---|---|
| Track | `surface-container` `#eeeeeb` | `surface-container` `#1b201d` |
| Fill | `primary-container` `#1b4332` | `primary-container` `#274e3d` |
| Height | 8px | 8px |
| Radius | full | full |

#### 4.7 Navigation
**Top Nav (header)**
| Property | Light | Dark |
|---|---|---|
| Bg | `surface-container-lowest` `#ffffff` | `surface-container-lowest` `#0a0d0b` |
| Bottom border | 1px `outline-variant` 0.3 | 1px `outline-variant` 0.3 |
| Active link | text `primary`, underline 2px primary | text `primary` `#a5d0b9`, underline 2px primary |
| Inactive link | text `on-surface-variant` | text `on-surface-variant` |
| Hover link | text `primary` + bg `surface-container-low` | (idem dark) |

**Footer** — bg `surface-container-low`, text `on-surface-variant`, links `secondary`.

**Mobile bottom tab** (out of MVP visualmente — não shipping, mas documentar para futuro)

#### 4.8 Modals / Sheets
| Property | Light | Dark |
|---|---|---|
| Overlay | `rgba(15, 20, 17, 0.5)` | `rgba(0, 0, 0, 0.7)` |
| Container bg | `surface-container-lowest` | `surface-container-lowest` |
| Container shadow | `0 16px 40px rgba(0,0,0,0.08)` | `0 16px 40px rgba(0,0,0,0.40)` |
| Radius | 1rem (`rounded-lg`) | (idem) |
| Padding | `p-xl` (32px) desktop, `p-lg` mobile | (idem) |
| Close button | top-right ghost icon button | (idem) |

**Donation Modal (Pix QR)**: extra `border-l-4 secondary` + countdown timer em label-sm.

#### 4.9 Toasts
Stack bottom-right desktop / bottom-center mobile. 4 variants:
| Variant | Light bg / border / text | Dark bg / border / text |
|---|---|---|
| Success | `#aeeecb` / `#2c694e` / `#316e52` | `#0e5138` / `#95d4b3` / `#b1f0ce` |
| Error | `#ffdad6` / `#ba1a1a` / `#93000a` | `#93000a` / `#ffb4ab` / `#ffdad6` |
| Warning | `#ffdad8` / `#5a302f` / `#673a39` | `#5a302f` / `#f5b7b4` / `#ffdad8` |
| Info | `#eeeeeb` / `#717973` / `#414844` | `#1b201d` / `#8b918c` / `#c1c8c2` |

### 5. Layout Principles
- Max container 1280px (`max-w-7xl`), `px-6 lg:px-8`
- Spacing scale strict: xs 4 / sm 8 / md 16 / lg 24 / xl 32 / xxl 48 / huge 64
- Section vertical: `py-huge` (64px) entre seções temáticas; `py-xxl` (48px) em mobile
- Card padding: `p-md` mobile / `p-lg` desktop / nunca abaixo de `p-md`
- Asymmetry preferred — nunca 50/50 hero
- Whitespace = luxury signal — calm + trust
- Grid patterns documentados em sub-section:
  - **KPI grid**: `grid-cols-1 md:grid-cols-3 gap-md`
  - **Donation listing**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg`
  - **Admin tables**: full-width, max-w container
  - **Settings**: `grid-cols-1 lg:grid-cols-2 gap-lg`
  - **Hero**: `grid-cols-1 lg:grid-cols-12` com texto em `col-span-7` e media em `col-span-5` (asymmetric 7/5)

### 6. Border Radius Scale
| Token | Value | Uso |
|---|---|---|
| `--radius-sm` | 0.25rem (4px) | badges, micro-pills |
| `--radius` | 0.5rem (8px) | buttons, inputs (default) |
| `--radius-md` | 0.75rem (12px) | standard cards |
| `--radius-lg` | 1rem (16px) | large containers, modals |
| `--radius-xl` | 1.5rem (24px) | media-prominent blocks (hero card image) |
| `--radius-full` | 9999px | pills, avatars |

Regra: nunca exceder `radius-xl` para containers; `radius-full` apenas em pills/avatars.

### 7. Depth & Elevation

#### 7.1 Light Mode — Shadow + Tonal Hybrid
Light usa shadow como principal, tonal layering como suporte (white-on-white precisa de shadow para se distinguir).

| Level | Surface | Shadow | Uso |
|---|---|---|---|
| 0 — Base | `background` `#f9faf6` | none | page bg |
| 1 — Section | `surface-container-low` `#f3f4f1` | none (tonal shift) | alt section |
| 2 — Card | `surface-container-lowest` `#ffffff` | `0 4px 12px rgba(0,0,0,0.02)` | cards |
| 3 — Hover | `#ffffff` | `0 4px 12px rgba(0,0,0,0.04)` | hover lift |
| 4 — Modal | `#ffffff` | `0 12px 24px rgba(0,0,0,0.04)` | modals/popovers |
| 5 — Toast | `#ffffff` | `0 16px 40px rgba(0,0,0,0.08)` | toasts/sheets |

#### 7.2 Dark Mode — Tonal Primary, Shadow Suporte
Dark usa tonal layering como principal (lighter = elevated), shadow apenas para overlays.

| Level | Surface | Shadow | Uso |
|---|---|---|---|
| 0 — Void | `background` `#0f1411` | none | page bg |
| 1 — Section | `surface-container-low` `#171c19` | none | alt section (1 tier up) |
| 2 — Card | `surface-container-lowest` `#0a0d0b` ou `surface-container` `#1b201d` | `0 4px 12px rgba(0,0,0,0.30)` | depende do contexto |
| 3 — Hover | tier acima | (idem com 0.40 opacity) | hover lift |
| 4 — Modal | `surface-container-high` `#252a27` | `0 12px 24px rgba(0,0,0,0.40)` | modal |
| 5 — Toast | `#252a27` | `0 16px 40px rgba(0,0,0,0.50)` | toasts |

#### 7.3 Ghost Borders (cross-mode)
- Standard container: `outline-variant` em 0.3 opacity
- Elevated container: `outline-variant` em 0.5 opacity
- Section divider: `outline-variant` em 0.2 opacity
- Focus ring: `secondary` solid 2px + 2px offset

### 8. Iconography
- **Lucide-only** via `<Icon name="…" />` (`src/components/ui/Icon.astro`)
- Mapping table preserva nomes Material Symbols dos mockups → Lucide equivalentes (mantida em `src/lib/icons.tsx`; este DESIGN.md apenas referencia)
- Sizes (Tailwind classes via `class="size-{n}"`): 16 / 20 / 24 / 32 / 48
- Color: herda do parent ou explicit `text-secondary` / `text-on-surface-variant`
- aria-label obrigatório em icon-only buttons
- Nunca: emoji como icon, Material Symbols font, Font Awesome, SVGs custom inline

### 9. Motion & Interaction
- `prefers-reduced-motion` respeitado em **toda** animação (skip via `@media (prefers-reduced-motion: reduce)`)
- Allowed properties: `transform`, `opacity` (GPU-only)
- Forbidden: animar `width`, `height`, `top`, `left`, `padding`, `margin`
- Accordion expand/collapse: `grid-template-rows: 0fr ↔ 1fr` (não `height: auto`)
- Transitions: `150ms ease` standard; `300ms ease-out` para reveals
- Focus ring: `outline 2px solid var(--color-secondary)` + `outline-offset 2px`
- Hover: subtle `transform: scale(0.98)` em buttons no `:active`; opacity transitions em cards
- Reveal: small fade-in (opacity 0 → 1, translateY 8px → 0) APENAS em intersection, skipped sob reduced-motion

### 10. Imagery
- Hero: `<Image>` (`astro:assets`) com `loading="eager"` + `fetchpriority="high"`
- Below fold: `loading="lazy"` + `fetchpriority="low"`
- Aspect ratios: hero 16:9 ou 21:9, card image 4:3, avatar 1:1
- Border radius: `rounded-md` (12px) cards, `rounded-xl` (24px) media-prominent
- Tone: real photography Rio Negro/Amazônia — nunca stock-clinical-tech
- Always explicit `width` + `height` attributes (CLS = 0)
- Decorative: `alt=""` + `aria-hidden="true"`
- Meaningful: descriptive alt em pt-BR

### 11. Do's and Don'ts

#### 11.1 Do
- Use semantic Material 3 tokens (`bg-surface-container-lowest`, `text-on-surface`)
- Sentence case para headlines
- Tabular-nums em currency/counters
- Inter para tudo, Literata só no wordmark
- `prefers-reduced-motion` guard em toda animação
- Lucide via `<Icon>` component
- 8px spacing grid estrito
- Soft shadows + tonal layering — nunca aggressive
- Validar par de cor contra §2.9 ou §2.10 antes de commit
- Testar em ambos modos antes de marcar componente como completo
- `<button>` para actions, `<a href="…">` para nav
- Focus rings visíveis sempre

#### 11.2 Don't
- Hardcoded hex fora de `@theme`
- Material Symbols, Font Awesome, emoji as icons
- `href="#"`
- Dark mode tokens em modo light ou vice-versa (cross-mode bleed)
- Pure white `#ffffff` page background — usar `#f9faf6`
- Pure black `#000000` text — usar `#1a1c1a` (light) ou `#e1e3df` (dark)
- "DOE AGORA!!!" + reds piscantes — calm authority
- 50/50 hero splits
- Animação de width/height/top/left
- Decorative gold/yellow accents — não pertencem à marca
- `client:load` em islands abaixo do fold

#### 11.3 The Five Traps (rejection gates)
| Trap | Trigger | Required Fix |
|---|---|---|
| **Sales-Loud** | "DOE AGORA!" + red CTAs everywhere + urgency timers piscando | Calm: single primary CTA per section, urgência só onde real |
| **Stock-Clinical** | `#fff` everywhere + tech-stock images | Warm neutrals + real Rio Negro photography |
| **Token-Drift** | Inline `#4a7c59` ou variantes não-M3 | Semantic token only |
| **Icon-Mix** | Material Symbols + Lucide + emoji co-existindo | Lucide-only via `<Icon>` |
| **Mode-Bleed** | `bg-stone-900` em modo light, ou tokens light em dark | Strict mode contract — usar `dark:` variant; nunca cross-mode |

#### 11.4 Template Test
- "Could this be a generic NGO template?" → **FAIL — restart**
- "Does this look like Stripe with calor humano?" → **SUCCESS direction**
- "Does this feel calm and trustworthy?" → **SUCCESS direction**
- "Does it look AI-generated slop?" → **FAIL — restart**

### 12. Responsive Behavior

#### 12.1 Breakpoints
| Name | Width | Tailwind |
|---|---|---|
| Mobile | < 640px | (default) |
| Tablet | 640–1024px | `sm:` `md:` |
| Desktop | ≥ 1024px | `lg:` `xl:` |
| Wide | ≥ 1280px | `xl:` `2xl:` |

#### 12.2 Per-Breakpoint Rules
- `< 640`: single column, stacked KPIs, hamburger nav, bottom-fixed CTA on detail page
- `640–1024`: 2-col grids, condensed nav, KPI 2x2, sidebar collapsible
- `≥ 1024`: full layout, 3-col donation grid, sidebar 240px, max-w-7xl

#### 12.3 Touch Targets
- Min 44x44px no mobile (não negociável)
- Button height: 40px mobile / 36px desktop
- Card padding: `p-md` mobile / `p-lg` desktop / nunca abaixo `p-md`
- Hero typography: 48 → 40 → 32px progressive scaling

#### 12.4 Mobile-Specific
- Donation modal: bottom-sheet pattern, não full overlay
- Hero image: maintain 4:3 ratio (não esticar)
- Search/filters: full-screen overlay
- Pix QR: full-width centered, copy button generous touch target

### 13. Accessibility (Project-Specific)
- WCAG AA contrast em todo par texto/fundo (validar via §2.9 light, §2.10 dark)
- One `<h1>` per page; semantic sectioning via `<section>/<article>/<nav>/<main>`
- Focus rings sempre visíveis: `outline 2px solid var(--color-secondary)` + `2px offset`
- Skip link `.skip-link` → `<main id="conteudo-principal" tabindex="-1">`
- All form fields: `<label for="...">`
- All icon-only buttons: `aria-label`
- Forms: error messages em pt-BR — color + icon + text (nunca color-only)
- Keyboard: full nav FAQ / accordion / table / modal
- Screen reader: `aria-live="polite"` para Pix QR countdown updates
- Color is never the sole status indicator (badge sempre tem texto)
- Dark mode triggered by user preference + manual toggle, persisted via cookie

### 14. Agent Prompt Guide

#### 14.1 Quick Token Reference — Light Mode
| Role | Token |
|---|---|
| Page bg | `background` `#f9faf6` |
| Card bg | `surface-container-lowest` `#ffffff` |
| Section alt bg | `surface-container-low` `#f3f4f1` |
| Primary CTA bg | `primary` `#012d1d` (or `primary-container` `#1b4332`) |
| Primary CTA text | `on-primary` `#ffffff` |
| Secondary CTA | outlined `secondary` `#2c694e` |
| Body text | `on-surface` `#1a1c1a` |
| Muted text | `on-surface-variant` `#414844` |
| Border | `outline-variant` `#c1c8c2` 0.3 opacity |
| Focus ring | `secondary` `#2c694e` 2px |
| Success | `secondary-container` `#aeeecb` / text `#316e52` |
| Urgent | `error-container` `#ffdad6` / text `#93000a` |
| Error | `error` `#ba1a1a` / text `#ffffff` |

#### 14.2 Quick Token Reference — Dark Mode
| Role | Token |
|---|---|
| Page bg | `background` `#0f1411` |
| Card bg | `surface-container-lowest` `#0a0d0b` |
| Section alt bg | `surface-container-low` `#171c19` |
| Primary CTA bg | `primary` `#a5d0b9` (or `primary-container` `#274e3d`) |
| Primary CTA text | `on-primary` `#003828` |
| Secondary CTA | outlined `secondary` `#95d4b3` |
| Body text | `on-surface` `#e1e3df` |
| Muted text | `on-surface-variant` `#c1c8c2` |
| Border | `outline-variant` `#414845` 0.3 opacity |
| Focus ring | `secondary` `#95d4b3` 2px |
| Success | `secondary-container` `#0e5138` / text `#b1f0ce` |
| Urgent | `error-container` `#93000a` / text `#ffdad6` |
| Error | `error` `#ffb4ab` / text `#690005` |

#### 14.3 Token Sync Checklist (10 items, antes de qualquer commit UI)
1. ✅ Cores são tokens semânticos — sem hex inline em componente
2. ✅ Tipografia segue role assignment (Inter; Literata só wordmark)
3. ✅ Spacing usa 8px grid (xs/sm/md/lg/xl/xxl/huge)
4. ✅ Border radius usa scale definida
5. ✅ Mode strict — sem tokens cross-mode
6. ✅ Focus ring presente em todo elemento interativo
7. ✅ Contraste validado contra §2.9 (light) ou §2.10 (dark)
8. ✅ Reduced-motion guard em animações
9. ✅ Lucide-only icons via `<Icon>`
10. ✅ Sentence case em headlines, UPPERCASE só em badges

#### 14.4 Example Component Prompts

**Light Mode**
- "KPI card on `surface-container-lowest` (`#ffffff`) com `border-l-4 secondary` (`#2c694e`), `rounded-md`, `p-lg`, shadow Level 1. Number Inter 48px 700 `on-surface` (`#1a1c1a`). Label Inter 14px 500 UPPERCASE `on-surface-variant` (`#414844`). Icon 48px Lucide `text-primary-container` (`#1b4332`)."
- "Donation card hero — bg `surface-container-lowest`, `rounded-xl`, image aspect-4:3 `rounded-t-xl`, badge urgent absolute top-md right-md (`bg-error-container text-on-error-container`), title h3 Inter 24px 600, description caption `text-on-surface-variant`, progress 8px (track `surface-container`, fill `primary-container`), CTA full-width `bg-primary-container text-on-primary`."
- "Primary button: `bg-primary` (`#012d1d`), `text-on-primary` (`#ffffff`), Inter 14px 500, padding 12px 24px, `rounded-lg`, hover `bg-primary-container`."

**Dark Mode**
- "KPI card on `surface-container-lowest` (`#0a0d0b`) com `border-l-4 secondary` (`#95d4b3`), `rounded-md`, `p-lg`, shadow `0 4px 12px rgba(0,0,0,0.30)`. Number Inter 48px 700 `on-surface` (`#e1e3df`). Label `on-surface-variant` (`#c1c8c2`). Icon `text-primary` (`#a5d0b9`)."
- "Primary button dark: `bg-primary` (`#a5d0b9`), `text-on-primary` (`#003828`), hover overlay `primary-fixed-dim` 0.92 opacity."

#### 14.5 Audit Process (per component)
Para cada componente tocado, agente DEVE:
1. Inspect implementação atual contra DESIGN.md
2. Identificar todas violações (token errado, font role, spacing, depth)
3. Validar contraste contra §2.9 (light) E §2.10 (dark)
4. Verificar render correto em ambos modos
5. Refactor usando apenas approved tokens
6. Verificar responsive breakpoints (mobile/tablet/desktop)
7. Self-audit antes de marcar complete

Output format:
```text
### [Component Name]
Violations: [list]
Changes: [list]
Token mapping (light): bg / border / text / accent / radius / spacing / typography
Token mapping (dark): bg / border / text / accent / radius / spacing / typography
Contrast (light): [pass/fail per pair, ref §2.9]
Contrast (dark): [pass/fail per pair, ref §2.10]
Responsive: [notes]
Status: COMPLIANT | PARTIAL (with remaining issues)
```

#### 14.6 Iteration Guide
1. Foco em UM componente por vez
2. Sempre especificar MODO — "in light mode, use…" / "in dark mode, use…"
3. Referenciar nomes de tokens — "use `primary` (`#012d1d`)" não "make it green"
4. Sempre especificar font role — "Inter for h3, label-sm for caption"
5. Para depth, especificar mecanismo — "shadow Level 2" (light) ou "tonal tier 2" (dark)
6. Especificar parent surface para validar contraste
7. Quando em dúvida, checar §2.9/§2.10 antes de commitar par de cor

### 15. Implementation Pointers
- **Tokens**: `src/styles/global.css` → `@theme` (light default) + `@variant dark` (dark)
- **Icons**: `src/components/ui/Icon.astro` + `src/lib/icons.tsx` (mapping table)
- **Typography**: `<link rel="preconnect">` + Google Fonts Inter 400/500/600/700 + Literata 600/700 (wordmark)
- **Mockup parity**: `docs/stitch-design/{landing,doar_list,doar_detail,prestacao,admin}_desktop/code.html`
- **When in doubt**: `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md` é canon
- **Mode toggle** (futuro): cookie `theme=light|dark|auto`, middleware injeta `<html data-theme>` ou class

### 16. Token Cheat Sheet (Reference Card)
Todos os tokens em uma tabela única para print/grep — útil para code review.

```css
/* @theme — Light Mode */
--color-background: #f9faf6;
--color-surface: #f9faf6;
--color-surface-container-lowest: #ffffff;
--color-surface-container-low: #f3f4f1;
--color-surface-container: #eeeeeb;
--color-surface-container-high: #e8e8e5;
--color-surface-container-highest: #e2e3e0;
--color-on-surface: #1a1c1a;
--color-on-surface-variant: #414844;
--color-primary: #012d1d;
--color-on-primary: #ffffff;
--color-primary-container: #1b4332;
--color-on-primary-container: #86af99;
--color-secondary: #2c694e;
--color-on-secondary: #ffffff;
--color-secondary-container: #aeeecb;
--color-on-secondary-container: #316e52;
--color-tertiary: #401b1b;
--color-tertiary-container: #5a302f;
--color-tertiary-fixed: #ffdad8;
--color-tertiary-fixed-dim: #f5b7b4;
--color-error: #ba1a1a;
--color-on-error: #ffffff;
--color-error-container: #ffdad6;
--color-on-error-container: #93000a;
--color-outline: #717973;
--color-outline-variant: #c1c8c2;
--color-inverse-surface: #2f312f;
--color-inverse-on-surface: #f0f1ee;
--color-inverse-primary: #a5d0b9;

/* @variant dark — Dark Mode */
--color-background: #0f1411;
--color-surface: #0f1411;
--color-surface-container-lowest: #0a0d0b;
--color-surface-container-low: #171c19;
--color-surface-container: #1b201d;
--color-surface-container-high: #252a27;
--color-surface-container-highest: #303531;
--color-on-surface: #e1e3df;
--color-on-surface-variant: #c1c8c2;
--color-primary: #a5d0b9;
--color-on-primary: #003828;
--color-primary-container: #274e3d;
--color-on-primary-container: #c1ecd4;
--color-secondary: #95d4b3;
--color-on-secondary: #003824;
--color-secondary-container: #0e5138;
--color-on-secondary-container: #b1f0ce;
--color-tertiary: #f5b7b4;
--color-tertiary-container: #7d3a37;
--color-tertiary-fixed: #ffdad8;
--color-tertiary-fixed-dim: #f5b7b4;
--color-error: #ffb4ab;
--color-on-error: #690005;
--color-error-container: #93000a;
--color-on-error-container: #ffdad6;
--color-outline: #8b918c;
--color-outline-variant: #414845;
--color-inverse-surface: #e1e3df;
--color-inverse-on-surface: #2f312f;
--color-inverse-primary: #012d1d;
```

### 17. Future Activation: Dark Mode Rollout (out of MVP scope, gated)
- MVP ship: light-only — `AGENTS.md` confirma
- Esta DESIGN.md já documenta dark formalmente para evitar drift quando ativada
- Ativação requer:
  - `@variant dark` configurado em `src/styles/global.css`
  - Middleware que injeta `data-theme` attribute via cookie + `prefers-color-scheme`
  - UI toggle em settings (admin) e header (public, opcional)
  - QA pass: cada tela em ambos modos
  - Lighthouse contrast audit em ambos modos
  - Re-validação dos pares §2.10 com WebAIM real
- Mockups dark NÃO existem ainda em `docs/stitch-design/` — criar primeiro antes de ativar

---

## Critical Files

| File | Action |
|---|---|
| `.claude/docs/design-specs/DESIGN.md` | **REWRITE** (full replace) — único arquivo modificado |
| `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md` | leitura, fonte de tokens (não modificar) |
| `docs/DESIGN.md` | leitura, fonte estrutural (não modificar) |
| `.claude/docs/design-specs/00-design-system-foundation.md` | leitura, fonte de princípios (não modificar) |
| `AGENTS.md` | leitura, fonte de cardinal rules (não modificar) |
| `src/styles/global.css` | leitura para validar `@theme` antes do write |

---

## Verification

Após o write:

1. **Tokens fantasmas removidos:** `grep -E "#4a7c59|#faf6f0|#705c30|forest green|cream|warm amber|Rooted Warmth" .claude/docs/design-specs/DESIGN.md` → 0 resultados.
2. **Tokens autoritativos light presentes:** `grep -c -E "#012d1d|#2c694e|#f9faf6|surface-container-lowest" .claude/docs/design-specs/DESIGN.md` → ≥ 10 ocorrências.
3. **Tokens dark presentes:** `grep -c -E "#a5d0b9|#0f1411|#0a0d0b|#e1e3df" .claude/docs/design-specs/DESIGN.md` → ≥ 8 ocorrências.
4. **Estrutura:** `grep -c "^### \|^## " .claude/docs/design-specs/DESIGN.md` → ≥ 60 (17 seções + sub-sections).
5. **Cardinal rules respeitadas:**
   - Lucide-only mencionado em §8 e §11
   - Light + Dark formalmente cobertos em §2, §4, §7, §14
   - Inter discipline mencionado em §3
   - prefers-reduced-motion mencionado em §9 e §11
   - Strict mode contract em §2.1 e §11.3
6. **Cross-reference checks:** spec aponta para canon em §15 e referencia tokens M3 corretamente.
7. **Tamanho:** arquivo final 22–28KB (~700–900 linhas). Atual é 6.8KB.
8. **Contrast tables:** §2.9 light tem 18+ rows; §2.10 dark tem 14+ rows.
9. **Component tables:** todo componente em §4 tem coluna Light + Dark.
10. **Sanity dos tokens vs CSS atual:** se `src/styles/global.css` existir, fazer diff entre tokens documentados e tokens em `@theme`. Discrepância → nota em §15.
11. **Smoke render:** abrir em VS Code, navegar pelas 17 seções, conferir que tabelas renderizam, links relativos funcionam.

---

## Out of Scope

- Modificar `docs/stitch-design/**` (canon).
- Modificar `docs/DESIGN.md` (referência estrutural NeonDash).
- Modificar `00-design-system-foundation.md` (manter como referência genérica).
- Tocar `src/styles/global.css` ou qualquer código real — plano cobre apenas rewrite do DESIGN.md.
- Implementar dark mode ativação real — §17 documenta gating mas não ship.
- Criar mockups dark mode em `docs/stitch-design/` — pré-requisito para futura ativação dark.

---

## Execution Order (após approval)

1. Re-read `src/styles/global.css` para conferir alinhamento dos tokens light já implementados.
2. Validar contrastes WCAG reais para §2.9 e §2.10 (WebAIM ou função local).
3. Write completo do `.claude/docs/design-specs/DESIGN.md` com 17 seções.
4. Run `grep` checks da seção Verification.
5. Reportar tamanho final e qualquer divergência detectada vs `src/styles/global.css`.
6. Sugerir ao usuário: pré-requisitos para activation dark (mockups + middleware + toggle UI) caso interesse.
