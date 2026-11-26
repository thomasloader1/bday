# Archive Report: fix-date-pipeline

**Change**: fix-date-pipeline
**Mode**: openspec (filesystem sync + archive move)
**Date**: 2026-08-15
**Verify status**: `partial` — PASS WITH WARNINGS (change complete and behaviorally verified; the only failing explicit check, B3 confirm guard, is explicitly OUT of scope and scheduled as follow-up, not fixed here)
**Status**: `success` — archived

---

## Executive Summary

The fix-date-pipeline change is COMPLETE and VERIFIED: 16/16 tasks done, tsc/lint/build clean, all 8 spec requirements (11/11 scenarios) behaviorally verified via an executed node harness (38/38), grep gates clean, locked-file contract respected, and the single justified deviation (D1) confirmed correct. The delta spec for `event-date` was synced to the main specs (created, since `openspec/specs/` was empty), and the change folder was moved to the archive with full audit trail. The one open item — the B3 confirm guard — is a pre-existing, out-of-scope defect flagged as a follow-up requirement (W1); it does not block this change's archive, and archiving unblocks downstream work (design-system Slice 3).

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `event-date` | Created | `openspec/specs/event-date/spec.md` — full spec copied from delta (main spec did not exist; `openspec/specs/` was empty). 8 requirements, 11 scenarios, 1 Non-Goals section. 0 modified, 0 removed (nothing pre-existing to merge). |

## Archive Contents

`openspec/changes/archive/2026-08-15-fix-date-pipeline/` contains:
- `proposal.md` ✅
- `specs/event-date/spec.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (16/16 tasks complete)
- `apply-progress.md` ✅
- `verify-report.md` ✅
- `archive-report.md` ✅

## Source of Truth Updated

- `openspec/specs/event-date/spec.md` — now reflects the new behavior (single source of truth for the party date; consumers derive from it).

## Implementation Traceability

Committed on `main`, `ed58fe0` → `407c52f` (5 commits, all ancestors of HEAD, base `6c30c2e`):
| Hash | Message |
|------|---------|
| `ed58fe0` | `feat(event-date): add source-of-truth event date helpers` |
| `2711b83` | `refactor(time): derive store dates from eventDate` (includes absorbed search-gate consumer — D1) |
| `3fc2dce` | `fix(calendar): use upcoming event date and valid Google format` |
| `61eaa20` | `fix(countdown): fire at real zero-crossing with event-over state` |
| `407c52f` | `chore(invitations): bump date strings to 2026 event` |

## Accepted Risks / Deviations (recorded per orchestrator)

- **D1 — search gate absorbed into commit `2711b83`**: the store refactor drops `timeLeft`, which `SearchInvitation.tsx` consumed; merging refactor + consumer keeps every commit compilable (work-unit-commits rule honored). Verified correct by sdd-verify (code correctness ✅, commit message coverage ✅, severity LOW/acceptable). Consequence: the planned 6-commit split became 5 commits; re-splitting is trivial if ever required.
- **D6 — static 2026 in invitation JSONs**: `__familyInvitation.json` `16/12/2026` 13:00, `__workInvitation.json` `21/12/2026` 18:00; times kept, other copy unchanged. Accepted by design: display copy only (spec R8 searches pipeline files, not JSON); drifts annually — accepted tradeoff.
- **B3 — confirm guard out-of-scope disposition**: the B3 confirm-guard defect is pre-existing and explicitly OUT of this change's scope (proposal "Out: confirm/RSVP flow"; spec Non-Goals). None of the 5 commits touched `src/app/[id]/confirm/page.tsx`. Disposition: NOT fixed here — carried as follow-up requirement W1.

## Follow-up Requirements (NOT fixed here)

- **W1 — B3 confirm guard (must be scheduled in a separate change)**
  - Where: `src/app/[id]/confirm/page.tsx:19-21` (byte-identical from base `6c30c2e` through HEAD).
  - Defect 1 (inverted/incomplete guard): a guest who never interacted (`isDrity === false`, `isConfirmed === false`) navigating directly to `/confirm` passes the guard and views the confirm page without ever confirming. Only declined guests are redirected. Fix: redirect on `error || !guestData.isConfirmed`.
  - Defect 2 (`router.push` during render): navigation side effect executes in the render phase (React anti-pattern). Fix: move into `useEffect` or gate rendering on confirmed state.
  - Downstream impact: any work that assumes the confirm page redirects unconfirmed guests builds on broken behavior.

## Non-blocking Suggestions (deferred, not part of archive)

- S1 `calculateTimeLeft` abs-of-floor off-by-one for negative diffs (latent — event-over never shows numbers).
- S2 search gate recomputes only on render (spec-compliant at render time; not live at T−30d crossing).
- S3 seconds never displayed in the final minute (pre-existing display choice).
- S4 apply-progress stat mismatch (11 files/167 lines vs actual 10 files/162 lines — cosmetic).
- S5 `getTime` dead code in timeStore (pre-existing, out-of-scope cleanup).

## Risks

- **B3 unaddressed**: if any downstream work (e.g. design-system Slice 3 or a confirm-flow change) assumes the confirm page redirects unconfirmed guests, it builds on broken behavior — W1 must be scheduled before or alongside such work.
- **Static 2026 in invitation JSONs**: drifts annually — accepted by design D6; display copy only.
- **No test framework**: behavioral guarantees rest on the verify-phase executed harness + manual QA; no automated regression protection yet.
- **Timezone**: all date math is device-local by design; store `eventDate` updates on complete/load only (acceptable per design).

## Skill Resolution

`fallback-path` — no `## Project Standards` block injected; no `SKILL: Load` instructions; no skill registry found (`.atl/skill-registry.md` absent); loaded `sdd-archive/SKILL.md` + `_shared/sdd-phase-common.md` + `_shared/openspec-convention.md` from `~/.config/opencode/skills/`. No `openspec/config.yaml` exists (no `rules.archive` overrides).

**Artifacts**: `openspec/specs/event-date/spec.md` (synced) · `openspec/changes/archive/2026-08-15-fix-date-pipeline/archive-report.md`
