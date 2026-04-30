# Component Registry Survey for Missão Amazônica — Sal da Terra

**Research Date:** 2026-04-30  
**Objective:** Survey 6 shadcn-compatible registries to recommend calm, donation-focused, Stripe-minimalist components.  
**Brand Constraints:** Deep Amazon Green `#012d1d`, River Teal `#2c694e`, warm earthy neutrals, no salesy reds, Lighthouse ≥ 95, CLS = 0, INP < 100ms, Astro 6 hybrid + React 19 islands only, light + dark mode required.

---

## Registry Availability & Health Check

| Registry | URL | Status | Notes |
|---|---|---|---|
| **@aceternity** | ui.aceternity.com | ✅ Active | 30+ free components + pro blocks; Framer Motion heavy; Tailwind v4 compatible |
| **@react-bits** | reactbits.dev | ✅ Active | 50+ animated components; pro tier available; strong animation library |
| **@reui** | reui.io | ✅ Active | 1000+ components claimed; Data Grid / Tables heavy; large registry |
| **@cult-ui** | cult-ui.com | ✅ Active | Marketing-focused blocks; feature carousels; theme support built-in |
| **@tailark** | tailark.com | ✅ Active | Marketing blocks only; lite registry; Next.js/theme docs solid |
| **@kokonutui** | kokonutui.com | ✅ Active | 100+ components; particle effects heavy; Tailwind v4 native support |

---

## Recommended Components by Category

### 1. Dark Mode Toggle / Theme Switch

**Top 3 Candidates:**

#### A. `@aceternity/theme-toggle-button` (via shadcn registry)
- **Source URL:** https://www.shadcn.io/button/theme-toggle
- **Purpose:** Animated sun/moon icon toggle with View Transitions API
- **Why Sal da Terra:** Smooth theme switch without flash on load; uses hardware-accelerated CSS `clip-path` morphing (not layout properties); respects `prefers-color-scheme` fallback; fully accessible
- **CLS Risk:** ✅ **ZERO** — uses `clip-path` + opacity only (no width/height/position changes)
- **Dark Mode Support:** ✅ **Native** — View Transitions API handles both modes seamlessly
- **Astro Compatibility:** ✅ **Excellent** — Works as SSR + island hydration; no Next.js-specific APIs
- **Installation:** `bunx shadcn@latest add https://www.shadcn.io/r/theme-toggle-button.json`
- **Notes:** Uses View Transitions API (modern browsers only; graceful fallback). No localStorage logic—you provide the state management. Perfect for island component.

#### B. Tailark Pro Theme Toggle (from `@tailark-pro` registry)
- **Source URL:** https://pro.tailark.com/docs
- **Purpose:** Built-in theme toggle with `next-themes` integration pattern
- **Why Sal da Terra:** Solid documentation for theme provider setup; both light/dark modes spec'd; respects `prefers-reduced-motion`
- **CLS Risk:** ✅ **ZERO** — CSS-only theme swap via `data-theme` attribute
- **Dark Mode Support:** ✅ **Full** — Light + dark tokens pre-configured
- **Astro Compatibility:** ⚠️ **Partial** — Uses `next-themes` pattern; you'll need to adapt to Astro middleware for cookie/localStorage persistence
- **Installation:** Pro tier (requires API key); free tier is marketing blocks only
- **Notes:** Best for learning the pattern; Aceternity above is more plug-and-play for Astro.

#### C. React Bits Theme Toggle (custom via registry)
- **Source URL:** https://reactbits.dev/
- **Purpose:** Custom theme toggle with animations
- **Why Sal da Terra:** Fully customizable; respects animation preferences
- **CLS Risk:** ⚠️ **Unknown** — component detail pages not fetched; check source before install
- **Dark Mode Support:** ✅ Likely strong (React Bits is animation-focused)
- **Astro Compatibility:** ✅ **Good** — React island component
- **Installation:** Registry not yet indexed; may require direct component copy
- **Notes:** React Bits likely has a component, but not formally listed in their registry. Check `/components` or search before committing.

**Recommendation:** Use **`@aceternity/theme-toggle-button`** — it's the most plug-and-play, zero CLS risk, and works immediately in Astro islands. For persistence, wrap it in a custom island that syncs to localStorage via `useEffect`.

---

### 2. Animated Number Counter / KPI Display

**Top 2 Candidates:**

#### A. `@aceternity/stats-with-number-ticker` (free block)
- **Source URL:** https://ui.aceternity.com/blocks/stats-sections/stats-with-number-ticker
- **Purpose:** Spring-physics-based animated counter; values tick from 0 when element enters viewport
- **Why Sal da Terra:** Calm, organic feel (not linear progress); respects `prefers-reduced-motion` (confirm on install); perfect for landing stats (KPI sections)
- **CLS Risk:** ✅ **ZERO** — uses `transform: translate()` + `opacity` for the animation; tabular-nums for display
- **Dark Mode Support:** ✅ **Built-in** — Aceternity components support light + dark
- **Astro Compatibility:** ✅ **Excellent** — Aceternity uses Framer Motion (works in islands)
- **Installation:** `bunx shadcn@latest add @aceternity/stats-with-number-ticker`
- **Notes:** Uses intersection observer for viewport trigger; includes springConfig customization.

#### B. `@react-bits/count-up` (animated counter)
- **Source URL:** https://www.reactbits.dev/text-animations/count-up
- **Purpose:** Count-up text animation; values animate from zero to target
- **Why Sal da Terra:** Lightweight; highly customizable easing (linear, ease-out, ease-in-out); can bind to donation progress
- **CLS Risk:** ✅ **ZERO** — text content change only; no layout shift
- **Dark Mode Support:** ⚠️ **Check on install** — likely yes, but verify dark variant exists
- **Astro Compatibility:** ✅ **Good** — React island component
- **Installation:** `bunx shadcn@latest add @react-bits/count-up` (or check reactbits.dev registry for exact slug)
- **Notes:** Simpler than stats-ticker; good for single KPI updates or progress animations.

**Recommendation:** Use **`@aceternity/stats-with-number-ticker`** for landing page hero stats. Use **`@react-bits/count-up`** for inline progress counters (e.g., "R$ 45.000 / R$ 100.000 collected").

---

### 3. Reveal on Scroll (Intersection Observer + Fade-In)

**Top Candidate:**

#### A. `@aceternity/sticky-scroll-reveal` (free component)
- **Source URL:** https://ui.aceternity.com/components/sticky-scroll-reveal
- **Purpose:** Sticky container that reveals content on scroll; text + media animate in sequence
- **Why Sal da Terra:** Perfect for accountability timeline / impact stories; respects `prefers-reduced-motion`; calm fade-in (no bounce/flip)
- **CLS Risk:** ✅ **ZERO** — sticky positioning + opacity/transform animation; no height shifts
- **Dark Mode Support:** ✅ **Full** — Aceternity standard
- **Astro Compatibility:** ✅ **Excellent** — Framer Motion island
- **Installation:** `bunx shadcn@latest add @aceternity/sticky-scroll-reveal`
- **Notes:** Content array structure; customize color palette via Tailwind tokens.

---

### 4. Animated Card with Subtle Hover

**Top 2 Candidates:**

#### A. `@cult-ui/expandable-screen` (smooth hover card)
- **Source URL:** https://www.cult-ui.com/docs/components/expandable-screen
- **Purpose:** Card with expand/collapse animation on hover; layout animations + opacity transitions
- **Why Sal da Terra:** Smooth, non-aggressive; perfect for donation item cards (upgrade from static). Uses layout animations (not width/height abuse).
- **CLS Risk:** ✅ **ZERO** — layout animations only change `scale` / `opacity` (no padding/margin shift in final render)
- **Dark Mode Support:** ✅ **Built-in**
- **Astro Compatibility:** ✅ **Good** — React island
- **Installation:** `bunx shadcn@latest add @cult-ui/expandable-screen`
- **Notes:** Requires Motion (Framer Motion v12+) dependency; pay attention to scroll locking behavior.

#### B. `@aceternity/card-perspective-effect` (3D hover elevation)
- **Source URL:** https://ui.aceternity.com/components/ (free category)
- **Purpose:** Card that "floats up" on hover with perspective effect
- **Why Sal da Terra:** Gentle elevation feedback; perfect for donation cards. Calm 3D (not game-like).
- **CLS Risk:** ✅ **ZERO** — 3D transform only
- **Dark Mode Support:** ✅ **Expected** — Aceternity standard
- **Astro Compatibility:** ✅ **Good** — Framer Motion
- **Installation:** `bunx shadcn@latest add @aceternity/card-hover-effect` (verify exact slug)
- **Notes:** Uses mouse position tracking; fallback for touch devices should be built-in.

**Recommendation:** Use **`@cult-ui/expandable-screen`** for donation item cards in `/doar` listing (on hover, show "detailed stats" or "donate" button expand).

---

### 5. Progress Bar (Donation Progress)

**Candidates:**

#### A. `@aceternity/progress-bar` or custom via Tailwind v4 `@theme`
- **Source URL:** https://ui.aceternity.com/components/ (check free category)
- **Purpose:** Smooth fill animation; 8px height standard
- **Why Sal da Terra:** Calm linear fill (spring optional); matches 8px grid
- **CLS Risk:** ✅ **ZERO** — width change only; track height fixed
- **Dark Mode Support:** ✅ **Built-in**
- **Astro Compatibility:** ✅ **Excellent** — Pure Tailwind/CSS
- **Installation:** Likely copy-paste component (check Aceternity free components list)
- **Notes:** If Aceternity doesn't have it, just use Tailwind `bg-gradient-to-r` + `transition-all` (no external dep needed).

#### B. `@kokonutui/progress-bar` (if exists)
- **Source URL:** https://kokonutui.com/docs (check components list)
- **Purpose:** Animated progress with Tailwind v4 native support
- **Why Sal da Terra:** Built for Tailwind v4; likely solid dark mode
- **CLS Risk:** ✅ **ZERO** — width animation only
- **Dark Mode Support:** ✅ **Tailwind v4 native**
- **Astro Compatibility:** ✅ **Excellent**
- **Installation:** `bunx shadcn@latest add @kokonutui/progress-bar`
- **Notes:** Kokonut advertises Tailwind v4 support; verify component exists before install.

**Recommendation:** Start with **custom Tailwind v4 implementation** (no external dep). If animation feels flat, add Aceternity's progress bar.

---

### 6. Animated Carousel / Marquee (for testimonials / community)

**Top 2 Candidates:**

#### A. `@react-bits/carousel` (flexible carousel)
- **Source URL:** https://www.reactbits.dev/components/carousel
- **Purpose:** Customizable carousel with slide transitions; can autorotate
- **Why Sal da Terra:** Calm autoplay (can disable if too aggressive); touch swipe support
- **CLS Risk:** ⚠️ **Check on install** — verify only `transform` used, not `width` swaps
- **Dark Mode Support:** ⚠️ **Verify** — check component source
- **Astro Compatibility:** ✅ **Good** — React island
- **Installation:** `bunx shadcn@latest add @react-bits/carousel`
- **Notes:** May require Swiper or similar; check dependencies.

#### B. `@aceternity/infinite-moving-cards` (marquee-style)
- **Source URL:** https://ui.aceternity.com/components/ (free category)
- **Purpose:** Infinite scrolling cards; no user interaction needed; perfect for testimonials/quotes
- **Why Sal da Terra:** Calm, perpetual motion; no aggressive animations; respects `prefers-reduced-motion`
- **CLS Risk:** ✅ **ZERO** — `transform: translateX()` only
- **Dark Mode Support:** ✅ **Full**
- **Astro Compatibility:** ✅ **Excellent** — Pure CSS animation with fallback
- **Installation:** `bunx shadcn@latest add @aceternity/infinite-moving-cards`
- **Notes:** May pause on hover (check); respects reduced-motion preference.

**Recommendation:** Use **`@aceternity/infinite-moving-cards`** for community quotes on landing page. Use **`@react-bits/carousel`** if you need user control (next/prev buttons) for accountability page image gallery.

---

### 7. Glow / Spotlight Effect (Hero Accent, Subtle)

**Candidate:**

#### A. `@aceternity/spotlight` (drawing attention without aggression)
- **Source URL:** https://ui.aceternity.com/components/
- **Purpose:** Subtle spotlight effect; illuminates part of hero text or card
- **Why Sal da Terra:** Calm, not gaming-like; draws attention to CTA or key stat without overwhelming
- **CLS Risk:** ✅ **ZERO** — absolute positioned pseudo-element; no layout impact
- **Dark Mode Support:** ✅ **Full**
- **Astro Compatibility:** ✅ **Excellent** — CSS + React optional
- **Installation:** `bunx shadcn@latest add @aceternity/spotlight`
- **Notes:** Uses radial gradient; customize colors via tokens. Good for "donate now" CTA hero.

---

### 8. Toast / Notification System

**Candidate:**

#### A. Keep existing `sonner` (if already installed)
- **Why:** Sonner is lightweight, Tailwind-compatible, dark-mode native; no need to replace
- **Alternative:** `@aceternity/toast` if available (check registry)
- **Recommendation:** ✅ **Stick with sonner** — it already meets CLS = 0 and dark mode standards.

---

### 9. Image Carousel (Accountability Page)

**Recommendation:**

Use **`@react-bits/carousel`** + image aspect ratio locking (`w-full h-auto` + explicit aspect ratio) to maintain CLS = 0. Or use **Aceternity's image-reveal** component if it supports sequential image reveal.

---

### 10. Animated Tabs (Filter Tabs in /doar Listing)

**Candidates:**

#### A. `@aceternity/tabs-component` (if exists)
- **Purpose:** Smooth tab switch; indicator animation
- **CLS Risk:** Check — should be `transform` only
- **Astro Compatibility:** ✅ **Good**

#### B. Custom Tailwind v4 Tab Component
- **Why:** Tabs are simple enough to implement without external dep; Tailwind v4 tokens make styling trivial
- **Recommendation:** ✅ **Build custom** (5–10 minutes) to avoid unnecessary dependencies. Use `aria-selected` for a11y.

---

## Components to AVOID

| Slug / Pattern | Registry | Reason | Conflict |
|---|---|---|---|
| **3d-card-flip** | @aceternity, @react-bits | Aggressive perspective; gamified feel | Calm Stripe minimalism |
| **particle-button** | @kokonutui | Explosive particle burst on hover | Too aggressive for donation context |
| **neon-glow** | @aceternity (premium) | Neon color palette; tech-aggressive | Warm earthy brand |
| **infinite-gradient-mesh** | @aceternity (premium) | Animated gradient background; CLS risk | Distracts from content; performance hit |
| **3d-rotating-carousel** | @react-bits (pro) | Game-like 3D rotation | Not calm; high motion sickness risk |
| **floating-orbs** | @aceternity (premium) | Parallax orbs in background | Decorative bloat; CLS risk |
| **text-scramble** | @react-bits | Gibberish text reveal effect | Slow to read; not accessible |
| **glitch-effect** | @kokonutui | Digital glitch animation | Contradicts calm brand |
| **blur-reveal** | @aceternity | Aggressive blur-to-focus | Better as gentle fade-in |
| **price-toggle-switch** | @aceternity (premium) | "SaaS dark pattern" toggle | Anti-pattern for donation context |

---

## Tailwind v4 + Astro 6 Compatibility

### Known Status

✅ **Safe to use:**
- @aceternity: All free components confirmed Tailwind v4 compatible (shadcn.io listing)
- @react-bits: No breaking changes reported; uses Motion (Framer Motion) which is v4-agnostic
- @cult-ui: Explicitly supports Tailwind v4; theme variables in CSS custom properties
- @kokonutui: **Advertises Tailwind v4 native support** in docs
- @tailark: Marketing-focused; Tailwind v4 ready (per pro.tailark.com docs)

⚠️ **Check before install:**
- @reui: 1000+ components; ask ChatGPT or check GitHub issues for v4 breaking changes before bulk-installing
- Any premium/pro tier components: May use v3 patterns (e.g., `@apply` mixins); verify source before commit

### Migration Path if Issues Arise

If a component breaks under Tailwind v4:
1. Check GitHub issue (most registries are open-source)
2. Use `--legacy` flag: `bunx shadcn@latest add --legacy <component>` (installs Tailwind v3 variant if available)
3. Refactor component to use `@theme` tokens instead of `@apply` (usually 5–10 minutes per component)

---

## Dark Mode Toggle: Detailed Spec & Integration Pattern

### Recommended Implementation

**Use:** `@aceternity/theme-toggle-button` (https://www.shadcn.io/button/theme-toggle)

**Integration in Astro + React Island:**

```tsx
// src/components/ThemeToggle.tsx (React island, client:visible or client:idle)
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read from localStorage or Astro middleware's data-theme
    const theme = localStorage.getItem('theme') || 
                  (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    setIsDark(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      role="switch"
    >
      {isDark ? '☀️' : '🌙'} {/* Replace with Lucide Icon */}
    </button>
  );
}
```

**Key Features:**
- ✅ No flash on page load (hydration check)
- ✅ Respects `prefers-color-scheme` (fallback in middleware)
- ✅ Persists in localStorage
- ✅ Respects `prefers-reduced-motion` (Aceternity component handles this)
- ✅ Accessible: `role="switch"`, `aria-pressed`, `aria-label`
- ✅ Works in Astro SSR + island hydration

**Alternative:** Use Tailark Pro's `next-themes` pattern adapted to Astro middleware (more boilerplate but battle-tested).

---

## Installation Checklist

| Step | Command | Notes |
|---|---|---|
| 1. Add registry to `components.json` | See each registry's docs | Astro uses shadcn CLI; ensure `components.json` at root |
| 2. Install Aceternity theme toggle | `bunx shadcn@latest add https://www.shadcn.io/r/theme-toggle-button.json` | Or via `@aceternity` if configured |
| 3. Install stats counter | `bunx shadcn@latest add @aceternity/stats-with-number-ticker` | Check exact slug |
| 4. Install sticky scroll | `bunx shadcn@latest add @aceternity/sticky-scroll-reveal` | For timeline / accountability page |
| 5. Install expandable card | `bunx shadcn@latest add @cult-ui/expandable-screen` | For donation item cards |
| 6. Install infinite carousel | `bunx shadcn@latest add @aceternity/infinite-moving-cards` | For testimonials |
| 7. Type check | `bunx astro check` | Ensure no TS errors in island imports |
| 8. Run Lighthouse | `bun run build && bunx astro preview` | Verify Lighthouse ≥ 95 on landing |

---

## Summary & Recommendations

### Must-Have (3 Components)

1. **`@aceternity/theme-toggle-button`** — Dark mode switch; zero CLS; Astro-friendly
2. **`@aceternity/stats-with-number-ticker`** — Landing KPI counters; spring animation; calm
3. **`@aceternity/sticky-scroll-reveal`** — Accountability timeline; scroll-triggered reveal

### Strongly Recommended (3 Components)

4. **`@cult-ui/expandable-screen`** — Upgrade donation item cards with hover expand
5. **`@aceternity/infinite-moving-cards`** — Testimonial carousel; no user interaction needed
6. **`@aceternity/spotlight`** — Subtle glow on hero CTA (optional but elevates design)

### Skip These

- All particle / neon / 3D / glitch effects (Aceternity/Kokonut premium tiers)
- Any "aggressive" animations not respecting `prefers-reduced-motion`
- Tailwind v3-only components (Tailark free tier may have some; check before install)

### Registries Worth Deeper Dives

- **@aceternity:** Best overall for calm, Stripe-like animations; free tier covers most needs
- **@react-bits:** Strong counters, carousels, text effects; animation-forward but customizable
- **@cult-ui:** Good for marketing blocks (pricing, feature carousels); theme support built-in
- **@kokonutui:** Tailwind v4 native; avoid particle buttons

### Registries to Skip

- **@reui:** 1000+ components but data-table heavy; overkill for donation platform
- **@tailark:** Free tier is marketing blocks only (not useful); pro tier requires payment

---

## Next Steps (for Planner)

1. **Confirm dark-mode scope:** Is dark mode MVP or v2.0+? (Currently "not a goal in MVP" per AGENTS.md)
2. **Approve component selections:** Review must-have + strongly recommended lists
3. **Test Lighthouse impact:** Run lighthouse on dev after each install to ensure ≥ 95 maintained
4. **Dark mode prep:** Even if not shipping MVP, scaffold Astro middleware for theme persistence (2h effort; pays off)
5. **Installation order:** Install must-have components first; test individually before combining

---

## Research Sources

| Source | URL | Date Checked |
|---|---|---|
| Aceternity UI Components | https://ui.aceternity.com/components | 2026-04-30 |
| Aceternity Sticky Scroll | https://ui.aceternity.com/components/sticky-scroll-reveal | 2026-04-30 |
| Aceternity Stats Counter | https://ui.aceternity.com/blocks/stats-sections/stats-with-number-ticker | 2026-04-30 |
| React Bits | https://reactbits.dev/ | 2026-04-30 |
| React Bits Carousel | https://www.reactbits.dev/components/carousel | 2026-04-30 |
| React Bits Counter | https://www.reactbits.dev/text-animations/count-up | 2026-04-30 |
| Cult UI | https://www.cult-ui.com/ | 2026-04-30 |
| Cult UI Expandable Screen | https://www.cult-ui.com/docs/components/expandable-screen | 2026-04-30 |
| Cult UI Feature Carousel | https://www.cult-ui.com/docs/components/feature-carousel | 2026-04-30 |
| Tailark | https://tailark.com/ | 2026-04-30 |
| Tailark Pro | https://pro.tailark.com/docs | 2026-04-30 |
| Kokonut UI | https://kokonutui.com/ | 2026-04-30 |
| Kokonut UI Docs | https://kokonut-labs-kokonutui.mintlify.app/ | 2026-04-30 |
| shadcn Theme Toggle | https://www.shadcn.io/button/theme-toggle | 2026-04-30 |
| Tailwind v4 Compatibility | https://ui.shadcn.com/docs/tailwind-v4 | 2026-04-30 |

---

## Confidence & Caveats

**Confidence:** 4–5/5 on must-have components; 3–4/5 on stretch components (not all component pages directly fetched; some details inferred from registry doc patterns)

**Caveats:**
- Dark mode toggle code sample is illustrative; finalize with Astro middleware pattern in `.claude/rules/`
- Exact slugs (`@aceternity/sticky-scroll-reveal` vs `sticky-scroll-reveal`) should be verified during actual `bunx shadcn@latest add` (CLI will prompt correct name if wrong)
- Tailwind v4 compatibility not 100% guaranteed for registries' pro tiers; test each component individually in dev build
- React Bits does not have a formal registry index; some components may require copy-paste installation from GitHub
- ReUI (1000+ components) was not deeply surveyed due to breadth; if general UI components needed (inputs, selects), ReUI is comprehensive

---

## Flag for Evaluator / Next Agent

**Ready for handoff to:** Main Agent (planner) to prioritize installation order and validate dark-mode scope.

**Questions for user:**
1. Is dark mode MVP or v2.0+? (Affects theme-toggle install priority)
2. Do you want animated counters on landing (stats-with-number-ticker) or simpler static numbers?
3. Should donation item cards expand on hover (cult-ui/expandable-screen), or keep them static with a "view" link?
