# mobile-invitation-deck Specification

## Purpose

Below 640px the confirmed-guest invitation cards render as a stacked, swipeable deck that navigates between cards without ever confirming or declining. This spec covers the deck, mobile readability, touch handling, pagination, map fallbacks, safe areas, reduced motion, and the Playwright mobile coverage that proves them. Desktop (≥640px) keeps the existing Swiper coverflow unchanged.

## Requirements

### Requirement: 1. Mobile deck rendering

Below 640px the confirm page MUST render the guest cards as a stacked deck (motion/react): up to 3 stacked cards, top card tilting up to ±8° on drag. The deck MUST NOT render at ≥640px.

### Requirement: 2. Swipe navigates only

A horizontal swipe MUST navigate between cards only. It MUST NOT confirm, decline, or trigger any other action. Acceptance MUST stay exclusively in the pre-confirm flow (`[id]/page.tsx`); the deck MUST NOT add decision buttons or a second confirmation path.

### Requirement: 3. Desktop swiper preserved

At ≥640px the existing coverflow Swiper (`slidesPerView=2`, `rotate=50`, `depth=100`) MUST render unchanged in visuals and behavior — zero regression.

### Requirement: 4. Mobile readability

At 375px wide (floor 320px) cards MUST be full-width, with body text ≥16px, touch targets ≥44×44px, no horizontal scroll, and fully visible (non-truncated) CTA labels. Card height MAY grow and the page MAY scroll vertically.

### Requirement: 5. Pagination visible

The deck MUST show visible pagination dots; `swiper/css/pagination` MUST be imported so desktop swiper bullets are visible too.

### Requirement: 6. Map display-only

The embedded map MUST be display-only on touch: dragging MUST be disabled so horizontal swipes are never trapped, while the "Abrir en Maps" button keeps working on tap.

### Requirement: 7. Missing-coords fallback

When a guest has no coordinates, the map MUST NOT render an infinite "Cargando mapa" spinner; a fallback (map hidden, Maps button kept) MUST render instead.

### Requirement: 8. Safe areas

The page MUST use `viewport-fit=cover` plus `env(safe-area-inset-*)` padding so content clears notches and home indicators.

### Requirement: 9. Reduced motion

Under `prefers-reduced-motion: reduce`, the deck MUST animate as a plain slide (no rotation/spring) and the CurvedLoop ribbon MUST be static.

### Requirement: 10. E2E coverage

Playwright MUST add mobile viewport projects (Pixel 7, iPhone 12, 320px) asserting: deck renders, swipe navigates, desktop shows the swiper, no horizontal scroll, and card-button taps work.

## Scenarios

Scenarios map 1:1 to Requirements 1-10.

### Scenario 1: Mobile deck renders stacked cards

- GIVEN a confirmed guest at <640px
- WHEN the page renders
- THEN up to 3 stacked cards plus pagination dots appear
- AND the top card tilts up to ±8° while dragging

### Scenario 2: Swipe navigates but does not confirm

- GIVEN 2+ cards at <640px
- WHEN the user swipes past the threshold
- THEN the top card animates off and the next becomes active
- AND no confirm/decline state changes and no redirect fires

### Scenario 3: Desktop swiper preserved

- GIVEN a confirmed guest at ≥640px
- WHEN the page renders
- THEN the coverflow matches the pre-change version
- AND pagination bullets are now visible

### Scenario 4: Readability at 375px

- GIVEN a 375px viewport showing a family card
- WHEN it renders
- THEN body text is ≥16px, targets are ≥44×44px, and CTA labels are fully visible

### Scenario 5: No horizontal scroll

- GIVEN viewports of 320px and 375px
- WHEN page and cards render
- THEN no element exceeds the viewport width
- AND vertical scrolling still works

### Scenario 6: Map does not trap swipe

- GIVEN a swipe that starts on the map at <640px
- WHEN the user drags horizontally
- THEN the deck navigates and the map does not pan

### Scenario 7: Missing-coords fallback

- GIVEN a guest with no coordinates
- WHEN the card renders
- THEN no spinner appears and the fallback with the Maps button shows

### Scenario 8: Reduced motion

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the deck and ribbon render
- THEN cards slide without rotation and the ribbon is static

### Scenario 9: Pagination visible

- GIVEN any viewport
- WHEN the deck or swiper renders
- THEN dots are visible and the active one is distinct

### Scenario 10: E2E coverage

- GIVEN Playwright mobile projects (Pixel 7, iPhone 12, 320px)
- WHEN the suite runs
- THEN deck-exists, swipe-navigates, desktop-swiper, no-horizontal-scroll, and tap assertions all pass

## Non-Goals

- No confirmation-logic changes, second confirm path, or decision buttons on deck cards
- No auth changes; no data-model or `guests.json` changes
- No new npm dependencies (`package.json` diff stays empty)
- No map-coordinate logic changes (per-guest lunch/after coords are correct)
- No desktop visual changes

## Out of Scope

- Work-slide `after`-coords switch (deferred)
- `[id]/page.tsx` (pre-confirm) behavior changes
- Unit test runner / strict TDD (not active)
- Copy changes; admin-dashboard, event-date, and other domains
