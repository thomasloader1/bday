# Loading Spinner

A status spinner with two modes: inline (components) and standalone (page-level). Fixes the old bug where `isComponent=true` still rendered a full `h-screen` viewport.

## Anatomy

```
<div role="status" class="flex items-center justify-center …">
  <div class="animate-spin rounded-full border-4 border-neutral-300 border-t-primary-700 …" />
  <span class="sr-only">{label}</span>
</div>
```

## Tokens

| Prop | Values | Default |
|---|---|---|
| size | `sm` (20px) / `md` (40px) / `lg` (64px) | md |
| label | string (sr-only) | "Cargando" |
| standalone | boolean | false |

Color: `border-neutral-300` ring + `border-t-primary-700` spin segment (visible on light surfaces).

## Variants & States

- Inline (`standalone=false`, default): renders inline, no viewport sizing. Use inside buttons (sm), LocationButton (sm), inline content.
- Standalone (`standalone=true`): page-level `h-screen` flex centering. Use on `[id]` and confirm loading states.

## Behavior

- No layout shift: spinner occupies its own slot; buttons reserve the slot while loading.
- No full-viewport overlay in inline mode — this is the fix for LocationButton.

## Accessibility

- `role="status"` + sr-only label announces loading to screen readers.
- Label must describe what is loading ("Cargando mapa", "Buscando invitación").
- The spinning animation is essential feedback; reduced-motion keeps the static ring visible.

## Do & Don't

- DO use sm inside buttons and inline components.
- DO use standalone only at page level.
- DON'T pass `isComponent` — the mode is gone.
- DON'T render a spinner where an inline size is expected and accidentally cover the screen.
