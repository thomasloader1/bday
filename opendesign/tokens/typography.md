# Typography

Display font with personality (NOT Inter) + a refined body font. Party suave.

## Tokens

| Token | Font | Weight | Size | Class |
|---|---|---|---|---|
| display-xl | Fraunces | 700 | 60px | `text-6xl font-display` |
| display | Fraunces | 700 | 48px | `text-5xl font-display` |
| heading | Fraunces | 600 | 30px | `text-3xl font-display` |
| subheading | Fraunces | 600 | 24px | `text-2xl` |
| body | Inter | 400/500/600/700 | 16px | `text-base` |
| caption | Inter | 400/500 | 14px | `text-sm` |

- Display: **Fraunces** via `next/font/google` (`--font-display`, weights 600/700, latin subset).
- Body: **Inter** via `next/font/google` (`--font-inter`, 400/500/600/700).
- Line heights (open): Tailwind defaults for now — 60/48px = 1.0, 30px = 1.2, 24px = 1.33, 16px = 1.5, 14px = 1.43.

## Roles

- **display** — hero titles, page titles, big headings. Voice of the party.
- **subheading/heading** — section titles, card titles.
- **body** — all readable copy; MUST be >= 16px.
- **caption** — metadata, hints, footer text.

## Usage

- Body text is `font-sans` (Inter) by default; display only where a heading lives.
- Body minimum 16px (`text-base`); captions never below 14px.
- Fonts load as CSS variables in `layout.tsx`; `fontFamily.display` and `fontFamily.sans` point at the variables.

## Do & Don't

- DO let Fraunces carry the personality: titles, hero, big numbers.
- DO keep body copy Inter for readability.
- DON'T use Inter for display headings (generic AI look).
- DON'T go below 16px for body copy.
- DON'T use more than 2 weights per font per screen.
