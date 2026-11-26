# Accessibility

Non-negotiable floor for every screen. Party warmth never comes at the cost of access.

## Rules

- **Contrast**: text >= 4.5:1 (normal), >= 3:1 (large). White on primary-700 is the default CTA pair. Check colored surfaces (paper, success, danger).
- **Touch targets**: interactive elements >= 44x44px. Button sizes sm/md/lg = 44/48/56px min-heights.
- **Focus**: visible accent ring on keyboard focus (see behaviors/focus).
- **Keyboard**: full Tab flow; no trap; card containers not focusable.
- **Motion**: reduced-motion kills non-essential animation (see behaviors/motion-reduction).
- **Semantics**: exactly ONE `<main>` in the DOM (layout owns it); headings hierarchical; status via `role="status"` + sr-only labels.
- **Text**: body >= 16px; captions >= 14px.
- **Language**: `lang="es"` on `<html>`; all user-facing copy in Spanish (Rioplatense).

## Do & Don't

- DO run a contrast check on every new colored surface.
- DO label icons (aria-label / sr-only) when they carry meaning.
- DON'T rely on color alone to convey state (loading, error, confirm).
- DON'T use emoji as interface icons (decorative only).
