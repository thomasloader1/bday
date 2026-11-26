# Delta for design-tokens

## ADDED Requirements

### Requirement: StarBorder / SplitFlapText keyframes

The `theme.extend.keyframes` and `theme.extend.animation` entries MUST add the animation keyframes required by the vendored StarBorder (two keyframes) and SplitFlapText (flip cycle) components. The existing token definitions (colors, typography, spacing, radius, shadow, motion) MUST remain unchanged; this addition MUST be the only `tailwind.config.ts` change in the change.

#### Scenario: Only keyframes added

- GIVEN the redesign change applied
- WHEN the `tailwind.config.ts` diff is inspected
- THEN only new keyframes/animation entries appear
- AND all existing token definitions are untouched

#### Scenario: Keyframes resolve

- GIVEN StarBorder and SplitFlapText render on the home page
- WHEN the built CSS is inspected
- THEN the animation classes they emit map to keyframes defined in the config
- AND under `prefers-reduced-motion: reduce` those animations are disabled per the motion-tokens requirement
