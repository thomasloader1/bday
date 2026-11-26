# Proposal: Fix Date Pipeline

## Intent
App is frozen at Dec 2023: countdown, calendar links and invitation copy hardcode 2023. Calendar events land on TODAY; Google's format is invalid (slashes, day/month swapped); countdown never fires `onComplete` at zero; search form hidden ~11 months/yr. Root cause: no single source of truth for the event date. This is the ROOT fix — later changes depend on it.

## Scope
**In:** event-date source of truth + next-upcoming computation; calendar links use event date (Google `YYYYMMDDTHHMMSS`, correct order); countdown zero-crossing + event-over state; search gate on real proximity; remove unused `targetWorkDate`/`targetFamilyDate` and `setFullYear` hack; B17 date strings in invitation JSONs derive from event date.
**Out:** confirm/RSVP flow; security; Firebase; performance; dead-code cleanup; copy rewrite; non-date usage.

## Capabilities
> `openspec/specs/` empty — all new.
**New:** `event-date` — birthday source of truth, `getNextBirthday()`, consumers (calendar links, countdown, search gate, invitation copy).
**Modified:** None.

## Approach
**A (recommended):** new `src/lib/eventDate.ts` (constants + `getNextBirthday(now)`: this year if upcoming, else next). `timeStore` inits from it; calendar fns take event date; `Countdown` checks zero in tick, event-over when diff < 0; `SearchInvitation` gates on proximity. Survives rollover.
**B:** bump 2023 → current year. Re-breaks next year; format/countdown bugs remain.
**C:** dates in Firebase/guest data. Overkill; couples flow to data.

## Affected Areas
| Area | Impact |
|------|--------|
| `src/lib/eventDate.ts` | New |
| `src/lib/addToGoogleCalendar.ts` | Mod: format/order/date |
| `src/lib/saveTheDate.ts` | Mod: event date |
| `src/store/timeStore.ts` | Mod: computed init, drop unused |
| `src/lib/calculateTimeLeft.ts` | Mod: event-over state |
| `src/components/Countdown.tsx` | Mod: zero-crossing, event-over |
| `src/app/page.tsx` | Mod: remove hack |
| `src/components/SearchInvitation.tsx` | Mod: proximity gate |
| `src/data/__workInvitation.json` + `__familyInvitation.json` | Mod: dates (B17) |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Local vs UTC timezone mismatch | Med | One zone; fixed test dates |
| Birthday passes while page open | Low | Per-tick derive; `onComplete` recomputes |
| Search gate UX change | Med | Proximity on real event |
| iOS `calendario://` scheme stale | Med | Date only; scheme unchanged |
| Scope creep | Med | Explicit OUT list |

## Rollback Plan
Revert the feature commit (pure frontend, no migrations). Fallback: keep hardcoded init in `timeStore`.

## Dependencies
- None. "Next upcoming" relies on device local time.

## Success Criteria
- [ ] Google link `YYYYMMDDTHHMMSS` opens event date, not today
- [ ] iOS `calendario://` carries event date
- [ ] Live countdown year-round; no "00 dias 00 horas" flash
- [ ] `onComplete` at zero-crossing; event-over state after
- [ ] Search form driven by real proximity
- [ ] No hardcoded 2023 dates in pipeline code
