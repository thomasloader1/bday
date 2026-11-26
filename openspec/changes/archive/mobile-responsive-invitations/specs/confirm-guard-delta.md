# Delta for confirm-guard

## MODIFIED Requirements

### Requirement: 3. Confirmed path preserved

For a confirmed guest the page MUST keep today's functional behavior: the guard flow, data access, and the existing foundation components (AuroraBackdrop, Card paper, GuestInvitations, Footer, `pageEntrance` motion) remain in place. At ≥640px the confirmed path MUST render with today's visuals — zero regression. Below 640px the layout MAY change for responsiveness: the swiper MAY be replaced by the mobile-invitation-deck, and spacing/safe-area adjustments MAY apply. Copy and confirmation behavior MUST NOT change.
(Previously: required the confirmed path to render exactly as today — same tokens and primitives (including BlurTextTitle) with zero behavior change; layout, tokens, motion, and copy had to be byte-identical to the current page.)

#### Scenario: Desktop visuals unchanged

- GIVEN a confirmed guest opens the page at ≥640px
- WHEN it renders
- THEN layout, tokens, motion, and copy are identical to the current page

#### Scenario: Mobile layout may change

- GIVEN a confirmed guest opens the page below 640px
- WHEN it renders
- THEN the swiper MAY be replaced by the mobile-invitation-deck and spacing MAY differ
- AND copy, guard flow, and confirmation behavior remain identical

### Requirement: 6. Manual acceptance and static gates

Acceptance MUST be verified via Playwright e2e (mobile viewport projects) plus manual walkthroughs of the scenarios above, plus static gates: `npx tsc --noEmit` and `npm run lint` MUST pass. `next build` MUST NOT be run.
(Previously: with no test runner, acceptance was manual walkthroughs plus static gates `npx tsc --noEmit`, `npm run lint`, and `npm run build` all passing.)

#### Scenario: Static gates pass

- GIVEN the change implemented
- WHEN `npx tsc --noEmit` and `npm run lint` run
- THEN both pass
- AND `next build` is not executed

#### Scenario: E2E gate passes

- GIVEN the change implemented and Playwright configured with mobile projects
- WHEN the e2e suite runs
- THEN deck, swipe, and no-horizontal-scroll assertions pass
