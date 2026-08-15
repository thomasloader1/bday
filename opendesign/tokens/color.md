# Color

One primary, one accent, slate neutrals, festive accents, semantic states. Kills the old orange/blue/green/slate chaos.

## Tokens

| Token | Value | Usage |
|---|---|---|
| primary.500 | `#F97316` | Family anchor (warm orange); decorative, large text only |
| primary.600 | `#EA580C` | CTA bg for large text (>= 3:1) |
| primary.700 | `#C2410C` | CTA bg default; white text >= 4.5:1 |
| primary.800 | `#9A3412` | CTA hover / active |
| primary.50–400, 900 | orange scale (`#FFF7ED`…`#FB923C`, `#7C2D12`) | Tints and deep accents (open: fill from Tailwind orange scale) |
| accent.500 | `#6366F1` | Focus rings, highlights |
| accent.600 | `#4F46E5` | Gradient glow, accent hover |
| neutral.50–900 | slate scale (`#F8FAFC`…`#0F172A`) | Surfaces, text, borders |
| white | `#FFFFFF` | Text on primary.700, surfaces |
| festive.cream | `#F9EFDB` | Card paper tint |
| festive.yellow | `#FFEAA7` | Decorative accents, sparingly |
| success | `#15803D` | Confirm — white text 5.01:1 (>= 4.5:1 AA) |
| danger | `#475569` | Decline — "danger" reads slate |
| info | `#2563EB` | Informational |
| warning | `#F59E0B` | Alerts |

## Roles

- **primary** — the single action color. Use for CTAs and key emphasis.
- **accent** — attention, never body text. Focus rings, highlights, glow.
- **neutral** — chrome: surfaces, borders, body text, captions.
- **festive** — party decoration only: card tints, background accents.
- **semantic** — state: success (confirm), danger (decline), info, warning.

## Usage

- Text on a colored surface MUST meet WCAG AA: >= 4.5:1 normal, >= 3:1 large.
- White on primary.700 is the default CTA pair (>= 4.5:1).
- Dark mode: `dark:` surfaces map to neutral-800/900 from the same scale.
- Zero hardcoded hex or arbitrary color classes on tokenized surfaces.

## Do & Don't

- DO use one primary per screen; accent sparingly.
- DO use festive colors only as decorative tints, at low visual weight.
- DON'T introduce a second primary or a competing hue family.
- DON'T use accent as body text; DON'T mix orange + blue + green on one screen.
- DON'T write `bg-[#…]` / `text-[#…]` in app code — token classes only.
