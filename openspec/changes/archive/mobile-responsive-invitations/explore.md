# Exploration: Mobile-responsive guest invitations

Product owner (ES): "Las invitaciones deben ser totalmente responsive con alta compatibilidad para teléfonos — los usuarios son mayormente mobile."

Status: read-only exploration; no code changed, no build run. Swiper math verified against installed swiper 11.0.5 (`node_modules`) and Tailwind 3.4.1 container defaults.

---

## Context

### Where the invitation cards render

- **Only one page renders the card deck**: `src/app/[id]/confirm/page.tsx` (confirmed guests). `GuestInvitations` is loaded via `dynamic(() => import("@/components/GuestInvitations"), { ssr: false })` (`page.tsx:15`) because swiper accesses `window` at module level and breaks SSR edge (comment at `:14`, runtime `edge` in `layout.tsx:24`).
- The confirm page composes: `motion.div` (overflow-x-clip, `:43`) → `Card variant="paper"` outer surface (`border-0 px-0`, flattened by `flatten-layout-containers`, commit `0f3582b`) → `div.relative pt-56` (`:49`) → `CurvedLoop` ribbon (`absolute -top-24 z-20 w-[120%] -translate-x-1/2`, `:56`) → `<GuestInvitations>` (`:59`) → `<Footer>`.
- `GuestInvitations` (`src/components/GuestInvitations.tsx`) maps `guestData.group[]` (strings, e.g. `"family"`, `"work"`) to slides: family/work entries → `Card paper` + `InvitationInfo`; anything else → `Card default` + `InvitationPersonalInfo` (static placeholder copy, `InvitationPersonalInfo.tsx:15-16`).
- `src/app/[id]/page.tsx` renders the *pre-confirm* invitation (`Invitation` + `CardRenderer`/`Card elevated max-w-2xl`) — NOT the swiper. No mobile blockers found there beyond what's below (max-w-2xl cards, no overflow).

### The swiper configuration (current, exact)

`GuestInvitations.tsx:19-33`:

```tsx
<Swiper className="my-4" effect="coverflow" grabCursor centeredSlides
        slidesPerView={2}
        coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: false }}
        pagination modules={[EffectCoverflow, Pagination]}>
```

No `breakpoints` prop. No `spaceBetween` (defaults 0). No `height`/`autoHeight` (slides auto-size to content).

### Card content

- `InvitationInfo.tsx`: h2 `text-2xl md:text-3xl` display title; description `<p>` (base 16px); food `Badge`s (text-xs) when `food` present (family only); full-width `Button` "Agendar en calendario" (secondary, `FaCalendar` icon); `LocationButton` (map `h-48` + full-width "Abrir en Maps" primary).
- `LocationButton.tsx`: react-leaflet `MapContainer` 192px tall, OSM tiles, custom SVG-pin `divIcon` (icon policy compliant), UA-sniffed deep link for Google Maps (mobile → `google.com/maps/dir/?api=1`, desktop → `google.com/maps?q=`).
- Content data: `src/data/__familyInvitation.json` ("Almuerzo Familiar" + 5-item food list) and `src/data/__workInvitation.json` ("3fter Labor3l", no food).

### Slide-width math (verified)

Container: `main class="container mx-auto px-6 md:px-8"` (`layout.tsx:34`); Tailwind 3.4.1 default container max-widths (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536). Outer card is `w-full` inside it; swiper = card width.

| Viewport | Container content | Slide (÷2) | Card inner (p-6 ×2) | Coverflow side-slide projected (×cos50°≈0.643) |
|---|---|---|---|---|
| 375px (iPhone SE) | 327px | **163px** | **115px** | ~105px |
| 768px (iPad mini) | 704px | 352px | 304px | ~226px |
| 1440px (desktop) | 1216px | 608px | 560px | ~391px |

At 375px the card content column is **~115px** — narrower than one word of the 24px display title. Consequence: "Almuerzo Familiar" wraps to ~3 lines, the description (95+ chars, 16px) wraps to 5+ lines, the 5 food badges stack vertically, and the full-width buttons truncate to "Agendar en calenda…" (the `truncate` span in `Button.tsx:76`). Personal card `RequirementList` (`divide-x` 2-column flex) collapses to ~50px columns.

### Related infra verified

- Swiper installed: `11.0.5` (package-lock `node_modules/swiper`). `swiper/css/effect-coverflow` resolves to an **empty** stylesheet in v11 (coverflow is fully inline transforms; core `swiper.css` already ships `.swiper-3d` perspective 1200px + preserve-3d).
- Tailwind installed: `3.4.1`.
- Design tokens: `openspec/specs/design-tokens/spec.md` — body MUST be ≥16px, cards=xl radius, `prefers-reduced-motion: reduce` MUST disable non-essential animation (`:76`).
- Guard spec: `openspec/specs/confirm-guard/spec.md:72` — confirmed path "MUST render exactly as today … GuestInvitations … zero behavior change" (already drifted re: BlurTextTitle which flatten removed; visual changes to the swiper will need a spec update).
- Playwright: `playwright.config.ts` exists (`testDir: './e2e'`), but **the `e2e/` directory does not exist** (`Test-Path` false). `test-results/.last-run.json` = `{"status":"failed","failedTests":[]}` (stale). `E2E_TEST_SCENARIOS.md` covers only confirm-guard behavior — **zero mobile-viewport test coverage**.

---

## Findings

1. **`slidesPerView={2}` is hardcoded — no responsive logic.** `GuestInvitations.tsx:24` with no `breakpoints` prop. At 375px this yields ~163px slides / ~115px content columns (math above) — titles wrap 3 lines, CTAs truncate, badges stack, the map is 163×192px. This is the core mobile breakage. (Evidence: `GuestInvitations.tsx:19-33`, `layout.tsx:34`, Tailwind container defaults.)

2. **Coverflow `rotate: 50, depth: 100` amplifies the problem on small screens.** Side slides project to ~105px at 375px and are tilted 50° — the neighbor card is an unreadable sliver. With 1–2 slides per guest (typical: `guests.json` groups are `["family"]`, `["work"]`, or `["family","work"]`), both slides are visible simultaneously at 375px: two cramped, tilted cards with no real swipe affordance. The coverflow identity works at desktop (608px slides) and degrades monotonically as viewport shrinks. (Evidence: `GuestInvitations.tsx:25-31`, `guests.json`.)

3. **Swiper pagination is invisible: `swiper/css/pagination` is never imported.** `layout.tsx:4-5` imports only `swiper/css` and `swiper/css/effect-cards`. Verified `node_modules/swiper/swiper.css` contains **0** `swiper-pagination` rules; the bullets module ships separately (`modules/pagination.css`, 8px bullets). Result: the `pagination={true}` DOM renders but bullets are zero-size unstyled spans — invisible on every device, and mobile users get no progress indicator. (Evidence: `layout.tsx:4-5`, grep of `swiper.css`, `swiper/package.json` exports.) Related: `effect-cards` CSS is imported but coverflow is used — dead CSS (coverflow needs none in v11; `effect-coverflow.css` is empty).

4. **The react-leaflet map traps swipes on touch.** `LocationButton.tsx:48-58`: Leaflet `dragging` defaults to true on touch devices, so a horizontal drag that starts on the map pans the map instead of advancing the swiper — a known nested-gesture trap, and the map sits mid-card so it covers the swipe lane. The map is display-only (the real action is "Abrir en Maps", `:23-30`). Also `LocationButton` shows an **infinite** `LoadingSpinner` ("Cargando mapa") when `_lat/_long` are missing (`:19-21`) — possible for admin-assigned guests with no `lunch` coordinate. Map height is fixed `h-48` (192px) — tallest block in the card.

5. **No safe-area handling.** Zero matches for `viewport`/`themeColor`/`safe-area`/`env(` in app code. Next.js 14 default viewport meta is `width=device-width, initial-scale=1` — no `viewport-fit=cover`, so on notched iPhones (landscape especially) content can sit under the home indicator / notch; the bottom "Abrir en Maps" button and Footer get no inset. (Evidence: grep of `src/app`, `layout.tsx` has no `viewport`/`themeColor` export.)

6. **`CurvedLoop` marquee ignores reduced-motion.** The `requestAnimationFrame` loop at `CurvedLoop.tsx:60-78` runs unconditionally (only `interactive` drag is gated). Violates design-tokens spec `:76` ("prefers-reduced-motion: reduce MUST disable non-essential animation"). The page-level entrance (`page.tsx:21,41`) and `AuroraBackdrop`/`CardRenderer` are correctly gated; the ribbon is the exception. It is also the only continuously-moving element on the confirm page.

7. **Typography and touch targets are mostly compliant — except inside the 115px column.** Body text is 16px (`text-base`), titles 24–30px, `Button` min-heights are 44/48/56px with `active:scale-95` press feedback and 150–300ms transitions (`Button.tsx:29-33,52`). But at 375px the full-width CTAs collapse to ~115px and their labels truncate; `Badge` is `text-xs` 12px (decorative only — acceptable per icon/emoji policy but unreadable as chip content at 375px). No emoji-as-icon violations; all interactive icons are SVG (`react-icons/fa6`, leaflet `divIcon` SVG pin).

8. **No page-level horizontal overflow, but the layout is fragile at edges.** Confirm page uses `overflow-x-clip` (`page.tsx:43`) and the ribbon `w-[120%]` (`:56`) is clipped safely at 375px (392px ribbon vs 327px card, ~32px overhang each side into the 24px gutter). The `pt-56` (224px) reserved for the ribbon is the same on a 320px phone as on desktop — wasteful vertical space on small screens, and in landscape (e.g., 844×390) the card (map + CTAs ≈ 700px+ tall) forces heavy vertical scrolling with no `max-h`/nested-scroll containment (which is otherwise correct — content flows, no nested scroll regions).

9. **CLS is managed.** Loading spinner gates render until Firestore resolves (`page.tsx:29-31`), so the client-only swiper mount doesn't shift layout. Swiper has no fixed height; cards auto-size (fine on portrait, tall on landscape — see 8).

10. **Zero mobile test coverage exists.** `playwright.config.ts` points at a non-existent `./e2e`; no viewport projects (`desktop-chrome` default only), no `.spec.ts` files anywhere. Any mobile QA today is manual. `E2E_TEST_SCENARIOS.md` documents confirm-guard scenarios only.

11. **Data observation (adjacent, not mobile):** `GuestInvitations.tsx:51-52` passes `guestData.lunch._lat/_long` to **both** family and work slides, though `Guest` also carries `after?` coordinates (`types/Guest.ts:6`). If the after-party is elsewhere, the work card shows the lunch map — the map is also the tallest mobile element, so pinning the right coordinates matters for vertical budget.

---

## Options

### Option A — Responsive Swiper config only (minimal)

Add a `breakpoints` prop to the existing Swiper and retune coverflow per viewport; keep the current component structure.

- Mobile (<640): `slidesPerView: 1.15–1.25`, `rotate: 30`, `depth: 60–80`, `spaceBetween: 8–12` → one readable centered card with a small peek of the next.
- Tablet (640–1024): `slidesPerView: 1.5`, moderate rotate.
- Desktop (≥1024): keep today's `2 / 50 / 100` exactly.

| Pros | Cons | Complexity |
|---|---|---|
| Small diff (1 component + 1 CSS import) | Doesn't fix map swipe-trap, safe areas, reduced-motion ribbon, or pagination visuals | **Low** |
| Preserves coverflow identity on desktop 100% | At <375px (small Androids) even 1.25× ≈ 260px cards still feel tight | |
| Follows swiper's supported, documented API | | |

### Option B — Mobile-first responsive package (recommended)

Option A **plus** the mobile UX fixes:

1. `breakpoints` as in A (mobile 1.15–1.25 / tablet 1.5 / desktop 2 with today's coverflow params).
2. Import `swiper/css/pagination`; drop the dead `swiper/css/effect-cards` import (`layout.tsx:4-5`).
3. `LocationButton`: `dragging={!L.Browser.mobile}` (or `touchZoom` off + tap-to-interact pattern) so the map never eats swipes; hide the infinite spinner by only rendering the map when coords exist (fallback: hide map, keep "Abrir en Maps" button). Optionally `h-44` on mobile.
4. Safe areas: add `viewport`/`themeColor` exports in `layout.tsx` (`viewport-fit: cover`) and `env(safe-area-inset-*)` padding on the confirm page bottom / Footer.
5. Gate `CurvedLoop`'s rAF loop with `useReducedMotion` (or `prefers-reduced-motion` CSS) — spec compliance.
6. Optionally tighten mobile vertical budget: reduce `pt-56` responsively (`pt-32 md:pt-56`) since the ribbon overhang is constant but the phone needs the space.

| Pros | Cons | Complexity |
|---|---|---|
| Directly answers "totalmente responsive, alta compatibilidad móvil" | Touches ~6 files + globals.css | **Medium** |
| Fixes real bugs found (invisible pagination, swipe trap, safe areas, reduced motion) | Slightly larger review surface (still well under 400 lines) | |
| Desktop visual unchanged | | |

### Option C — Stack cards on mobile, keep swiper on desktop

Breakpoint-gate the component: `<640px` render the slides as a vertical stack (plain divs, same `Card` content), `≥640px` keep the swiper/coverflow untouched.

| Pros | Cons | Complexity |
|---|---|---|
| Maximum readability — no swipe affordance or rotation at all on phones | Loses the "card deck" interaction that defines the page | **Medium-High** |
| Side-steps coverflow-on-tiny-screens entirely | Two render paths to maintain + a `matchMedia`/resize bridge (client-only) | |
| | Conflicts most with the "zero behavior change" spirit of confirm-guard spec | |

---

## Recommendation

**Option B — the mobile-first responsive package.** It is the only option that fully answers the PO statement ("totalmente responsive con alta compatibilidad para teléfonos") while keeping the confirmed-path page's identity intact on desktop. A alone fixes slide width but ships a swiper whose pagination dots are invisible, whose map eats swipes, whose ribbon ignores reduced-motion, and that ignores safe areas — that's not "alta compatibilidad". C is a defensible fallback if the PO decides phones should read cards like an email rather than swipe them; keep it in the back pocket, don't default to it.

Suggested defaults to validate (proposal/spec phase should confirm with PO):
- `breakpoints`: `0: { slidesPerView: 1.2, spaceBetween: 10 }`, `480: { slidesPerView: 1.35 }`, `640: { slidesPerView: 1.5 }`, `1024: { slidesPerView: 2, spaceBetween: 0 }`, with coverflow `rotate/depth` scaled per breakpoint (mobile ~30/70, desktop 50/100).
- Keep `centeredSlides`, `grabCursor`, `pagination` (now visible), `slideShadows: false`.
- Update `openspec/specs/confirm-guard/spec.md:72` — it requires the confirmed path render with "zero behavior change"; a swiper config change is visual only, but the spec must acknowledge it (it already drifted re: BlurTextTitle).
- Add Playwright mobile projects (`Pixel 7` 412×915, `iPhone 12` 390×844, plus a 320px device) with overflow/swipe/CTA-visibility assertions — the repo currently has zero e2e coverage and the `e2e/` dir doesn't even exist.

## Risks

- **Spec constraint**: `confirm-guard` main spec (line 72) requires the confirmed path to render "exactly as today … zero behavior change". Changing `slidesPerView`/coverflow on mobile is a visual change → must be spec'd explicitly in the delta spec or the verify phase will flag it.
- **Coverflow retuning is fiddly**: rotate/depth/modifier interact; the peek size on 320px Androids may still be tight — needs real-device QA (the 163px math shows how fast this degrades).
- **Leaflet in a transformed ancestor**: side slides get 3D transforms; if we keep coverflow on tablet widths where the map is inside a rotated slide, leaflet tiles render fine (verified pattern) but the drag conflict remains — reason #3 above is mandatory, not optional.
- **Dynamic import already in place**: swiper is client-only (`ssr:false`), so breakpoints logic has no SSR cost; do NOT move swiper back to SSR.
- **No test harness to lean on**: everything above is verified by code-reading + installed-package inspection, not by browser run; the apply phase should add the Playwright mobile projects first (they're the cheapest regression net for exactly this change).

## Affected areas (anticipated, for the proposal)

- `src/components/GuestInvitations.tsx` — breakpoints, per-breakpoint coverflow params, spaceBetween.
- `src/app/layout.tsx` — swiper CSS imports (add pagination, drop effect-cards), `viewport`/`themeColor` exports.
- `src/components/LocationButton.tsx` — mobile drag handling, missing-coords fallback, responsive map height.
- `src/components/CurvedLoop.tsx` — reduced-motion gate.
- `src/app/[id]/confirm/page.tsx` — responsive `pt-56`, safe-area bottom padding.
- `playwright.config.ts` + new `e2e/` — mobile viewport projects + swiper/map smoke tests.
- `openspec/specs/confirm-guard/spec.md` — acknowledge swiper visual change.

## Open questions (for PO / orchestrator)

1. On phones, should the deck stay a swipeable carousel with a peek of the next card (Options A/B), or should cards stack vertically like an email (Option C)? This is the main product decision.
2. Minimum supported phone: 375px (iPhone SE/12) only, or also 320px small Androids? Sets the `slidesPerView` floor.
3. Restore the pagination dots as the mobile navigation hint, or drop them in favor of the peek? (Currently invisible — a bug either way.)
4. Does the work slide need the `after` coordinates instead of `lunch` for its map? (Wrong-map today; the map is the tallest mobile element.)
5. OK to relax the confirm-guard "zero behavior change" wording to permit visual/mobile-responsive changes to the confirmed path?
