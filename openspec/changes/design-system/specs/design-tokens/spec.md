# Design Tokens Specification

## Purpose

Centralize the visual vocabulary (color, type, spacing, radius, shadow, motion) as tokens in `tailwind.config.ts` (theme.extend) consumed by every component, ending the current chaos: competing orange/blue/green/slate, mixed radius/shadow, dead CSS, inert `focus:shadow-outline`.

## Requirements

### Requirement: Color palette tokens

The system MUST define exactly ONE primary family (warm orange `#F97316`-family), ONE accent (indigo), a slate neutral scale, and a festive set (cream/yellow) used only as decorative accents, via `theme.extend.colors`:

| Token | Value | Role |
|---|---|---|
| primary.600 | `#EA580C` | CTA bg (large-text only, ≥3:1) |
| primary.700 | `#C2410C` | CTA bg default (white text ≥4.5:1) |
| primary.800 | `#9A3412` | CTA hover/active |
| accent.500 / accent.600 | `#6366F1` / `#4F46E5` | Focus rings, highlights, gradient glow (never body text) |
| neutral.50–neutral.900 | slate scale + white | Surfaces, text, borders |
| festive.cream | `#F9EFDB` | Card tint (paper) |
| festive.yellow | `#FFEAA7` | Decorative accents, sparingly |
| success | `#15803D` | Confirm — amended from `#16A34A` (3.30:1) to meet WCAG AA ≥4.5:1 with white text (5.01:1) |
| danger | `#475569` (slate-600) | Decline — "danger" reads slate |
| info / warning | `#2563EB` / `#F59E0B` | Informational / alerts |

Any text on a colored surface MUST meet WCAG AA (≥4.5:1 normal, ≥3:1 large). Dark mode: `dark:` surfaces map to neutral-800/900 from the same scale.

#### Scenario: Primary CTA contrast

- GIVEN a default-size primary CTA button
- WHEN rendered
- THEN white label on primary.700 measures ≥4.5:1 contrast

### Requirement: Typography tokens

Display font MUST be Fraunces (next/font/google, `--font-display` variable, weights 600/700); body MUST be Inter (`--font-inter`, 400/500/600/700). Display MUST NOT be Inter (avoids generic AI aesthetics). Extend `fontFamily`: `display: ['var(--font-display)','Georgia','serif']`, `sans: ['var(--font-inter)','Inter','ui-sans-serif','system-ui']`. Both loaded as CSS variables in `layout.tsx`.

Semantic type scale (Tailwind defaults):

| Token | Class | Size |
|---|---|---|
| display-xl / display | text-6xl / text-5xl | 60px / 48px, Fraunces 700 |
| heading | text-3xl | 30px, Fraunces 600 |
| subheading | text-2xl | 24px, weight 600 |
| body | text-base | 16px (MUST be ≥16px) |
| caption | text-sm | 14px |

### Requirement: Spacing tokens

Adopt Tailwind's default 4/8pt scale as convention (no new tokens): `0=0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96` px. Page gutter MUST be one value: `container mx-auto px-6 md:px-8` on the layout `<main>`; page-level overrides removed (`wishlist` px-24, `[id]`/`confirm` px-8/pt-10).

#### Scenario: Gutter consistency

- GIVEN the wishlist page
- WHEN rendered
- THEN horizontal padding equals the gutter token, not px-24

### Requirement: Radius tokens

Pin `theme.extend.borderRadius`: `sm=4px, md=8px, lg=12px, xl=16px, full=9999px`. Conventions: cards=xl, buttons/badges=lg or full, map=lg. Resolves mixed `rounded-lg/full/md/t-lg/18px` (swiper-slide 18px → xl). App code MUST NOT use arbitrary radius (`rounded-[…]`).

### Requirement: Shadow tokens

Pin `theme.extend.boxShadow` elevation scale: `sm = 0 1px 2px 0 rgb(0 0 0 / 0.05)`, `md = 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`, `lg = 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`. Cards=md, overlays=lg. Inert `focus:shadow-outline` MUST be replaced by focus-visible rings (accent).

### Requirement: Motion tokens

Durations/easing/keyframes in tailwind config; stagger constants in `src/lib/motion.ts`:

| Token | Value |
|---|---|
| transitionDuration.fast / base / slow | 150ms / 250ms / 300ms |
| transitionTimingFunction.party | `cubic-bezier(0.16, 1, 0.3, 1)` |
| stagger.pageLoad | 60–80ms between elements |

Page load = ONE staggered entrance per page (container variants); no scattered micro-interactions. `prefers-reduced-motion: reduce` MUST disable non-essential animation (CSS media query; `useReducedMotion` for motion components; static fallbacks).

#### Scenario: Reduced motion

- GIVEN user prefers reduced motion
- WHEN a page loads
- THEN no transform/opacity entrance animation runs and backgrounds render static

### Requirement: Token adoption gate

After adoption, app code MUST contain zero hardcoded hex or arbitrary color/radius/shadow classes on tokenized surfaces (`bg-[#…]`, `text-[#…]`, `bg-[radial-gradient(…)]`, `bg-[linear-gradient(…)]`, `bg-[size:…]`, `rounded-[18px]`, `shadow-[…]`). `globals.css`: remove RGB vars + dark-scheme block, dead `progress` keyframes + `.animate-progress` (zero usage verified), tokenize swiper radius. Vendor CSS (leaflet, swiper) exempt.

#### Scenario: Scan gate

- GIVEN verify phase
- WHEN grep runs `bg-\[#|text-\[#|rounded-\[|shadow-\[|bg-\[radial|bg-\[linear` over src/app + src/components
- THEN zero matches outside vendor files
