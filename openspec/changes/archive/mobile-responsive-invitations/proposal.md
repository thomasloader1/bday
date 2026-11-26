# Proposal: Mobile-responsive guest invitations

## Intent

PO: invitations must be "totalmente responsive"; users are mostly mobile. Current deck (swiper coverflow, `slidesPerView=2`, no breakpoints) collapses to ~163px slides at 375px: titles wrap, CTAs truncate, badges stack. Pagination invisible; map traps swipes; ribbon ignores reduced-motion; no safe areas.

## Scope

### In Scope
- Mobile <640px: stacked Tinder-style deck; horizontal swipe navigates only, never confirms.
- Desktop 640px+: coverflow unchanged (zero regression).
- Readability 320-375px: full-width cards, body 16px+, targets 44px+, no truncated CTAs.
- Visible pagination (import `swiper/css/pagination`; drop dead `effect-cards` import).
- Map: touch drag-off (display-only); missing-coords fallback (no spinner loop).
- Safe areas (`viewport-fit=cover` + `env()` insets); reduced-motion gates (ribbon, deck rotation).
- Playwright mobile projects + new `e2e/` smoke specs; `confirm-guard` delta.

### Out of Scope
- No confirmation-logic changes; no second confirm path; no new card buttons.
- No auth/data-model changes; no new deps (`package.json` empty diff).
- No desktop redesign; work-slide `after`-coords fix deferred.

## Capabilities

> Contract for sdd-spec.

### New Capabilities
- `mobile-invitation-deck`: mobile deck navigation, card readability, touch handling, safe areas.

### Modified Capabilities
- `confirm-guard`: "zero behavior change" becomes desktop-identical; mobile renders the deck (delta spec).

## Approach

Options: (1) motion/react hand-rolled deck: `drag="x"`, `useTransform` rotate, spring-back, off-screen animate; zero deps, full control. (2) swiper custom effect: no stable v11 API; rejected. (3) Hybrid (recommended): swiper/coverflow 640px+ untouched; motion deck under 640px behind `matchMedia` gate (component already `ssr:false`); shared slide renderer.

Deck: up to 3 stacked cards (`y=12*i`, `scale 1-0.05*i`, top rotate to +-8 deg); threshold ~100px / velocity 500; arrows, visible dots, aria-labels; reduced-motion: plain slide; axis-locked `x` keeps vertical scroll. Map: `dragging={false}` on touch; render only with coords; `h-44 md:h-48`. `layout.tsx`: `viewport` export + pagination CSS; `CurvedLoop`: gate rAF; confirm page: `pt-32 md:pt-56` + safe-area padding. e2e: Pixel 7 / iPhone 12 / 320px: no h-scroll, swipe nav, CTAs visible, map no-pan.

## Affected Areas

| Area | Change |
|------|--------|
| `src/components/GuestInvitations.tsx` | Modified: swiper/deck gate |
| `src/components/GuestInvitationsDeck.tsx` | New: motion deck |
| `src/components/LocationButton.tsx` | Modified: drag-off, coords fallback, `h-44 md:h-48` |
| `src/components/CurvedLoop.tsx` | Modified: reduced-motion gate |
| `src/app/layout.tsx` | Modified: pagination CSS, drop effect-cards, `viewport` |
| `src/app/[id]/confirm/page.tsx` | Modified: `pt-32 md:pt-56`, safe-area padding |
| `openspec/specs/confirm-guard/spec.md` | Modified: delta spec |
| `playwright.config.ts` + `e2e/` | New: mobile projects, smoke specs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Swipe vs vertical scroll | Med | `drag="x"` axis lock; e2e assert |
| Tall cards, landscape | Med | content flows; test 320x568, 844x390 |
| Leaflet gesture trap | Med | `dragging={false}` on touch |
| Leaflet in transformed card | Low | tiles render fine (verified) |
| Tap vs drag on buttons | Med | drag only after movement; tap test |
| `confirm-guard` verify flag | Med | delta spec in this change |
| Reduced-motion drift | Low | `useReducedMotion` (tokens `:76`) |

## Rollback Plan

Revert `GuestInvitations.tsx` to single Swiper; delete deck; revert `layout.tsx`, `CurvedLoop.tsx`, `LocationButton.tsx`, `confirm/page.tsx`; drop `e2e/` specs. No deps/schema: zero data risk; desktop unaffected.

## Dependencies

None new (hard gate): `motion@^12.43.0` + `swiper@^11.0.5` installed.

## Success Criteria

- [ ] `package.json` diff empty
- [ ] 320-375px: no horizontal scroll; CTAs labeled; body 16px+; targets 44px+
- [ ] Swipe navigates only; calendar/maps fire on tap, never on swipe
- [ ] 640px+ identical to today (screenshot compare)
- [ ] Dots visible; map no-pan; no "Cargando mapa" loop
- [ ] Reduced-motion: ribbon static, deck unrotated
- [ ] Playwright mobile projects green

## Open Questions

1. Card-footer confirm/decline buttons: cards today carry only calendar/maps CTAs (acceptance lives pre-confirm). Add, or keep deck informational-only?
2. Work-slide map: switch `lunch` to `after` coords in this change or defer?
3. Single-slide guests: one card + dots without swipe affordance, acceptable?
