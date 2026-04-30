# Anti-AI-Slop Aesthetics Reference

> Design philosophy for resisting generic AI-generated visual output within the GPUS brand system.
> Source: frontend-specialist agent + GPUS brand adaptations.

---

## 1. Core Philosophy

AI models converge toward generic, "on distribution" outputs — the aesthetic of median training data. Every design choice must actively resist this convergence.

**The GPUS Anti-Slop Pact:** Within NeonDash/GPUS brand identity, visual diversity is expressed through **layouts, composition, animation choreography, typography scale and pairing, and spatial composition** — not through token values or color palette. GPUS color tokens are fixed brand anchors. The creative space lives in how you arrange, reveal, and move content.

Two equally valid approaches:
- **Refined minimalism**: restraint, precision, whitespace as a feature
- **Bold maximalism**: elaborate composition, layered depth, orchestrated motion

Both resist slop. The middle is slop.

---

## 2. The Ten Forbidden Defaults

Rejection gates. If any trigger is true → delete the offending section and restart it.

| # | Default | Trigger | Required Fix |
|---|---------|---------|--------------|
| 1 | **Standard Hero Split** | Left text block / right image 50/50 or 60/40 layout | Massive Typographic Hero, Center-Staggered, Layered Depth, Vertical Narrative, or Extreme Asymmetry 90/10 |
| 2 | **Bento Grids** | Rounded boxes in uniform grid for landing page content | OK for data dashboards; forbidden for marketing/landing. Use editorial columns, asymmetric stacking, or overlapping. |
| 3 | **Mesh/Aurora Gradients** | High-opacity floating colored blobs dominating background | GPUS `bg-mesh` (5-10% opacity, anchored) is acceptable. Full-screen aurora = forbidden. |
| 4 | **Glassmorphism** | `backdrop-blur` without accompanying solid 1-2px borders | Remove blur → solid tonal surfaces + 1-2px `outline-variant` at 15% opacity only where accessibility requires |
| 5 | **Fintech Blue/Cyan** | Generic blue or cyan used as primary brand color | GPUS Gold (`--primary`) or Azul Petróleo (`--neon-petroleo`) only |
| 6 | **Generic Copy** | "Orchestrate", "Empower", "Elevate", "Seamless", "Transform" | Write what the feature literally does: "Track your mentorados' monthly metrics" not "Elevate your mentorship journey" |
| 7 | **Purple/Violet/Indigo** | Purple, violet, or indigo as primary, accent, or gradient | The #1 AI design cliché. Use GPUS Gold or Petróleo only. If asked to use purple → explain why and substitute. |
| 8 | **Neumorphism** | Soft inset/extrude shadows simulating 3D buttons or cards | Fails WCAG contrast (1.3:1 typical). Use tonal layering per Stitch surface hierarchy instead. |
| 9 | **Tiny Body Text** | Body text set at 10-12px | Minimum 14px (0.875rem), prefer 16px (1rem). Accessibility and readability non-negotiable. |
| 10 | **JS Hover Animations** | JavaScript event handlers driving hover animation state | CSS transitions only (`transition` property). JS animations kill INP scores below 200ms budget. |

### The `backdrop-blur` Legacy Note

42 existing NeonDash files use `backdrop-blur`. Gradual migration:
- **New components:** prefer solid surfaces with tonal layering
- **Existing components with backdrop-blur:** ensure solid 1-2px `outline-variant` border accompanies blur
- Do not initiate a mass refactor — document as technical debt

---

## 3. Alternative Typography

### Font Alternatives by Aesthetic

Choose one display/headline + one body/UI font. Never use two fonts from the same aesthetic category.

| Aesthetic | Display / Headline | Body / UI |
|-----------|--------------------|-----------|
| **Editorial** | Playfair Display, Fraunces, Newsreader, Crimson Pro | DM Serif Display, Libre Baskerville |
| **Modern Startup** | Clash Display, Satoshi, Cabinet Grotesk, Bricolage Grotesque | DM Sans, Plus Jakarta Sans |
| **Technical** | JetBrains Mono, Space Mono, IBM Plex Mono | IBM Plex Sans, Source Code Pro |
| **Distinctive** | Familjen Grotesk, Epilogue, Obviously | Outfit, Nunito Sans |

**Loading via Google Fonts / Fontsource:**
```tsx
// Google Fonts (in index.html)
<link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@200;700&family=Satoshi:wght@400;500&display=swap" rel="stylesheet" />

// Fontsource (via npm)
import '@fontsource/fraunces/200.css';
import '@fontsource/fraunces/800.css';
```

### GPUS Brand Font Exceptions

| Font | Role | Why Intentional |
|------|------|----------------|
| **Manrope** | Primary display + UI | Distinctive geometric humanist; warm authority without corporate generic-ness |
| **Inter** | Secondary body fallback | Functional companion to Manrope's geometry; optimal for data tables, dense UI |
| **Fira Code** | Monospace | Character and readability over neutral alternatives |

Inter is forbidden as a *starting choice* — it is acceptable as a *secondary fallback* in a stack where a distinctive primary already leads. For landing pages, marketing, and editorial surfaces, prefer the table above.

### Typography Composition Rules

**Weight extremes — make a choice:**
- `font-thin` (100) or `font-extralight` (200) for display captions/labels
- `font-extrabold` (800) or `font-black` (900) for headlines
- Avoid the 300-600 weight range for display text — it reads as "I didn't decide"

**Size jumps — 3x minimum, not 1.5x:**
```
Hero: text-8xl (96px)  → Body: text-lg (18px)   ✓ 5.3x contrast — decisive
Section: text-5xl (48px) → Body: text-base (16px) ✓ 3x contrast — strong
Hero: text-4xl (36px)  → Body: text-2xl (24px)   ✗ 1.5x contrast — generic
```

**Pairings (display + body):**
- Display font (distinctive, bold) + Mono body (technical, precise) — editorial contrast
- Serif display + Geometric sans body — luxury rhythm
- Slab serif display + Humanist sans body — journalistic authority

**GPUS tracking conventions:**
- Display text: `tracking-tighter` or `tracking-[-0.02em]`
- Labels / metadata: `tracking-[0.1em]` uppercase
- Body: normal tracking (never tight on small text)

---

## 4. Alternative Layouts

### Five Alternatives to the Hero Split

| Layout | Description | When to Use |
|--------|-------------|-------------|
| **Massive Typographic Hero** | 300px+ headline dominates 80% of viewport. Zero image. Typography IS the design. | Strong brand, editorial, thought leadership |
| **Center-Staggered** | Content centered but offset — headline and body on different horizontal axes. Controlled asymmetry. | Product showcases, single-focus pages |
| **Layered Depth** | Elements overlap on Z-axis. Cards, text, and images stack with intentional overlap creating 3D depth without shadows. | Premium products, feature reveals |
| **Vertical Narrative** | Scroll-driven story. Each section builds on the previous. No above-fold "everything". | Storytelling, onboarding flows |
| **Extreme Asymmetry 90/10** | One element takes 90% of width. The other 10% is an accent, not content. | Bold statements, hero images with minimal text |

### Spatial Composition Principles

- **Grid-breaking**: Let one element escape the grid. A headline that bleeds to the edge, an image that overlaps two sections.
- **Diagonal flow**: Use negative space to create an implied diagonal reading path.
- **Density extremes**: Maximum whitespace (cinematic premium) OR maximum density (data-rich utility). Never "comfortable medium."
- **Overlap**: Text over images, cards over backgrounds, badges over other cards. Depth reads as quality.
- **Asymmetry ratio**: 70/30 is the minimum acceptable asymmetry. 60/40 still reads as "trying to be symmetric."

---

## 5. Geometry Extremes

### Border Radius Decision Matrix

| Range | Aesthetic | Examples | When to Use |
|-------|-----------|----------|-------------|
| **0-2px** | Tech, Luxury, Brutalist | `rounded-none` (0), `rounded-sm` (2px) | Authority, precision, high-end tools |
| **16-32px** | Social, Lifestyle, Consumer | `rounded-2xl` (16px), `rounded-3xl` (24px) | Friendly, approachable, human |
| **4-8px** | ~~Safe Boredom~~ | `rounded-md` (6px), `rounded-lg` (8px) | **FORBIDDEN for new standalone pages** |

### GPUS Brand Exception

`--radius: 0.5rem` (8px) falls in the forbidden zone by the general rule. This is an **intentional brand exception**:

> The Architectural Monolith aesthetic demands controlled geometry — neither brutalist sharp nor bubbly soft. The 8px radius signals precision without coldness, structure without aggression.

Application: The GPUS 8px radius applies to the **dashboard application** (cards, inputs, buttons). For:
- Marketing/landing pages → consider `rounded-none` or `rounded-sm` (0-2px) for sharp luxury
- Consumer-facing onboarding → consider `rounded-2xl` (16-32px) for approachability
- Choose decisively based on the surface's personality

---

## 6. Motion & Animation

### Core Rules

- **GPU-accelerated properties only**: `transform`, `opacity`. Never animate `width`, `height`, `margin`, `padding`, `top`, `left` — these trigger layout recalculation (reflow).
- **`prefers-reduced-motion` is MANDATORY**, not optional:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **CSS-only first**: Use `transition`, `animation`, `@keyframes`. Reach for Motion/Framer Motion only when orchestrating complex sequences that CSS `animation-delay` cannot handle.

### Page Load Orchestration

One well-orchestrated entrance > scattered micro-interactions everywhere.

```css
/* Staggered reveal pattern */
.hero-title    { animation: fadeInUp 0.6s ease-out 0ms both; }
.hero-subtitle { animation: fadeInUp 0.6s ease-out 100ms both; }
.hero-cta      { animation: fadeInUp 0.6s ease-out 200ms both; }
.hero-visual   { animation: fadeIn   0.8s ease-out 300ms both; }

/* Total sequence: 800ms — deliberate, not anxious */
```

Stagger timing guide:
- Text elements: 80-120ms between items
- Complex reveals: 150-200ms per major section
- Total sequence: ≤800ms (longer feels like waiting, shorter feels rushed)

### Scroll-Triggered Reveals

Use IntersectionObserver or CSS Scroll-Driven Animations (Chrome 115+, progressive enhancement):

```tsx
// React pattern with IntersectionObserver
const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
<div ref={ref} className={cn("transition-all duration-700", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} />
```

### Hover States That Surprise

- **Scale + reveal**: `hover:scale-[1.02]` + reveal a previously hidden sub-element
- **Text shift**: Move label position on hover (transform, not margin)
- **Underline animations**: Custom SVG underline that draws in from left (`clip-path` animation)
- **Border gradient rotation**: `@property` registered custom property animating hue

What NOT to do on hover:
- Add `box-shadow` (repaints; use `drop-filter` instead)
- Change `border-width` (layout shift)
- Use JavaScript `mouseenter`/`mouseleave` for animation state

---

## 7. Backgrounds & Visual Details

### Atmosphere Creation Techniques

| Technique | Implementation | Opacity |
|-----------|----------------|---------|
| Noise/grain texture | SVG feTurbulence or CSS `url("noise.svg")` overlay | 2-5% |
| Geometric patterns | SVG pattern as background-image | 5-15% |
| Radial gradient accent | `radial-gradient` in a corner, brand color | 5-10% |
| Layered transparencies | Multiple overlapping elements with `opacity` | Vary |
| Vignette | `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4))` | Contextual |

### GPUS-Approved Atmosphere

```css
/* bg-mesh — subtle atmospheric depth (APPROVED) */
/* Already defined as @utility in assets/theme-tokens.css */
/* Key: 5-10% opacity, anchored positions, brand token colors */

/* bg-noise — grain texture overlay */
/* Usage: Apply as pseudo-element over backgrounds, 3% opacity */

/* Tonal layering (Stitch) — surface hierarchy creates depth */
/* void → section → interactive → elevated — no shadows required */
```

### What Creates Atmosphere (GPUS-Appropriate)

- Dark mode: Deep slate void (`#020617`) creates naturally atmospheric backgrounds
- Subtle `bg-mesh` radial gradients at gold accent positions (corners, focal points)
- `bg-noise` grain overlay on hero sections (adds tactile depth)
- Decorative border: `outline-variant` at 15-20% opacity as ghost edges on elevated surfaces
- High-quality imagery with `bg-primary/10` color overlay to unify with brand palette

### Forbidden

- Full-screen aurora/mesh gradients at >20% opacity (the SaaS-slop look)
- Pure solid white or gray backgrounds with zero atmospheric treatment
- Decorative elements with no functional purpose
- Bokeh effect backgrounds (unfocused circles — 2020 trend)

---

## 8. Usability Research Principles

Evidence-backed rules — cite these when pushing back on design decisions.

| Principle | Research Finding | Application to GPUS |
|-----------|-----------------|---------------------|
| **F-Pattern Reading** | 79% of users scan; 16% read word-by-word (Nielsen Norman Group) | Front-load key information. Section subheadings = navigation anchors, not decoration. |
| **Left-Side Bias** | 69% more fixation time on left half of screen (NN Group 2024) | Primary navigation, key metrics, and primary CTAs: left-aligned. Never center-align primary actions. |
| **Fitts's Law** | Interaction time = log(distance/size) | Primary actions: large touch targets (min 44×44px) close to related controls. Dashboard KPI cards → action button inside card, not separate row. |
| **Hick's Law** | Decision time grows with number + complexity of choices | Limit unrelated choices to ≤7. Group related options. Use progressive disclosure for advanced settings. |
| **Thumb Zones** | 49% hold phone one-handed; top corners = high-effort reach (Steven Hoober 2013) | Primary actions in bottom third on mobile. Design for variable grip — avoid top-right for primary CTA. |
| **Banner Blindness** | Users ignore content styled like ads or navigation banners | CTAs away from top-banner position. Inline contextual CTAs outperform persistent banners. |
| **Cognitive Load** | Working memory: 7±2 items (Miller 1956) | KPI dashboard: max 6-8 visible metrics before progressive disclosure. Kanban columns: max 5 columns visible at once. |

---

## 9. AI Interface Patterns

Applicable when implementing Gemini-powered features (chat, copilots, content generation, analysis).

### Input UX

- **Growing text areas**: Auto-resize with content using `field-sizing: content` (CSS) or JS `onInput` resize. Single-line inputs for multi-turn AI conversations are an anti-pattern.
- **Prompt examples**: Show 3-4 contextual prompt chips/examples. Reduces blank-page friction by 40-60% (observed pattern). Examples should be specific to the current context, not generic.
- **Character/token indicator**: Show soft limit warning at 80% of max, hard stop with count at 100%.
- **Anti-pattern**: Single-line `<input>` for AI prompt in multi-turn workflow

### Output UX

- **Progressive streaming**: Never show blank state during generation. Use `ReadableStream` to render tokens as they arrive.
- **Shaped skeleton loaders**: Skeleton must match the shape of expected output:
  - Paragraph output → 3-4 lines of skeleton text at correct width
  - List output → skeleton list items
  - Code output → skeleton code block with monospace lines
  - Spinner alone = wrong (no shape information)
- **Draft label**: Label AI-generated output as draft with edit affordance. Users need psychological permission to change AI output.
- **Source attribution**: When output is based on specific data, link to source.

### Loading States

AI responses take 5-30 seconds — static spinners feel broken after 3 seconds.

```tsx
// Progress label pattern
const stages = ["Analyzing...", "Searching context...", "Writing response..."];
// Cycle through stages with 2-3s intervals
// Show elapsed time after 8s: "Still working (12s)..."
```

Use animated skeletons with progress stage labels. The label change signals liveness — the system is working, not stuck.

### Refinement UX

- **Sliders/presets for common refinements**: Tone (Formal ↔ Casual), Length (Brief ↔ Detailed), Focus (Technical ↔ Summary)
- **Contextual action menu**: Highlight text → action menu appears (Rewrite, Expand, Summarize, Change tone) — more precise than global "re-prompt" box
- **Regenerate with context**: "Try again" should offer 2-3 variations, not just one retry

### Transparency & Trust

- **Confidence signals**: When AI is uncertain, show it. "This is based on 3 data points — limited confidence."
- **Friction for high-stakes actions**: Before sending AI-generated content externally (email, WhatsApp), show review step: "AI drafted this — review before sending."
- **Distinguish AI from user**: Clear visual differentiation between user input and AI output in chat interfaces

---

## 10. Brand Exception Summary

Quick reference for all places where GPUS brand decisions intentionally diverge from general anti-slop rules.

| Anti-Slop Rule | GPUS Exception | Reasoning |
|---------------|----------------|-----------|
| Inter is a forbidden generic font | Inter used as body/fallback in GPUS stack | Manrope leads (distinctive); Inter serves as functional companion for dense UI text. Not lazy default. |
| 4-8px radius is "safe boredom" zone | `--radius: 0.5rem` (8px) is GPUS standard | Architectural Monolith: controlled precision, not soft/not sharp. Intentional brand choice. |
| "Vary aesthetics across designs" | Token values are fixed; vary layouts/motion | GPUS is a product brand, not a design exploration. Consistency in tokens = brand recognition. |
| Mesh/aurora gradients are forbidden | `bg-mesh` utility exists in codebase | Opacity is 5-10% with anchored positions + brand colors. Not the full-screen blob aesthetic. |
| Glassmorphism is forbidden | 42 existing files use `backdrop-blur` | Gradual migration. Existing files need solid border audit. New code: solid surfaces only. |
| Purple/violet is forbidden | No exception | GPUS Gold and Petróleo only. No purple. Ever. |
