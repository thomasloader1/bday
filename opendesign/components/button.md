# Button

The ONE button language. Replaces 5 button implementations (old `Button.tsx` colorMap, InvitationButton, GroupedButtons pills, inline anchors, inline form submit).

## Anatomy

```
[ icon ] [ spinner slot ] [ label ]      ← button element (native)
└─────────── button / a (asChild) ──────
   base: min-height by size, rounded-lg, font-medium, duration-fast ease-party
   loading: spinner in reserved slot + label, disabled
```

- Label = text content. Icon = react-icons/fa6 node, `iconPosition` left|right.
- Spinner slot is always reserved (width reserved while loading — NO layout shift).
- `asChild` renders a Link/anchor and merges classes.

## Tokens

| Variant | Rest | Hover | Text |
|---|---|---|---|
| primary | `bg-primary-700` | `bg-primary-800` | white |
| secondary | white + `border-neutral-200` | `bg-neutral-50` | neutral-700 |
| ghost | transparent | `bg-primary-50` | primary-700 |
| success | `bg-success` | `bg-success/90` | white |
| danger | `bg-danger` | `bg-danger/90` | white |

Sizes: sm = min-h 44px, md = 48px, lg = 56px (touch >= 44x44).

## Variants & States

- Idle → hover (bg shift) → active (`scale-95`) → focus-visible (`ring-2 ring-offset-2 ring-accent-500`).
- Disabled: `disabled` attr + reduced opacity, no hover.
- Loading: disabled + inline spinner (sm) + label; size unchanged.
- As link: `asChild` wraps `Link`/`<a>`; focus ring preserved.

## Behavior

- `loading` MUST disable the button and show spinner WITHOUT layout shift (reserved slot; no emoji text-3xl jumps).
- Static variant maps (no dynamic class strings — Tailwind JIT safe).
- `type="button"` default; form submits pass `type="submit"`.

## Accessibility

- Min heights 44/48/56px; visible focus ring on keyboard focus (accent-500).
- Loading state announced via `aria-busy`; disabled prevents double-submit.
- Contrast: white on primary-700 >= 4.5:1; large-text variants >= 3:1.
- Icons are SVG (react-icons/fa6), never emoji, on interactive buttons.

## Do & Don't

- DO use primary for the one main action per screen.
- DO use loading, not emoji swaps, for pending states.
- DON'T style raw `<button>` elements with ad-hoc classes — use the primitive.
- DON'T use emoji inside buttons; DON'T use dynamic color strings.
