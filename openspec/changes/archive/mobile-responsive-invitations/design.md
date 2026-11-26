# Design: Mobile-responsive guest invitations

## Context

Confirmed-guests page (`src/app/[id]/confirm/page.tsx`) renders `GuestInvitations` via `dynamic(..., { ssr: false })` (`:15`) inside `div.relative pt-56` (`:49`) with the `CurvedLoop` ribbon (`:56`). `GuestInvitations.tsx:19-33` is a hardcoded Swiper: `effect="coverflow"`, `slidesPerView={2}`, `rotate: 50, depth: 100`, `pagination={true}` — no breakpoints. Slides map `guestData.group[]` to `Card paper`+`InvitationInfo` (family/work) or `Card default`+`InvitationPersonalInfo` (`:35-67`), passing `guestData.lunch` coords (`:50-52`). At 375px this collapses to ~163px slides / ~115px content columns: titles wrap, CTAs truncate (Button `truncate`, `Button.tsx:76`).

Verified defects: pagination CSS never imported (`layout.tsx:4-5` imports only `swiper/css` + dead `effect-cards`) so bullets are invisible; `LocationButton.tsx:48-58` map keeps Leaflet `dragging` default true → traps horizontal swipes, and `:19-21` shows an infinite "Cargando mapa" spinner when coords are missing; `CurvedLoop.tsx:60-78` rAF marquee ignores `prefers-reduced-motion` (violates design-tokens spec `:76`); no `viewport-fit=cover` (safe areas); `playwright.config.ts:8` points at a nonexistent `./e2e` (zero mobile coverage).

Deps already present: `motion@^12.43.0`, `swiper@^11.0.5` — `package.json` diff stays empty.

## Goals / Non-Goals

**Goals**: Tinder-style stacked deck <640px (swipe LEFT/RIGHT navigates only, never confirms); desktop ≥640px byte-identical coverflow; full-width readable cards (no truncation, targets ≥44px, body ≥16px); visible pagination; map no-pan + no-spinner fallback; safe areas; reduced-motion gates; Playwright mobile projects (Pixel 7 412×915, iPhone 12 390×844, 320px); reuse `InvitationInfo`/`InvitationPersonalInfo`/`Card` unchanged.

**Non-Goals**: no confirm-logic changes, no second confirm path, no new card CTAs; no desktop redesign; no `after`-coords fix (deferred); no data/auth changes; no new deps; no unit runner (Strict TDD inactive).

## Architecture

Before:
```
confirm/page.tsx → Card paper → div.relative.pt-56
  ├── CurvedLoop
  └── GuestInvitations (dynamic ssr:false)
        └── Swiper coverflow ── SwiperSlide ×N ── Card + InvitationInfo|InvitationPersonalInfo
```
After:
```
GuestInvitations (single entry; keeps dynamic ssr:false)
  ├─ matchMedia('(min-width: 640px)') listener → isDesktop
  ├─ isDesktop → <Swiper> EXACT current config (lines 19-33 unchanged)
  └─ !isDesktop → <mobile/InvitationDeck slides={slides}>
        └── stacked cards ── same Card children (shared renderer)
```
Slide content is built once by a private `renderSlide(gdg, index)` inside `GuestInvitations` (same fork + JSON lookups as today) and passed as `ReactNode[]` to both paths — one renderer, zero content drift. Desktop swiper JS never mounts on mobile (gate unmounts it), so no hidden tiny slides.

## Data Flow

Props unchanged: `GuestInvitations { guestData: Guest; guestLoaded: boolean }`. `InvitationDeck` state is local: `activeIndex`, `x: MotionValue` (drag offset), derived `rotate`/`scale`, `didDragRef` (tap-vs-drag). Swipe end: |x| > 100px or velocity > 500 → `animate(x, ±600)` off-screen → `activeIndex++`, `x.set(0)`; else spring back to 0. Behind cards render `activeIndex+1/+2` at fixed offsets. No store, no confirmation writes — swipe only mutates `activeIndex`.

## Key Decisions

| # | Decision | Options / tradeoff | Choice & rationale |
|---|---|---|---|
| 1 | Swipe mechanics | free drag; swiper custom effect (no stable v11 API); `drag="x"` | **`motion.div drag="x"` axis-locked** — zero deps, pointer capture + velocity built in; vertical scroll untouched |
| 2 | Tap vs drag | `onPointerUp` heuristics; delay clicks; suppress after drag | **`didDragRef` set when \|x\|>8px; `onClickCapture` on deck stops clicks if dragging** — calendar/maps fire on tap, never after swipe |
| 3 | Deck animation | CSS transitions (no velocity flicks); AnimatePresence per card (heavy); full-stack re-render | **`useMotionValue(x)` + `useTransform` rotate/scale on top card only; imperative `animate(x, target)` for exit; spring-back below threshold** — cheap, velocity-driven |
| 4 | Viewport gate | CSS `hidden md:block`; JS matchMedia | **`matchMedia('(min-width: 640px)')` in `useState+useEffect` (listen `change`)** — CSS-only can't unmount Swiper's JS/modules/gestures on mobile; component is client-only so no hydration risk |
| 5 | Pagination | custom dots only; drop pagination | **Import `swiper/css/pagination` in `layout.tsx` (desktop bullets become visible), drop dead `effect-cards`; deck uses custom pill dots** — fixes invisible-bullet bug for both paths |
| 6 | Map | keep dragging; `dragging={false}`; `touchZoom` etc. off | **`dragging={false} touchZoom={false} scrollWheelZoom={false} doubleClickZoom={false}`; no coords → render `null` (no spinner loop); `h-44 md:h-48`** — display-only map never eats deck swipes |
| 7 | Reduced motion | CSS-only kill; `useReducedMotion` | **`useReducedMotion()` in `CurvedLoop` skips rAF loop (static text) and in deck skips rotate/scale** — design-tokens `:76` compliance; CSS alone can't gate the rAF |
| 8 | Safe areas | ignore; `env()` everywhere | **`layout.tsx` exports `viewport { viewportFit: 'cover' }`; confirm page `pb-[env(safe-area-inset-bottom)]`, `pt-32 md:pt-56`** — content clears notch/home indicator; env() padding isn't a token violation |

## Component Design

- **`src/components/mobile/InvitationDeck.tsx` (new)** — props `{ slides: ReactNode[]; total: number; guestName: string }`. State: `activeIndex`, motion `x`, `didDragRef`. Renders deck region (`role="region"` `aria-label=Invitaciones de ${guestName}`, `tabIndex={0}`, ArrowLeft/Right advances), stacked cards, prev/next chevron buttons (44px, `aria-label` "Anterior/Siguiente invitación", disabled at ends), dot row (`aria-current`). Small and presentational.
- **`GuestInvitations.tsx` (mod)** — adds gate hook + `renderSlide`; desktop Swiper props byte-identical; mobile returns deck.
- **`LocationButton.tsx` (mod)** — map gesture props, coords fallback, `h-44 md:h-48`.
- **`CurvedLoop.tsx` (mod)** — `useReducedMotion` gate on rAF effect.
- **`layout.tsx` (mod)** — pagination CSS import; drop `effect-cards`; `viewport` export.
- **`src/app/[id]/confirm/page.tsx` (mod)** — `pt-32 md:pt-56`, safe-area bottom padding.

## Styling

Deck container `relative pb-2`; active card in flow (`relative z-20 shadow-lg`); behind cards `absolute inset-x-0 z-10`, `translateY(-8*i px) scale(1-0.04*i) shadow-md`, `pointer-events-none`; top card rotates from `useTransform(x, [-300,300], [-8,8])`. Dots: `flex justify-center gap-2 mt-4`; active `w-6 h-2 rounded-full bg-primary-700`, inactive `w-2 h-2 bg-neutral-300`. All tokens from design-tokens spec (radius xl, shadow lg/md, `duration-base ease-party`); no arbitrary color/radius/shadow classes.

## Testing

`playwright.config.ts`: add `projects` — `desktop-chrome`, `pixel-7` (412×915, hasTouch), `iphone-12` (390×844, hasTouch), `narrow-320` (320×568, hasTouch) via `devices`.

- **`e2e/mobile-deck.spec.ts`** (3 mobile projects): no horizontal scroll (`scrollWidth <= clientWidth`); deck + dots visible, dot count == slides; touch swipe advances active card; swipe never changes URL or confirmation state; tap on "Agendar en calendario" fires (no advance); map drag doesn't pan map; CTAs visible, labeled, ≥44px tall at 320px; ArrowRight advances.
- **`e2e/desktop-swiper.spec.ts`** (desktop only): swiper coverflow element + visible neighbor slides + pagination bullets visible.
- Static gates: `npx tsc --noEmit` (never `next build`); no unit runner.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Swipe vs vertical scroll | `drag="x"` axis lock; e2e asserts both swipe-advance and page scroll |
| Tap vs drag on buttons | 8px movement threshold + click suppression; tap e2e |
| Landscape 844×390 (cards taller than viewport) | content flows, page scrolls; add `landscape-390` project or manual QA gate |
| `swiper/css/pagination` import | global bullet styles; deck dots use custom classes (no `.swiper-pagination` conflict); removal of `effect-cards` verified dead in v11 |
| Leaflet in transformed card | renders fine (explore verified); `dragging={false}` removes gesture conflict |

## Migration

No data migration. Rollback = revert gate to single Swiper, delete deck, revert `layout.tsx`/`CurvedLoop.tsx`/`LocationButton.tsx`/`confirm/page.tsx`, drop `e2e/`. No deps/schema → zero data risk; desktop untouched.

## Open Questions

1. Landscape 844×390: dedicated Playwright project in scope, or manual QA only?
2. Single-slide guests: deck shows 1 card + 1 dot with spring-back swipe — acceptable, or hide deck chrome?
3. Confirm `after`-coords map fix stays deferred in this change (per proposal)?
