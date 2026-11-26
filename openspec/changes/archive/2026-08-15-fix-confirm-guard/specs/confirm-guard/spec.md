# confirm-guard Specification

## Purpose

Access rules for `/confirm`, the instructions page for confirmed guests only. Loading, not-confirmed, and error states separate cleanly with no render-phase side effects, redirecting unconfirmed guests to the invitation home `/[id]`.

## Requirements

### Requirement: 1. Guard redirect condition

The confirm page MUST redirect to `/[id]` via `router.replace` when and only when `!loading && (error || !findGuest || !guestData.isConfirmed)`. While `loading` is true the page MUST NOT redirect: the initial state (`loading=true`, `isConfirmed=false`) MUST render the spinner, never bounce.

#### Scenario: Confirmed guest stays

- GIVEN `findGuest=true`, `isConfirmed=true`, `error=false`
- WHEN loading finishes
- THEN no redirect fires
- AND the page renders normally

#### Scenario: Never-interacted guest redirects after load

- GIVEN id exists in `guests.json` with `isDrity=false`, `isConfirmed=false`
- WHEN loading finishes
- THEN `router.replace` sends the guest to `/[id]`
- AND the confirm UI never renders

#### Scenario: Declined guest redirects

- GIVEN `isDrity=true`, `isConfirmed=false`
- WHEN loading finishes
- THEN the guest is redirected to `/[id]`

#### Scenario: Unknown id or error redirects

- GIVEN id not in `guests.json` (`error=true`) or the fetch failed
- WHEN loading finishes
- THEN the guest is redirected to `/[id]`

#### Scenario: Loading never redirects

- GIVEN a fresh mount with `loading=true`, `isConfirmed=false`
- WHEN the page renders
- THEN the spinner shows and NO redirect fires

#### Scenario: Back button cannot loop

- GIVEN an unconfirmed guest was redirected to `/[id]` by the guard
- WHEN the browser Back button is pressed
- THEN the previous history entry is not `/confirm` (replace semantics)
- AND no redirect loop occurs

### Requirement: 2. No render side effects

Navigation MUST run inside `useEffect`, never during render. While the guard is pending the page MUST render a safe fallback: `LoadingSpinner` while loading, `null` on the guard path. The confirm UI MUST NOT appear before the redirect.

#### Scenario: Redirect runs in an effect

- GIVEN the guard condition becomes true after load
- WHEN the component renders
- THEN navigation happens in `useEffect`, not during render
- AND no render-phase side-effect warnings appear in the console

#### Scenario: Direct URL open shows no wrong content

- GIVEN a guest opens `/[id]/confirm` in a new tab
- WHEN the page loads and the guard fails
- THEN only the spinner and the `null` fallback appear
- AND the confirm UI never flashes

### Requirement: 3. Confirmed path preserved

For a confirmed guest the page MUST render exactly as today: same tokens and primitives (AuroraBackdrop, Card paper, BlurTextTitle, GuestInvitations, Footer, `pageEntrance` motion) and zero behavior change.

#### Scenario: Visual design unchanged

- GIVEN a confirmed guest opens the page
- WHEN it renders
- THEN layout, tokens, motion, and copy are identical to the current page

### Requirement: 4. Accessible loading state

The loading state MUST use the app-standard `LoadingSpinner` pattern; no new inline spinner. No wrong content MUST flash while the guard resolves.

#### Scenario: Spinner matches app pattern

- GIVEN the page is loading
- WHEN rendered
- THEN the app's standard `LoadingSpinner` appears

### Requirement: 5. Copy untouched

This change MUST NOT alter page copy. Existing copy stays warm party Spanish Rioplatense and MUST NOT introduce em dashes.

#### Scenario: Copy unchanged

- GIVEN the change applied
- WHEN a confirmed guest views the page
- THEN title and instructions are byte-identical to current copy

### Requirement: 6. Manual acceptance and static gates

With no test runner, acceptance MUST be manual walkthroughs of the scenarios above plus static gates: `npx tsc --noEmit`, `npm run lint`, and `npm run build` MUST all pass.

#### Scenario: Static gates pass

- GIVEN the change implemented
- WHEN `npx tsc --noEmit`, `npm run lint`, and `npm run build` run
- THEN all three pass

## Non-Goals

- Visual changes, copy edits, `GroupedButtons` decline branch, home-page flows
- Data layer (`useGuestData`, `firebase.ts`, `guests.json`)
- Existing user-initiated `router.push` calls
