# Component Primitives Specification

## Purpose

One Button language and one Card replacing 5 button implementations and 4 card treatments, plus fixes to LoadingSpinner, Footer, nested `<main>`, a redesigned CakeBackground, two react-bits, an icon policy, and dependency cleanup.

## Requirements

### Requirement: Button primitive

New `src/components/ui/Button.tsx` consuming tokens. API: `variant: primary|secondary|ghost|success|danger`, `size: sm|md|lg` (min-heights 44/48/56px — touch targets ≥44×44), `loading`, `icon` (react-icons node), `iconPosition`, `fullWidth`, `asChild` (link), focus-visible ring (`ring-2 ring-offset-2 ring-accent-500`), active press state. Loading MUST disable the button and show an inline spinner WITHOUT layout shift (reserved slot — no emoji text-3xl jump). Variant→token: primary=primary.700/white, secondary=neutral surface+border, ghost=transparent+primary text, success=green (confirm), danger=slate (decline).

#### Scenario: Loading state

- GIVEN a button with `loading`
- WHEN rendered
- THEN it is disabled, shows spinner + label, and its size does not change

#### Scenario: Keyboard focus

- GIVEN keyboard Tab reaches a button
- THEN a visible accent focus ring appears (no `focus:shadow-outline`)

### Requirement: Button replacement mapping

File-by-file (locked `SearchInvitation.tsx` deferred to Slice 3):

| File | Current | New |
|---|---|---|
| Button.tsx (colorMap) | 6 color variants | deleted at Slice 3 (kept deprecated until then so locked consumer builds) |
| InvitationButton.tsx | dead (0 imports) | deleted |
| GroupedButtons.tsx | green/slate pills | success/danger variants; pending → spinner, no emoji size swap |
| InvitationInfo.tsx | gray "Agendar" w-full | secondary + FaCalendar, fullWidth |
| InvitationPersonalInfo.tsx | gray "Agendar"; dead "Saber mas" no-op | secondary; remove no-op button |
| LocationButton.tsx | "Abrir en Maps" | primary, fullWidth |
| WhatsAppButton.tsx | blue "Ir a inicio" / green "WhatsApp" | secondary / primary + FaWhatsapp |
| ProductCard2.tsx | inline blue anchor | Button `asChild` sm + arrow icon |
| SearchInvitationForm.tsx | inline orange submit | primary sm + FaPaperPlane |
| SearchInvitation.tsx | old Button (LOCKED) | mechanical drop-in at Slice 3 |

#### Scenario: Build stays green

- GIVEN Slice 1 lands
- WHEN `next build` runs
- THEN no consumer of the old Button API remains except the locked file

### Requirement: Card primitive

New `src/components/ui/Card.tsx`: `variant: default|paper|elevated`; padding p-6 (24px), radius rounded-xl (16px), border neutral-200. paper = festive.cream tint; elevated = shadow-md. Replaces: `[id]/page.tsx` wrapper div → Card elevated; confirm page radial-gradient div → Card paper (gradient removed/tokenized); GuestInvitations SwiperSlides → Card default/paper; ProductCard2 → Card elevated.

### Requirement: LoadingSpinner fix

API `{ size?: 'sm'|'md'|'lg', label?: string }`, `role="status"` + sr-only label. `h-screen` wrapper ONLY in page-level standalone mode; inline/component usage renders inline with no viewport sizing (fixes isComponent=true still rendering full viewport). Consumers: `[id]`, `confirm` (standalone), `LocationButton` (inline sm).

#### Scenario: Inline spinner

- GIVEN LocationButton with undefined lat/long
- WHEN rendered with inline size
- THEN no full-viewport overlay appears

### Requirement: Footer layout fix

Footer becomes static, in-flow at document end (removes `fixed bottom-0 z-[9999]`); confirm page drops `mb-40`; layout `<main>` gains systematic bottom padding (pb-16). Restyle on tokens.

#### Scenario: No magic padding

- GIVEN the confirm page
- WHEN rendered
- THEN footer follows content flow and `mb-40` is gone

### Requirement: Single main

Only `layout.tsx` renders `<main>` (with gutter container classes); `[id]/page.tsx` and confirm page replace their `<main>` with `<section>`/divs.

#### Scenario: DOM structure

- GIVEN any page
- WHEN rendered
- THEN exactly one `<main>` exists in the DOM

### Requirement: CakeBackground redesign

Replace the 700ms `setInterval` teleport (stale closure, O(n²) collision check, 20 re-layouts/tick) with: positions generated ONCE (single mount render, no setState loop); gentle drift via CSS keyframes or framer-motion animate-once (transform/opacity only); ≤20 icons, `pointer-events-none`, `aria-hidden`; festive palette at low opacity (NOT gray-900); reduced-motion → static positions, no animation.

#### Scenario: No re-render loop

- GIVEN CakeBackground mounted
- WHEN 60s elapse
- THEN no state updates or re-layouts occur after initial mount

### Requirement: react-bits integration

Install via shadcn CLI: `npx shadcn@latest add @react-bits/Aurora-TS-TW @react-bits/BlurText-TS-TW`. Aurora = soft animated gradient backdrop on the confirm page card (replaces cream/yellow radial chaos; static fallback under reduced motion). BlurText = per-word hero title reveal on `[id]` and confirm pages. Both components and their parents MUST be client components (`"use client"`); SSR-safe on Next 14 + React 18 (verify at install).

#### Scenario: Client boundary

- GIVEN BlurText on the `[id]` page
- WHEN the page renders
- THEN words reveal sequentially and no client-only hook runs during SSR

### Requirement: Icon/emoji policy

Interactive elements MUST use react-icons/fa6 SVG icons (single set; size scale text-base/lg/xl — 16/18/20px, consistent within a component). Emoji allowed ONLY as decorative non-interactive party accents. Leaflet marker: `divIcon` emoji 🥳 MUST be replaced by an inline SVG pin (map behavior unchanged). Button pending states use the spinner, not emoji swaps.

### Requirement: Dependency changes

Add `motion` (framer-motion successor). Remove unused packages (zero imports verified): canvas-confetti, confetti-js, emoji-mart, react-countdown, react-countdown-circle-timer, plus devDep @types/canvas-confetti.

#### Scenario: Deps clean

- GIVEN verify phase
- WHEN scanning package.json and imports
- THEN none of the five removed packages appear in either
