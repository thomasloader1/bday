# Proposal: Flatten layout containers on /confirm

## Intent

User report (ES): confirm reads as "muchos containers". Root cause: commit `4fe4335` mapped both the outer confirm surface and the swiper slides to `Card`, which bakes `border + rounded-xl + p-6` into every variant: two nested bordered boxes, plus a gray alert and a white footer band. Goal: ONE visible surface level, guard behavior byte-identical.

## Scope

### In Scope
- **F1 (CRITICAL)** flatten outer surface: `[id]/confirm/page.tsx:42` → `Card variant="paper" className="relative w-full max-w-3xl border-0"`. twMerge overrides base border; cream tint + Aurora kept. Slide Cards untouched.
- **F2 (CRITICAL)** deflate the void: remove `.swiper` 50px top/bottom padding (`globals.css:9-13`); `slideShadows: false` (`GuestInvitations.tsx:30`) removes phantom boxes behind neighbors. Keep coverflow params + pagination.
- **F3 (WARNING)** `InvitationPersonalInfo.tsx:18`: drop `bg-gray-50 dark:bg-gray-800` fill, keep `role="alert"` + text classes.
- **F4 (SUGGESTION)** `Footer.tsx:6`: drop `bg-white`, keep `border-t border-neutral-200`.

### Out of Scope
- Guard logic / hook order / confirmed-path JSX (byte-identical)
- F1-A (flatten inner slides: kills coverflow affordance)
- `[id]`, home, wishlist, `layout.tsx`, BackgroundLayer, glow blobs
- Card primitive refactor / ProductCard2 `p-0` hygiene (F5: opt-out already exists)

## Capabilities

> Contract for sdd-spec. Researched `openspec/specs/`.

### New Capabilities
None

### Modified Capabilities
- `confirm-guard`: Req 3 (Confirmed path preserved) changes: confirmed path now renders outer surface borderless; rest unchanged. Reqs 1-2, 4-6 unchanged.

## Approach

F1-B + F2 + F3 + F4: class-only, 5 files, no logic, no deps. Delta spec isolates the carve-out; effect, hook order, and returns stay untouched.

## Affected Areas

- `src/app/[id]/confirm/page.tsx` — :42 add `border-0` (F1)
- `src/app/globals.css` — :9-13 delete `.swiper` padding (F2)
- `src/components/GuestInvitations.tsx` — :30 `slideShadows: false` (F2)
- `src/components/InvitationPersonalInfo.tsx` — :18 drop gray fill (F3)
- `src/components/Footer.tsx` — :6 drop `bg-white` (F4)

## Risks

- **Coverflow reads flatter** (Med): depth via rotate/centeredSlides; verify in browser
- **Cream panel loses frame identity** (Low): Aurora + cream tint retained
- **confirm-guard spec contradiction** (High): delta spec carves out Req 3 visual change only
- **Alert prominence drops** (Low): `role="alert"` + contrast kept

## Rollback Plan

`git checkout` the 5 files (class-only; restores exact prior visuals). No data/logic migration. Each F independently revertible.

## Dependencies

None.

## Success Criteria

- [ ] /confirm shows ONE surface level: slide cards only, no nested double box
- [ ] Coverflow affordance preserved; side slides still read as cards
- [ ] No visual regression on `[id]` / wishlist
- [ ] Guard unchanged: spinner, redirect, confirmed JSX semantics
- [ ] `role="alert"` kept; contrast intact
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` pass (no test runner)
- [ ] Browser check on localhost:3000
- [ ] Artifacts stay untracked in git
