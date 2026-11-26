# Archive Report: fix-confirm-guard

**Change**: fix-confirm-guard
**Date archived**: 2026-08-15
**Archived to**: `openspec/changes/archive/2026-08-15-fix-confirm-guard/`
**Artifact store mode**: openspec
**Verify verdict**: PASS (12/12 scenarios; tsc / lint / build all exit 0)
**Commit verified**: `5905cf4` `fix(confirm): redirect unconfirmed guests to /[id] via effect`

---

## Summary

`/confirm` access guard fixed: inverted render-time `router.push` condition replaced with a post-load `useEffect` that calls `router.replace` whenever `!loading && (error || !findGuest || !guestData.isConfirmed)`. Never-interacted, declined, and unknown-id guests now redirect to `/[id]`; loading shows the app-standard `LoadingSpinner`; confirmed guests see byte-identical design and copy. Single-file change, verified PASS, archived.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| confirm-guard | Created (new capability) | Delta spec copied verbatim to `openspec/specs/confirm-guard/spec.md` — 6 requirements, 12 scenarios |

`event-date`, `design-tokens`, `component-primitives` main specs untouched (not in this change's scope).

## Archive Contents

- proposal.md ✅
- specs/confirm-guard/spec.md ✅
- design.md ✅
- tasks.md ✅ (5/5 tasks complete)
- apply-progress.md ✅
- verify-report.md ✅ (PASS)
- archive-report.md ✅ (this file)

## Deviations Recorded in the Audit Trail

1. `router` added to the `useEffect` deps array (design listed `[loading, error, findGuest, guestData.isConfirmed, params.id]`). Required for exhaustive-deps cleanliness under the repo's pinned `eslint-plugin-react-hooks@4.6.0` (via `eslint-config-next@14.0.3`); stable reference from `next/navigation`, idempotent `replace`, unmount after nav. Documented in apply-progress and verify-report.
2. Live-browser manual checklist not executed during apply/verify (no dev server/browser) — verified structurally; see Follow-ups below.

## Follow-ups (NOT fixed here — recorded for the orchestrator)

1. **Live-browser manual checklist** — the design's 8-item manual checklist (slow-3G loading, real Back-button press, StrictMode double-effect console observation, declined flow via real RSVP "No Confirmar" or seeded doc) was verified statically only. Recommend a post-deploy `browser-qa` pass before ship.
2. **Pre-existing: hung Firestore read → permanent spinner** — `getGuestFirebase` has no timeout, so a hung Firestore read leaves `loading=true` forever. Pre-existing in `useGuest`, out of this change's scope; candidate for a future change.
3. **openspec/config.yaml missing; openspec/ + opendesign/ untracked in git** — standing recommendation: add `openspec/config.yaml` (project SDD config with rules per phase) and decide whether `openspec/` and `opendesign/` should be tracked. Not committed here (previous archives did not commit; no commit unless the skill explicitly requires it).

## Source of Truth Updated

- `openspec/specs/confirm-guard/spec.md` — now reflects the new access-guard behavior

## Rollback (if ever needed)

`git checkout -- src/app/[id]/confirm/page.tsx`. Single client component; no data/deps/migrations. Note: the archived change folder is an audit trail — do not modify or delete.

## SDD Cycle Complete

The change has been fully planned, implemented, verified, and archived. Ready for the next change.
