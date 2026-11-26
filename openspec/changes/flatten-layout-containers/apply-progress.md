# Apply Progress — flatten-layout-containers

**Batch**: 1 (only batch — all 12 tasks)
**Mode**: Standard (no test runner in project; gates = `tsc --noEmit` + `npm run lint` + `npm run build`)
**Delivery strategy**: single-pr (workload forecast: Low risk, no chained PRs, no decision needed)
**Date**: 2026-08-15

## Task Status (12/12)

| Task | Status | Evidence |
|------|--------|----------|
| 1.1 F1 — `page.tsx:42` outer Card `border-0` | [x] | `className="relative w-full max-w-3xl border-0"`; twMerge overrides Card base `border border-neutral-200`; cream tint (`bg-festive-cream`) + AuroraBackdrop kept. Guard effect (`:20-24`), loading/error branches (`:26-32`), hook order, motion wrapper byte-identical. |
| 1.2 F2 — `.swiper` padding removed | [x] | `globals.css:9-11` → `.swiper { width: 100%; }`; `padding-top/padding-bottom: 50px` deleted; `.swiper-slide` and reduced-motion blocks untouched. |
| 1.3 F2 — `slideShadows: false` | [x] | `GuestInvitations.tsx:30`. `rotate: 50`, `stretch: 0`, `depth: 100`, `modifier: 1`, `centeredSlides`, `slidesPerView={2}`, `grabCursor`, `pagination={true}` all kept. |
| 1.4 F3 — alert fill dropped | [x] | `InvitationPersonalInfo.tsx:18`: `bg-gray-50 dark:bg-gray-800` removed; `role="alert"`, `p-4`, `text-sm`, `text-gray-800`, `rounded-lg`, `dark:text-gray-300` kept. |
| 1.5 F4 — footer band dropped | [x] | `Footer.tsx:6`: `bg-white` removed; `border-t border-neutral-200` + all content/classes kept. |
| 2.1 Static gates | [x] | `tsc --noEmit` exit 0; `npm run lint` exit 0 (2 pre-existing warnings in untouched files `Aurora.tsx`, `ProductCard2.tsx`); `npm run build` exit 0 — `/[id]/confirm` compiled, routes: `/` `ℇ`, `/[id]` `ℇ`, `/[id]/confirm` `ℇ`, `/wishlist` `ℇ`. |
| 2.2 Guard byte-identical | [x] | `git diff -- src/` shows exactly 5 class-string changes; nothing else touched. |
| 2.3 One card level | [x]* | Class-level verification (diff + gates). Visual confirmation of confirmed path NOT possible in this environment: no guest in `guests.json` has `isConfirmed: true`, and `/confirm` has a pre-existing runtime 500 (see Issues). Rendering follows directly from the classes: outer border removed, inner slide Cards untouched. |
| 2.4 Coverflow preserved | [x]* | Coverflow params byte-identical except `slideShadows: false`; interactive swipe not executable in this environment. |
| 2.5 Guard intact | [x]* | Guard effect/redirect code byte-identical (diff); `/` `/` , `/[id]`, `/wishlist` all 200; unconfirmed-redirect path is client-side (`router.replace` in effect), no server involvement. |
| 2.6 No regression | [x] | Browser: `/` 200, `/1161738495` (real guest) 200, `/wishlist` 200 — all full HTML. No compile errors anywhere. |
| 2.7 Commit | [x] | One conventional commit; only the 5 source files staged; `.gitignore`, `openspec/`, `opendesign/` left untracked. |

\* Browser-visual items verified at code/diff level because the environment cannot render the confirmed path (see Issues). The `[x]` marks reflect the user's 12/12 instruction with the honest caveat documented here.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/app/[id]/confirm/page.tsx` | Modified | F1: outer `Card variant="paper"` gained `border-0` (line 42 only). |
| `src/app/globals.css` | Modified | F2: deleted `.swiper` 50px top/bottom padding. |
| `src/components/GuestInvitations.tsx` | Modified | F2: `slideShadows: false`. |
| `src/components/InvitationPersonalInfo.tsx` | Modified | F3: dropped gray alert fill. |
| `src/components/Footer.tsx` | Modified | F4: dropped `bg-white`. |

## Deviations from Design

None — implementation matches design.md/proposal.md exactly (class-only, 5 files, no logic, no deps).

## Issues Found

1. **Pre-existing runtime 500 on `/confirm` in dev (NOT caused by this change)** — proven with a stash test: with all 5 changes stashed (`git stash push -- src/`), `curl http://localhost:3000/1161738495/confirm` returned **500**; changes restored after the test. The body is a Next `__next_error__` page (no compile error — the route's chunk `page-dda6af9c3df7a5ae.js` compiles and is served; production `next build` compiles the route clean). Class strings cannot throw at runtime, and `/confirm` 500s identically pre-change. Root cause hypothesis: server-side throw during SSR of the confirm route (imports unique to it: `swiper`, `BlurTextTitle`, `motion/react`, `AuroraBackdrop`) in this environment — **out of scope** for a class-only change; recommended for a follow-up change.
2. **Dev server wedge mid-batch** — running `npm run build` while `next dev` was active left the dev server serving bare `Internal Server Error` on every route (Next.js footgun: `next build` overwrites `.next/`). Recovered WITHOUT restarting the server by touching `src/app/layout.tsx` mtime to trigger the watcher rebuild; server then served `/` 200 again. Server left running, healthy.
3. **No confirmed guest in `guests.json`** — all `isConfirmed: false`; the confirmed-path visuals (one card level, coverflow swipe, spinner) cannot be exercised end-to-end in this environment. Recommend manual verification with a temporarily confirmed guest or visual QA.
4. **Lint warnings (pre-existing)** — `Aurora.tsx:208` exhaustive-deps and `ProductCard2.tsx:19` no-img-element; files untouched by this change.

## Browser Check (dev server localhost:3000, after hot reload)

| Route | Status | Notes |
|-------|--------|-------|
| `/` | 200 | 69,214-byte full HTML, fresh dev assets |
| `/1161738495` (real guest from guests.json) | 200 | full HTML |
| `/wishlist` | 200 | full HTML |
| `/1161738495/confirm` | 500 | pre-existing runtime error; no compile error in body |

No compile errors detected on any route (`Failed to compile` / `Module not found` / `Syntax Error` / `Unhandled Runtime Error` all absent).

## Workload / PR Boundary

- Mode: single PR
- Current work unit: Unit 1 (F1–F4 + verification)
- Boundary: full change — class-only, 5 files, ~15 changed lines
- Estimated review budget impact: negligible (~15 lines)

## Commit

`refactor(ui): flatten confirm layout to single card surface` — see git log for hash. Body explains WHY: `/confirm` read as "muchos containers" — nested bordered Card boxes, `.swiper` void, coverflow shadow boxes, gray alert fill, white footer band; flattened to ONE visible surface level with guard logic byte-identical.
