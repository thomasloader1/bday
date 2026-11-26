# Apply Progress: Fix /confirm access guard

**Change**: fix-confirm-guard
**Batch**: 1 (first and only batch — all 5 tasks)
**Mode**: Standard (no test runner in repo; strict_tdd not configured — `openspec/config.yaml` absent)
**Date**: 2026-08-15

## Tasks Completed

### Phase 1: Core Implementation

- [x] 1.1 Destructure `findGuest`; render-time `router.push` guard removed; `useEffect` added with `router.replace` on `!loading && (error || !findGuest || !guestData.isConfirmed)`.
- [x] 1.2 Ternary fragment → early returns: `loading` → `<LoadingSpinner standalone />`; guard path → `null`; confirmed JSX verbatim.

### Phase 2: Verification

- [x] 2.1 Manual scenarios — statically verified (no dev server/browser in this environment; live-walkthrough items delegated to sdd-verify):
  - Loading gate first (`if (loading) return <LoadingSpinner standalone />`); effect gate `!loading` makes a fresh-mount redirect impossible → loading never redirects, spinner shows.
  - Never-interacted (`isDrity=false, isConfirmed=false`) → `!guestData.isConfirmed` in both effect and render-guard → replace + `null`; confirm UI never painted.
  - Declined (`isDrity=true, isConfirmed=false`) → same clause, same path (no `isDrity` requirement, per design).
  - Unknown id → `error || !findGuest` → replace.
  - Confirmed → only path that reaches the confirmed JSX; byte-identical design.
  - Back button → `router.replace` (no `/confirm` history entry) → no loop.
  - No render-phase side effects → no "Cannot update a component while rendering" warning possible.
  - StrictMode double effect → `replace` idempotent (same URL, deterministic decision, unmount after redirect).
- [x] 2.2 Static gates: `npx tsc --noEmit` ✓, `npm run lint` ✓, `npm run build` ✓ — all exit 0 (evidence below).

### Phase 3: Completion

- [x] 3.1 Spec scenarios re-checked against implementation; tasks marked `[x]`; single commit per design: `fix(confirm): redirect unconfirmed guests to /[id] via effect`.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/app/[id]/confirm/page.tsx` | Modified | Guard inverted-condition `router.push` (render-time) replaced with post-load `useEffect` + `router.replace`; early-return render states; confirmed JSX untouched |
| `openspec/changes/fix-confirm-guard/tasks.md` | Modified | Tasks 1.1, 1.2, 2.1, 2.2, 3.1 marked `[x]` |
| `openspec/changes/fix-confirm-guard/apply-progress.md` | Created | This file (first batch) |

## Deviations from Design

1. **Effect deps array includes `router`** — design specified `[loading, error, findGuest, guestData.isConfirmed, params.id]` and claimed "exhaustive-deps clean", but the repo's pinned `eslint-plugin-react-hooks@4.6.0` (via `eslint-config-next@14.0.3`) flags `router` as a missing dependency (verified: first lint run produced `24:6 Warning: React Hook useEffect has a missing dependency: 'router'`). Added `router` to deps: stable in `next/navigation`, keeps `replace` idempotent, and satisfies the lint gate the design required. Nothing else deviates.
2. **Live browser scenarios not executed here** — the design's manual checklist (slow-3G loading, real RSVP flows, console observation of StrictMode double effect) needs a dev server + browser, which this batch does not run. Scenario logic was verified statically; runtime walkthrough is the sdd-verify phase's job.

## Gate Evidence

| Gate | Command | Result |
|------|---------|--------|
| Types | `npx tsc --noEmit` | exit 0, no errors |
| Lint | `npm run lint` | exit 0; zero warnings from `src/app/[id]/confirm/page.tsx`; 2 pre-existing warnings in untouched files (`Aurora.tsx` 208:6 exhaustive-deps, `ProductCard2.tsx` 19:7 no-img-element) |
| Build | `npm run build` | exit 0; compiled; `/[id]/confirm` route built (90.1 kB / 313 kB First Load JS); 4 static pages generated |

## Static Render-Logic Walkthrough (replaces manual 5-state walk)

1. **Loading**: `loading=true` → line 26 early return renders spinner; effect line 21 gate `!loading` → never redirects.
2. **Never-interacted**: `findGuest=true, isConfirmed=false` → effect fires `router.replace(\`/${params.id}\`)`; render-guard line 30 returns `null` → confirm UI never flashes.
3. **Declined**: `isConfirmed=false` → identical path; `isDrity` not required (design decision).
4. **Unknown id / error**: `error=true` or `findGuest=false` → identical path.
5. **Confirmed**: only state reaching the confirmed JSX (lines 34-55) — byte-identical to pre-change confirmed content (AuroraBackdrop, Card paper, BlurTextTitle, GuestInvitations, Footer, `pageEntrance`, `useReducedMotion`).
6. **No render side effects**: zero router calls in component body; navigation exclusively inside `useEffect`.

## Risks

- **Hung Firestore read → permanent spinner** (design Open Questions): pre-existing in `useGuest` (`getGuestFirebase` has no timeout), out of scope. Flagged for a future change.
- Declined-state live test needs a real RSVP or a seeded doc — seed `guests.json` has no declined person (design Open Question); verify phase should RSVP "No Confirmar" first or seed.

## Rollback

`git checkout -- src/app/[id]/confirm/page.tsx`

## Status

5/5 tasks complete. Ready for verify.
