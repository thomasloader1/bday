# Design: Fix /confirm access guard

## Technical Approach

Single-file fix to `src/app/[id]/confirm/page.tsx`. Replace the render-time `router.push` guard (inverted condition) with a post-load `useEffect` that calls `router.replace` whenever the guest is not confirmed; render the spinner while loading and `null` while a redirect is pending. Confirmed-guest JSX stays byte-identical. Follows the proposal; reuses the `[id]/page.tsx` loading pattern and the `LoadingSpinner` standalone primitive (component-primitives spec).

## Architecture Decisions

### Decision: Redirect condition

| Option | Tradeoff | Decision |
|---|---|---|
| Current: `error \|\| (isDrity && isConfirmed === false)` | Requires `isDrity` → never-interacted guests (`isDrity=false`) bypass; only declined redirect | `!loading && (error \|\| !findGuest \|\| !guestData.isConfirmed)` |
| `!isConfirmed` alone | Unknown id keeps defaults → redirects, but hides *why*; error means "no guest identity" | Keep explicit `error` + `findGuest` clauses |

Each clause: `!loading` gates the whole decision — initial defaults are `isConfirmed=false`, so un-gated every mount would redirect. `error` = unknown id / lookup failure. `!findGuest` = id absent from `guests.json` (defensive; `getGuest` sets both). `!guestData.isConfirmed` = the access rule — one clause covers never-interacted AND declined, making `isDrity` unnecessary (a confirmed guest always RSVP'd).

### Decision: Effect placement and navigation

| Option | Tradeoff | Decision |
|---|---|---|
| Redirect during render (current) | Side effect in render → "Cannot update a component while rendering" warning; StrictMode double-fire; content paints before nav | `useEffect` |
| `router.push` | New history entry → Back returns to `/confirm` → guard re-fires → back-button loop | `router.replace` — guard is corrective; user-initiated `push` calls elsewhere (GroupedButtons) unchanged |
| Deps: `[loading, error, findGuest, guestData.isConfirmed, params.id]` | Every guard input re-triggers the check; `params.id` = replace target + param-change re-check; exhaustive-deps clean | Adopt |

StrictMode double-effect: `replace` is idempotent (same target URL, second call no-op), the guard decision is deterministic, and the page unmounts after redirect — no cleanup or ref-flag needed.

### Decision: Render states

| State | Render |
|---|---|
| `loading` | `<LoadingSpinner standalone />` — matches `[id]/page.tsx` and the spec |
| `!loading && blocked` | `null` — no confirm-UI flash while the effect schedules the replace |
| confirmed | current JSX verbatim (ternary fragment becomes early returns; content untouched) |

## Data Flow

```
/confirm ── useGuest(params)
   loading=true ─────────────→ <LoadingSpinner standalone />
   getGuest(id): guests.json
     ├─ found   → findGuest=true, guestData = firebase ?? seed
     └─ missing → findGuest=false, error=true
   finally: loading=false
   effect: !loading && (error || !findGuest || !guestData.isConfirmed)
     ├─ true  → router.replace(`/${params.id}`) → /[id] (Invitation/NoInvitation)
     └─ false → confirmed content (unchanged JSX)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/[id]/confirm/page.tsx` | Modify | Guard condition, `useEffect` redirect, early-return render states, destructure `findGuest` |

No other files: `useGuest` already returns `findGuest`; `LoadingSpinner` standalone already fits; design tokens/primitives untouched (visual byte-identical).

## Interfaces / Contracts

None new. `Guest`, `useGuest`, `LoadingSpinner` APIs unchanged.

## Testing Strategy

No test runner in the repo — gates + manual scenarios:

| Gate | Command | Checks |
|---|---|---|
| Types | `npx tsc --noEmit` | condition/deps type-check |
| Lint | `npm run lint` | exhaustive-deps |
| Build | `npm run build` | production compile + route build |

Manual checklist (dev server; React StrictMode active in dev):
1. **Loading** — slow 3G, open `/{id}/confirm`: spinner only; no redirect until load settles; no content flash.
2. **Never-interacted** (seed `isDrity=false, isConfirmed=false`): open `/{id}/confirm` → spinner → redirect `/{id}` → RSVP buttons; confirm UI never painted.
3. **Declined** — RSVP "No Confirmar" on `/{id}` first (firebase doc `isDrity=true, isConfirmed=false`) → `/confirm` redirects to `/{id}` decline message.
4. **Confirmed** — RSVP "Confirmar" → `/confirm` renders title/instructions; visual compare against pre-change screenshot (byte-identical design).
5. **Unknown id** — `/999999/confirm` → spinner → redirect → NoInvitation.
6. **Back button** — after (2): Back must NOT land on `/confirm` (replace semantics).
7. **Console** — no "Cannot update a component while rendering" warning; exactly one redirect under the StrictMode double effect.
8. **Reduced motion** — OS setting toggled: no entrance animation (unchanged behavior).

## Migration / Rollout

No migration. Rollback: `git checkout -- src/app/[id]/confirm/page.tsx`.

## Commit Plan

One commit. The two candidate work units are not independently coherent: condition-only keeps the render side-effect warning and a half-fixed state set; effect-only keeps the inverted-condition bug. Both halves are one atomic guard fix.

```
fix(confirm): redirect unconfirmed guests to /[id] via effect
```

## Open Questions

- [ ] `getGuestFirebase` has no timeout — a hung Firestore read leaves `loading=true` forever (permanent spinner). Pre-existing in `useGuest`, out of scope; flag for a future change.
- [ ] Declined-state manual test needs a real RSVP or seeded doc — seed `guests.json` has no declined person.
