# Card

One card primitive replacing 4 ad-hoc treatments (wrapper divs, radial-gradient divs, swiper slides, product cards).

## Anatomy

```
┌─────────────────────────────┐
│  Card (p-6, rounded-xl,     │
│  border-neutral-200)        │
│  ┌───────────────────────┐  │
│  │  content (children)   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

Presentational container only. Interactive content lives INSIDE (Button, Link).

## Tokens

| Variant | Surface | Border | Shadow |
|---|---|---|---|
| default | white | neutral-200 | none |
| paper | festive-cream | neutral-200 | none |
| elevated | white | neutral-200 | md |

Base: `p-6` (24px), `rounded-xl` (16px).

## Variants & States

- default — standard content cards.
- paper — warm tinted cards (invitation slides, party surfaces).
- elevated — cards lifted off the page (hero invitation card).
- No interactive states of its own; the card is a div.

## Behavior

- Replaces: `[id]` wrapper div → elevated; confirm radial-gradient div → paper (gradient removed/tokenized); GuestInvitations slides → default/paper; ProductCard2 → elevated.
- Swiper slide radius tokenized to xl in globals.css.

## Accessibility

- Neutral border + white/cream surface keeps text contrast stable.
- If a whole card is clickable, the interactive element inside is the focusable target — never the card div.
- No `role` needed for plain containers.

## Do & Don't

- DO pick variant by surface meaning: elevated = hero content, paper = warm invite, default = anything else.
- DO keep p-6 padding unless content requires a wider layout.
- DON'T hand-roll card divs with bg/radius/shadow classes.
- DON'T make the card div itself interactive.
