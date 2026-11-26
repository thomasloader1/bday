# Tasks: ReactBits-native redesign of all screens

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,500–1,700 (S1 vendoring ≈ 900; vendor copies dominate) |
| 400-line budget risk | High (approved exception) |
| Chained PRs recommended | No |
| Suggested split | Single PR — 6 slices as commit/revert boundaries (size:exception approved) |
| Delivery strategy | ask-on-risk → resolved to size:exception |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High (approved exception)
size:exception: Yes (maintainer-approved)

Spec refs: **RC**=reactbits-components (R1 location/naming, R2 SSR contract, R3 reduced-motion, R4 offscreen pause, R5 zero-new-deps, R6 contracts), **DT**=design-tokens delta, **CP**=component-primitives delta, **AD**=admin-dashboard delta (Req 4 CardRenderer, Req 8 admin tokens), **CG**=confirm-guard delta (Req 3), **ED**=event-date (Req 5 zero-crossing, Req 6 search gate).

### Suggested Work Units

| Unit | Goal | Notes |
|------|------|-------|
| 1 | Vendoring + tokens + shared fixes | Foundation; zero visual diff; every later slice revertable |
| 2–6 | Home → Invitation → Confirm → Wishlist → Admin | Independent after S1; each = one commit = one revert boundary |

## Slice 1: Vendoring + tokens + shared fixes

- [ ] 1.1 Vendor `src/components/reactbits/SplitFlapText.tsx` (keep scoped `<style>`; `loop={false}` single phrase; built-in reduced-motion). **RC R1/R6** — DoD: file present, only react/motion/gsap/ogl imports.
- [ ] 1.2 Vendor `Grainient.tsx` + `GrainientBackdrop.tsx`: dynamic `ssr:false` wrapper, `useReducedMotion` gate, tokenized static fallback (`from-primary-500/20 via-festive-cream to-accent-500/20`), `aria-hidden` + `pointer-events-none` + `absolute inset-0 overflow-hidden`; brand hexes via `color1/2/3` props (keeps token scan green). **RC R1/R2/R3/R6** — DoD: no ogl in edge server bundle.
- [ ] 1.3 Vendor `Particles.tsx` + `ParticlesBackdrop.tsx`; ADD offscreen-pause + visibilitychange guards at vendoring (mirror Grainient's IntersectionObserver pattern). **RC R4** — DoD: hidden surface stops rAF, resumes without remount.
- [ ] 1.4 Vendor `StarBorder.tsx`, restyled inner to token classes (`bg-transparent border-0 rounded-full p-0`) so existing `Button` keeps loading/focus-ring contract; used as `<StarBorder as="span">`. **RC R6** — DoD: focus ring visible, click/tap operable.
- [ ] 1.5 Vendor `ElectricBorder.tsx` (canvas + ResizeObserver, SSR-safe). **RC R6** — DoD: sizes to card via ResizeObserver.
- [ ] 1.6 Vendor `ClickSpark.tsx` decorative canvas (`aria-hidden`, `pointer-events-none`; never blocks underlying button). **RC R6** — DoD: click action fires AND spark renders.
- [ ] 1.7 Vendor `GradientText.tsx`, `ShinyText.tsx`, `CountUp.tsx` (motion) with token gradient stops. **RC R6** — DoD: reduced-motion renders static text/final value.
- [ ] 1.8 Fix `src/components/BlurText.tsx:51`: `animateBy === 'words' ? text.split(' ') : text.split('')` AND `marginRight: '0.25em'` on word segments (flex-wrap swallows space text nodes). **CP words-mode req** — DoD: words reveal per word; characters mode unchanged.
- [ ] 1.9 Delete `src/components/Cubes.tsx` + remove `import Cubes` (line 6) and commented block (lines 27–40) in `BackgroundLayer.tsx`. **Bug fix (dead ref, hardcoded #fff/#120F17)** — DoD: zero `Cubes` references.
- [ ] 1.10 `tailwind.config.ts`: ADD ONLY `star-movement-bottom` + `star-movement-top` keyframes/animations; no other token changes. **DT** — DoD: only keyframes added, `drift` untouched.
- [ ] 1.11 `globals.css`: extend reduced-motion block to `.animate-star-movement-bottom, .animate-star-movement-top` (and `animate-drift` stays). **DT/RC R3** — DoD: reduced-motion disables all new animated classes.
- [ ] 1.12 S1 verification: backup `tailwind.config.ts` + `globals.css`; `npx tsc --noEmit` + `npm run lint` + `npm run build` green; grep `.next/server` → no `ogl`; token scan gate (`bg-\[#|text-\[#|rounded-\[|shadow-\[`) green; no screen consumes reactbits yet (visual diff = zero). **RC R2/R5, AD Req 7** — DoD: all gates pass.

Rollback: `git revert` slice-1 commit restores BlurText/Cubes/tailwind/globals; no consumer, so zero visual impact.

## Slice 2: Home

- [ ] 2.1 Create `src/components/SplitFlapCountdown.tsx` (same props as Countdown: `targetDate`/`onComplete`): `setInterval` 1s → `calculateTimeLeft` → 4× `<SplitFlapText>` (`text={pad2(v)}`, `charset="numeric"`, `padTo={2}`, `loop={false}`, `flipDuration={0.12}`, `stagger={0.02}`, `tileColor="#EA580C"` `textColor="#FFFFFF"` via props); `isOver` → event-over state; `null` placeholder hydration-safe; zero-crossing fires `onComplete` once → `setEventDate(getNextBirthday())`. **ED Req 5, RC R6 SplitFlapText** — DoD: each tick flips changed tiles; over-state not clamped zeros; hydration matches.
- [ ] 2.2 Rebuild `src/app/page.tsx`: `GrainientBackdrop` hero + `ParticlesBackdrop` ambient + `GradientText`/`BlurTextTitle` headline + `SplitFlapCountdown` + `StarBorder` around Demo `Button`; keep `SearchInvitation` (Firebase + 30-day gate) and demo flow. **RC R6, ED Req 6** — DoD: form/gate behavior identical; one WebGL layer max.
- [ ] 2.3 Delete `src/components/Countdown.tsx`. — DoD: zero imports remain.
- [ ] 2.4 S2 verification: tsc/lint/build + grep gates; manual: countdown animates per tick, demo flow works, 30-day gate shows/hides form, reduced-motion static countdown, home at 375/768/1440. **RC R3** — DoD: all pass.

Rollback: revert slice-2 → home restores `Countdown`; S1 files remain unused.

## Slice 3: Invitation `[id]`

- [ ] 3.1 `src/components/ui/CardRenderer.tsx`: wire real branches — `backgroundType`: aurora→AuroraBackdrop, solid→token solid, gradient→token gradient (dynamic `ssr:false`, `loading: () => StaticGradient`, `timeout: 3000`); `textEffect`: blur→BlurText, gradient→GradientText, shiny→ShinyText, none→plain; unknown → StaticGradient; keep props contract (`backgroundType/textEffect/titleText/bodyText/colorStops`). **AD Req 4** — DoD: "Real variants resolve" scenario passes; no dead switches.
- [ ] 3.2 `src/app/[id]/page.tsx`: remove latent bug `style={{ opacity: reducedMotion ? 1 : 0 }}` (no animate call → invisible page; use `pageEntrance`); wrap card in `ElectricBorder`; add `ClickSpark` to confirm/WhatsApp buttons; `ShinyText`/`GradientText` accents. **RC R6, AD Req 4** — DoD: page visible for all users; assignment→card and fallback Card elevated + NoInvitation paths intact.
- [ ] 3.3 `src/components/GroupedButtons.tsx:61`: remove 🖕 emoji only; keep warm decline copy. **Bug fix (icon/emoji policy)** — DoD: no emoji in decline branch; button variants unchanged.
- [ ] 3.4 `InvitationText.tsx` + `WhatsAppButton.tsx`: accent polish (ShinyText labels; no functional change to WhatsApp/calendar links). **RC R6** — DoD: links/copy intact.
- [ ] 3.5 S3 verification: tsc/lint/build + grep gates; manual: `[id]` with assigned card renders real variants, fallback invitation, NoInvitation on error, no invisible page, reduced-motion static borders, 375/768/1440. **AD Req 7** — DoD: all pass.

Rollback: revert slice-3 → `[id]` returns to stub CardRenderer + previous buttons.

## Slice 4: Confirm polish

- [ ] 4.1 `src/app/[id]/confirm/page.tsx`: add decorative `ClickSpark` only; visuals MAY differ, guard/copy/flattened Card paper/AuroraBackdrop/swiper byte-equivalent logic. **CG Req 3** — DoD: confirmed path behavior + copy identical (guard/redirect rules per E2E scenarios 1–4).
- [ ] 4.2 S4 verification: tsc/lint/build + grep gates; manual: confirmed stays, unconfirmed redirects (incl. Back-button no-loop), spinner during load, unknown id graceful, reduced-motion static, 375/768/1440. **CG Req 1/2/4, RC R3** — DoD: all pass.

Rollback: revert slice-4 → confirm byte-identical to pre-change.

## Slice 5: Wishlist

- [ ] 5.1 `src/app/wishlist/page.tsx`: add `CountUp` stat "¡X regalos soñados!" (`to={items.length}`, animates on view; reduced-motion → final value). **RC R6 CountUp** — DoD: stat renders correct count; grid + MercadoLibre links intact.
- [ ] 5.2 S5 verification: tsc/lint/build; manual: stat counts items, links work, reduced-motion shows final value, 375/768/1440. — DoD: all pass.

Rollback: revert slice-5 → wishlist unchanged.

## Slice 6: Admin restyle

- [ ] 6.1 `src/app/admin/login/page.tsx`: token/primitives restyle — Fraunces heading, `Card paper`, `Button primary`; auth POST + cookie flow untouched; `runtime = "nodejs"` intact. **AD Req 8** — DoD: no raw blue-gray/arbitrary hex on page; login works.
- [ ] 6.2 `src/app/admin/dashboard/page.tsx`: surfaces → `Card`, actions → `Button` variants + `Badge` from token palette; Firestore reads + logout untouched. **AD Req 8** — DoD: page passes token scan gate; CRUD/logout work.
- [ ] 6.3 S6 verification: tsc/lint/build + token scan gate on admin; manual: login wrong/right password, logout redirect, dashboard loads Firestore data, `runtime="nodejs"` check. **AD Req 1/7/8** — DoD: all pass.

Rollback: revert slice-6 → admin back to raw blue-gray, logic unchanged.

## Integration / Final

- [ ] 7.1 Full `npm run build`; E2E regression per `E2E_TEST_SCENARIOS.md` (playwright config exists, `testDir: ./e2e` currently empty — run any present specs + manual scenarios): demo flow, search gate (30-day), guard redirect incl. Back-button, calendar (Google/iOS), WhatsApp, leaflet pin, swiper coverflow, admin auth, edge/nodejs runtime check. — DoD: all scenarios pass.
- [ ] 7.2 Visual walkthrough of all 6 screens at 375/768/1440 + reduced-motion OS toggle (static fallbacks everywhere). **RC R3** — DoD: no animation under reduce; no broken layout at any width.
- [ ] 7.3 Final grep gates: `.next/server` has no `ogl`; token scan gate green across `src/app` + `src/components`; `package.json` diff = zero new deps. **RC R2/R5, AD Req 7** — DoD: all green.

Rollback: whole change = per-slice `git revert` sequence (S6→S1, newest first).
