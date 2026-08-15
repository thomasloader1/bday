# Design System Log

Newest first.

## 2026-08-15

- **Amended `success` token** `#16A34A` → `#15803D` (verify WARNING-1, auto-approved): white-on-green was 3.30:1, failing the design-tokens AA rule (≥4.5:1 normal text) and the proposal's own success criterion. `#15803D` keeps the green family and measures 5.01:1 with white text. Updated `tailwind.config.ts`, `opendesign/tokens/color.md`, `opendesign/styles/tokens.css`, and the design-tokens delta spec.
- Created the OpenDesign bundle for the design-system change (`openspec/changes/design-system`).
- Captured resolved token values from the design-tokens spec: primary orange scale (600 #EA580C, 700 #C2410C, 800 #9A3412), accent indigo 500/600, slate neutrals, festive cream/yellow, semantic success/danger/info/warning.
- Decided fonts: Fraunces (display, 600/700) + Inter (body) via next/font/google CSS variables.
- Decided motion model: durations/easing/keyframes live in `tailwind.config.ts`; stagger constants in `src/lib/motion.ts`.
- Decided primitives: `ui/Button` (variant/size/loading/icon/asChild), `ui/Card` (default/paper/elevated), `LoadingSpinner` `{size,label,standalone}`.
- Decided CakeBackground redesign: positions generated once via useMemo, CSS-keyframe drift (transform only), festive palette, reduced-motion static.
- Decided Footer static in-flow; single `<main>` in layout; one page gutter `px-6 md:px-8`.
- Verified react-bits names live: `@react-bits/Aurora-TS-TW` (dep `ogl` — WebGL) and `@react-bits/BlurText-TS-TW` (dep `motion`).
- Marked open values: line heights (Tailwind defaults for now), accent scale beyond 500/600, primary 50–400/900 tints (Tailwind orange scale).
