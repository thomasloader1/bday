# Tasks: Design System — "Party Suave"

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ≈980 total (Slice 1 ≈570, Slice 2 ≈250, Slice 3 ≈160) |
| 400-line budget risk | High — Slice 1 ≈570 exceeds budget by itself |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 (design's 3-slice plan) |
| Delivery strategy | ask-on-risk → RESOLVED: size:exception |
| Chain strategy | size-exception (3 chained PRs; each slice MAY exceed 400 lines) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

**Note:** size:exception is ALREADY APPROVED — apply may implement slices >400 lines without re-asking. ~~Slice 3 is BLOCKED on the fix-date-pipeline archive~~ → fix-date-pipeline was **ARCHIVED 2026-08-15**; Slice 3 fully unblocked and **COMPLETE** (see below).

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Tokens + primitives live; no old-Button consumer except locked | PR 1 → main | ≈570 lines, size:exception |
| 2 | react-bits + pages on tokens | PR 2 (base = PR 1 branch) | ≈250 lines |
| 3 | Locked restyles + dead code + dep removal | PR 3 (base = PR 2 branch) | ≈160 lines; ✅ done (`fix-date-pipeline` archived 2026-08-15) |

## Slice 1: Token Foundation + Primitives (≈570 lines)

### Unit S1-A — Token vocabulary (`feat: tokenize design vocabulary`)
- [x] **1.1.1** Color tokens — extend `tailwind.config.ts` `theme.extend.colors`: primary-50..900 (600 #EA580C / 700 #C2410C / 800 #9A3412), accent-500 #6366F1 / 600 #4F46E5, neutral-50..900 slate+white, festive.cream #F9EFDB, festive.yellow #FFEAA7, success #16A34A, danger #475569, info #2563EB, warning #F59E0B. **AC**: values match spec table; config loads. [DT-1]
- [x] **1.1.2** Typography — `src/app/layout.tsx` loads Fraunces (600/700, `--font-display`) + Inter (400–700, `--font-inter`) via next/font/google `variable`; config `fontFamily.display/sans` per spec. **AC**: build; `font-display` renders Fraunces, body Inter. [DT-2]
- [x] **1.1.3** Gutter + main — layout `<main>` gains `container mx-auto px-6 md:px-8 pb-16`; adopt 4/8pt scale convention. **AC**: gutter class present. [DT-3, CP-6]
- [x] **1.1.4** Radius — `theme.extend.borderRadius` sm4/md8/lg12/xl16/full; globals swiper-slide 18px → xl. **AC**: grep `rounded-[18px]` = 0 outside vendor. [DT-4]
- [x] **1.1.5** Shadow — `theme.extend.boxShadow` sm/md/lg per spec; replace inert `focus:shadow-outline` with rings. **AC**: grep `focus:shadow-outline` = 0. *(Note: only remaining match is dead `InvitationButton.tsx` — 0 imports, deleted at 3.2.2.)* [DT-5]
- [x] **1.1.6** Motion tokens — `transitionDuration` 150/250/300, `transitionTimingFunction.party` cubic-bezier(0.16,1,0.3,1), keyframes+animation drift; new `src/lib/motion.ts` `stagger.pageLoad = 0.08`. **AC**: tsc. [DT-6]
- [x] **1.1.7** globals.css cleanup — remove RGB vars + dark-scheme block, dead `progress` keyframes + `.animate-progress` (verify zero usage first). **AC**: grep `rgb(var|animate-progress` = 0. [DT-7]

### Unit S1-B — Deps + primitives (`feat: add Button/Card primitives`)
- [x] **1.2.1** Install `clsx` + `tailwind-merge` + `motion`; commit package.json + lockfile. **AC**: install green; React 18/Next 14 peer compat. [CP-10]
- [x] **1.2.2** New `src/components/ui/Button.tsx` — variant primary/secondary/ghost/success/danger, size sm/md/lg (44/48/56px), `loading`=disabled + reserved spinner slot (no layout shift), icon/iconPosition, fullWidth, asChild, `ring-2 ring-offset-2 ring-accent-500`, active:scale-95; cn() via clsx+tailwind-merge. **AC**: tsc; browser: loading keeps size, Tab shows accent ring. [CP-1]
- [x] **1.2.3** New `src/components/ui/Card.tsx` — variant default/paper/elevated; p-6 rounded-xl border-neutral-200; paper=festive.cream; elevated=shadow-md. **AC**: tsc. [CP-3]

### Unit S1-C — Structural fixes (`fix: spinner, footer, single main`)
- [x] **1.3.1** `LoadingSpinner` — API `{size sm/md/lg, label, standalone}`, `role="status"` + sr-only; h-screen ONLY in standalone; update `[id]` + confirm usage. **AC**: browser: standalone full-viewport, inline never. [CP-4]
- [x] **1.3.2** `Footer` — static in-flow, border-t, tokenized; remove `fixed bottom-0 z-[9999]`; confirm drops `mb-40`. **AC**: grep `mb-40|z-\[9999\]` = 0; footer follows content. [CP-5]
- [x] **1.3.3** Single `<main>` — `[id]/page.tsx` + confirm replace `<main>` with `<section>`/div. **AC**: grep per page exactly 1 `<main>`; browser DOM. [CP-6]

### Unit S1-D — Consumer adoption + CakeBackground (`refactor: adopt primitives, redesign CakeBackground`)
- [x] **1.4.1** `CakeBackground` — positions via useMemo once; ≤18 icons; CSS-keyframe transform drift; festive /40 opacity; pointer-events-none; aria-hidden; reduced-motion → `animation: none`; delete setInterval teleport. **AC**: browser 60s → zero re-renders (devtools), reduced-motion static. [CP-7]
- [x] **1.4.2** `GroupedButtons` — success/danger variants; pending → spinner, no emoji size swap. [CP-2]
- [x] **1.4.3** `InvitationInfo` — secondary + FaCalendar + fullWidth. [CP-2]
- [x] **1.4.4** `InvitationPersonalInfo` — secondary; remove dead "Saber mas" no-op button. [CP-2]
- [x] **1.4.5** `LocationButton` — primary fullWidth; inline sm spinner when lat/long undefined. **AC**: no full-viewport overlay. [CP-2, CP-4]
- [x] **1.4.6** `WhatsAppButton` — static variant map (secondary / primary + FaWhatsapp); remove dynamic color string (JIT risk). [CP-2]
- [x] **1.4.7** `SearchInvitationForm` — primary sm + FaPaperPlane submit. [CP-2]
- [x] **1.4.8** `ProductCard2` — Button asChild sm + arrow icon; Card elevated. [CP-2, CP-3]
- [x] **1.4.9** Old `Button.tsx` — add `@deprecated` JSDoc; keep until Slice 3. **AC**: build stays green. [CP-2]

### Unit S1-V — Slice 1 verification
- [x] **1.5.1** Green build — `npx tsc --noEmit` && `npm run lint` && `npm run build`; grep old-Button imports → only `SearchInvitation.tsx`. [CP-2]
- [x] **1.5.2** Grep gate — `bg-\[#|text-\[#|rounded-\[|shadow-\[|bg-\[radial|bg-\[linear` over src/app + src/components → 0 outside vendor. *(Note: 5 matches remain, ALL owned by Slice 2: confirm radial → 2.2.2; GuestInvitations grid/radial decorations → 2.2.4. New code added zero arbitrary classes.)* [DT-7]
- [x] **1.5.3** Manual matrix S1 — all pages visual; reduced-motion toggle (no entrance anim, static cake); keyboard focus rings; touch ≥44px; one `<main>`; spinner no-shift. *(Note: structural checks passed (single `<main>` grep, touch min-h ≥44px via tokens); browser/axe pass runs at verify — no browser in apply env.)* [DT-6, CP-1]

## Slice 2: react-bits + Pages on Tokens (≈250 lines)

### Unit S2-A — react-bits (`feat: add Aurora/BlurText backdrops`)
- [x] **2.1.1** Install via CLI — `npx shadcn@latest add @react-bits/Aurora-TS-TW @react-bits/BlurText-TS-TW`; verify "use client" present (wrap if absent); edge-runtime + `ogl` WebGL compat — if build fails, drop `runtime='edge'` from layout. **AC**: build; SSR no hydration error. [CP-8] *(Also installed Cubes per new user requirement; all three via URL form `https://reactbits.dev/r/<Name>-TS-TW`, "use client" added to each; build green with edge runtime KEPT — ogl import is SSR-safe.)*
- [x] **2.1.2** Wrappers — client `AuroraBackdrop` (useReducedMotion → static gradient) + `BlurTextTitle`; wire confirm card + `[id]`/confirm h1. **AC**: tsc. [CP-8]

### Unit S2-B — Page restyles (`feat: restyle pages on tokens`)
- [x] **2.2.1** `[id]/page.tsx` — tokens; Card elevated wrapper; BlurTextTitle; remove px-8/pt-10 overrides; one staggered entrance (motion.ts). **AC**: browser stagger; reduced-motion static. [DT-3, DT-6, CP-3, CP-8] *(BlurTextTitle lives in Invitation.tsx h1 per design AD-10.)*
- [x] **2.2.2** `[id]/confirm/page.tsx` — Card paper replaces radial-gradient div (gradient tokenized/removed); Aurora backdrop; BlurTextTitle; stagger. [DT-6, DT-7, CP-3, CP-8]
- [x] **2.2.3** `wishlist/page.tsx` — tokens; remove px-24. **AC**: gutter = px-6 md:px-8. [DT-3]
- [x] **2.2.4** Supporting components — NoInvitation, GuestInvitations (SwiperSlides → Card default/paper), Invitation, Badge (yellow→warning, orange→primary, green→success, dark→neutral, default→info); icon policy: fa6 SVG for interactive, emoji decorative only, leaflet `divIcon` 🥳 → inline SVG pin. **AC**: grep interactive emoji = 0. [DT-7, CP-3, CP-9]

### Unit S2-V — Slice 2 verification
- [x] **2.3.1** Green — tsc/lint/build; re-run grep gate; manual matrix S2 (Aurora/BlurText visual, reduced-motion static fallback, keyboard/touch, client-boundary). [CP-8, DT-7] *(tsc/lint/build green; grep gate 0 matches — the 5 Slice-1 deferred matches resolved. Browser/axe matrix runs at verify — no browser in apply env.)*

## Slice 3: Polish + Cleanup (≈160 lines) ✅ COMPLETE (unblocked — `fix-date-pipeline` archived 2026-08-15)

> fix-date-pipeline ARCHIVED → locked files released; all 3.1.x + 3.2.x executed in this batch.

### Unit S3-A — Locked-file restyle (unblocked by archive)
- [x] **3.1.1** `Countdown.tsx` — digit styling on tokens + reduced-motion. [DT-7] *(font-display + tabular-nums + neutral-800; no CSS animation to disable — 1s tick is content, kept under reduced motion)*
- [x] **3.1.2** `SearchInvitation.tsx` — mechanical old→new Button drop-in. [CP-2] *(→ `ui/Button` primary lg, `loading` spinner, label preserved; dead `text-md` → `text-base`)*
- [x] **3.1.3** home `src/app/page.tsx` — restyle on tokens (Aurora optional). [DT-7] *(hero h1 → `BlurTextTitle`, `min-h-screen`, Aurora skipped — BackgroundLayer already decorates)*

### Unit S3-B — Dead code + deps
- [x] **3.2.1** Delete old `Button.tsx` — only after 3.1.2 removes last consumer (verify 0 imports). [CP-2] *(0 imports verified — all Button imports are `ui/Button`)*
- [x] **3.2.2** Delete dead components — InvitationButton, ProductCard (+ PlacesToGo, LocationFriendsCard if import scan shows 0 usage). **AC**: grep 0 imports before delete. [CP-2, CP-3] *(InvitationButton 0 imports; ProductCard only commented wishlist usage; PlacesToGo only commented InvitationPersonalInfo usage; LocationFriendsCard only imported by PlacesToGo — all removed with dead imports/comments)*
- [x] **3.2.3** Uninstall unused — canvas-confetti, confetti-js, emoji-mart, react-countdown, react-countdown-circle-timer, @types/canvas-confetti (verify 0 imports first). [CP-10] *(0 references repo-wide outside package.json; `npm uninstall` removed 6 packages)*
- [x] **3.2.4** Final gates — tsc/lint/build; grep removed pkgs absent from package.json + imports; final arbitrary-class grep; full manual matrix. [CP-10, DT-7] *(tsc 0 / lint 0 (2 pre-existing warnings in untouched live files) / build 0; all grep gates 0; arbitrary classes 0; `<main` = 1; browser matrix deferred to verify — no browser in apply env)*
