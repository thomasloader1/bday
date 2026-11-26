# Tasks: Fix /confirm access guard

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~35 (single file: `src/app/[id]/confirm/page.tsx`, currently 51 lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Atomic guard fix in `src/app/[id]/confirm/page.tsx` | PR 1 | One commit: `fix(confirm): redirect unconfirmed guests to /[id] via effect`; manual + static verification included |

## Phase 1: Core Implementation

- [x] 1.1 In `src/app/[id]/confirm/page.tsx`: destructure `findGuest` from `useGuest(params)`; delete the render-time `router.push` guard; add a `useEffect` (deps `[loading, error, findGuest, guestData.isConfirmed, params.id]`) that calls `router.replace(\`/${params.id}\`)` when `!loading && (error || !findGuest || !guestData.isConfirmed)`.
- [x] 1.2 Replace the ternary fragment with early returns: `loading` → `<LoadingSpinner standalone />`; guard path → `null`; else current confirmed JSX verbatim (tokens, motion, copy byte-identical, no em dashes).

## Phase 2: Verification

- [x] 2.1 Manual scenarios (dev server, StrictMode active): loading shows spinner and never redirects; never-interacted (`isDrity=false, isConfirmed=false`) redirects to `/[id]` with no confirm-UI flash; declined (RSVP "No Confirmar" first — seed `guests.json` has no declined person) redirects; confirmed stays with unchanged design; unknown id `/999999/confirm` redirects; Back button doesn't loop (replace semantics); no "Cannot update a component while rendering" warning; exactly one redirect under StrictMode double effect.
- [x] 2.2 Static gates: `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.

## Phase 3: Completion

- [x] 3.1 Re-check every scenario in `openspec/changes/fix-confirm-guard/specs/confirm-guard/spec.md`, mark tasks `[x]`, and commit once per design: `fix(confirm): redirect unconfirmed guests to /[id] via effect`.

## Definition of Done

- [ ] Guard fires only after `loading=false`; condition is exactly `!loading && (error || !findGuest || !guestData.isConfirmed)`
- [ ] Never-interacted, declined, and unknown-id guests redirect via `router.replace`; no back-button loop
- [ ] Confirmed guest sees byte-identical design and copy
- [ ] No render-phase side effects; no confirm-UI flash; spinner while loading
- [ ] tsc, lint, build pass; manual scenarios verified
- [ ] Rollback plan available: `git checkout -- src/app/[id]/confirm/page.tsx`
