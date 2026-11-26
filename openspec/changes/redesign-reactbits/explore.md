# Exploration: Redesign all screens with ReactBits + Tailwind (new design)

User request (ES): user is unsatisfied with the app's current design ("Party Suave" from the archived design-system change) and rejected the externally-generated `opendesign/` bundle. They want a NEW design + component structure for ALL screens based on **ReactBits** (reactbits.dev) + Tailwind.

Status: read-only exploration. No code changed, no build run. All claims verified against source files in this repo and the react-bits GitHub repo (2026-08-15).

---

## 1. Current state: what exists today

### Stack (verified `package.json`)

`next 14.0.3` (App Router, root layout `runtime = 'edge'`) · `react 18` · `tailwindcss ^3.3.0` (`tailwind.config.ts`) · `motion ^12.43.0` (`motion/react`) · `gsap ^3.15.0` · `ogl ^1.0.11` · `swiper ^11.0.5` · `leaflet ^1.9.4` + `react-leaflet ^4.2.1` · `firebase ^10.7.0` · `nanostores ^0.9.5` · `react-icons ^4.12.0` · `clsx` + `tailwind-merge`.

**Key insight: `motion`, `gsap` and `ogl` are already installed.** The ReactBits shortlist below needs ZERO new dependencies.

### Screens (all read in full)

| Route | Composition | Verdict |
|---|---|---|
| `/` (home) | `BlurTextTitle` + `Countdown` (dias/horas/minutos, NO segundos, plain `text-3xl`) + `SearchInvitation` (tryDemo → `/1155011250`) | Functional, flat. No atmosphere, no hero. The countdown is the least "party" thing on the page. |
| `/[id]` (invitation) | `getAssignment(id)` → `getCard(cardId)` → **`CardRenderer`** (placeholder, see below); fallback `Card elevated` + `Invitation` (BlurTextTitle + InvitationText + GroupedButtons); `NoInvitation` on error | The admin-driven card system is a stub — every card renders the same static gradient. |
| `/[id]/confirm` | confirm guard → `Card paper border-0` (flattened by `flatten-layout-containers`) + `AuroraBackdrop` (ogl) + `CurvedLoop` marquee + `GuestInvitations` (swiper coverflow, 2 slides from `__workInvitation.json`/`__familyInvitation.json`) + `Footer` | Best-looking page today; already airy post-flatten. |
| `/wishlist` | hardcoded MercadoLibre items + `ProductCard2` + `Card elevated` + `Button` | Functional, static, plain. |
| `/admin/login` | **RAW default Tailwind blue-gray** (no tokens, no primitives) | **Biggest visual inconsistency.** |
| `/admin/dashboard` | **RAW default Tailwind blue-gray**, in-flight cards+persons CRUD (uncommitted) | Same. |

### Component inventory

- **Vendored ReactBits already in repo**: `Aurora.tsx` (ogl — client-only), `BlurText.tsx` (motion — **words mode broken**: `animateBy === 'words' ? text.split('') : text.split('')`, identical branches, `BlurText.tsx:51`), `Cubes.tsx` (gsap — **unused**: only reference is commented out in `BackgroundLayer.tsx`), `CurvedLoop.tsx` (self-contained SVG marquee — matches catalog entry `curved-loop`).
- **Custom**: AuroraBackdrop (dynamic `ssr:false` wrapper + reduced-motion gate — the established pattern for client-only effects), BackgroundLayer, CakeBackground, Countdown, GroupedButtons, GuestInvitations, Invitation, InvitationInfo, InvitationPersonalInfo, InvitationText, LoadingSpinner, LocationButton, NoInvitation, ProductCard2, RequirementList, SearchInvitation, SearchInvitationForm, WhatsAppButton, Badge, Footer.
- **UI primitives**: `Button.tsx` (5 variants, sizes sm/md/lg = 44/48/56px, loading reserved slot, focus ring accent-500), `Card.tsx` (default/paper/elevated — bakes `border-neutral-200 rounded-xl p-6`), **`CardRenderer.tsx` is a PLACEHOLDER** — dead `textEffect` switch branches, always renders `StaticGradient`.

### Known issues the redesign must absorb

1. `BlurText` words mode broken (splits into chars).
2. `CardRenderer` placeholder — dead switches, static gradient always.
3. `GroupedButtons` contains `🖕` text ("Alla le vamos a hacer el festejo, hij3 de le gorr3, 🖕") — violates the project's own icon/emoji policy.
4. Admin pages are unstyled (raw Tailwind defaults).
5. Countdown has no seconds and no motion language.
6. `opendesign/` bundle (19 files) — rejected. Why (evidence): it is a **second source of truth** (`styles/tokens.css` is NOT wired into the app; the app styles from `tailwind.config.ts` only), its motion spec drifts from the actual config (keyframes mismatch documented in `motion.md`), it documents the OLD minimal "Party Suave" aesthetic the user is now rejecting, and 19 files of pure documentation is over-engineered for a ~30-component app. **Lesson: the redesign must NOT create another parallel system — it must be real code, vendored in-repo, styled from the existing Tailwind tokens.**

### Functional invariants (MUST survive any redesign)

Firebase guest lookup (`assignments` → `cards`), confirm guard redirect, calendar save (Google + iOS `calendario://`), WhatsApp button, leaflet map w/ inline SVG pin, swiper coverflow on confirm, demo flow home → `/1155011250`, admin cookie auth (`/api/admin/login|logout` + `middleware.ts`), event date Dec 16 20:00 device-local (`src/lib/eventDate.ts`), root layout `runtime = 'edge'` (admin segment must keep `runtime = "nodejs"` per in-flight admin-dashboard change).

---

## 2. ReactBits research (verified against react-bits repo, 2026-08-15)

- 165+ components in 4 categories: **Text Animations** (~39), **Animations** (~42), **Components** (~48), **Backgrounds** (~55).
- Source lives at `src/tailwind/{Category}/{Component}/` in `DavidHDev/react-bits` (TS variant: `src/ts-tailwind/...`).
- reactbits.dev pages are JS-rendered; the sitemap + GitHub raw files are the reliable surface (this exploration used both).

### Dependency audit of shortlist candidates (read actual source files)

| Component | Category | Dependencies | In project? | Verdict |
|---|---|---|---|---|
| `SplitFlapText` | TextAnimations | **none** (CSS keyframes + rAF, built-in `prefers-reduced-motion`, `numeric` charset, `padTo`) | — | ✅ **Headline pick for countdown** |
| `ClickSpark` | Animations | **none** (canvas + rAF) | — | ✅ Click/confirm micro-delight |
| `StarBorder` | Animations | **none** (CSS, needs 2 keyframes in tailwind config) | — | ✅ CTA border |
| `ElectricBorder` | Animations | **none** (canvas + rAF + ResizeObserver) | — | ✅ Invitation card frame |
| `GradientText` | TextAnimations | `motion/react` | ✅ | ✅ Party title |
| `CountUp` | TextAnimations | `motion/react` | ✅ | ✅ Stats (wishlist "X regalos") |
| `ShinyText` | TextAnimations | `motion/react` | ✅ | ✅ Accents |
| `AnimatedList` | Components | `motion/react` (opinionated dark theme — needs restyle) | ✅ | ◐ Wishlist (optional) |
| `Dock` | Components | `motion/react` (`'use client'`) | ✅ | ◐ Mobile bottom nav (optional) |
| `Particles` | Backgrounds | `ogl` | ✅ | ✅ Ambient 3D point cloud |
| `Orb` | Backgrounds | `ogl` | ✅ | ✅ Party gradient blob |
| `Topography` | Backgrounds | `ogl` (WebGL2, **already** pauses offscreen via IntersectionObserver) | ✅ | ✅ Subtle contour texture |
| `Grainient` | Backgrounds | `ogl` (WebGL2, pauses offscreen; gradient + grain, brand-perfect colors) | ✅ | ✅ Hero backdrop candidate |
| `BounceCards` | Components | `gsap` | ✅ | ◐ Photos fan (optional) |
| `FadeContent` | Animations | `gsap` + `ScrollTrigger` (bundled plugin) | ✅ | ◐ Scroll reveal (optional) |
| `Beams` | Backgrounds | **`three` + `@react-three/fiber` + `@react-three/drei`** | ❌ | ⛔ 3 heavy new deps — avoid |
| `Antigravity` | Animations | **`three` + `@react-three/fiber`** | ❌ | ⛔ avoid |

**Conclusion: a high-impact ReactBits redesign is achievable with ZERO new dependencies.** Everything shortlisted is either dependency-free or uses `motion`/`gsap`/`ogl`, all already in `package.json`. Only the WebGL backgrounds (Particles/Orb/Topography/Grainient) add rAF surface, and they follow the existing `AuroraBackdrop` pattern (`dynamic ssr:false` + reduced-motion gate). `Topography` and `Grainient` already self-pause offscreen; `Particles`/`Orb` should get the same guard when vendored.

---

## 3. Design directions

### Direction A — "Surgical accents" (keep current layouts, swap in ReactBits on top)

Keep the existing "Party Suave" layouts and only: swap `Countdown` → `SplitFlapText`; wrap invite card in `ElectricBorder`; add `ClickSpark` to confirm buttons; restyle admin with existing tokens/primitives; fix `BlurText` words bug, `CardRenderer` placeholder, and the `🖕` emoji; add `StarBorder` to the home CTA.

- Pros: minimal risk, fast, keeps the working airy confirm page.
- Cons: **does not deliver a "NEW design"** — the user explicitly rejected the current aesthetic. Token-level tweaks will read as the same app.
- Effort: Low.

### Direction B — "ReactBits-native redesign" (recommended)

Rebuild the visual language per screen with ReactBits as the primary material, styled from the existing Tailwind tokens (orange/indigo/cream + Fraunces/Inter):

- **Home**: `Grainient` hero backdrop (brand colors, party gradient + grain) → `GradientText`/`BlurText`(fixed) title → **`SplitFlapText` countdown** with seconds (numeric charset, `padTo`), fed by the existing `$time` nanostore → `StarBorder` CTA → `Particles`/`Orb` ambient layer (lighter weight) → `SearchInvitation` stays custom (Firebase-bound).
- **`/[id]`**: `ElectricBorder` invitation card (party frame) + `ClickSpark` on the confirm/WhatsApp buttons + `ShinyText` accents; replace `CardRenderer` stub with real variants or remove the dead switch; fix `BlurText` words mode; remove `🖕`.
- **`/[id]/confirm`**: keep `AuroraBackdrop` + `CurvedLoop` (already the best page); add `ClickSpark` micro-delight; optionally `Particles` ambient; keep flattened layout + swiper.
- **`/wishlist`**: keep product grid; add `CountUp` fun-stat ("¡X regalos soñados!"); optional `AnimatedList` restyled to tokens.
- **Admin** (login + dashboard): bring into the design system — tokens, `Button`/`Card` primitives, Fraunces headings; same visual family as public pages. This is the single biggest consistency win.
- **Structure**: vendor all new ReactBits under `src/components/reactbits/` (matching the existing `Aurora.tsx` vendoring precedent), each with reduced-motion gating + `'use client'` where needed, named by catalog name. Keep `AuroraBackdrop`-style SSR-safe wrappers.
- Pros: genuinely new look, zero new deps, per-screen fit proven above, reuses the existing tokens (no parallel system — directly addresses the opendesign rejection), fixes the known bugs as part of the change, includes admin consistency.
- Cons: WebGL surface grows (performance discipline needed: offscreen pausing, reduced-motion fallbacks — patterns already exist in the repo); larger change = more review surface; coverflow/swiper + new effects must be tested together on mobile.
- Effort: Medium-High (one change, several slices).

### Direction C — "Component library layer first"

Before touching screens, extract `src/components/reactbits/` as a documented mini-library (props spec per component) wired to tokens, then apply screens on top. Feeds future changes, most durable.

- Pros: cleanest long-term structure.
- Cons: heaviest, slowest path to visible change; for a ~30-component app the process overhead is disproportionate.
- Effort: High.

**Recommendation: Direction B**, executed with A's discipline (fix bugs + admin inside the same change) and C's vendoring convention. Slices proposal for the proposal phase: (1) home, (2) invitation card, (3) confirm polish, (4) wishlist, (5) admin restyle, (6) vendoring + tokens/keyframes wiring (StarBorder keyframes etc.).

---

## 4. ReactBits shortlist (final)

| Component | Category | Deps | Screen | Role |
|---|---|---|---|---|
| SplitFlapText | TextAnimations | none | home | Countdown (dias/hs/min/seg) — departure-board party energy, `numeric` charset, built-in reduced-motion |
| Grainient | Backgrounds | ogl | home | Hero backdrop — gradient + grain, brand colors, self-pauses offscreen |
| GradientText | TextAnimations | motion | home / `[id]` | Party title accents |
| StarBorder | Animations | none (+2 config keyframes) | home | CTA "Buscar mi invitación" |
| ClickSpark | Animations | none | `[id]` / confirm | Click sparkle on confirm/WhatsApp buttons |
| ElectricBorder | Animations | none | `[id]` | Invitation card party frame |
| ShinyText | TextAnimations | motion | `[id]` | Accent labels |
| CountUp | TextAnimations | motion | wishlist | "¡X regalos!" stat |
| Particles | Backgrounds | ogl | home / confirm | Ambient point cloud (add offscreen pause) |
| Orb | Backgrounds | ogl | confirm | Party gradient blob (alternative to Particles) |
| Dock | Components | motion | optional | Mobile bottom nav (confirm/wishlist/home) |
| BounceCards | Components | gsap | optional | Photos fan on confirm |
| AnimatedList | Components | motion | optional | Wishlist list mode (needs token restyle) |
| FadeContent | Animations | gsap | optional | Scroll reveal |

Kept custom (NOT ReactBits): `SearchInvitation`/`SearchInvitationForm` (Firebase), `GuestInvitations` (swiper — dependency already present; ReactBits `Carousel` would add complexity for no gain here), `LocationButton` (leaflet), `WhatsAppButton`, `Countdown` data logic (moves into SplitFlapText driver), admin auth flows, `AuroraBackdrop` + `CurvedLoop` (already ReactBits-based, keep).

**Explicitly avoided**: `Beams`, `Antigravity` and any other `three`/`@react-three/fiber` component — would add ~3 heavy deps for one background.

---

## 5. Risks

- **WebGL surface area** (Grainient/Particles/Orb): must follow the existing `AuroraBackdrop` pattern — `dynamic ssr:false`, `prefers-reduced-motion` gate, offscreen pause. `Topography`/`Grainient` self-pause; `Particles`/`Orb` need the guard added on vendoring. Without it: hidden-tab CPU burn on mobile.
- **SplitFlapText countdown semantics**: it cycles text tiles on prop change — drive it from the existing `$time` nanostore (days/hours/minutes/seconds as padded strings per slice); verify tile animation triggers on each tick (it rebuilds via `useEffect` keyed on props — yes) and that `loop: false`/single-phrase mode settles cleanly (it does — `normalizedPhrases.length <= 1` short-circuits).
- **Accessibility**: `SplitFlapText` sets `aria-label` to settled text (good); `ClickSpark` canvas is `pointer-events-none` (decorative — must be `aria-hidden`); `StarBorder` needs the existing Button focus ring; Grainient/Particles/Orb are decorative backgrounds (aria-hidden, no interaction needed). Reduced-motion: SplitFlapText + StarBorder keyframes + AuroraBackdrop gate already handle it; Grainient/Particles/Orb must stop animating under reduced motion (existing `motion-reduction` behavior in `globals.css` kills `animate-drift` — extend the pattern).
- **Runtime split**: root layout stays `edge`; WebGL/motion components are client-side only (no server render) — keep the `AuroraBackdrop` dynamic pattern so the edge runtime is untouched. Admin segment keeps `runtime = "nodejs"` (in-flight admin-dashboard change).
- **No test runner configured**: playwright config exists (untracked); the redesign is visual — verify by browser (tsc/lint + manual) in apply phase; keep logic changes minimal (countdown driver, CardRenderer replacement) and spec'd.
- **Scope creep**: 6 screens × new components is a lot — keep the change sliceable (proposal should define slices) and keep the custom Firebase/leaflet/swiper logic out of the redesign.
- **Two-sources-of-truth regression** (the opendesign failure): vendor components as CODE in `src/components/reactbits/`, styled via existing Tailwind tokens; do NOT create another token system or doc-only spec layer. Update `openspec/specs/design-tokens` only if a token genuinely needs adding (e.g. StarBorder keyframes → tailwind config animation extension).

---

## 6. What the proposal must preserve (checklist)

- All functional invariants (§1) with no behavior change to Firebase, guard, calendar, WhatsApp, leaflet, middleware, API routes, demo flow.
- Root layout `edge` runtime; admin `nodejs` runtime.
- Existing tokens (orange/indigo/neutral/festive + Fraunces/Inter) as the only source of truth.
- Flattened confirm layout (do not reintroduce nested boxes — `flatten-layout-containers` is the guard).
- Fix-on-the-way bugs: BlurText words branch, CardRenderer placeholder, 🖕 emoji.

## Affected areas (complete list)

- `src/app/page.tsx` (home: hero, SplitFlapText countdown, StarBorder CTA), `src/app/[id]/page.tsx` (ElectricBorder card, ClickSpark, CardRenderer), `src/app/[id]/confirm/page.tsx` (ambient/click polish), `src/app/wishlist/page.tsx` (CountUp stat), `src/app/admin/login/page.tsx` + `src/app/admin/dashboard/page.tsx` (full restyle to tokens/primitives).
- `src/components/` — replace/upgrade: `Countdown.tsx`, `CardRenderer.tsx`, `BlurText.tsx` (words fix), `GroupedButtons.tsx` (emoji); add: `src/components/reactbits/` vendored set.
- `tailwind.config.ts` — add StarBorder keyframes/animation (only config change expected).
- `globals.css` — extend reduced-motion handling to new animated layers.
- `openspec/specs/` — optionally document vendored component props in the affected specs' slice; no new parallel spec system.
- Unaffected logic: `src/lib/*` (firebase, eventDate, saveTheDate, addToGoogleCalendar), `src/store/*`, `src/hooks/useGuestData.ts`, `src/middleware.ts`, `src/app/api/admin/*`, `GuestInvitations` (swiper), `LocationButton` (leaflet), `AuroraBackdrop`, `CurvedLoop`.

## Ready for proposal

**Yes.** Evidence is grounded (all components read from source, deps verified, invariants enumerated). Recommend Direction B; the proposal phase should define slices (home → invitation → confirm → wishlist → admin → vendoring) and spec the countdown driver + CardRenderer replacement as the only behavior-adjacent changes.
