# Proposal: Design System — "Party Suave"

## Intent
Zero token infrastructure: 5 button implementations, 4 card treatments, color chaos (orange/blue/green/slate), inconsistent radius/shadow/spacing, dead CSS + 5 unused deps. Goal: disciplined minimalism (1 primary + 1 accent, display+body font pairing, ONE button language, tokenized motion) that keeps the party warmth — it's a birthday app.

## Scope
**In:**
- Tokens: `tailwind.config.ts` (colors, fonts, spacing, radius, shadow, animation); `globals.css` cleanup (dead keyframes, RGB vars, inert classes)
- Primitives: `Button` variant system (primary/secondary/ghost/danger), new `Card`; remove dead `InvitationButton`, `ProductCard`
- Fixes: `LoadingSpinner` h-screen bug; `Footer` mb-40 magic; nested `<main>`
- `CakeBackground` redesign (subtle, reduced-motion aware)
- Restyle `[id]`, `[id]/confirm`, `wishlist` pages on tokens; `ProductCard2` polish
- Icon policy: SVG (react-icons) interactive, emoji decorative only
- Deps: add `motion` + 2 react-bits; remove 5 unused (canvas-confetti, confetti-js, emoji-mart, react-countdown, react-countdown-circle-timer)

**Out:**
- Locked fix-date-pipeline files (`Countdown.tsx`, `SearchInvitation.tsx`, home `page.tsx`, lib/store, JSONs) → **countdown digit styling + home/search restyle deferred** until that change verifies/archives
- Firebase/security/PII; functional bugs (confirm guard, search validation)
- `next/image` migration (separate change); leaflet redesign; full dead-code sweep beyond replaced primitives

## Capabilities
> `openspec/specs/` empty — all new.
**New:** `design-tokens` (palette, typography, spacing/radius/shadow, motion, icon policy); `component-primitives` (Button/Card variants).
**Modified:** None.

## Approach
Tokens → primitives → pages, all consuming tokens. Motion: framer-motion (`motion` pkg) for page-load stagger, hover/tap, micro-interactions. react-bits (2 only): **Aurora** (soft animated gradient bg — replaces cream/yellow radial chaos; CSS-based, cheap, static reduced-motion fallback) + **BlurText** (gentle per-word title reveal). Rejected: Particles (heavy canvas), RollingGallery/TiltedCard (flashy, wrong direction), SpotlightCard/Dock (interactive chrome). Reduced-motion via media query.

## Aesthetic Direction
- **Palette:** 1 primary (warm orange `#F97316`-family), 1 accent (indigo, fixed from broken rgba glow), neutrals (slate/white), festive accents (cream, yellow) used sparingly
- **Type:** display font (headings/hero — NOT Inter) + refined body; Inter only for body
- **Scales:** 4/8pt spacing; systematic radius (sm/md/lg/full); shadow elevation scale
- **Motion tokens:** 150–300ms, one easing curve, 1 staggered page load, reduced-motion off

## Affected Areas
| Area | Impact |
|---|---|
| `tailwind.config.ts`, `globals.css`, `layout.tsx` | Mod (tokens, fonts, single main) |
| primitives: `Button`, `Card`(new), `LoadingSpinner`, `Footer`, `CakeBackground` | Mod |
| components: `GroupedButtons`, `Badge`, `GuestInvitations`, `Invitation*`, `NoInvitation`, `WhatsAppButton`, `SearchInvitationForm`, `LocationButton`, `ProductCard2` | Mod |
| dead: `InvitationButton`, `ProductCard`, 5 unused deps | Removed |
| pages: `[id]`, `[id]/confirm`, `wishlist` | Mod (restyle) |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Tailwind JIT kills dynamic classes (WhatsAppButton color string) | Med | Static variant maps |
| motion/SSR: motion components must be client | Med | `"use client"`; verify react-bits on React 18/Next 14 |
| >400 changed lines | High | chained slices below |
| Locked-file drift | Med | restyle deferred to follow-up |

## Delivery Strategy
Exceeds 400 lines → chained PRs:
- **Slice 1** (starts: token config; ends: primitives live): tokens + primitives + layout fixes
- **Slice 2** (starts: restyles; ends: pages on tokens): react-bits + CakeBackground + page restyles + icon policy
- **Slice 3** (starts: polish; ends: cleanup): dep removal, dead-code, countdown styling when unlocked

## Rollback Plan
Revert per-slice commit (pure frontend, no migrations, no data). Backup `tailwind.config.ts`/`globals.css` pre-slice-1.

## Dependencies
- fix-date-pipeline verify/archive before locked files restyle
- `motion` + react-bits TS-TW installs (React 18/Next 14 compat check)

## Success Criteria
- [ ] All components consume tokens; zero arbitrary-value color/radius left
- [ ] ONE Button primitive everywhere; Card for all cards
- [ ] CakeBackground no re-layout; reduced-motion static
- [ ] Footer without mb-40 magic; single `<main>`
- [ ] Only 2 react-bits; contrast ≥4.5:1; build + lint pass
- [ ] Unused deps removed
