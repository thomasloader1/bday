# Design: Fix Date Pipeline

## Technical Approach

Create `src/lib/eventDate.ts` as the single source of truth (constants + `getNextBirthday`), then rewire every consumer to derive from it: store init, calendar links, countdown tick, search gate, and invitation copy. All date math uses device-local time. Pure functions are extracted so logic is inspectable; no new test framework (repo has none — build/lint/manual verification instead).

## Architecture Decisions

### D1: eventDate.ts module contract

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Return parts object | Consumers re-assemble Date | Return a `Date` — store/countdown need instants |
| `nextBirthday()` vs `getNextBirthday(now)` | Injected `now` makes boundary testable & pure | `getNextBirthday(now: Date = new Date())` |
| UTC vs local components | UTC breaks local-date semantics (spec R2) | Local getters + local-time `Date` constructor |

```ts
// src/lib/eventDate.ts
export const EVENT_MONTH = 12;      // December
export const EVENT_DAY = 16;
export const EVENT_HOUR = 20;
export const EVENT_MINUTE = 0;

export const getNextBirthday = (now: Date = new Date()): Date => {
  const thisYear = new Date(now.getFullYear(), EVENT_MONTH - 1, EVENT_DAY, EVENT_HOUR, EVENT_MINUTE, 0, 0);
  return thisYear > now ? thisYear : new Date(now.getFullYear() + 1, EVENT_MONTH - 1, EVENT_DAY, EVENT_HOUR, EVENT_MINUTE, 0, 0);
};
```

"Strictly after" (spec R1): equal to the party instant → next year (`>` not `>=`). Local-time constructor satisfies R2 (UTC-3 Dec 16 22:00 local → next year) and leap-year (Feb 29 2028 → Dec 16 2028, month/day unshifted since we never build Feb 29).

### D2: timeStore simplification

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep all 3 dates | `targetWorkDate`/`targetFamilyDate` have zero consumers (verified via grep) | Drop both; `timeLeft: any` dies too |
| Keep `setTime` | Only caller is the removed hack | Replace with `setEventDate(eventDate)` |
| Store `eventDate` only | Consumers compute remaining themselves | Atom holds just `{ eventDate: Date }` from `getNextBirthday()` |

```ts
// src/store/timeStore.ts
export const $time = atom<{ eventDate: Date }>({ eventDate: getNextBirthday() });
export const setEventDate = (eventDate: Date) => { $time.set({ eventDate }); };
```

### D3: Calendar link fixes

`addToGoogleCalendar.ts`: switch `getUTC*` → local getters; format `YYYYMMDDTHHMMSS` (year-month-day, zero-padded, no slashes — fixes swapped day/month and invalid separators); both `dates` = event start (spec R3).

```ts
const pad = (n: number) => n.toString().padStart(2, '0');
const formattedDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
// → dates=${formattedDate}/${formattedDate}
```

`saveTheDate.ts`: replace `new Date().toISOString()...` (today, UTC) with `getNextBirthday()`; iOS gets local ISO `2026-12-16T20:00:00`; scheme `calendario://x-callback-url/add`, `alarm=30`, title unchanged (spec R4). Non-iOS passes the same `eventDate` to `addToGoogleCalendar`.

### D4: Countdown redesign

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `useState(calculateTimeLeft(...))` at render | `Date.now()` at render → SSR/CSR mismatch (spec R5) | `useState<TimeLeft \| null>(null)`; compute in effect after mount; placeholder renders "00" identically on server/client |
| `timeLeft.days === 0` check | Fires all day, not at zero-crossing | Tick compares `prev.isOver → true` transition; fires once |
| `onComplete` in effect deps | Inline arrow re-creates → interval resets every render | Latest-ref pattern (`useRef` + no-dep effect) |
| Clamped `Math.max(0,...)` | Event-over unrepresentable | Unclamp; `isOver` flag; negative → label "La fiesta ya pasó" |

`calculateTimeLeft.ts` becomes pure with optional `now` param and returns `{ days, hours, minutes, seconds, isOver }` (abs values + `isOver = diffMs < 0`). On mount-after-event: initial compute seeds `prevOver = true` → no fire, event-over renders (R5 scenario 2). Tab-throttled ticks can't double-fire (monotonic transition).

### D5: Search gate

`SearchInvitation.tsx` reads `eventDate` from `$time`; `isComing = eventDate.getTime() - Date.now() <= 30 * 86400000` (`<=` → exactly 30 days shown, spec R6). Real remaining time, never clamped store `timeLeft`. Hidden message becomes exactly `Aun no estan disponibles las entradas de este año` (fixes "diponibles" typo). Shown-prompt text and form stay unchanged.

### D6: Invitation JSON dates

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Template year in JSON | JSON can't interpolate; spec scenario reads file content | Static substitution to current year (2026) |
| Runtime interpolation in `GuestInvitations` | Touches copy flow outside Affected Areas; fails spec's "WHEN JSONs read" scenario | Rejected |

`__familyInvitation.json`: `16/12/2023` → `16/12/2026` (13:00 kept). `__workInvitation.json`: `21/12/23` → `21/12/2026` (18:00 kept). Other copy unchanged. Tradeoff: drifts annually — accepted; display copy, not pipeline code (spec R8 searches pipeline files only; wishlist image URLs containing `112023` are CDN IDs, out of scope).

## Data Flow

```
eventDate.ts (constants + getNextBirthday) ── single source of truth
    ├─→ timeStore ($time.eventDate) ──→ page.tsx ──→ Countdown(targetDate prop)
    │                                        └── onComplete → setEventDate(getNextBirthday())  [no setFullYear hack]
    ├─→ saveTheDate ── iOS: calendario://…date=ISO ──┐
    │        └─→ addToGoogleCalendar(eventDate) ─────┤  (both use upcoming date, never today)
    ├─→ SearchInvitation (eventDate − now ≤ 30d → form; else exact message)
    └─→ JSON copy year (static 2026)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/eventDate.ts` | Create | Constants + `getNextBirthday` (local time) |
| `src/lib/calculateTimeLeft.ts` | Modify | Unclamp, add `isOver` + optional `now` param |
| `src/store/timeStore.ts` | Modify | `{ eventDate }` from `getNextBirthday()`; drop 2 dates, `timeLeft`, `setTime` → `setEventDate` |
| `src/lib/addToGoogleCalendar.ts` | Modify | Local getters, `YYYYMMDDTHHMMSS`, no slashes |
| `src/lib/saveTheDate.ts` | Modify | Event date instead of `new Date()`; local ISO for iOS |
| `src/components/Countdown.tsx` | Modify | Hydration-safe init, tick zero-crossing, event-over label |
| `src/app/page.tsx` | Modify | Remove hack; `onComplete` → `setEventDate(getNextBirthday())` |
| `src/components/SearchInvitation.tsx` | Modify | Real proximity gate (≤30d), exact message |
| `src/data/__workInvitation.json` | Modify | `21/12/23` → `21/12/2026` |
| `src/data/__familyInvitation.json` | Modify | `16/12/2023` → `16/12/2026` |

`useGuestData.ts` — no date logic; untouched. `GuestInvitations.tsx`/`InvitationInfo.tsx` — consume JSON as-is; untouched.

## Interfaces / Contracts

```ts
// eventDate.ts
export const EVENT_MONTH: number; export const EVENT_DAY: number;
export const EVENT_HOUR: number;  export const EVENT_MINUTE: number;
export function getNextBirthday(now?: Date): Date;

// calculateTimeLeft.ts
export interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; isOver: boolean; }
export function calculateTimeLeft(targetDate: Date, now?: Date): TimeLeft;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Build/type | All modules compile; no `2023` in pipeline | `npm run build`, `npm run lint`, `rg 2023 src/lib src/store src/components src/app` |
| Manual (browser) | Google link `20261216T200000`; iOS `calendario://` contains `-12-16T20:00:00`; countdown ticks, fires once at zero, event-over label; search form shown ≤30d / hidden + message beyond | Dev server + device/UA spoof, fixed `Date` via devtools override near boundary |
| Manual (JSON) | Invitation cards show 16/12/2026 and 21/12/2026 | Guest demo route |

No test framework exists in the repo; adding one is a separate change (open question for orchestrator).

## Migration / Rollout

No migration — pure frontend. Rollback: revert the feature commit; hardcoded store init removed, so fallback is `getNextBirthday()` which is equivalent-or-better.

## Commit & PR Strategy

Estimate ≈ 290 changed lines (additions+deletions) — **under** the 400-line budget, Low risk.
`Decision needed before apply: No` · `Chained PRs recommended: No` · `400-line budget risk: Low`
One PR, 6 work-unit commits (each independently revertable, repo coherent after each):

1. `feat(event-date): single source of truth for party date` — `eventDate.ts`
2. `fix(store): derive event date from module; drop stale dates and setFullYear hack` — `timeStore.ts`, `page.tsx`
3. `fix(calendar): calendar links use upcoming event date with local formats` — `addToGoogleCalendar.ts`, `saveTheDate.ts`
4. `fix(countdown): hydration-safe zero-crossing with event-over state` — `calculateTimeLeft.ts`, `Countdown.tsx`
5. `fix(search): gate search form on real 30-day proximity` — `SearchInvitation.tsx`
6. `chore(data): invitation copy to current event year` — both JSONs

If reviewer wants smaller slices: chain PR1 (commits 1–2, date core) → PR2 (3–6, consumers), each ≈ 120–170 lines.

## Open Questions

- [ ] Confirm no new test framework (recommended: keep out of scope; verification via build/lint/manual matrix above).
- [ ] Event-over label "La fiesta ya pasó" — not pinned by spec; adjust copy freely in apply.
