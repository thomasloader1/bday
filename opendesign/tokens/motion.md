# Motion

Tokenized motion: short durations, ONE easing curve, ONE staggered page-load entrance. Reduced-motion off by default.

## Tokens

| Token | Value |
|---|---|
| transitionDuration.fast | 150ms |
| transitionDuration.base | 250ms |
| transitionDuration.slow | 300ms |
| transitionTimingFunction.party | `cubic-bezier(0.16, 1, 0.3, 1)` |
| stagger.pageLoad | 60–80ms between elements (constant 80ms in `src/lib/motion.ts`) |
| keyframes.drift | translateY(0 → -12px → 0), ease-in-out, 4s loop |

## Roles

- **fast** — hover/tap state changes on interactive elements.
- **base/slow** — entrances, larger transitions.
- **party** — the one easing curve; use everywhere for consistency.
- **pageLoad stagger** — container variants: ONE staggered entrance per page.
- **drift** — CakeBackground floating icons (CSS keyframes, transform only).

## Usage

- Durations/easing/keyframes live in `tailwind.config.ts` (CSS classes: `duration-fast`, `ease-party`, `animate-drift`).
- Stagger constants live in `src/lib/motion.ts` for `motion` transition props.
- Animate only transform/opacity (GPU-composited, no layout thrash).
- No scattered micro-interactions: one well-orchestrated entrance beats ten random tweens.
- `prefers-reduced-motion: reduce` → no entrance runs, backgrounds static.

## Do & Don't

- DO keep durations inside 150–300ms.
- DO use `ease-party` everywhere; one curve.
- DO respect reduced motion (CSS media query + `useReducedMotion` for motion components).
- DON'T add per-element one-off animations; DON'T loop background motion.
- DON'T animate layout properties (width, height, top, left).
