# Focus

Keyboard focus is always visible and always consistent: accent ring, never `focus:shadow-outline`.

## Rules

- Interactive elements use `focus-visible:` ring styles: `focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:outline-none`.
- Rings appear only on keyboard focus (`focus-visible`), not on mouse click.
- The old inert `focus:shadow-outline` pattern is deleted everywhere.
- Buttons, links, inputs: all keyboard-reachable; Tab order matches visual order.
- Card containers are never focusable — the interactive element inside is.

## Do & Don't

- DO keep the ring accent-500 (>= 3:1 against its background).
- DO apply rings to the ui/Button primitive and all form controls.
- DON'T remove focus styles to "look cleaner" — invisible focus is an accessibility failure.
- DON'T use shadow as the focus indicator.
