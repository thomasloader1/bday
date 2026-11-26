# Delta for confirm-guard

## MODIFIED Requirements

### Requirement: 3. Confirmed path preserved

For a confirmed guest the page MUST render with ONE visible card level: the outer surface MAY be flattened to a borderless `Card variant="paper"` (`className="relative w-full max-w-3xl border-0"`, `[id]/confirm/page.tsx:42`), keeping the festive-cream tint and AuroraBackdrop, while the inner slide Cards MUST keep the card look. All behavioral requirements MUST remain byte-identical: loading spinner, guard redirect condition, `router.replace`, effect-only navigation, confirmed-path JSX structure, copy, and motion.

(Previously: the confirmed path rendered exactly as today, with the outer surface as a bordered Card paper and zero visual change allowed.)

#### Scenario: One visible card level

- GIVEN a confirmed guest opens `/confirm`
- WHEN the confirmed path renders
- THEN the outer surface shows no border (`border-0`) and the inner slide Cards are the only visible card level
- AND the festive-cream tint and AuroraBackdrop remain

#### Scenario: Behavior unchanged

- GIVEN the flattened outer surface
- WHEN a confirmed guest interacts with the page
- THEN loading spinner, redirect condition, `router.replace`, effect-only navigation, copy, and motion behave byte-identically to before

## ADDED Requirements

### Requirement: 7. No gray alert box on personal slides

The personal-slide alert MUST keep `role="alert"` and its text classes, but MUST NOT render as a filled box: the `bg-gray-50 dark:bg-gray-800` fill MUST be dropped (`InvitationPersonalInfo.tsx:18`).

#### Scenario: Alert keeps semantics

- GIVEN a confirmed guest views the personal slide
- WHEN the PD alert renders
- THEN `role="alert"` is present and the text stays readable
- AND no gray fill appears

### Requirement: 8. Footer renders as a hairline, not a band

The footer MUST NOT render a white band: `bg-white` MUST be dropped (`Footer.tsx:6`); the `border-t border-neutral-200` hairline and all footer content MUST remain.

#### Scenario: Footer without white fill

- GIVEN the confirm page renders
- WHEN the footer renders
- THEN no white fill appears and the top border hairline remains
- AND footer links and copy stay intact

### Requirement: 9. Coverflow swipe affordance preserved

The swiper MUST keep its coverflow parameters, `centeredSlides`, `slidesPerView={2}`, `grabCursor`, and pagination. The `.swiper` 50px top/bottom padding (`globals.css:9-13`) MUST be removed, and `slideShadows` MUST be set to `false` (`GuestInvitations.tsx:30`) so neighbor slides stop reading as extra boxes.

#### Scenario: Side slides keep card affordance

- GIVEN the flattened page renders the swiper
- WHEN slides render
- THEN side slides keep card shape and tilt with no shadow boxes behind them
- AND no 50px vertical void appears inside the surface

#### Scenario: Swipe still navigates

- GIVEN a confirmed guest swipes the coverflow
- WHEN the swipe completes
- THEN the slide changes and pagination advances
