# Proposal: Fix /confirm access guard (B3)

## Intent

B3 (CRITICAL): `/confirm` is the instructions page for confirmed guests only, but its guard is inverted — `if (error || (guestData.isDrity && guestData.isConfirmed === false))` redirects only DECLINED guests, so anyone who never RSVP'd (`isDrity=false, isConfirmed=false`) opens `/confirm` directly. `router.push` also runs during render. The design-system change restyled this page but left the logic byte-identical (deferred in its proposal). This change fixes ONLY the guard; the visual design is preserved.

## Scope

**In**
- Rewrite guard in `src/app/[id]/confirm/page.tsx`: redirect to `/[id]` whenever guest is NOT confirmed after load
- Redirect inside `useEffect` (no render side effects); safe render fallback while pending
- `router.replace` for the guard (no back-button loop; existing `push` calls are user-initiated nav, no guard precedent)

**Out**
- Visual changes (tokens, primitives, copy)
- `GroupedButtons` decline branch; home-page flows
- Data layer (`useGuestData`, `firebase.ts`, `guests.json`)
- Other bugs

## Capabilities

**New:** `confirm-guard` — access rules for `/confirm`: only confirmed guests render; loading/not-confirmed/error separation; no render side effects.
**Modified:** None (`event-date`, `design-tokens`, `component-primitives` untouched).

## Approach

Model (verified): `isDrity` = RSVP'd; `isConfirmed` = attending; `findGuest` = id in `guests.json`; `error` = unknown id (firebase failure falls back to seed); initial `loading=true` with `isConfirmed=false`. The guard MUST fire only after `loading=false`, else initial defaults would redirect every mount. Condition: `!loading && (error || !findGuest || !guestData.isConfirmed)` → `router.replace(\`/${id}\`)` in `useEffect` (deps: loading, error, findGuest, isConfirmed, id). Render: spinner while loading; `null` on the guard path (no flash before the effect); page only when confirmed. Target `/[id]` shows the RSVP buttons.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/[id]/confirm/page.tsx` | Modified | Guard condition, `useEffect` redirect, render fallback |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Redirect flash / StrictMode double effect | Med | Guard only when `!loading`; `replace`; `null` render on guard path |
| Confirmed guest misredirected | Low | Only render path is `isConfirmed === true` |
| Error redirects valid guest | Low | `error` set only for unknown id; firebase failure falls back to seed |

## Rollback Plan

`git checkout -- src/app/[id]/confirm/page.tsx`. Single client component; no data/deps/migrations.

## Dependencies

None. Verification (no test runner): `npx tsc --noEmit`, `npm run lint`, `npm run build`, manual walkthrough of 5 states: loading / never-interacted / declined / confirmed / unknown-id.

## Success Criteria

- [ ] `isConfirmed=false` (never-interacted OR declined) → redirected to `/[id]`, no confirm-UI flash
- [ ] Loading shows spinner, never redirects
- [ ] Confirmed guest sees the page; visual design unchanged
- [ ] Unknown id → redirect; no render-side-effect console warnings
- [ ] `tsc` / lint / build pass
