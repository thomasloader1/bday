# Verification Report: fix-date-pipeline

**Change**: fix-date-pipeline
**Version**: event-date spec (delta) — openspec/changes/fix-date-pipeline/specs/event-date/spec.md
**Mode**: Standard (no test runner — verification = tsc + lint + build + grep gates + node behavioral harness)
**Date**: 2026-08-15
**Status**: `partial` — the change itself is complete and behaviorally verified (all 8 spec requirements PASS), but one explicitly requested check (B3 confirm guard) FAILS in current code. See WARNING W1.

---

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 16 |
| Tasks complete | 16 |
| Tasks incomplete | 0 |

All 3 phases complete. Implementation confirmed on `main` as the 5 claimed commits (`ed58fe0` → `407c52f`), all ancestors of HEAD: `git rev-list --count 6c30c2e..407c52f` = 5. 8 design-system commits sit on top; they do not alter the change's code (verified below).

---

## Build & Execution Evidence (real commands, real output)

| Gate | Command | Result |
|------|---------|--------|
| Type check | `npx tsc --noEmit` | ✅ exit 0, clean |
| Lint | `npm run lint` | ✅ exit 0 — 3 warnings, ALL in files untouched by this change (`Aurora.tsx` exhaustive-deps; `LocationFriendsCard.tsx` no-img-element + alt-text; `ProductCard2.tsx` no-img-element). Zero warnings in changed files |
| Build | `npm run build` | ✅ exit 0 — `✓ Compiled successfully`; all routes compiled: `/`, `/_not-found`, `/[id]`, `/[id]/confirm`, `/wishlist` (⚠ edge-runtime note + caniuse-lite outdated are pre-existing) |
| Grep "2023" (all of `src/`) | Select-String | 6 hits — ALL in `src/app/wishlist/page.tsx` (MercadoLibre CDN image IDs `..._112023-O.webp`, `_122023-F.webp`). **Zero hits in the date pipeline.** CDN IDs unrelated to dates → acceptable (orchestrator's judgment call confirmed) |
| Grep `diponibles\|setFullYear\|targetWorkDate\|targetFamilyDate` | Select-String | Zero hits — typo and stale fields fully removed |
| Behavioral (node) | Compiled pure modules + executed 38 spec scenarios | ✅ 38/38 PASS |

**Behavioral harness**: the four pure modules were compiled with `tsc` (commonjs, es2019) into a temp dir and executed in node (v24.14.0). Covered: R1 (before/equal/after/rollover/leap/never-past), R2 (real `TZ=America/Argentina/Buenos_Aires` — proved local 22:00 Dec 16 == 01:00 Dec 17 UTC, and that local semantics return *today's* party at 19:30 local where a UTC implementation would wrongly return next year), R3 (exact `dates=20261216T200000/20261216T200000`), R4 (iOS UA → `calendario://x-callback-url/add?alarm=30&title=Cumpleaños%20Tomas%20Gomez&date=2026-12-16T20:00:00`; desktop → Google with event date), R5 (3s remaining, exact-instant, after-event, no negatives), R6 (30d exact boundary shown, 30d+1ms hidden, 20d/40d/event-day).

Note: 6 initial harness failures were disproven as test-harness bugs (my miscalculated expectation; a flawed slash regex — the single `/` in `dates=A/B` is Google's *required* start/end separator; and Node 24's read-only global `navigator` silently swallowing the UA override). All 38 scenarios pass with the corrected harness.

---

## Spec Compliance Matrix

| Req | Scenario | Evidence (executed) | Result |
|-----|----------|---------------------|--------|
| R1 Event date module | Before party → this year | node: Dec 10 → `2026-12-16T20:00`; 19:59:59 → same-day 20:00 | ✅ COMPLIANT |
| R1 | Event passed / equal instant → next year | node: equal instant → `2027-12-16T20:00`; Dec 16 22:00 → 2027; Dec 17 → 2027; Dec 31 → 2027; never-past check | ✅ COMPLIANT |
| R1 | Leap year | node: Feb 29 2028 → `2028-12-16T20:00` (month/day unshifted) | ✅ COMPLIANT |
| R2 Timezone | Local vs UTC date | node under real UTC-3: Dec 16 22:00 local (= Dec 17 01:00 UTC) → `2027-12-16T20:00`; discriminating case 19:30 local → today 20:00 | ✅ COMPLIANT |
| R3 Google link | Format & order, event date, never today | node: `dates=20261216T200000/20261216T200000`, no slashes inside datetimes, yyyymmdd order (old code had day/month swapped via `getUTCDate`) | ✅ COMPLIANT |
| R4 iOS calendario | iOS → `calendario://` with `-12-16T20:00:00`; desktop → Google | node with iPhone/Windows UA: exact URL match, `alarm=30`, title unchanged, local ISO no `Z`; desktop → Google with same event date | ✅ COMPLIANT |
| R5 Countdown | Zero-crossing fires once; event-over state; hydration-safe | static (Countdown.tsx transition logic — see C4) + node (calculateTimeLeft: 3s → not over; exact instant → false→true next tick; after → isOver; no negatives) | ✅ COMPLIANT (behavior) |
| R6 Search gate | ≤30d shown / beyond hidden / exact boundary | node: boundary arithmetic `eventDate - now <= 30*86400000` exact 30d → shown, 30d+1ms → hidden, 20d → shown, 40d → hidden; code reads `$time.eventDate`, exact message `Aun no estan disponibles las entradas de este año` (typo `diponibles` gone) | ✅ COMPLIANT |
| R7 Invitation JSON | Both invitations current year, times kept | JSON diff: family `16/12/2026` 13:00hs; work `21/12/2026` 18:00 hs; only the year strings changed | ✅ COMPLIANT |
| R8 Consumers derive from module | No hardcoded 2023; hack & stale dates removed | grep zero hits in pipeline; timeStore inits from `getNextBirthday()`; page.tsx `setEventDate(getNextBirthday())` | ✅ COMPLIANT |

**Compliance summary**: 11/11 scenarios compliant.

---

## Explicit Checks (orchestrator scope)

1. **eventDate.ts source of truth** — ✅ `getNextBirthday` uses local getters + local constructor, strictly-after `>` (equal instant → next year), year rollover correct, can never return a past date. It returns "today" ONLY in the legitimate case (before 20:00 on party day — countdown then shows the true hours-to-go, not 00). The CRITICAL failure mode (countdown showing 00 for the whole day) is impossible: equal instant → next year.
2. **Store derives from eventDate** — ✅ `$time` = `atom({ eventDate: getNextBirthday() })`; old `new Date("2023-12-16T20:00:00")` etc. gone; zero `2023` in date logic (6 wishlist CDN IDs are image identifiers, unrelated to dates).
3. **Calendar link** — ✅ `YYYYMMDDTHHMMSS` local, no slashes inside datetimes, year-month-day order (old: `YYYY/DD/MMTHH:MM:SS` — slashes + day/month swapped + UTC), both `dates` = event start, never today.
4. **Countdown** — ✅ hydration-safe (null-init placeholder renders identically server/client); fires exactly once via `prevOverRef` false→true transition (not all-day like the old `timeLeft.days === 0` check); monotonic transition → tab-throttled ticks can't double-fire; mount-after-event seeds `prevOver=true` → no spurious fire; event-over renders `La fiesta ya pasó`; never renders negatives. B24 (post-event clamped zeros) is gone.
5. **Locked-file contract** — ✅ the 5 commits touched exactly the 10 owned files (see File Changes). `git diff 407c52f HEAD` on the 7 locked source files (eventDate, timeStore, addToGoogleCalendar, saveTheDate, calculateTimeLeft, Countdown, SearchInvitation) = **empty** — design-system did not touch them. `src/app/page.tsx` lost only the decorative `IconBackground` (presentational); the date logic (`setEventDate(getNextBirthday())` on complete, `<Countdown targetDate={eventDate}>`) is intact.
6. **Confirm guard (B3)** — ❌ **NOT FIXED — see WARNING W1.** Guard is byte-identical from base `6c30c2e` through HEAD; none of the 5 commits touched `src/app/[id]/confirm/page.tsx`; `router.push` still runs during render.
7. **Grep gates** — ✅ no `2023` in the date pipeline; countdown never renders negatives (abs values + `isOver` short-circuit); `diponibles` typo eliminated.

---

## Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D1 eventDate module contract | ✅ Yes | Exactly as designed (constants + `getNextBirthday(now)`); verified against all D1 design examples |
| D2 timeStore simplification | ✅ Yes (with D2-deviation) | Atom holds `{ eventDate }`; dropped 3 stale fields + `setTime` → `setEventDate`; `getTime` kept (documented deviation, zero consumers, out-of-scope cleanup) |
| D3 Calendar link fixes | ✅ Yes | Local getters, `YYYYMMDDTHHMMSS`, no slashes; saveTheDate uses `getNextBirthday()` + local ISO for iOS |
| D4 Countdown redesign | ✅ Yes | Null-init + post-mount effect; latest-ref; transition fire-once; unclamped + `isOver`; `La fiesta ya pasó` |
| D5 Search gate | ✅ Yes | `eventDate - now <= 30*86400000` (`<=` boundary), real remaining time, exact message, prompt text unchanged |
| D6 Invitation JSON | ✅ Yes | Static 2026 substitution, times kept; drift accepted by design |

### Deviation D1 evaluation (search-gate work-unit absorbed into commit `2711b83`)

- **Code correctness**: ✅ The old `SearchInvitation` read `$time.timeLeft` (verified in the pre-change file). The store refactor drops `timeLeft` → without the consumer in the same commit, the repo would NOT compile through commits 2–4. The merge keeps every commit compilable (work-unit-commits rule honored).
- **Commit message coverage**: ✅ The body explicitly documents it: *"SearchInvitation gates on real proximity (eventDate - now <= 30d) and fixes the 'diponibles' typo; its adaptation ships here because the store shape change breaks compilation without the consumer."*
- **Severity judgment**: LOW / acceptable. Justified, documented, and the resulting code is correct. The design's exact 6-commit split would have produced an uncompilable intermediate state on `main`; merging refactor+consumer is the better call. Re-splitting (if ever required) is trivial per the apply notes.

### Apply-progress inaccuracies (non-blocking)
- Claims "11 files, 110 insertions + 57 deletions = 167 changed lines"; actual: **10 files, 106 insertions + 56 deletions = 162 lines** (`git diff --stat 6c30c2e 407c52f`). Cosmetic — under the 400-line budget either way.
- Task 3.1's lint-warning attribution says `CakeBackground.tsx`; it now surfaces as `Aurora.tsx` (design-system renamed the component). Same pre-existing warning, untouched file.

---

## File Changes (as implemented)

| File | Action | Status |
|------|--------|--------|
| `src/lib/eventDate.ts` | Create | ✅ new source of truth |
| `src/lib/calculateTimeLeft.ts` | Modify | ✅ unclamped, `isOver`, optional `now`, `TimeLeft` |
| `src/store/timeStore.ts` | Modify | ✅ `{ eventDate }` from `getNextBirthday()`; stale fields gone |
| `src/lib/addToGoogleCalendar.ts` | Modify | ✅ local getters, `YYYYMMDDTHHMMSS` |
| `src/lib/saveTheDate.ts` | Modify | ✅ event date + local ISO for iOS |
| `src/components/Countdown.tsx` | Modify | ✅ zero-crossing fire-once, event-over |
| `src/app/page.tsx` | Modify | ✅ hack removed; `setEventDate(getNextBirthday())` |
| `src/components/SearchInvitation.tsx` | Modify | ✅ proximity gate ≤30d, typo fixed |
| `src/data/__workInvitation.json` | Modify | ✅ `21/12/2026` |
| `src/data/__familyInvitation.json` | Modify | ✅ `16/12/2026` |

Untouched as designed: `useGuestData.ts`, `GuestInvitations.tsx`, `InvitationInfo.tsx`, `SearchInvitationForm.tsx` (all re-inspected — no date logic; JSON consumed as-is; `saveTheDate` called with JSON copy).

---

## Issues Found

**CRITICAL** (must fix before archive): None.

**WARNING** (should fix):

- **W1 — B3 confirm guard is NOT fixed (explicitly requested check 6 fails)**
  - Where: `src/app/[id]/confirm/page.tsx:19-21`
  - Evidence: the guard `if (error || (guestData.isDrity && guestData.isConfirmed === false)) { router.push(`/${params.id}`); }` is byte-identical across base `6c30c2e` → `6ad76d9` → `4fe4335` (HEAD). None of the 5 change commits touched this file. Two defects remain:
    1. **Inverted/incomplete guard**: a guest who never interacted (`isDrity === false`, `isConfirmed === false`) navigating directly to `/confirm` passes the guard and views the confirm page (invitations + personal info) without ever confirming. Only declined guests (`isDrity && !isConfirmed`) are redirected. Fix: redirect on `error || !guestData.isConfirmed`.
    2. **`router.push` during render**: a navigation side effect executes in the render phase (React anti-pattern; Next.js guidance: `useEffect` or `redirect()`). Fix: move into `useEffect`, e.g. `useEffect(() => { if (error || !guestData.isConfirmed) router.push(`/${params.id}`); }, [error, guestData.isConfirmed, params.id]);` — or gate rendering on the confirmed state.
  - Scope note: pre-existing and explicitly OUT of this change's scope (proposal "Out: confirm/RSVP flow"; spec Non-Goals "Confirm/RSVP flow"). The change neither caused nor claimed it. **But** the verify contract asked for it and it is demonstrably absent from current code — if downstream work assumes B3 is fixed, it is not. Orchestrator to decide: separate change or in-change fix.

**SUGGESTION** (nice to have):

- **S1 — `calculateTimeLeft` abs-of-floor is off-by-one for negative diffs** — `src/lib/calculateTimeLeft.ts:12-17`: for diff = −25h, `Math.floor(-25/24)` = −2 → `days = 2` (true: 1d1h). Latent only: when `isOver`, Countdown renders `La fiesta ya pasó` and never shows the numbers. Fix: `Math.ceil` on negatives, or keep signed values and render only when `!isOver`.
- **S2 — Search gate recomputes only on render** — `src/components/SearchInvitation.tsx:18`: `isComing` is computed per render; crossing T−30d does not trigger a re-render (the store only changes once/year; Countdown's ticks are local state), so the form appears at the boundary only after a reload/re-render. Spec-compliant at render time; a lightweight interval or `Date.now()` store tick would make it live.
- **S3 — Seconds never displayed** — `src/components/Countdown.tsx:48`: the final minute reads `00 dias 00 horas 00 minutos` (true remaining time, changes internally every second but not visibly). Pre-existing display choice, not B24 (which was permanent post-event zeros). Consider rendering seconds in the last minute.
- **S4 — apply-progress stat mismatch** — reports 11 files / 167 lines; actual 10 files / 162 lines.
- **S5 — `getTime` dead code** — `src/store/timeStore.ts:13-15`: zero consumers (pre-existing, documented deviation D2, out-of-scope cleanup).

---

## Verdict

**PASS WITH WARNINGS** — status `partial` because explicit check 6 (B3) fails.

The fix-date-pipeline change itself is COMPLETE and CORRECT: 16/16 tasks done, tsc/lint/build clean, all 11 spec scenarios behaviorally verified by executed node harness (38/38), grep gates clean, locked-file contract respected, D1 deviation justified and documented. The single failing item (B3 confirm guard) is a pre-existing, out-of-scope bug whose fix is absent from current code — flagged precisely above so the orchestrator can schedule it.

---

## Next Recommended

- `sdd-archive` for fix-date-pipeline (change itself is verified; B3 does not block this change's archive — confirm with orchestrator).
- Separate change for B3 confirm-guard fix if downstream work depends on it.
- Manual/browser QA of the two interactive behaviors the node harness cannot prove: live tick animation + once-only `onComplete` at a real boundary, and iOS UA behavior in a real device/browser.

## Risks

- **B3 unaddressed**: if any downstream work assumes the confirm page redirects unconfirmed guests, it builds on broken behavior (see W1).
- **Static 2026 in invitation JSONs**: drifts annually — accepted by design D6; display copy only.
- **No test framework**: behavioral guarantees rest on this report's executed harness + manual QA; no automated regression protection yet.
- **Timezone**: all date math is device-local by design; the countdown derives per-tick, so a user crossing a timezone mid-session re-renders correctly, but the store's `eventDate` only updates on complete/load (acceptable per design).

## Skill Resolution

`fallback-path` — loaded `sdd-verify/SKILL.md` + `_shared/sdd-phase-common.md` + `_shared/openspec-convention.md` from `~/.config/opencode/skills/`. No Project Standards block injected; no `openspec/config.yaml` exists (no `rules.verify` overrides); no skill registry found. Standard mode (repo has no test runner; strict TDD not applicable).

**Artifacts**: `openspec/changes/fix-date-pipeline/verify-report.md`
