# Delta for component-primitives

## MODIFIED Requirements

### Requirement: react-bits vendoring

The react-bits components used by this app (Aurora, BlurText, plus the set specified in the reactbits-components spec) MUST be vendored as source under `src/components/reactbits/`, replacing the previous CLI install (`npx shadcn@latest add @react-bits/Aurora-TS-TW @react-bits/BlurText-TS-TW`); no shadcn CLI installs remain. Aurora = soft animated gradient backdrop on the confirm page card (replaces cream/yellow radial chaos; static fallback under reduced motion). BlurText = hero title reveal; the words mode (`animateBy === 'words'`) MUST split and reveal text per word — currently both branches split into characters (`BlurText.tsx:51`) — while the characters mode MUST keep character-level reveal. Vendored components and their parents MUST be client components (`"use client"`); SSR-safe on Next 14 + React 18.
(Previously: installed Aurora and BlurText via the shadcn CLI; BlurText had no working words mode — both branches split into chars.)

#### Scenario: Client boundary

- GIVEN BlurText on the `[id]` page
- WHEN the page renders
- THEN words reveal sequentially and no client-only hook runs during SSR

#### Scenario: Words mode reveals per word

- GIVEN BlurText with `animateBy="words"`
- WHEN the reveal runs
- THEN tokens appear grouped per word, not one character at a time
- AND `animateBy="characters"` still reveals per character

#### Scenario: Vendored source replaces CLI install

- GIVEN the change applied
- WHEN the repo is inspected
- THEN Aurora and BlurText exist under `src/components/reactbits/`
- AND no CLI-install artifacts remain
