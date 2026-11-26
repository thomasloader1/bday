# Proposal: ReactBits-native redesign of all screens

## Intent
Design is inconsistent — admin screens have zero design system, and "Party Suave" was rejected; `opendesign/` (parallel doc-only token system, never wired to the app) rejected too. ReactBits + installed deps (motion/gsap/ogl) = zero-new-dep path to a cohesive festive design on existing tokens.

## Scope
### In Scope
- ReactBits-native redesign of all 6 screens (home, `[id]`, confirm, wishlist, admin login/dashboard)
- Vendor ReactBits under `src/components/reactbits/` (client-only, reduced-motion, offscreen pause)
- Fix bugs: BlurText words, CardRenderer placeholder, GroupedButtons 🖕, Cubes dead ref
- Preserve ALL invariants: Firebase search, confirm guard, calendar, WhatsApp, leaflet, middleware, edge/nodejs split, demo flow, flattened confirm
- Existing tokens only; add StarBorder/SplitFlapText keyframes
- Slices: home → invitation → confirm → wishlist → admin → vendoring

### Out of Scope
- New deps (`three`-based Beams/Antigravity avoided)
- Backend/functional changes
- `opendesign/` bundle: REJECTED, not migrated — no second token system
- Full a11y overhaul beyond design-adjacent fixes
- Reworking custom Firebase/leaflet/swiper components (stay custom)

## Capabilities
### New
- `reactbits-components` — vendored ReactBits inventory + contracts (SplitFlapText, Grainient, GradientText, StarBorder, ClickSpark, ElectricBorder, ShinyText, CountUp, Particles, Orb; optional Dock/BounceCards/AnimatedList/FadeContent), SSR/reduced-motion/offscreen handling

### Modified
- `design-tokens` — add StarBorder/SplitFlapText keyframes; token system unchanged
- `component-primitives` — react-bits req: vendored set replaces 2 CLI installs; BlurText words fix
- `admin-dashboard` — tokens/primitives req on login + dashboard; CardRenderer real variants
- `confirm-guard` — Req 3 reworded: visuals may change; guard/copy/functionals unchanged

## Approach
Home: Grainient hero, GradientText/BlurText title, SplitFlapText countdown (numeric, seconds, on `$time`), StarBorder CTA, Particles/Orb ambient. `[id]`: ElectricBorder + ClickSpark + ShinyText, CardRenderer stub replaced. Confirm: keep AuroraBackdrop/CurvedLoop/flattened + ClickSpark. Wishlist: CountUp stat. Admin: full token restyle. Vendored under `src/components/reactbits/` gated like AuroraBackdrop.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/app/{page,[id]/page,[id]/confirm,wishlist}/page.tsx`, `admin/*` | Mod | per-screen rebuild |
| `src/components/{Countdown,BlurText,GroupedButtons,Cubes}.tsx`, `ui/CardRenderer.tsx` | Mod | fixes + countdown driver |
| `src/components/reactbits/*` | New | vendored set |
| `tailwind.config.ts`, `globals.css` | Mod | keyframes; reduced-motion |
| `src/lib/*`, `src/store/*`, `middleware.ts`, `api/admin/*` | None | untouched |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| WebGL surface | Med | offscreen pause; AuroraBackdrop gate |
| Reduced-motion gaps | Med | per-component gates + globals.css |
| No test runner (visual change) | Med | tsc/lint/build + browser checks |
| Second token system (opendesign regression) | Low | code-only on existing tokens |
| Runtime split breakage | Low | client-only effects; admin stays nodejs |

## Rollback Plan
Per-slice `git revert` (pure frontend, no migrations). Backup `tailwind.config.ts` + `globals.css` pre-slice-1.

## Dependencies
In-flight admin-dashboard CRUD (admin keeps nodejs runtime). No new packages.

## Success Criteria
- [ ] All 6 screens cohesive festive design, ONE token system
- [ ] Zero new dependencies
- [ ] 4 bugs fixed (BlurText, CardRenderer, 🖕, Cubes)
- [ ] Admin on tokens/primitives (no raw blue-gray)
- [ ] E2E scenarios pass: demo, search, guard, calendar, WhatsApp, leaflet, auth, runtimes
- [ ] tsc/lint/build green
