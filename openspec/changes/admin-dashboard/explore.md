# Exploration: Admin Dashboard (admin-dashboard)

## Current state summary
Personal birthday-invitation site. Next.js 14.0.3 (App Router) + React 18 + TS strict + Tailwind 3 + Firebase 10 (client SDK) + nanostores + motion + swiper + ogl + gsap.

### Routing & runtime
- `src/app/layout.tsx` sets **`export const runtime = "edge"`** at the root (line 24). This is critical: the Edge runtime has no `window`/`document`, so any component/module that touches DOM at module-eval or during SSR crashes the whole route. This is the root cause of the `/confirm` 500 (ogl `Texture3D.js:17` module-scope `document.createElement`; the fix is in-progress via `next/dynamic` `ssr:false` in AuroraBackdrop).
- Routes today: `/` (home), `/[id]` (invitation + RSVP), `/[id]/confirm` (confirmation page), `/wishlist`.
- `layout.tsx` mounts `BackgroundLayer` (site-wide cake/Cubes backdrop) and a centered `<main>`.

### Data model
- `src/data/guests.json` — static seed, key `persons[]`. Each: `id, name, group[], lunch{_lat,_long}, after{_lat,_long}, isConfirmed, isDrity, isVoted, votedFor`.
- `src/lib/firebase.ts`: `getGuest` → finds in guests.json, overlays Firestore `persons/{id}`; `getGuestFirebase`, `addGuest`, `updateGuest` (collection `persons`). Client SDK, API key is public (acceptable for a party app; documented).
- `src/types/Guest.ts` — Guest/UpdateGuest types (read during exploration; exact fields match guests.json).
- No concept of "cards" or "themes" exists yet.

### Components of interest
- `Card` + `Button` primitives (design system, tokens adopted).
- `Aurora`/`AuroraBackdrop` (react-bits, edge-runtime SSR-unsafe → client-only loading required).
- `BlurText`/`BlurTextTitle`, `Cubes` (background), `GuestInvitations` (swiper), `Footer`, `Invitation`, `LoadingSpinner`, `NoInvitation`, `BackgroundLayer`.
- `useGuestData` hook wraps `getGuest`.

## ReactBits free-tier fit (catalog verified, ~110 free components)
Categories: **Backgrounds** (Particles, Gradient Waves, Dot Grid, Grid Distortion, Aurora, Floating Lines, Side Rays, Light Rays, Beams, Galaxy, Iridescence, Waves, Prism, Liquid Ether, Pixel Blast, Lightning, etc.), **Text Animations** (SplitText, BlurText, GradientText, ShinyText, CountUp, RotatingText, FallingText, Scroll Reveal, Text Loop, etc.), **Animations/Effects** (Cubes, Click Spark, Star Border, Electric Border, Tilted Card, Spotlight Card, Border Glow, Magnet, Blob Cursor, Splash Cursor, Pixel Trail, Ribbons, Animated Content, Fade Content), **Components** (Dock, Counter, Animated List, Scroll Stack, Circular Gallery, Specular Button, Card Stack, Option Wheel, Curved Input, Bounce Cards, Infinite Menu).

SSR safety matrix (CRITICAL for edge runtime):
- **SSR-safe** (CSS/JS only, no module-scope DOM): BlurText, SplitText, GradientText, ShinyText, CountUp, RotatingText, Motion-based (motion/react), Click Spark (DOM via event only), Star Border, Tilted Card, Animated Content/Fade Content, Counter, Dock, Animated List, Scroll Stack, Card Stack.
- **SSR-UNSAFE** (module-scope or constructor-scope DOM/canvas access): Aurora/ogl (Texture3D.js:17 `document.createElement` at module scope; Renderer.js constructor uses document), Particles (likely canvas module-scope), MetaBalls, LiquidChrome, Iridescence, GridDistortion, etc. — **all WebGL/canvas based**. Must be loaded via `next/dynamic` `ssr:false` + mounted gate, NOT imported statically.
- Recommendation: a reusable `<ClientOnly>`/dynamic pattern to wrap any WebGL ReactBits component. AuroraBackdrop already proves the pattern.

## Card designer concept
A "card" = a persisted config object: `{ id, name, guestGroupId?, background:{type, props}, titleEffect:{type,props}, titleText, bodyText, colorStops, ... }`. A generic `<CardRenderer config>` mounts the selected ReactBits components (background + text effect) behind the invitation content. SSR-unsafe pieces lazy-load client-side with a static fallback.

## Route structure (proposal for propose phase)
- `/admin` (route group? NO — edge runtime on root layout would break Firebase Admin + WebGL). Options:
  - **(A) Override runtime per segment**: put `/admin/**` in `src/app/admin/` and add `export const runtime = "nodejs"` in its layout — this opts the dashboard out of edge while keeping the rest edge. Cleanest for Next 14.
  - **(B) Move root off edge** entirely — drops the perf benefit of edge for the public invite routes. Tradeoff: simpler, but loses edge perk.
  - Recommendation: (A) — segment-level runtime override keeps public invite fast on edge (after Aurora SSR fix), dashboard on Node (needs full Firebase + interactive WebGL preview).
- `/admin/login` — password gate.
- `/admin/dashboard` — guest list + card list.
- `/admin/cards/[id]` — card editor (ReactBits effect picker + live preview).
- `/admin/cards/new` — new card.
- `/admin/assignments` — guest → card mapping.

## Persistence approach
Firestore `cards` collection (drafts) + `assignments` collection (guestId → cardId). Reuse existing `db` from `config/firebase`. Guests already come from `persons`; the [id] route would look up assignment then render the assigned card config. Backward-compatible: if no assignment, render the default invitation (current behavior).

## Auth (decision deferred to propose phase)
Lightweight single-admin password gate (env var `ADMIN_PASSWORD`, cookie via `/api/login`, middleware protecting `/admin/*`). NOT Firebase Auth (overkill/quota for a party). Tradeoff: trivial to share; fine for a personal, unlisted app. This is the ONE open decision.

## Risks
- **Edge runtime conflict**: dashboard's Node runtime coexists with edge public routes via segment override — verify Firebase Admin vs client SDK. Using existing client SDK (`db`) avoids needing Admin SDK. Keep dashboard client-side (no Admin).
- **WebGL preview SSR**: card editor live preview must use `next/dynamic ssr:false` for any WebGL background; otherwise the editor route itself 500s under edge or even Node (module-scope DOM).
- **Bundle size**: importing many ReactBits components grows the bundle; lazy-load per effect in the editor.
- **Perf on low-end devices**: WebGL backgrounds (Aurora, Particles) can tank mid-tier phones — keep as opt-in, reduce-motion gated.

## Next steps
Recommendation: (1) resolve auth model, (2) create `fix-aurora-ssr` commit (already code-applied, just needs commit + verify), (3) proceed with admin-dashboard SDD (propose → spec → design → tasks → apply).
