---
name: Missão Amazônica Design System
colors:
  surface: '#f9faf6'
  surface-dim: '#dadad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f0f1ee'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2c694e'
  on-secondary: '#ffffff'
  secondary-container: '#aeeecb'
  on-secondary-container: '#316e52'
  tertiary: '#401b1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a302f'
  on-tertiary-container: '#d29895'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#f5b7b4'
  on-tertiary-fixed: '#331111'
  on-tertiary-fixed-variant: '#673a39'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3e0'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  huge: 64px
---

## Brand & Style

The visual identity of this design system balances the high-performance aesthetics of a modern SaaS platform with the grounded, human-centric mission of a non-profit organization. It prioritizes clarity, transparency, and calm to foster trust among donors, partners, and field workers. 

The style is **Corporate / Modern** with a strong leaning toward **Minimalism**. By drawing inspiration from industry leaders like Stripe and Apple, the system uses generous whitespace and a restricted color palette to ensure the content—specifically the ecological and social impact of the mission—remains the primary focus. The inclusion of organic, earthy neutrals prevents the interface from feeling clinical, ensuring the "Sal da Terra" (Salt of the Earth) philosophy is felt through a warm and welcoming user experience.

## Colors

The color palette is rooted in the lush depth of the Amazon rainforest. The primary **Deep Amazon Green** provides a sense of stability and institutional strength, while the **River Teal** acts as a versatile secondary for interactive elements and accents.

To maintain a "human" and "approachable" feel, the system avoids pure white backgrounds in favor of **Earthy Warm Neutrals**. This reduces eye strain and provides a softer canvas for photography. Status colors (Success, Warning, Error) are slightly desaturated to align with the organic nature of the brand while remaining distinct enough for clear functional communication.

## Typography

This design system utilizes **Inter** for all interface levels to achieve a systematic and utilitarian feel that mirrors modern SaaS applications. The hierarchy is strictly defined to guide the user's eye through complex data or long-form impact stories.

Headlines use tighter letter spacing and heavier weights to command attention, while body text is optimized with a generous 1.6 line-height to ensure maximum readability for mission reports and educational content. For a unique brand touch, utilize "Sentence case" for headlines to maintain a conversational and humble tone.

## Layout & Spacing

The system follows a **strict 8px grid**, ensuring every element from icons to container padding is a multiple of eight. This mathematical consistency creates an underlying sense of order and professionalism.

The layout philosophy uses a **Fixed Grid** for main content areas (max-width 1280px) to maintain a trustworthy, institutional feel on large screens, while transitioning to a fluid model for tablets and mobile. Large "Huge" spacing units (64px+) should be used to separate major thematic sections, reinforcing the "Calm" vibe requested by preventing information density from becoming overwhelming.

## Elevation & Depth

To maintain the clean, modern aesthetic, depth is primarily conveyed through **Tonal Layers** and **Ambient Shadows**. Instead of heavy shadows, this design system uses light-reflecting "ghost borders" (1px borders in a slightly darker neutral than the background) combined with very diffused, low-opacity shadows.

Surface tiers:
- **Level 0 (Background):** Warm neutral (#F8F9FA).
- **Level 1 (Cards/Content):** Pure white (#FFFFFF) with a 4px blur, 2% opacity shadow to create a subtle lift.
- **Level 2 (Modals/Popovers):** Pure white with a 12px blur, 8% opacity shadow to indicate high priority and interaction.

This "Stripe-inspired" approach ensures the UI feels light and airy rather than heavy and static.

## Shapes

The shape language is defined as **Rounded**, utilizing a base radius of 8px (0.5rem). This choice is intentional: it is more approachable than sharp corners but more professional than fully pill-shaped "playful" designs.

- **Small Components (Buttons, Inputs):** 8px radius.
- **Large Components (Cards, Containers):** 16px (1rem) radius.
- **Media (Images, Videos):** 24px (1.5rem) radius to soften the visual impact of photography.

This consistent rounding creates a "soft-tech" feel that bridges the gap between a high-tech platform and a community-focused NGO.

## Components

### Buttons
- **Primary:** Filled with Deep Amazon Green (#1B4332), white text. Used for the main call to action (e.g., "Donate Now").
- **Secondary:** Outlined with River Teal (#2D6A4F). Used for secondary actions (e.g., "Learn More").
- **Ghost:** No background, River Teal text. Used for low-priority navigation.

### Cards
Cards are the primary vehicle for impact stories. They feature a white background, 16px of internal padding, and a subtle Level 1 shadow. When used for data/stats, include a 4px left-border in River Teal to add a dash of color.

### Input Fields
Inputs use the Earthy Neutral surface (#E9ECEF) for the background with a transparent border that turns River Teal on focus. This provides a "quiet" form experience that feels less intimidating than high-contrast borders.

### Impact Progress Bars
A custom component for this design system. A thin 8px track using the neutral surface with a Deep Amazon Green fill to show funding or project progress.

### Lists
Lists should avoid bullet points in favor of 8px spacing between items and custom icons (e.g., a small leaf or salt crystal icon) to reinforce the brand mission.