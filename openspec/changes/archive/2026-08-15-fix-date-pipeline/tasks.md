# Tasks: Fix Date Pipeline

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~290 (1 new + 9 modified) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR, 6 work-unit commits |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Work Units (all PR 1, base main)

1. eventDate.ts (R1,R2) · 2. store+page (R8,R5) · 3. calendar links (R3,R4) · 4. countdown (R5) · 5. search gate (R6) · 6. invitation JSONs (R7)

## Phase 1: Foundation

- [x] 1.1 **Create `src/lib/eventDate.ts`** — constants (MONTH=12, DAY=16, HOUR=20, MINUTE=0); `getNextBirthday(now=new Date())` local-time, `thisYear > now ? thisYear : nextYear`. AC: before/after/leap/UTC-3 scenarios hold. Deps: —. CU1. [R1,R2]
- [x] 1.2 **Node sanity check** — Dec 16 22:00 local → next year; Feb 29 2028 → Dec 16 2028. AC: matches spec. Deps: 1.1. CU1. [R1,R2]

## Phase 2: Core Implementation

- [x] 2.1 **`src/store/timeStore.ts`** — atom `{eventDate}` init `getNextBirthday()`; drop `targetWorkDate`/`targetFamilyDate`/`timeLeft`; `setTime` → `setEventDate`. AC: compiles; stale fields gone. Deps: 1.1. CU2. [R8]
- [x] 2.2 **`src/app/page.tsx`** — remove `setFullYear` hack; `onComplete` → `setEventDate(getNextBirthday())`. AC: re-derives next year. Deps: 2.1. CU2. [R8,R5]
- [x] 2.3 **`src/lib/addToGoogleCalendar.ts`** — local getters; `YYYYMMDDTHHMMSS` zero-padded, no slashes; both `dates` = event start. AC: `20261216T200000`. Deps: —. CU3. [R3]
- [x] 2.4 **`src/lib/saveTheDate.ts`** — `getNextBirthday()` not `new Date()`; iOS local ISO `-12-16T20:00:00`, `calendario://x-callback-url/add`, `alarm=30`, title unchanged; non-iOS → Google with same date. AC: both carry event date. Deps: 1.1, 2.3. CU3. [R4]
- [x] 2.5 **`src/lib/calculateTimeLeft.ts`** — pure, optional `now`; unclamp; `isOver = diffMs < 0`; `TimeLeft` interface. AC: negative → isOver, abs values. Deps: —. CU4. [R5]
- [x] 2.6 **`src/components/Countdown.tsx`** — `useState<TimeLeft|null>(null)` + post-mount compute; latest-ref tick; `onComplete` once on isOver transition; event-over label "La fiesta ya pasó". AC: no "00 dias" flash; fires once. Deps: 2.5. CU4. [R5]
- [x] 2.7 **`src/components/SearchInvitation.tsx`** — read `$time.eventDate`; gate ≤30 days (`<=`); hidden → "Aun no estan disponibles las entradas de este año" (fixes "diponibles" typo). AC: 30d boundary shown; beyond hidden+message. Deps: 2.1. CU5. [R6]
- [x] 2.8 **`src/data/__familyInvitation.json`** — `16/12/2023` → `16/12/2026`, 13:00 kept. AC: reads 2026. Deps: —. CU6. [R7]
- [x] 2.9 **`src/data/__workInvitation.json`** — `21/12/23` → `21/12/2026`, 18:00 kept. AC: reads 2026. Deps: —. CU6. [R7]

## Phase 3: Verification (no test runner — build/lint/manual)

- [x] 3.1 `npm run lint` — clean. Deps: all.
- [x] 3.2 `npx tsc --noEmit` — clean. Deps: all.
- [x] 3.3 `npm run build` — success. Deps: all.
- [x] 3.4 `rg -n "2023" src/lib src/store src/components src/app` — zero hits; wishlist CDN IDs out of scope. Deps: 2.1–2.9. [R8] (rg not on PATH; equivalent PowerShell `Select-String` scan used — zero hits)
- [x] 3.5 **Manual matrix** — (a) countdown ticks, no "00 dias" flash, fires once, "La fiesta ya pasó"; (b) search form ≤30d / hidden + message beyond; (c) Google link `20261216T200000`, iOS `-12-16T20:00:00`; (d) `/[id]` confirm page unaffected. Deps: all. [R1–R7] (Machine-verifiable parts done: (c) formats verified via node against compiled module; (d) `/` + `/[id]` + `/[id]/confirm` built clean. Interactive browser parts — tick animation, UA spoof, live boundary checks — remain for the verify phase / manual QA per design's testing strategy.)
