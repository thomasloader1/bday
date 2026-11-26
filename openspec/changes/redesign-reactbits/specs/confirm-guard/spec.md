# Delta for confirm-guard

## MODIFIED Requirements

### Requirement: 3. Confirmed path preserved (behavior and copy)

For a confirmed guest the page MUST render with the same behavior and copy as today: the guard flow, data, and the existing foundation components (AuroraBackdrop, Card paper, BlurTextTitle, GuestInvitations, Footer, `pageEntrance` motion) remain in place, and there MUST be zero behavior change to confirm flows. Visual composition MAY change as part of the redesign polish (e.g. click sparkle, ambient effects); the page is no longer required to be byte-identical.
(Previously: required the page to render exactly as today — layout, tokens, motion, and copy byte-identical to the current page.)

#### Scenario: Confirmed guest behavior unchanged

- GIVEN a confirmed guest opens the page
- WHEN the guard passes
- THEN no redirect fires
- AND the functional flows (swiper, calendar, WhatsApp) behave exactly as before

#### Scenario: Visual polish permitted

- GIVEN a confirmed guest opens the page after the redesign
- WHEN it renders
- THEN visuals MAY differ from the pre-change page (added click sparkle / ambient effects)
- AND copy and guard behavior remain identical
