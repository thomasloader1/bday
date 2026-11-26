# Icon & Emoji Policy

Interactive = SVG icon. Decorative = emoji. Never mix.

## Rules

- **Interactive elements**: react-icons `fa6` set only (one icon family), sizes `text-base`/`text-lg`/`text-xl` (16/18/20px), consistent within a component.
- **Buttons**: icons via the `icon` prop (left/right slot); never emoji inside buttons.
- **Pending states**: spinner, never an emoji swap (`🥳`/`🖕` text-3xl jumps are gone).
- **Emoji**: allowed ONLY as decorative, non-interactive party accents (e.g. 👀 in footer copy).
- **Leaflet marker**: the `divIcon` emoji 🥳 is replaced by an inline SVG pin (map behavior unchanged).
- **Icons carry meaning**: add `aria-label` or sr-only text when the icon is the only affordance.

## Do & Don't

- DO use one icon set (fa6) for all interactive glyphs.
- DO keep icon size on the 16/18/20px scale.
- DON'T use emoji as buttons, links, or inputs.
- DON'T invent inline SVG per-component where react-icons already covers it (leaflet pin is the one exception — SVG string required by divIcon).
