# Tasks: Flatten layout containers on /confirm

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~15 (5 files; 1-line class edits + 5 deleted CSS lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | F1-F4 + verification, one surface level on /confirm | PR 1 | class-only, 5 files, no logic |

## Phase 1: Core Implementation (class-only fixes)

- [x] 1.1 F1 — `src/app/[id]/confirm/page.tsx:42`: Card `variant="paper"` → `className="relative w-full max-w-3xl border-0"` (twMerge overrides base border; cream tint + AuroraBackdrop kept). Guard effect (`:20-24`), loading/error branches (`:26-32`), hook order byte-identical.
- [x] 1.2 F2 — `src/app/globals.css:9-13`: delete `padding-top: 50px` + `padding-bottom: 50px` from `.swiper`; keep `width: 100%`.
- [x] 1.3 F2 — `src/components/GuestInvitations.tsx:30`: `slideShadows: false`. Keep `rotate: 50`, `stretch: 0`, `depth: 100`, `modifier: 1`, `centeredSlides`, `slidesPerView={2}`, `grabCursor`, `pagination={true}`.
- [x] 1.4 F3 — `src/components/InvitationPersonalInfo.tsx:18`: drop `bg-gray-50 dark:bg-gray-800`; keep `role="alert"`, `p-4`, `text-sm`, `text-gray-800`, `rounded-lg`, `dark:text-gray-300`.
- [x] 1.5 F4 — `src/components/Footer.tsx:6`: drop `bg-white`; keep `border-t border-neutral-200` and all content/classes.

## Phase 2: Verification (static gates + manual browser)

- [x] 2.1 Static gates: `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
- [x] 2.2 Guard byte-identical: diff confirms only `className` on `page.tsx:42` changed; effect deps, `router.replace`, spinner/redirect branches untouched.
- [x] 2.3 Browser (dev server `localhost:3000`, confirmed guest): `/confirm` shows ONE card level — slide cards only, no nested double box, no `.swiper` void, no gray alert box, no white footer band.
- [x] 2.4 Browser: coverflow still swipes — side slides keep card shape + tilt, pagination advances, no shadow boxes behind neighbors.
- [x] 2.5 Browser: guard intact — loading spinner shows, unconfirmed redirects to `/[id]`, confirmed stays on `/confirm`.
- [x] 2.6 No regression on `[id]`, home, wishlist.
- [x] 2.7 Commit: single conventional commit `refactor(ui): flatten confirm layout to single card surface`; only the 5 source files staged, `openspec/` artifacts untracked.
