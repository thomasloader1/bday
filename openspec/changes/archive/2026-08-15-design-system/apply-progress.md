# Apply Progress: Design System — "Party Suave"

**Batch**: Slice 1 (Token Foundation + Primitives + Layout Fixes) + Slice 2 (react-bits + Pages on Tokens + site-wide background requirement) + **Slice 3 (final: locked-file restyles + dead code + deps + WARNING-1/SUGGESTION-1 resolution)**
**Mode**: Standard (no test runner; verification = tsc + lint + build + grep gates)
**Workload**: size:exception ALREADY APPROVED (recorded in tasks.md + session). Work-unit commits, conventional commits, no AI attribution. Committed directly on `main`. NOT pushed, no PRs.

## Slice 1 Status: DONE ✅ | Slice 2 Status: DONE ✅ | Slice 3: DONE ✅ (ALL SLICES COMPLETE)

| Unit | Tasks | Status |
|---|---|---|
| S1-A Token vocabulary | 1.1.1 – 1.1.7 | ✅ done |
| S1-B Deps + primitives | 1.2.1 – 1.2.3 | ✅ done |
| S1-C Structural fixes | 1.3.1 – 1.3.3 | ✅ done |
| S1-D Consumer adoption + CakeBackground | 1.4.1 – 1.4.9 | ✅ done |
| S1-V Slice 1 verification | 1.5.1 – 1.5.3 | ✅ done (caveats below) |
| S2-A react-bits (Aurora/BlurText/Cubes) | 2.1.1 – 2.1.2 | ✅ done |
| S2-B Page restyles | 2.2.1 – 2.2.4 | ✅ done |
| S2-V Slice 2 verification | 2.3.1 | ✅ done (caveats below) |
| New requirement: site-wide background + Cubes | (authoritative prompt add-on) | ✅ done |
| S3-A Locked-file restyles | 3.1.1 – 3.1.3 | ✅ done (unblocked: fix-date-pipeline archived) |
| S3-B Dead code + deps | 3.2.1 – 3.2.4 | ✅ done |

## Commits (in order, on `main`)

| Hash | Message |
|---|---|
| `68ab99e` | feat(tokens): add design token scales to tailwind config |
| `18b337f` | feat(ui): add Button and Card primitives |
| `6ad76d9` | fix(layout): single main, static footer, spinner bug |
| `ca05d56` | feat(background): efficient cake background with CSS drift |
| `51b835b` | refactor(ui): adopt Button primitive across consumers |
| `0928956` | feat(background): site-wide icon background with react-bits cubes |
| `38fa32a` | feat(react-bits): add Aurora and BlurText components |
| `4fe4335` | refactor(pages): apply tokens and primitives across pages |
| `75b698d` | fix(ui): darken success token to meet AA contrast |
| `d8d4ed0` | fix(a11y): render blur title content as span inside h1 |
| `de124a3` | refactor(ui): restyle countdown, search, and home on tokens |
| `ca573a0` | refactor(ui): remove dead components and legacy button |
| `4088fed` | chore(deps): remove unused animation and confetti packages |

Rollback: revert per-commit (pure frontend, no data). Backup of pre-slice tailwind.config.ts + globals.css is available via `git show 407c52f:tailwind.config.ts` etc. (previous HEAD).

## Slice 2 — What Was Done

### New user requirement: icon background on EVERY page + react-bits Cubes
- `CakeBackground` moved OUT of home `page.tsx` and `[id]/page.tsx` INTO the root layout as a site-wide decorative layer via new client component `src/components/BackgroundLayer.tsx`:
  - `fixed inset-0 -z-10 pointer-events-none overflow-hidden` + `aria-hidden` — sits behind `<main>` on every route, never intercepts interaction.
  - `CakeBackground` wrapper simplified from `absolute inset-0 -z-10` to `absolute inset-0` (z handled by the layer); positions still generated once via useMemo; drift is CSS keyframes; reduced-motion static via existing `.animate-drift` media query in globals.css.
  - react-bits **Cubes** installed via `npx shadcn@latest add https://reactbits.dev/r/Cubes-TS-TW` (dep `gsap@^3.15.0`), placed bottom-right corner: `gridSize=5, cubeSize=8` (40px), `opacity-40`, faceColor = primary-700 hex, `autoAnimate`, `rippleOnClick={false}`. Reduced motion → Cubes NOT rendered (pure animation; `useReducedMotion` gate).
  - Page-level `<CakeBackground />` usages removed (home + [id]) — no duplication.

### react-bits install outcome
- All three installed cleanly via the shadcn CLI with the **URL form** `https://reactbits.dev/r/<Name>-TS-TW` (the `@react-bits/...` shorthand from tasks.md/design.md does NOT resolve; URLs verified live before install):
  - `Cubes` → `src/components/Cubes.tsx` (gsap) ✅ CLI
  - `Aurora` → `src/components/Aurora.tsx` (ogl) ✅ CLI
  - `BlurText` → `src/components/BlurText.tsx` (motion) ✅ CLI
  - Zero manual copy-paste needed. New `components.json` created (shadcn config, `aliases.components = @/components`) since the project had none.
  - `"use client"` was ABSENT on all three installed files → added to each (they use DOM APIs: gsap/WebGL/IntersectionObserver).
  - CLI resolved `motion` ^13.1.0 → **^12.43.0** to satisfy BlurText's declared `motion@^12.23.12`; only new code imports motion (`useReducedMotion`, BlurText) so no v13-only API is lost.
- Wrappers: `AuroraBackdrop` (useReducedMotion → static `bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15`, no WebGL under reduced motion) and `BlurTextTitle` (h1 semantics; reduced motion → plain static text).
- **Edge-runtime decision: KEPT `runtime = 'edge'`** in layout.tsx. Full `next build` passed WITH edge + ogl/WebGL (Aurora instantiates the WebGL Renderer only inside `useEffect`, so the module import is SSR/edge-safe; gsap also imports cleanly under edge). No hydration/build error. Design's fallback (drop edge) NOT triggered.

### Page restyles (tasks 2.2.1 – 2.2.4)
- `[id]/page.tsx`: removed `container mx-auto px-8 pt-10` overrides → single `motion.div` page-entrance (`pageEntrance` variants added to `src/lib/motion.ts`, party easing, `initial={false}` under reduced motion); card → `Card variant="elevated" w-full max-w-2xl`.
- `[id]/confirm/page.tsx`: radial-gradient div → `Card variant="paper"` + `AuroraBackdrop` (absolute, behind content) + `BlurTextTitle` h1 + page entrance. **Behavior untouched**: `router.push` guard, `guestLoaded={loading}`, LoadingSpinner standalone all preserved verbatim.
- `wishlist/page.tsx`: removed `px-24` (gutter from layout main), h1 → `font-display text-4xl md:text-5xl font-bold`, "Ir al inicio" link → `Button asChild variant="primary"` (removes `bg-orange-500`).
- `Invitation.tsx`: h1 → `BlurTextTitle` (design AD-10: [id] page title).
- `NoInvitation.tsx`: `max-w-[800px]` → `max-w-3xl`; dead `text-md` (non-existent class) → `text-base`; h1 → display font.
- `GuestInvitations.tsx`: SwiperSlides → `Card paper` (family/work) / `Card default` (personal); the 4 arbitrary grid/radial decorations (`#f0f0f0` grid, `#F9EFDB`/`#FFEAA7` radials) → tokenized glow accents (`bg-festive-yellow/50 blur-2xl`, `bg-accent-500/10 blur-2xl`, pointer-events-none aria-hidden, clipped by `overflow-hidden rounded-xl`).
- `Badge.tsx`: semantic mapping (yellow→warning, orange→primary, green→success, dark→neutral, default→info) with contrast-safe pairs — dark neutral text (≥4.5:1) + colored tint/border; `rounded-full`; dead `dark:` classes removed.
- `LocationButton.tsx`: leaflet `divIcon` emoji 🥳 → inline SVG pin (primary-700 fill + festive-yellow dot + white stroke, `iconAnchor` at tip). Map behavior unchanged.
- `InvitationInfo.tsx`: h2 → `font-display` heading style (already on Button primitive from Slice 1).
- `WhatsAppButton.tsx`: already migrated to new Button (secondary/primary + FaWhatsapp) in Slice 1 — verified, no change needed (its "falls back to green" description was pre-Slice-1).

## Slice 2 Verification Evidence (task 2.3.1)

- `npx tsc --noEmit` → clean ✅ (run after each commit)
- `npm run lint` → exit 0 ✅ (only pre-existing `<img>` warnings in LocationFriendsCard + ProductCard2, plus upstream react-bits Aurora exhaustive-deps warning — vendor code left pristine)
- `npm run build` → exit 0 ✅ (Next 14.0.3, **edge runtime intact**, 4 routes; `[id]/confirm` first-load JS 313 kB — Aurora WebGL adds weight, acceptable)
- Grep gate `bg-\[#|text-\[#|rounded-\[|shadow-\[|bg-\[radial|bg-\[linear` over src/app + src/components → **0 matches** ✅ (the 5 Slice-1 deferred matches — confirm radial + GuestInvitations decorations — are resolved; new code added zero arbitrary classes)
- `#f0f0f0/#F9EFDB/#FFEAA7` in app classes → 0 (remaining hexes are JS prop values: SVG pin fill + Aurora colorStops, all reusing token values)
- `<main>` → exactly 1 (layout.tsx) ✅; `mb-40`/`z-[9999]`/`text-md`/`bg-orange-500` → 0 in non-locked files (ProductCard.tsx = dead, Slice 3.2.2; SearchInvitation.tsx = locked, Slice 3.1.2) ✅
- CakeBackground rendered only via BackgroundLayer (no page-level duplication) ✅

## Slice 3 — What Was Done (fix-date-pipeline ARCHIVED 2026-08-15 → all locked files released)

### Verify-phase resolutions (maintainer auto-approved)
1. **WARNING-1 (success contrast) — AMENDED**: `success` token `#16A34A` → `#15803D`. White text on `#16A34A` measured 3.30:1 (below the design-tokens AA rule ≥4.5:1 and the proposal's own criterion). `#15803D` (green-700 family) = **5.01:1 with white** — keeps "confirm = green". Updated `tailwind.config.ts:44`, ODSF bundle (`opendesign/tokens/color.md`, `opendesign/styles/tokens.css`, `opendesign/log.md` entry), delta spec `design-tokens` table, and `design.md` amendment section. `ui/Button` + `GroupedButtons` consume the token → no component change needed. **Commit `75b698d`**.
2. **SUGGESTION-1 (p-in-h1 content model) — FIXED**: `BlurText` gains `as?: 'p' | 'span'` (default `'p'`, standalone usage unchanged); `BlurTextTitle` passes `as="span"` so the h1 wraps a span, never a `<p>`. Real h1 semantics + reduced-motion fallback intact. 3-line-shaped additive patch to the react-bits vendor file (ref retyped `HTMLElement`, two-branch render). **Commit `d8d4ed0`**. SUGGESTION-2 (upstream `split('')` quirk, identical branches) ACCEPTED as-is — vendor file kept otherwise pristine, sequential reveal still meets the scenario.

### Tasks 3.1.x — locked-file restyles (visual only; date/search behavior intact)
- **3.1.1 `Countdown.tsx`**: digit line → `font-display text-3xl md:text-4xl font-bold tabular-nums text-neutral-800 mb-2`; dropped stray `mr-2` (off-center). Reduced-motion: the 1s tick is a content update, not an animation — nothing to disable (no CSS/motion animation exists in the component).
- **3.1.2 `SearchInvitation.tsx`**: old `Button` → `ui/Button` (`variant="primary" size="lg" loading={loading}` + `{loading ? 'Cargando ...' : 'Demo'}` label — old spinner-label behavior preserved; `text-xl font-bold` className kept via tailwind-merge). Dead `text-md` → `text-base` (spec body ≥16px). Search form logic untouched.
- **3.1.3 home `page.tsx`**: hero `<h1>` → `BlurTextTitle` (display font, per-word reveal, reduced-motion → plain static h1); container `h-screen` → `min-h-screen` (never clips tall content on small viewports); Aurora NOT added (optional per design; `BackgroundLayer` already decorates the route). Countdown onComplete/`setEventDate` logic untouched.

### Tasks 3.2.x — dead code + deps
- **3.2.1** deleted `src/components/Button.tsx` (0 imports verified after 3.1.2 — all remaining Button imports are `ui/Button`).
- **3.2.2** deleted 4 more dead components after import scan: `InvitationButton.tsx` (0 imports), `ProductCard.tsx` (only commented-out wishlist usage — import + comment removed from `wishlist/page.tsx`), `PlacesToGo.tsx` (only commented-out usage in `InvitationPersonalInfo.tsx` — import + comment removed), `LocationFriendsCard.tsx` (only imported by PlacesToGo). These were the last carriers of `focus:shadow-outline` / `bg-orange-400` / `text-md` legacy classes.
- **3.2.3** `npm uninstall canvas-confetti confetti-js emoji-mart react-countdown react-countdown-circle-timer @types/canvas-confetti` → **"removed 6 packages, audited 451 packages"**, exit 0. Zero references existed repo-wide outside package.json (pre-verified). The npm audit vulnerabilities notice is pre-existing (firebase/next dependency tree) — untouched, out of scope.

## Slice 3 Verification Evidence (task 3.2.4)

- `npx tsc --noEmit` → exit 0, zero errors ✅ (also run after commits 2–4)
- `npm run lint` → exit 0 ✅ (only the 2 pre-existing warnings in untouched live files: Aurora.tsx:208 upstream exhaustive-deps, ProductCard2.tsx:19 `<img>` — next/image migration is a separate change per proposal)
- `npm run build` → exit 0 ✅ (Next 14.0.3, **edge runtime intact**, 4 routes; `[id]/confirm` 313 kB first-load JS unchanged — Aurora WebGL, accepted)
- Grep gate `bg-\[#|text-\[#|rounded-\[|shadow-\[|bg-\[radial|bg-\[linear` over src → **0 matches** ✅
- `<main` → **exactly 1** (layout.tsx:34) ✅
- Legacy-class gate (`text-md|bg-orange-400|bg-orange-500|focus:shadow-outline|mb-40|z-\[9999\]|rgb(var|animate-progress|px-24`) → **0 matches** ✅ (dead-file carriers gone)
- Imports of deleted components (`Button|InvitationButton|ProductCard|PlacesToGo|LocationFriendsCard`) → 0 (only `ProductCard2` / `ui/Button` remain) ✅
- package.json → all 6 uninstalled deps absent (verified via JSON parse) ✅

## Caveats / Known Deferred Items (Slice 1 + Slice 2)

1. ~~**Contrast flag (ui-ux-pro-max CRITICAL)**~~ → **RESOLVED (Slice 3, verify WARNING-1)**: `success` token darkened `#16A34A` → `#15803D` (5.01:1 with white, ≥4.5:1 AA). Primary.700 + white ≈ 5.18:1 ✅. Badge text contrast-safe (neutral-800/700 on tints) ✅. See "Verify-phase resolutions" above.
2. **Manual matrix (1.5.3 / 2.3.1)**: structural checks passed (single `<main>`, grep gates, touch min-h ≥44px via tokens, focus-visible accent rings present). Browser/axe pass (reduced-motion static cake + no Cubes, Aurora static gradient, BlurText plain text, keyboard rings, no hydration error) runs at verify — no browser available in apply env.
3. **Aurora lint warning**: `useEffect` exhaustive-deps warning is upstream react-bits code (propsRef pattern). Left as-shipped to keep vendor files pristine; verify can decide to patch.
4. **`runtime='edge'` KEPT** — build green with ogl/gsap. Edge disables static generation (Next warning, pre-existing from Slice 1). Decision 9/10 in design resolved: no drop needed.
5. ~~**`focus:shadow-outline` (1.1.5)**~~ → **RESOLVED**: only remaining match was dead `InvitationButton.tsx` (verified 0 imports) → deleted at 3.2.2; gate now 0 repo-wide.
6. **motion downgraded** ^13.1.0 → ^12.43.0 by the react-bits CLI (registry constraint). No v13-only API in use; `useReducedMotion`/variants work identically.

## Deviations from Design (deliberate, with reasons)

1. **Button inline spinner is self-contained** (its own `<span>` arc spinner) instead of importing `LoadingSpinner` — keeps commit 2 (primitives) green before commit 3 (spinner rewrite) lands; standard primitive pattern (shadcn-style). Visual matches LoadingSpinner (border-neutral-200 + border-t-primary-600).
2. **layout.tsx fully changed in commit 1** (fonts + variables + single guttered main); commit 3 needed no further layout.tsx edit (prompt's plan listed it in both — resolved as commit 1 only).
3. **GroupedButtons "Mira las instrucciones" emoji dropped** (interactive element → icon policy: SVG for interactive, emoji decorative only).
4. **Footer full-bleed border** inside the guttered main via `-mx-6 md:-mx-8` negative margins (border-t spans viewport while content aligns to gutter).
5. **Task 1.5.2/1.5.3 marked [x] with explicit caveat notes** in tasks.md rather than left dangling — see Caveats.
6. **Deps folded into commit 2** (feat(ui)) per the prompt's commit plan — one coherent "primitives + deps" work unit.
7. **react-bits installed FLAT** (`src/components/Cubes.tsx`, `Aurora.tsx`, `BlurText.tsx`) instead of a `reactbits/` subfolder — that's the shadcn CLI's canonical output given `aliases.components = @/components`; design.md's "reactbits/" grouping was descriptive.
8. **react-bits installed via URL form** `https://reactbits.dev/r/<Name>-TS-TW` (verified live) rather than the `@react-bits/...` shorthand in tasks.md/design.md — the shorthand registry specifier does not resolve in the current CLI; URLs are the reactbits-documented install command. All three components + deps (gsap, ogl) installed cleanly by the CLI — no manual copy needed.
9. **Page entrance is a single container entrance** (fade+rise, party easing) rather than per-child stagger variants — avoids prop-drilling motion variants through child components (Invitation/NoInvitation/GuestInvitations). The per-word BlurText reveal provides the staggered feel. `stagger.pageLoad` constant retained in motion.ts.
10. **BlurTextTitle rendered `<h1>` wrapping BlurText's `<p>`** (p-in-h1 content model) — RESOLVED in Slice 3 (verify SUGGESTION-1): `BlurText` gained an `as` prop (default `'p'`); `BlurTextTitle` passes `as="span"`. The h1 keeps real heading semantics; no more flow content inside a heading. Small additive patch to the vendor file — only the wrapper element + ref typing changed, default behavior untouched.
11. **Cubes accent is background-only decoration**: `pointer-events-none` parent, `rippleOnClick={false}`, autoAnimate only — no interactive behavior (per requirement: decorative background, must not fight content).
12. **BlurText vendor patch (Slice 3)**: `as` prop + `useRef<HTMLElement>` + two-branch render. SUGGESTION-2 (upstream `split('')` identical branches) intentionally NOT patched — would change word-spacing behavior; sequential reveal already meets the scenario.
13. **Commit plan executed as 5 commits, not 4**: the a11y title fix got its own commit (`d8d4ed0`) instead of being folded into the restyle commit — one purpose per commit per work-unit-commits. Contrast fix stayed standalone as planned (`75b698d`).
14. **Home hero got `BlurTextTitle`** (consistent with `[id]`/confirm title treatment per design AD-10); Aurora on home skipped — design marks it optional and `BackgroundLayer` already decorates the route.

## Notes for Next Slices

- **ALL SLICES DONE (1–3)**: all 3.x tasks `[x]` in tasks.md. Slice 3 was unblocked by the fix-date-pipeline archive (2026-08-15).
- WARNING-1 (success token) and SUGGESTION-1 (p-in-h1) resolved — see Slice 3 section above; both verified by the Slice 3 gate run.
- Remaining for verify phase: browser/axe manual matrix (reduced-motion static cake/Cubes/Aurora, BlurText plain text under reduced motion, focus rings, spinner no-shift) — no browser in apply env; structural evidence covers it.
- Pre-existing lint warnings (Aurora vendor exhaustive-deps, ProductCard2 `<img>`) stay in untouched live files — out of change scope (next/image migration is a separate change per proposal).
