# Design: Design System — "Party Suave"

## Technical Approach

Token-first rollout: (1) extend `tailwind.config.ts` with the token vocabulary, (2) build `ui/Button` + `ui/Card` primitives, (3) mechanically adopt primitives in every non-locked consumer (Slice-1 green-build scenario), (4) restyle pages on tokens + 2 react-bits, (5) cleanup. One motion lib, one easing curve, ONE staggered entrance per page, 3 chained PRs. React-bits names verified: `@react-bits/Aurora-TS-TW` (dep `ogl` — WebGL, not CSS as proposal assumed) and `@react-bits/BlurText-TS-TW` (dep `motion`). No runtime data flow; everything consumes tokens.

## Architecture Decisions

| # | Decision | Choice | Why |
|---|---|---|---|
| 1 | Token architecture | `theme.extend`: colors primary-50..900 (spec-pinned 600/700/800), accent-500/600, neutral-50..900 (slate), festive-cream/yellow, success/danger/info/warning; borderRadius sm4/md8/lg12/xl16/full; boxShadow sm/md/lg; transitionDuration fast/base/slow; transitionTimingFunction party; keyframes+animation drift | Spec pins values; static maps JIT-safe |
| 2 | Motion token home | Both: durations/easing/keyframes in config (CSS classes); stagger constants in new `src/lib/motion.ts` | Spec-mandated; config drives classes, motion.ts feeds transitions |
| 3 | Fonts | Fraunces (600/700, `--font-display`) + Inter (400–700, `--font-inter`) via next/font/google `variable`; body `font-sans` | Warm soft serif = "party suave", NOT Inter for display; Inter body stays readable |
| 4 | Button primitive | New `ui/Button.tsx`: variant primary/secondary/ghost/success/danger; size sm/md/lg (44/48/56px); `loading` = disabled + reserved spinner slot (no layout shift); icon/iconPosition; fullWidth; asChild; cn() via NEW clsx+tailwind-merge; focus-visible ring-accent-500; active:scale-95 | One button language replacing 5 implementations |
| 5 | Button adoption | All 6 non-locked consumers migrate in Slice 1; submit button lives in `SearchInvitationForm.tsx` (NOT locked) → Slice 1; `SearchInvitation.tsx` locked → Slice 3; old `Button.tsx` kept + `@deprecated` JSDoc until Slice 3 | Spec green-build scenario |
| 6 | Card primitive | New `ui/Card.tsx`: default (white, border-neutral-200) / paper (festive-cream) / elevated (+shadow-md); p-6 rounded-xl | Replaces 4 treatments; swiper 18px → xl via `@apply rounded-xl` |
| 7 | LoadingSpinner | `{ size?: sm/md/lg, label?, standalone? }`; role="status" + sr-only label; `standalone` = page-level h-screen only; inline default | Fixes h-screen bug; LocationButton → inline sm |
| 8 | Footer | Static in-flow, border-t, tokenized; confirm drops `mb-40`; layout `<main>` gains pb-16 | Kills z-[9999] + mb-40 magic |
| 9 | CakeBackground | Positions via useMemo (once); drift = CSS keyframes (transform only, GPU); ≤18 icons, festive /40 opacity, pointer-events-none, aria-hidden; reduced-motion → `animation: none` | Zero re-renders, no stale closure, cheapest |
| 10 | react-bits | Aurora = confirm card backdrop (spec; home locked); BlurText titles on `[id]` + confirm (Invitation.tsx h1); "use client" wrappers; Aurora gated by useReducedMotion → static gradient | Spec placement; ogl/WebGL flagged; home hero optional Slice 3 |
| 11 | Deps | Add motion, clsx, tailwind-merge (+ogl via CLI); remove canvas-confetti, confetti-js, emoji-mart, react-countdown, react-countdown-circle-timer, @types/canvas-confetti | Zero imports verified |

## Chained PRs

| PR | Starts at | Ends with | Key files | Est |
|---|---|---|---|---|
| 1 | token config | primitives live, no old-Button consumer except locked | tailwind.config, globals.css, layout.tsx, lib/motion.ts, ui/Button, ui/Card, LoadingSpinner, Footer, CakeBackground, GroupedButtons, InvitationInfo, InvitationPersonalInfo, LocationButton, WhatsAppButton, SearchInvitationForm, ProductCard2, [id]+confirm main→div swap | ~570 |
| 2 | Aurora+BlurText install | pages on tokens | reactbits/, AuroraBackdrop, BlurTextTitle, [id]/confirm/wishlist pages, NoInvitation, GuestInvitations, Invitation, Badge, package.json | ~250 |
| 3 | fix-date-pipeline archived | cleanup | Countdown, SearchInvitation, home restyle; delete Button/InvitationButton/ProductCard/PlacesToGo/LocationFriendsCard; dep removal | ~160 |

Slice 1 ≈ 570 > 400 → chained PRs confirmed; Slice 1 itself exceeds per-PR budget → `size:exception` (ask-on-risk) or split 1a/1b. Slice 3 blocked on fix-date-pipeline archive; if not archived, ship deps+dead-code, defer Button deletion. Chain: PR1 → main; PR2/PR3 → previous slice branch.

## Interfaces / Contracts

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'ghost'|'success'|'danger';
  size?: 'sm'|'md'|'lg'; loading?: boolean; icon?: React.ReactNode;
  iconPosition?: 'left'|'right'; fullWidth?: boolean; asChild?: boolean;
}
// ui/Card: { variant?: 'default'|'paper'|'elevated'; className? }
// LoadingSpinner: { size?; label?; standalone? }  // standalone = h-screen page level
// config: colors{primary,accent,neutral,festive,success,danger,info,warning}
// fontFamily{display:['var(--font-display)','Georgia','serif'], sans:['var(--font-inter)','Inter',…]}
// borderRadius 4/8/12/16/9999px; boxShadow sm/md/lg per spec; duration 150/250/300ms
// easing party = cubic-bezier(0.16,1,0.3,1); keyframes{drift}; motion.ts stagger = { pageLoad: 0.08 }
```

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Build | each slice compiles; Slice-1 green-build | `next build` + `next lint` |
| Gate | zero arbitrary color/radius/shadow | grep `bg-\[#|text-\[#|rounded-\[|shadow-\[|bg-\[radial|bg-\[linear` (vendor exempt) |
| Manual | contrast ≥4.5:1, focus rings, reduced-motion static, spinner no shift, one `<main>` | browser + axe |
| Deps | removed pkgs absent from package.json/imports | grep |

No test runner exists — coverage via gates + manual.

## Migration / Rollout

Backup `tailwind.config.ts` + `globals.css` pre-Slice 1; rollback = revert per-slice commit (pure frontend). Layout has `runtime = 'edge'`: verify motion/ogl SSR at install; drop edge runtime if build fails.

## Open Questions

- [ ] Slice-1 size-exception approval or split 1a/1b; Badge semantic mapping (yellow→warning, orange→primary, green→success, dark→neutral, default→info)
- [ ] Installed react-bits ship "use client"? (wrap if not); ogl + edge runtime compat

## Deliverables

- This `design.md`
- `opendesign/` — ODSF v0.1 bundle (index, log, tokens, components, behaviors, guidelines, `styles/tokens.css`)

## Amendments (post-verify, maintainer auto-approved)

- **success token** `#16A34A` → `#15803D` (verify WARNING-1): white text on `#16A34A` measured 3.30:1, failing the spec's own AA rule (≥4.5:1) and the proposal's success criterion. `#15803D` (green-700 family) measures 5.01:1 with white and keeps the "confirm = green" semantic. Applied to `tailwind.config.ts`, the ODSF bundle, and the design-tokens delta spec before Slice 3 verification.
