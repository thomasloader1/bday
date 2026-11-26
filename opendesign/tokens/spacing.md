# Spacing

Adopt Tailwind's default 4/8pt scale as convention. No new tokens; the scale IS the system.

## Tokens

| Token | Value |
|---|---|
| 0 / 1 / 2 / 3 / 4 / 5 / 6 | 0 / 4 / 8 / 12 / 16 / 20 / 24 px |
| 8 / 10 / 12 / 16 / 20 / 24 | 32 / 40 / 48 / 64 / 80 / 96 px |
| gutter | 24px (`px-6`), 32px on md+ (`md:px-8`) |

## Roles

- **gutter** — the ONE page horizontal padding; applied on the layout `<main>` (`container mx-auto px-6 md:px-8`).
- **scale** — all component padding, gaps, margins come from the scale (4/8pt rhythm).

## Usage

- Page-level padding overrides removed: wishlist `px-24` and `[id]`/confirm `px-8 pt-10` go away.
- Vertical rhythm: `mb-*`/`space-*` multiples of 4px.
- Touch targets use the scale: buttons min-heights 44/48/56px.

## Do & Don't

- DO pick sizes from the scale; 4px is the base unit.
- DO keep one gutter per page.
- DON'T use odd spacing values (5px, 13px, 21px).
- DON'T override the gutter per page.
- DON'T use magic paddings like `mb-40` to clear fixed elements — fix the layout instead.
