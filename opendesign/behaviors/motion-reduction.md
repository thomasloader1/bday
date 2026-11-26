# Motion Reduction

Every animation has an off switch. `prefers-reduced-motion: reduce` disables non-essential animation; static fallbacks render instead.

## Rules

- CSS: `@media (prefers-reduced-motion: reduce)` sets `animation: none` on `animate-drift` (CakeBackground) and any other tokenized animation classes.
- Motion components: use `useReducedMotion()` from `motion/react` — when reduced, skip entrance/exit variants (render final state, no transform/opacity animation).
- Aurora (react-bits): gated by `useReducedMotion` — reduced users get a static gradient div, the WebGL canvas never mounts.
- Page load: ONE staggered entrance per page; reduced → elements render visible immediately.
- Only transform/opacity are animated anywhere (GPU-composited).

## Exceptions

- Essential feedback keeps working: the spinner ring still spins (or shows a static ring + sr-only status), focus rings, cursor states.

## Do & Don't

- DO test every animated component with OS reduced-motion on.
- DO prefer CSS media queries for CSS animations and `useReducedMotion` for motion components.
- DON'T leave any animation running under reduced motion.
- DON'T hide content behind an animation that can be disabled.
