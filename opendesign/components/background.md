# Background (CakeBackground)

Festive floating-icon background. Redesigned: positions generated once, CSS-keyframe drift, zero re-renders, reduced-motion static. Used on home (birthday cake) and `[id]` (party popper).

## Anatomy

```
<div class="absolute inset-0 overflow-hidden -z-10 pointer-events-none" aria-hidden>
  {icons.map(i => <div class="animate-drift …" style={{left, top, animationDelay, animationDuration}} />)}
</div>
```

- Container: absolute, inset-0, `pointer-events-none`, `aria-hidden`.
- Icons: <= 20 (design uses 18), festive palette at low opacity (NOT gray-900).

## Tokens

| Token | Value |
|---|---|
| count | <= 20 (design: 18) |
| colors | festive.yellow / primary-300..400 / accent-300..400 at 40–50% opacity |
| size | text-3xl–4xl |
| animation | `drift` 3–6s (per-icon duration + delay), ease-in-out, infinite |
| reduced motion | `animation: none` → static positions |

## Variants & States

- Animated (default): icons gently drift via CSS keyframes (transform only, GPU).
- Static (reduced motion): `@media (prefers-reduced-motion: reduce)` kills `animate-drift`; positions remain.

## Behavior

- Positions generated ONCE via `useMemo` on mount. No `setInterval`, no setState loop, no collision check (decorative icons may overlap — the old O(n²) check was pointless).
- No re-renders or re-layouts after mount; 60s elapse → zero state updates.
- Drift animates transform only; nothing else moves.

## Accessibility

- `aria-hidden` + `pointer-events-none`: never blocks content or focus.
- Reduced motion → static background, no entrance or drift animation.
- Decorative only — never carries meaning.

## Do & Don't

- DO keep count <= 20 and opacity low — it's atmosphere, not content.
- DO generate positions once; never loop with timers.
- DO use festive palette; gray icons on a light page are invisible and sad.
- DON'T re-render on a tick; DON'T animate layout properties; DON'T use emoji icons here when SVG (react-icons) is available.
