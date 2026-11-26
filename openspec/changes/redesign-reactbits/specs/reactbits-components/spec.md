# ReactBits Components Specification

## Purpose

Vendored ReactBits inventory under `src/components/reactbits/` powering the redesign. Every component is source-vendored (no CLI installs), uses only dependencies already in `package.json` (`react`, `motion`, `gsap`, `ogl`), and follows the existing `AuroraBackdrop` integration pattern: client-only, SSR-safe under the edge root layout, reduced-motion gated, and offscreen-paused for WebGL surfaces.

## Requirements

### Requirement: Vendoring location and naming

The vendored set MUST live in `src/components/reactbits/`, one file per catalog name (e.g. `SplitFlapText.tsx`, `Grainient.tsx`), matching the existing `Aurora.tsx` vendoring precedent. Components MUST NOT be installed via CLI.

#### Scenario: Catalog layout

- GIVEN the redesign applied
- WHEN the verify phase globs `src/components/reactbits/*`
- THEN each core component exists under its catalog name
- AND no shadcn/react-bits CLI install artifacts remain

### Requirement: Per-component SSR contract

Every vendored component MUST follow the AuroraBackdrop pattern: client-only via `"use client"` wrappers and `next/dynamic` with `ssr: false` for WebGL/rAF modules; a tokenized static fallback MUST render during SSR and the first client render (no hydration mismatch); the `ogl` module MUST NEVER evaluate server-side. The root layout MUST keep `runtime = "edge"` and the `/admin` segment MUST keep `runtime = "nodejs"`.

#### Scenario: No ogl in server bundles

- GIVEN `npm run build` succeeds
- WHEN the server chunks are inspected
- THEN no ogl module code appears outside client chunks (`.next/static/chunks`)

#### Scenario: Edge routes stay HTTP 200

- GIVEN a first request to any public route (`/`, `/[id]`, `/wishlist`)
- WHEN the server renders
- THEN HTTP 200 returns with static fallbacks and no `window is not defined` error

#### Scenario: No hydration mismatch

- GIVEN SSR rendered static fallbacks
- WHEN the client performs its first render
- THEN markup matches SSR and no hydration warnings appear

### Requirement: Reduced-motion gates

Every animated or WebGL vendored component MUST honor `prefers-reduced-motion`: no rAF loop, no WebGL canvas, no transform/opacity animation; the tokenized static fallback renders instead. The `globals.css` reduced-motion block MUST extend to all new animated classes.

#### Scenario: Reduced motion renders static

- GIVEN a user with `prefers-reduced-motion: reduce`
- WHEN any vendored component mounts
- THEN it renders its static fallback
- AND starts no rAF loop or WebGL canvas

### Requirement: Offscreen pause for WebGL surfaces

Grainient, Particles, and Orb MUST pause their rAF/WebGL work while not visible (IntersectionObserver; Grainient's built-in behavior, the same guard MUST be added to Particles and Orb at vendoring). Rendering MUST resume when the surface becomes visible, without remount.

#### Scenario: Hidden surface stops rendering

- GIVEN Particles or Orb mounted
- WHEN the surface scrolls offscreen or the tab is hidden
- THEN the rAF loop stops
- AND resumes when the surface becomes visible again

### Requirement: Zero-new-deps constraint

Vendoring MUST NOT add any package to `package.json`; vendored components MUST use only `react`, `motion`, `gsap`, and `ogl` already installed. Components requiring `three`/`@react-three/*` (e.g. Beams, Antigravity) MUST NOT be vendored.

#### Scenario: Deps unchanged

- GIVEN the change applied
- WHEN the `package.json` diff is inspected
- THEN no new dependencies or devDependencies were added

### Requirement: Vendored component contracts

The system MUST vendor the core set — SplitFlapText, Grainient, GradientText, StarBorder, ClickSpark, ElectricBorder, ShinyText, CountUp, Particles, Orb — and MAY vendor the optional set — Dock, BounceCards, AnimatedList, FadeContent — each with its contract. Surfaces MUST use token classes; raw hex MAY appear only as inline-style or prop values for WebGL/material effects (the `Aurora` `colorStops` precedent), keeping the token-adoption scan gate green.

| Component | Deps | Screen role | Contract (props/behavior) |
|---|---|---|---|
| SplitFlapText | none | home countdown | Driven by the `$time` nanostore; `numeric` charset + `padTo` per unit (dias/hs/min/seg padded strings); `loop: false` single phrase; tiles flip on each tick; built-in reduced-motion settles text instantly |
| Grainient | ogl | home hero | Gradient + grain backdrop in brand colors; decorative; built-in offscreen pause; reduced-motion → static gradient |
| GradientText | motion | home / `[id]` | Animated gradient text on token colors (primary/accent/festive); reduced-motion → static gradient text |
| StarBorder | none | home CTA | Wraps the "Buscar mi invitación" Button; animated star border; the Button focus ring MUST stay visible; reduced-motion → static border |
| ClickSpark | none | `[id]` / confirm | Canvas spark on click/tap; `pointer-events-none` + `aria-hidden`; MUST NOT block the underlying button |
| ElectricBorder | none | `[id]` | Canvas electric frame around the invitation card; ResizeObserver keeps it sized; reduced-motion → static border; decorative |
| ShinyText | motion | `[id]` | Shimmer accent labels; respects `disabled`; reduced-motion → static text |
| CountUp | motion | wishlist | "¡X regalos soñados!" stat animates on view; reduced-motion → final value directly |
| Particles | ogl | home / confirm | Ambient point cloud; offscreen pause MUST be added at vendoring; reduced-motion → static fallback |
| Orb | ogl | confirm | Gradient blob; offscreen pause MUST be added at vendoring; reduced-motion → static fallback |
| Dock | motion | confirm / wishlist / home | Optional mobile bottom nav; token restyle; client-only |
| BounceCards | gsap | confirm | Optional photos fan; reduced-motion → static stack |
| AnimatedList | motion | wishlist | Optional list mode; restyled from dark theme to tokens |
| FadeContent | gsap | any | Optional scroll reveal; reduced-motion → no transform |

#### Scenario: Countdown ticks animate

- GIVEN the home page with a `$time` update (seconds change)
- WHEN SplitFlapText receives new padded values
- THEN each changed tile flips to the new digit
- AND the settled text reads the current countdown

#### Scenario: ClickSpark does not block clicks

- GIVEN ClickSpark wrapping the confirm Button
- WHEN the user clicks the button
- THEN the button action fires and a spark renders
- AND the spark canvas never intercepts the event

#### Scenario: Optional components may be absent

- GIVEN the core set vendored
- WHEN the verify phase inspects the optional set
- THEN absent optional components break neither the build nor any import graph

### Requirement: Decorative semantics

Decorative layers (Grainient, Particles, Orb, ElectricBorder, ClickSpark canvas) MUST be `aria-hidden` and `pointer-events-none`; interactive wrappers (StarBorder, ClickSpark, Dock) MUST keep underlying controls operable and focusable.

#### Scenario: Focus and interaction preserved

- GIVEN the StarBorder-wrapped CTA
- WHEN keyboard Tab reaches it
- THEN the accent focus ring renders
- AND click/tap still activates the button
