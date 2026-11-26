# Apply Progress: fix-date-pipeline

**Mode**: Standard (no test runner — repo has none; verification via tsc/lint/build)
**Date**: 2026-08-15
**Batch**: 1 of 1 (FULL change — single PR scope)
**Status**: 16/16 tasks complete. Ready for verify.

## Completed Tasks

### Phase 1: Foundation

- [x] 1.1 **Create `src/lib/eventDate.ts`** — constants (MONTH=12, DAY=16, HOUR=20, MINUTE=0) + `getNextBirthday(now = new Date())`, local-time constructor, `thisYear > now ? thisYear : nextYear` (strictly-after semantics: equal instant → next year). [R1,R2]
- [x] 1.2 **Node sanity check** — real file compiled with tsc into a temp dir and executed against the spec scenarios. All pass: Dec 10 → Dec 16 2026 20:00; Dec 16 19:59 → Dec 16 2026; Dec 16 20:00 (equal) → Dec 16 2027; Dec 16 22:00 → Dec 16 2027; Dec 17 → Dec 16 2027; Feb 29 2028 → Dec 16 2028 (month/day unshifted); UTC-3 Dec 16 22:00 local → Dec 16 2027 (local date governs). [R1,R2]

### Phase 2: Core Implementation

- [x] 2.1 **`src/store/timeStore.ts`** — atom now `{ eventDate: Date }` initialized from `getNextBirthday()`; `targetWorkDate`/`targetFamilyDate`/`timeLeft` dropped; `setTime` → `setEventDate(eventDate)`. `getTime` kept (updated return type) — zero consumers, but dead-code cleanup is explicitly OUT of scope per proposal and tasks.md does not list it. [R8]
- [x] 2.2 **`src/app/page.tsx`** — `setFullYear` hack removed; `onComplete` → `setEventDate(getNextBirthday())`; renders `<Countdown targetDate={eventDate} />`. [R8,R5]
- [x] 2.3 **`src/lib/addToGoogleCalendar.ts`** — `getUTC*` → local getters; format `YYYYMMDDTHHMMSS` (year-month-day, zero-padded, no slashes); both `dates` params = event start. Verified via node: `20261216T200000/20261216T200000`. [R3]
- [x] 2.4 **`src/lib/saveTheDate.ts`** — `new Date().toISOString()...` (today, UTC) replaced with `getNextBirthday()`; iOS gets local ISO `2026-12-16T20:00:00` (verified: contains `-12-16T20:00:00`), scheme `calendario://x-callback-url/add`, `alarm=30`, title unchanged; non-iOS passes the same `eventDate` to `addToGoogleCalendar`. [R4]
- [x] 2.5 **`src/lib/calculateTimeLeft.ts`** — pure with optional `now` param; unclamped abs components; `isOver = diffMs < 0`; exported `TimeLeft` interface. [R5]
- [x] 2.6 **`src/components/Countdown.tsx`** — `useState<TimeLeft | null>(null)` + compute in post-mount effect (placeholder `"00 dias 00 horas 00 minutos"` renders identically on server/client → hydration-safe); tick compares `prevOverRef` false→true transition and fires `onComplete` once via latest-ref callback (`onCompleteRef`, no-dep effect → interval never resets on re-render); event-over renders `"La fiesta ya pasó"`. Mount-after-event seeds `prevOver = true` → no fire. Tab-throttled ticks cannot double-fire (monotonic transition). [R5]
- [x] 2.7 **`src/components/SearchInvitation.tsx`** — reads `$time.eventDate`; `isComing = eventDate.getTime() - Date.now() <= 30 * 86400000` (`<=` → exactly 30 days shown, spec R6 boundary); hidden message now exactly `"Aun no estan disponibles las entradas de este año"` (typo `diponibles` fixed); shown-prompt text and form unchanged. `SearchInvitationForm.tsx` inspected: pure router.push form, no date logic → no changes needed. [R6]
- [x] 2.8 **`src/data/__familyInvitation.json`** — `16/12/2023` → `16/12/2026`, 13:00 kept. [R7]
- [x] 2.9 **`src/data/__workInvitation.json`** — `21/12/23` → `21/12/2026`, 18:00 kept. [R7]

### Phase 3: Verification (no test runner — build/lint/manual)

- [x] 3.1 `npm run lint` — exit 0. Only pre-existing warnings in untouched files (`CakeBackground.tsx` exhaustive-deps, `LocationFriendsCard.tsx`/`ProductCard2.tsx` img-element). No warnings in any changed file.
- [x] 3.2 `npx tsc --noEmit` — clean.
- [x] 3.3 `npm run build` — success. All routes compiled: `/`, `/_not-found`, `/[id]`, `/[id]/confirm`, `/wishlist`.
- [x] 3.4 `2023` scan — zero hits in `src/lib` `src/store` `src/components` `src/app` (`rg` not on PATH; equivalent PowerShell `Select-String` used). Wishlist CDN IDs (`112023`/`122023`) untouched — out of scope.
- [x] 3.5 Manual matrix — machine-verifiable parts done: (c) Google `20261216T200000` and iOS `-12-16T20:00:00` verified by executing the compiled modules in node; (d) `/[id]` + `/[id]/confirm` compiled clean in build (they consume `saveTheDate`/JSON as-is). Interactive browser parts — (a) tick animation / once-only `onComplete` at live zero-crossing, (b) form shown ≤30d / hidden + message beyond at a live boundary, iOS UA spoof — cannot be executed headlessly here; deferred to the verify phase / manual QA per design's testing strategy (no test framework in repo).

## Commit List (5 of 6 planned work units — see deviation D1)

| # | Hash | Message |
|---|------|---------|
| 1 | `ed58fe0` | `feat(event-date): add source-of-truth event date helpers` |
| 2 | `2711b83` | `refactor(time): derive store dates from eventDate` |
| 3 | `3fc2dce` | `fix(calendar): use upcoming event date and valid Google format` |
| 4 | `61eaa20` | `fix(countdown): fire at real zero-crossing with event-over state` |
| 5 | `407c52f` | `chore(invitations): bump date strings to 2026 event` |

Work-unit 5 (`fix(search): gate invitations by real event proximity`) has NO commit of its own — see D1.

## Deviations from Design

- **D1 — SearchInvitation absorbed into CU2 (commit 2, `2711b83`)**: the design's commit split puts the store shape change in CU2 and its consumer adaptation in CU5. Dropping `timeLeft` from the store breaks compilation of `SearchInvitation.tsx`, so with the design's exact split the repo would be uncompilable through commits 2–4. Commits land directly on `main` (no feature branch), so an intermediate broken state violates the work-unit-commits rule "repo still makes sense after applying only it". The store-shape refactor + its direct consumer are one coherent, reviewable unit — merged into commit 2 (15 insertions/26 deletions across 3 files). Consequence: commit 5 of the planned list does not exist; the 6-unit plan became 5 commits, all other boundaries unchanged. If the exact 6-commit split is required, re-splitting is trivial (move `SearchInvitation.tsx` out of `2711b83` into its own commit).
- **D2 — `getTime` kept in timeStore**: design D2 shows only `$time` + `setEventDate`; tasks.md explicitly drops `targetWorkDate`/`targetFamilyDate`/`timeLeft` and replaces `setTime`, but does not list `getTime`. It has zero consumers; removing public exports not sanctioned by the task list conflicts with the proposal's "dead-code cleanup: out". Kept with updated return type so the module compiles; harmless to remove later.
- **D3 — commit message wording**: orchestrator-provided commit plan messages used verbatim where the commit exists; the CU2 body explains the absorbed consumer change (D1).

## Issues Found

- None blocking. Notes: (1) `getTime` in timeStore is dead code (pre-existing, out of scope); (2) lint warnings in `CakeBackground.tsx`/`LocationFriendsCard.tsx`/`ProductCard2.tsx` are pre-existing and untouched; (3) `caniuse-lite outdated` warnings from build are pre-existing; (4) interactive browser checks (tick at live boundary, UA spoof) remain manual per design's own testing strategy — no test framework exists (open question in design).

## Workload / PR Boundary

- Mode: single PR, base `main` (delivery strategy `ask-on-risk`, resolved: Low risk, no chaining needed)
- Current work unit: 6 of 6 design units (5 commits; CU5 merged into CU2 per D1)
- Boundary: full change — `ed58fe0` through `407c52f`
- Actual diff: 11 files, 110 insertions + 57 deletions = 167 changed lines (design forecast ~290; under 400-line budget)
- Estimated review budget impact: Low

## Return Summary

**Change**: fix-date-pipeline
**Mode**: Standard (no test runner — repo has none; verification via tsc/lint/build)

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `src/lib/eventDate.ts` | Created | Constants (MONTH/DAY/HOUR/MINUTE) + `getNextBirthday(now)` — local-time source of truth |
| `src/lib/calculateTimeLeft.ts` | Modified | Pure w/ optional `now`; unclamped abs components; `isOver` flag; `TimeLeft` interface |
| `src/store/timeStore.ts` | Modified | `{ eventDate }` from `getNextBirthday()`; dropped stale fields; `setTime` → `setEventDate` |
| `src/lib/addToGoogleCalendar.ts` | Modified | Local getters; `YYYYMMDDTHHMMSS` no slashes; both `dates` = event start |
| `src/lib/saveTheDate.ts` | Modified | `getNextBirthday()` not `new Date()`; iOS local ISO; scheme/alarm/title unchanged |
| `src/components/Countdown.tsx` | Modified | Hydration-safe null-init; zero-crossing fire-once via prev-over transition; "La fiesta ya pasó" state |
| `src/app/page.tsx` | Modified | Removed `setFullYear` hack; `onComplete` → `setEventDate(getNextBirthday())` |
| `src/components/SearchInvitation.tsx` | Modified | Real proximity gate `<= 30d`; typo fix "disponibles" |
| `src/data/__workInvitation.json` | Modified | `21/12/23` → `21/12/2026` |
| `src/data/__familyInvitation.json` | Modified | `16/12/2023` → `16/12/2026` |

### Deviations from Design
D1: SearchInvitation adaptation merged into CU2 (store refactor + consumer must move together — repo stays compilable on every commit). D2: `getTime` kept (not sanctioned for removal by tasks.md; dead-code cleanup out of scope). D3: CU5 has no dedicated commit (consequence of D1). Details above.

### Issues Found
None blocking. Interactive browser checks deferred to verify/manual QA (no test runner in repo).

### Remaining Tasks
None — 16/16 complete. Next phase: sdd-verify.

### Status
16/16 tasks complete. Ready for verify.
