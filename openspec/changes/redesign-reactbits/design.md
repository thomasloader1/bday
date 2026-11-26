# Design: ReactBits-native redesign of all screens

## Technical Approach

Rebuild the visual language of all 6 screens using a vendored ReactBits component set under `src/components/reactbits/`, styled exclusively from the existing Tailwind tokens (`tailwind.config.ts` — the opendesign lesson: real code, one token system, no parallel doc layer). WebGL components (Grainient, Particles) follow the proven `AuroraBackdrop` pattern: `dynamic ssr:false` + reduced-motion gate + offscreen pause. Root layout stays `edge`; admin stays `nodejs`; all functional invariants (Firebase, guard, calendar, WhatsApp, leaflet, swiper, demo flow, flattened confirm) untouched. Four known bugs fixed on the way. Zero new dependencies (verified: motion/gsap/ogl already installed).

## Architecture Decisions

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D1 | Vendor under `src/components/reactbits/`, flat, named by catalog name | npm package; `node_modules`; doc-only spec layer | Zero new deps; matches existing `Aurora.tsx` precedent; vendored copies get token-adapted + pause-guarded — that's the point (opendesign failure was a *second source of truth*, not vendoring) |
| D2 | AuroraBackdrop-derived wrapper per WebGL component (`{Name}Backdrop.tsx`) | direct import; CSS-only fallback | Proven pattern in repo: `ssr:false` dynamic → no ogl in edge server bundle; `useReducedMotion` → static fallback; offscreen pause → no hidden-tab CPU burn |
| D3 | Only StarBorder keyframes added to `tailwind.config.ts`; SplitFlapText keyframes stay in its scoped `<style>` | add both (proposal said so) | Verified in source: SplitFlapText ships `split-flap-front/back` in a component `<style>` tag — adding them to the config would be dead config. StarBorder has NO internal reduced-motion handling and needs the 2 config animations |
| D4 | Keep existing token system; zero new tokens beyond 2 keyframes | migrate `opendesign/` | `opendesign/` never wired to the app; second source of truth is the exact failure mode being rejected |
| D5 | Vendor only consumed components (9 + 2 wrappers). Defer Orb, Dock, BounceCards, AnimatedList, FadeContent | vendor all shortlisted | Dead code = review surface; at most ONE WebGL layer per screen (home: Grainient hero; confirm: AuroraBackdrop only). Proposal marked them optional |
| D6 | Fix `BlurText` in place (`src/components/BlurText.tsx`), don't re-vendor into reactbits/ | re-vendor | Avoids churn to `BlurTextTitle`/confirm imports; it's already a vendored copy |
| D7 | Execution order: vendoring FIRST, then screens (proposal's listed order was home→…→vendoring) | proposal order | Screens consume vendored components; each screen slice must be independently revertable, so the foundation lands first |

## Vendoring Plan (source: `DavidHDev/react-bits`, `src/ts-tailwind/{Cat}/{Name}/{Name}.tsx`, MIT — keep header comments)

| New file | Source | Deps | Vendoring notes |
|---|---|---|---|
| `reactbits/SplitFlapText.tsx` | TextAnimations/SplitFlapText | none | Keep scoped `<style>`; drive via `text` prop + `loop={false}` (single phrase → no cycling timer); built-in reduced-motion settles instantly |
| `reactbits/Grainient.tsx` + `GrainientBackdrop.tsx` | Backgrounds/Grainient | ogl | Self-pauses (IntersectionObserver + visibilitychange — verified); pass brand hexes via `color1/2/3` props; no internal reduced-motion → wrapper gates it |
| `reactbits/Particles.tsx` + `ParticlesBackdrop.tsx` | Backgrounds/Particles | ogl | **Add** offscreen-pause + visibility guards on vendoring (mirror Grainient's pattern; not in upstream) |
| `reactbits/StarBorder.tsx` | Animations/StarBorder | none | Restyle inner `from-black to-gray-900 rounded-[20px]` → token classes (`bg-transparent border-0 rounded-full p-0`) so the existing `Button` keeps loading/focus-ring contract; used as `<StarBorder as="span">` wrapper |
| `reactbits/ElectricBorder.tsx` | Animations/ElectricBorder | none | canvas + ResizeObserver, SSR-safe |
| `reactbits/ClickSpark.tsx` | Animations/ClickSpark | none | decorative canvas, `aria-hidden`, `pointer-events-none` |
| `reactbits/GradientText.tsx` | TextAnimations/GradientText | motion | token gradient stops |
| `reactbits/ShinyText.tsx` | TextAnimations/ShinyText | motion | |
| `reactbits/CountUp.tsx` | TextAnimations/CountUp | motion | |

Deferred (not vendored): Orb, Dock, BounceCards, AnimatedList, FadeContent. Not touched: `Aurora.tsx`/`AuroraBackdrop.tsx` (stay at `src/components/`), `BlurText.tsx` (fixed in place).

## Per-screen Composition

| Screen | Adds (vendored) | Removes/Replaces | Stays (invariant) |
|---|---|---|---|
| `/` | `GrainientBackdrop` hero; `SplitFlapText` ×4 (DÍAS/HORAS/MIN/SEG, `charset="numeric"`, `padTo={2}`, `loop={false}`) via new `SplitFlapCountdown`; `StarBorder` around Demo `Button`; `ParticlesBackdrop` ambient | `Countdown.tsx` (deleted) | `SearchInvitation` + form (Firebase/30-day gate), demo flow, `$time` store, `BlurTextTitle` (now word-split) |
| `/[id]` | `ElectricBorder` frame on the Card; `ClickSpark` on confirm/WhatsApp buttons; `ShinyText`/`GradientText` accents | `CardRenderer` stub → real variants; `opacity:0` bug on CardRenderer branch (drop, use `pageEntrance`); 🖕 removed; dead switch removed | assignment→card resolution, fallback Card elevated + `Invitation`, `NoInvitation`, guard-free behavior |
| `/[id]/confirm` | `ClickSpark` (decorative) | nothing | AuroraBackdrop, CurvedLoop, flattened `Card paper border-0`, swiper, guard, copy |
| `/wishlist` | `CountUp` stat ("¡X regalos soñados!", `to={items.length}`) | none | product grid, MercadoLibre links |
| `/admin/login` | — (uses existing primitives) | raw blue-gray → `Card paper` + `Button primary` + Fraunces heading, token classes | auth POST, cookie flow, nodejs runtime |
| `/admin/dashboard` | — (primitives) | raw blue-gray → `Card`/`Button`/`Badge` tokens | Firestore reads, logout, nodejs runtime |

## Token/Keyframe Changes

- `tailwind.config.ts` — ADD ONLY: `star-movement-bottom`, `star-movement-top` keyframes + animations (StarBorder). `drift` and everything else unchanged.
- `globals.css` — extend reduced-motion block: `.animate-drift, .animate-star-movement-bottom, .animate-star-movement-top { animation: none !important }`.
- No new colors/fonts/radius/shadow/motion tokens. Grep gate from design-tokens spec (`bg-\[#|text-\[#|rounded-\[|shadow-\[…` in `src/app`+`src/components`) must stay green — vendored reactbits files are treated as vendor code but get token-adapted anyway.

## Bug Fix Design

| Bug | File | Fix |
|---|---|---|
| BlurText words mode | `src/components/BlurText.tsx:51` | `animateBy === 'words' ? text.split(' ') : text.split('')` AND add `marginRight: '0.25em'` on word segments (flex-wrap swallows space text nodes — verified in vendored copy) |
| CardRenderer stub | `src/components/ui/CardRenderer.tsx` | Wire real branches: `backgroundType: aurora→AuroraBackdrop, solid→token solid, gradient→token gradient` (dynamic `ssr:false`); `textEffect: blur→BlurText, gradient→GradientText, shiny→ShinyText, none→plain`. Keep props contract (`backgroundType/textEffect/titleText/bodyText/colorStops`) per admin-dashboard spec |
| 🖕 emoji | `src/components/GroupedButtons.tsx:61` | Remove emoji only; keep warm decline text |
| Cubes dead ref | `src/components/Cubes.tsx` | DELETE file + remove import/commented block in `BackgroundLayer.tsx` (unused gsap; hardcoded `#fff/#120F17` violates token gate) |

## Interfaces / Contracts

```tsx
// src/components/SplitFlapCountdown.tsx (replaces Countdown.tsx; same props)
interface SplitFlapCountdownProps {
  targetDate: Date;
  onComplete: () => void; // fires once at zero-crossing (event-date Req 5), unchanged
}
// Internals: setInterval 1s → calculateTimeLeft → per-unit <SplitFlapText
//   text={pad2(v)} charset="numeric" padTo={2} loop={false} flipDuration={0.12}
//   stagger={0.02} tileColor="#EA580C" textColor="#FFFFFF"
// isOver → event-over state; null → placeholder (hydration-safe, same as today)

// Backdrop wrapper contract (GrainientBackdrop / ParticlesBackdrop)
"use client"; const C = dynamic(() => import("./C"), { ssr:false, loading: () => <StaticFallback/> });
// static fallback = tokenized gradient (from-primary-500/20 via-festive-cream to-accent-500/20)
// reducedMotion → fallback; wrapper div: aria-hidden, pointer-events-none, absolute inset-0, overflow-hidden
```

## Data Flow

```
$time store (eventDate) ──> SplitFlapCountdown
  └─ calculateTimeLeft(targetDate) @1s → {d,h,m,s,isOver}
       └─ SplitFlapText ×4 (text=pad2(value), numeric, loop=false)
  └─ zero-crossing (isOver false→true) → onComplete() → setEventDate(getNextBirthday())
```

## Slice Boundaries (execution order; 6 slices, chained PRs — forecast >400 lines)

| # | Slice | Files | Definition of done |
|---|---|---|---|
| 1 | Vendoring + tokens + shared fixes (proposal: "vendoring") | **New**: `reactbits/{SplitFlapText,Grainient,GrainientBackdrop,GradientText,StarBorder,ElectricBorder,ClickSpark,ShinyText,CountUp,Particles,ParticlesBackdrop}.tsx` — **Mod**: `BlurText.tsx`, `BackgroundLayer.tsx`, `tailwind.config.ts`, `globals.css` — **Del**: `Cubes.tsx` | tsc/lint/build green; grep: no `ogl` in `.next/server`; star keyframes present; BlurText splits words; no screen consumes yet (visual diff = zero) |
| 2 | Home (proposal: "home") | `src/app/page.tsx` — **New**: `SplitFlapCountdown.tsx` — **Del**: `Countdown.tsx` | Countdown DD/HH/MM/SS + seconds animates per tick; zero-crossing fires once → date re-derives; event-over state; demo flow + 30-day gate intact; reduced-motion static |
| 3 | Invitation `[id]` | `src/app/[id]/page.tsx`, `ui/CardRenderer.tsx`, `GroupedButtons.tsx`, `InvitationText.tsx`, `WhatsAppButton.tsx` | ElectricBorder frame; ClickSpark on confirm/WhatsApp; CardRenderer real variants; opacity-0 bug gone; no 🖕; assignment fallback + NoInvitation intact |
| 4 | Confirm polish (proposal: "confirm") | `src/app/[id]/confirm/page.tsx` | ClickSpark decorative only; guard/copy/flattened/AuroraBackdrop/swiper byte-equivalent logic |
| 5 | Wishlist (proposal: "wishlist") | `src/app/wishlist/page.tsx` | CountUp stat; grid + links intact |
| 6 | Admin restyle (proposal: "admin") | `src/app/admin/login/page.tsx`, `src/app/admin/dashboard/page.tsx` | Tokens/primitives only; auth + Firestore logic untouched; `runtime = "nodejs"` intact |

Rollback: per-slice `git revert` (pure frontend, no migrations). Backup `tailwind.config.ts` + `globals.css` before slice 1. Each slice independent after S1.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Static | types/lint/build | `npx tsc --noEmit`, `npm run lint`, `npm run build` per slice |
| Grep gates | token scan + runtime split | design-tokens scan gate; `.next/server` has no `ogl` (admin-dashboard Req 7) |
| Manual/browser | per-screen walkthrough | demo flow, search gate, guard redirect (incl. Back-button), calendar (Google/iOS), WhatsApp, leaflet pin, swiper, admin auth, `runtime` check on admin; reduced-motion OS toggle; mobile 375px |

## Migration / Rollout

No data migration. No feature flags. Chained PRs (6 slices, one per slice) to keep review < 400 lines/PR; each targets the previous slice's branch.

## Open Questions

- [ ] None blocking. (Decided: defer Orb/Dock/BounceCards/AnimatedList/FadeContent; copy on admin login/dashboard restyle stays as-is unless user asks for Spanish)

## Proposal corrections (what proposal missed)

1. **SplitFlapText keyframes do NOT go in tailwind config** — they ship in the component's scoped `<style>` (verified). Only StarBorder's 2 keyframes.
2. **Proposal slice order is not executable** — vendoring must land first (foundation), then screens.
3. **Latent bug found**: `[id]/page.tsx` CardRenderer branch has `opacity: reducedMotion ? 1 : 0` with no animate call — non-reduced-motion users would see an invisible page. Fixed in slice 3.
4. **BlurText words mode needs TWO fixes**: wrong split AND flex-wrap swallows the space node — word segments need `marginRight`.
5. **Grainient/Particles accept hex via props** (not class strings) — brand hexes passed as props keep the token scan gate green.
6. **Countdown seconds**: `calculateTimeLeft` already returns seconds — the driver is a pure re-render of existing data, no store changes.
