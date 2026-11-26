# Shape

A pinned radius scale resolving the mixed `rounded-lg/full/md/t-lg/18px` chaos.

## Tokens

| Token | Value | Use |
|---|---|---|
| sm | 4px | small elements, inputs, tags |
| md | 8px | midsize surfaces |
| lg | 12px | buttons, badges |
| xl | 16px | cards |
| full | 9999px | pills, avatars, dots |

## Roles / Conventions

- Cards = **xl** (16px). Swiper slides were 18px → xl.
- Buttons and badges = **lg** or **full**.
- Map = **lg**.
- App code MUST NOT use arbitrary radius (`rounded-[…]`); swiper slide radius tokenized in globals.css via `@apply rounded-xl`.

## Do & Don't

- DO pick from the scale by role (card xl, button lg).
- DO use `full` only for truly pill-shaped elements.
- DON'T write `rounded-[18px]` or any arbitrary radius.
- DON'T mix two radii on the same element family.
