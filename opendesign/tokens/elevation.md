# Elevation

A small shadow scale with clear roles. Replaces ad-hoc `shadow-md`/`shadow-[…]` mixing.

## Tokens

| Token | Value |
|---|---|
| sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| md | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| lg | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |

## Roles

- **sm** — subtle separation, badges, small elements.
- **md** — cards (default surface + border, `shadow-md` when elevated).
- **lg** — overlays, floating menus, modal-level surfaces.

## Usage

- Cards = md (Card `elevated` variant).
- Overlays = lg.
- Default card = border only, no shadow.
- The inert `focus:shadow-outline` is dead — replaced by focus-visible rings (accent).

## Do & Don't

- DO use the scale; nothing outside sm/md/lg.
- DO prefer border + subtle shadow over heavy drop shadows.
- DON'T use arbitrary `shadow-[…]` values.
- DON'T use shadows as focus indicators — use focus rings.
