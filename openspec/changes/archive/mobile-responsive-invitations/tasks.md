# Tasks: Mobile-responsive guest invitations

## Task Breakdown

### Slice 1 — Foundation & config (pagination CSS, safe areas, e2e scaffolding)

1. **`layout.tsx` CSS + viewport** — swap dead `swiper/css/effect-cards` for `swiper/css/pagination`; add `viewport` export `{ viewportFit: 'cover' }`.
   - ✓ `tsc` clean; pagination CSS imported; no `effect-cards` import remains.
   - Files: `src/app/layout.tsx`. Deps: none. Est: 8 (+6/-2).

2. **`confirm/page.tsx` spacing** — `div.relative pt-56` → `pt-32 md:pt-56`; add `pb-[env(safe-area-inset-bottom)]` on the outer `motion.div`.
   - ✓ At 320px the top gap shrinks; `env()` bottom padding applied (design tokens K8).
   - Files: `src/app/[id]/confirm/page.tsx`. Deps: 1. Est: 4 (+3/-1).

3. **Playwright mobile projects** — add `webServer` (dev, `reuseExistingServer`) + projects: `desktop-chrome`, `pixel-7` (412×915, hasTouch), `iphone-12` (390×844, hasTouch), `narrow-320` (320×568, hasTouch) via `devices`.
   - ✓ `npx playwright test --list` shows 4 projects and discovers `e2e/*.spec.ts`.
   - Files: `playwright.config.ts`. Deps: none. Est: 40.

### Slice 2 — Component fixes (reduced motion, display-only map)

4. **`CurvedLoop` reduced-motion gate** — `useReducedMotion()`; when reduce, skip rAF loop and render static marquee text.
   - ✓ Ribbon static under `prefers-reduced-motion: reduce`; marquee behavior unchanged otherwise.
   - Files: `src/components/CurvedLoop.tsx`. Deps: none. Est: 8 (+6/-2).

5. **`LocationButton` map fixes** — coords missing → render fallback (map hidden, Maps button kept, NO "Cargando mapa" spinner); `MapContainer` gets `dragging={false} touchZoom={false} scrollWheelZoom={false} doubleClickZoom={false}`; wrapper `h-48` → `h-44 md:h-48`.
   - ✓ No infinite spinner without coords; map drag never pans (display-only); "Abrir en Maps" tap intact.
   - Files: `src/components/LocationButton.tsx`. Deps: none. Est: 18 (+12/-6).

### Slice 3 — Core deck (<640px)

6. **Create `src/components/mobile/InvitationDeck.tsx`** — props `{ slides: ReactNode[]; total: number; guestName: string }`; `motion.div drag="x"` axis-locked; `didDragRef` (8px threshold) + click suppression via `onClickCapture`; `useMotionValue(x)` + `useTransform` (top card rotate ±8°, behind stack `translateY(-8*i) scale(1-0.04*i)`); swipe end |x|>100 or vel>500 → `animate(x, ±600)` then `activeIndex++`/`x.set(0)`, else spring-back; 44px chevron buttons (aria-label "Anterior/Siguiente invitación", disabled at ends), `ArrowLeft/Right` keys, pill dots with `aria-current`, `role="region"` + `aria-label="Invitaciones de ${guestName}"`; reduced-motion → plain slide (no rotate/scale).
   - ✓ ≤3 stacked cards + dots; swipe mutates only `activeIndex`; no confirm/decline/redirect; vertical scroll untouched.
   - Files: `src/components/mobile/InvitationDeck.tsx` (new). Deps: 2. Est: 180.

7. **`GuestInvitations.tsx` viewport gate + shared renderer** — `matchMedia('(min-width: 640px)')` gate (useState+useEffect, `change` listener); extract private `renderSlide(gdg, index)` → `ReactNode[]` (same fork + JSON lookups as today); desktop path keeps EXACT current Swiper props (`:19-33` byte-identical); mobile returns `<InvitationDeck slides total={guestData.group.length} guestName={guestData.name}>`.
   - ✓ ≥640px coverflow identical (zero regression, desktop swiper never mounts on mobile); <640px deck only; one renderer = no content drift.
   - Files: `src/components/GuestInvitations.tsx`. Deps: 6. Est: 140 (+95/-45).

### Slice 4 — E2E verification

8. **Create `e2e/mobile-deck.spec.ts`** (runs on pixel-7/iphone-12/narrow-320 only): no horizontal scroll (`scrollWidth <= clientWidth`); deck + dots visible, dot count == slides; touch swipe advances active card AND URL/confirmation state unchanged; tap "Agendar en calendario" fires without advancing; swipe starting on map doesn't pan; CTAs visible, labeled, ≥44px at 320px; ArrowRight advances; vertical scroll still works.
   - ✓ All mobile scenarios (1,2,4,5,6,7,9) pass on all 3 projects.
   - Files: `e2e/mobile-deck.spec.ts` (new). Deps: 3, 5, 6, 7. Est: 145.

9. **Create `e2e/desktop-swiper.spec.ts`** (desktop-chrome only): coverflow swiper element present, neighbor slide visible, `.swiper-pagination` bullets visible (scenario 3).
   - ✓ Green on desktop-chrome; skipped on mobile projects.
   - Files: `e2e/desktop-swiper.spec.ts` (new). Deps: 1, 3, 7. Est: 40.

## Suggested Commit Order

1. `fix(layout): import swiper pagination css and viewport-fit=cover` (task 1)
2. `feat(confirm): responsive top padding and safe-area inset` (task 2)
3. `test(e2e): add mobile viewport projects to playwright config` (task 3)
4. `fix(curved-loop): gate marquee rAF with prefers-reduced-motion` (task 4)
5. `fix(location-button): display-only map and missing-coords fallback` (task 5)
6. `feat(deck): motion swipe deck for mobile invitations` (task 6)
7. `feat(invitations): viewport gate with shared slide renderer` (task 7)
8. `test(e2e): mobile invitation deck spec` (task 8)
9. `test(e2e): desktop swiper spec` (task 9)

`package.json` diff stays EMPTY — motion@12.43.0 + swiper@11.0.5 already installed.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~580 (range 520-600) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR (maintainer-approved size:exception) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

> Size:exception approved this session, so apply proceeds as ONE PR. Forecast exceeds the 400-line budget — reviewers should pace review per commit/slice (deck commit and e2e commits are the biggest chunks) rather than as one diff.

## Risks

- **Swipe vs vertical scroll**: `drag="x"` axis-lock; e2e asserts swipe-advance AND scroll still works (scenario 5).
- **Tap vs drag on CTAs**: 8px threshold + `onClickCapture` suppression; tap e2e covers calendar button (scenario 6).
- **Landscape 844×390**: no dedicated project (proposal scope) — manual QA gate; content flows, page scrolls vertically.
- **Single-slide guests**: deck keeps 1 card + 1 dot with spring-back (design default); confirm with PO if chrome should hide — decision deferred to apply.
- **`swiper/css/pagination` global bullets**: deck dots use custom classes (no `.swiper-pagination` conflict); `effect-cards` removal verified dead in v11.
- **Leaflet in transformed card**: render verified by explore; `dragging={false}` removes gesture conflict.
- **`next lint` on Next 14.0.3**: gate = lint passes, not zero-warning (Next 14 deprecation warnings expected).
- **Engram persistence**: `mem_save` unavailable this session — tasks persisted to filesystem only.

## Verification Plan

- `npx tsc --noEmit` — never `next build` (hard gate)
- `npm run lint`
- `npx playwright test --list` — confirms 4 projects + 2 specs
- `npx playwright test` — full suite (or per project: `--project=pixel-7`, `--project=iphone-12`, `--project=narrow-320`, `--project=desktop-chrome`)

---

**Total estimated changed lines: ~580 (additions + deletions across 9 tasks).**
