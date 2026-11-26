---
odsf_version: "0.1"
okf_version: "0.1"
name: "Party Suave — Design System"
description: "Editable design system reference for the bday app (30th birthday invitation site). Token-first, warm party aesthetic, disciplined minimalism."
created: "2026-08-15"
---

# Party Suave — Design System

Editable Open Design reference for iterating on the bday design system. Values here are the source for the running implementation; where a value is marked `open`, pick and record it in `log.md` before changing code.

## Foundation

- [Tokens / Color](tokens/color.md) — one primary (warm orange), one accent (indigo), slate neutrals, festive accents, semantic states
- [Tokens / Typography](tokens/typography.md) — Fraunces display + Inter body, semantic type scale
- [Tokens / Spacing](tokens/spacing.md) — 4/8pt scale, one page gutter
- [Tokens / Elevation](tokens/elevation.md) — shadow scale with roles
- [Tokens / Shape](tokens/shape.md) — radius scale with conventions
- [Tokens / Motion](tokens/motion.md) — durations, one easing curve, stagger, drift
- [Styles / tokens.css](styles/tokens.css) — machine-readable CSS custom property projection

## Components

- [Button](components/button.md) — the one button language (5 variants, loading without layout shift)
- [Card](components/card.md) — default / paper / elevated
- [Loading Spinner](components/loading-spinner.md) — inline vs page-level, no h-screen bug
- [Background (CakeBackground)](components/background.md) — festive floating icons, reduced-motion aware

## Behaviors

- [Loading](behaviors/loading.md)
- [Motion Reduction](behaviors/motion-reduction.md)
- [Focus](behaviors/focus.md)

## Guidelines

- [Accessibility](guidelines/accessibility.md)
- [Icon & Emoji Policy](guidelines/icon-emoji-policy.md)
- [Voice](guidelines/voice.md) — Rioplatense, warm, party tone

## Changelog

See [log.md](log.md).
