# Archive Report: design-system

**Change**: design-system
**Mode**: openspec (filesystem sync + archive move)
**Date**: 2026-08-15
**Verify status**: `success` — FINAL: PASS, 0 CRITICAL, 0 WARNING (39/39 tasks complete across Slices 1–3)
**Status**: `success` — archived

---

## Executive Summary

The design-system change ("Party Suave") is COMPLETE and VERIFIED: 39/39 tasks done across all 3 chained slices, `tsc` exit 0, `lint` exit 0, `build` exit 0 (edge runtime kept), all grep gates clean (arbitrary classes 0, `<main` = 1, legacy classes 0), WCAG AA contrast verified by computed luminance (success 5.02:1, primary.700 5.18:1, danger 7.58:1), locked-file restyles proven visual-only against the archived fix-date-pipeline behavior contract (5 behavior lib files diff-empty), deleted components/deps confirmed gone with zero imports, and the two verify findings resolved (WARNING-1 success token darkened `#16A34A` → `#15803D`, SUGGESTION-1 p-in-h1 fixed via `as` prop). Both delta specs (`design-tokens`, `component-primitives`) were synced into the main specs (created — `openspec/specs/` had only the archived `event-date` spec), and the change folder was moved to the archive with full audit trail. Four follow-ups are recorded for future work (B3 confirm guard, missing `openspec/config.yaml`, untracked openspec/opendesign artifacts, deferred browser/axe matrix) — none block this archive, and none are fixed here.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `design-tokens` | Created | `openspec/specs/design-tokens/spec.md` — full spec copied from delta (main spec did not exist). 8 requirements, 7 scenarios. Includes the amended `success` token `#15803D` (5.01:1 with white, WCAG AA) per the post-verify maintainer-approved amendment. 0 modified, 0 removed (nothing pre-existing to merge). |
| `component-primitives` | Created | `openspec/specs/component-primitives/spec.md` — full spec copied from delta (main spec did not exist). 10 requirements, 5 scenarios. 0 modified, 0 removed (nothing pre-existing to merge). |

Both copies verified byte-identical to the delta specs (SHA-256 match).

## Archive Contents

`openspec/changes/archive/2026-08-15-design-system/` contains:
- `proposal.md` ✅
- `specs/design-tokens/spec.md` ✅
- `specs/component-primitives/spec.md` ✅
- `design.md` ✅ (incl. amendments section)
- `tasks.md` ✅ (39/39 tasks complete)
- `apply-progress.md` ✅
- `verify-report.md` ✅
- `archive-report.md` ✅

## Source of Truth Updated

- `openspec/specs/design-tokens/spec.md` — token vocabulary (palette incl. amended success, typography, spacing, radius, shadow, motion, adoption gate) now the single source of truth.
- `openspec/specs/component-primitives/spec.md` — Button/Card primitives, structural fixes, CakeBackground, react-bits, icon policy, dependency changes now the single source of truth.

## Implementation Traceability

Committed on `main`, `68ab99e` → `4088fed` (13 commits, base `407c52f` = archived fix-date-pipeline HEAD):
| Hash | Message |
|------|---------|
| `68ab99e` | `feat(tokens): add design token scales to tailwind config` |
| `18b337f` | `feat(ui): add Button and Card primitives` |
| `6ad76d9` | `fix(layout): single main, static footer, spinner bug` |
| `ca05d56` | `feat(background): efficient cake background with CSS drift` |
| `51b835b` | `refactor(ui): adopt Button primitive across consumers` |
| `0928956` | `feat(background): site-wide icon background with react-bits cubes` |
| `38fa32a` | `feat(react-bits): add Aurora and BlurText components` |
| `4fe4335` | `refactor(pages): apply tokens and primitives across pages` |
| `75b698d` | `fix(ui): darken success token to meet AA contrast` |
| `d8d4ed0` | `fix(a11y): render blur title content as span inside h1` |
| `de124a3` | `refactor(ui): restyle countdown, search, and home on tokens` |
| `ca573a0` | `refactor(ui): remove dead components and legacy button` |
| `4088fed` | `chore(deps): remove unused animation and confetti packages` |

## Accepted Risks / Deviations (recorded per verify + apply)

- **Deviation D1 — success token amendment (WARNING-1 resolution)**: `success` `#16A34A` → `#15803D` (green-700 family, 5.02:1 with white ≥ 4.5 AA). Applied to `tailwind.config.ts:44`, ODSF bundle, delta spec, and design.md amendments section; `ui/Button` + `GroupedButtons` consume the token so no component change was needed. Commit `75b698d`.
- **Deviation D2 — BlurText `as` prop (SUGGESTION-1 resolution)**: `BlurText` gained `as?: 'p' | 'span'` (default `'p'`); `BlurTextTitle` passes `as="span"` inside the `<h1>` — real heading semantics, no flow content in heading. Small additive vendor patch, default behavior untouched. Commit `d8d4ed0`.
- **Deviation D3 — react-bits installed via URL form** `https://reactbits.dev/r/<Name>-TS-TW` (the `@react-bits/...` shorthand does not resolve in the current shadcn CLI); installed flat in `src/components/` per CLI output; `"use client"` added to each (absent upstream); `motion` resolved to ^12.43.0 by the CLI — no v13-only API in use.
- **Deviation D4 — site-wide background**: `CakeBackground` moved from page-level into a root-layout `BackgroundLayer` (`fixed inset-0 -z-10`), plus react-bits **Cubes** (gsap) added per new user requirement, bottom-right corner, gated by `useReducedMotion`. Zero page-level duplication.
- **Deviation D5 — Button inline spinner self-contained** (its own `<span>` arc) instead of importing `LoadingSpinner` — keeps the primitives commit green before the spinner rewrite; visual matches.
- **Deviation D6 — edge runtime KEPT** (`runtime = 'edge'` in layout): full build green with ogl/gsap — Aurora instantiates WebGL only inside `useEffect`, so the module import is SSR/edge-safe. Design's drop-edge fallback not triggered.
- **Deviation D7 — commit plan executed as 13 commits** (including separate `d8d4ed0` a11y fix and `75b698d` contrast fix — one purpose per commit per work-unit-commits).
- **BlurText "words" mode splits per character** (upstream quirk, identical `split('')` branches) — ACCEPTED as-is; vendor kept pristine; sequential reveal still meets the scenario (SUGGESTION-2).
- **Aurora vendor exhaustive-deps lint warning** (`Aurora.tsx:208`) — upstream react-bits, left as-shipped; optional future patch (SUGGESTION-4 in verify).

## Follow-up Requirements (recorded — NOT fixed here)

1. **B3 confirm guard** — `src/app/[id]/confirm/page.tsx:19-21`. Inverted/incomplete guard (a guest who never interacted passes it and views the confirm page without confirming) + `router.push` during render (React anti-pattern). Pre-existing CRITICAL from the original audit, out of scope of BOTH fix-date-pipeline and design-system (behavior preserved verbatim in this change's restyle). REQUIRED follow-up before any confirm/RSVP-flow work — downstream work must not assume the confirm page redirects unconfirmed guests.
2. **`openspec/config.yaml` missing** — the openspec convention expects it (`schema`, `rules.verify`, `testing`); verify fell back to project files (Standard mode, no test runner). Create before the next change (sdd-init).
3. **`openspec/` + `opendesign/` artifacts UNTRACKED in git** — currently only `opendesign/log.md`, `opendesign/styles/tokens.css`, `opendesign/tokens/color.md`, `openspec/changes/design-system/design.md`, and `openspec/changes/design-system/specs/design-tokens/spec.md` are tracked; the ODSF bundle and SDD audit trail (incl. this archive) would be lost on push. Recommendation: commit the ODSF bundle + audit trail, or accept the loss. **Not committed in this phase** — consistent with the previous archive (repo convention so far leaves them untracked; `.gitignore` change for `.atl/` is also uncommitted).
4. **Browser/axe manual matrix deferred** — reduced-motion fallbacks (static cake/Cubes/Aurora, BlurText plain text), focus rings, spinner no-shift, one `<main>` in DOM. No browser in apply/verify env; structural evidence covers it. Recommend a post-deploy browser-qa/canary-watch pass.

## Non-blocking Suggestions (deferred, not part of archive)

- `[id]/confirm` first-load JS 313 kB (Aurora WebGL) — accepted; monitor LCP if it matters.
- Pre-existing lint warnings in untouched live files (`ProductCard2.tsx:19` `<img>` — next/image migration is a separate change per proposal).
- `next/image` migration, leaflet redesign, full dead-code sweep beyond replaced primitives — explicit proposal Out items.

## Risks

- **B3 confirm guard unaddressed** (see follow-up 1): any confirm/RSVP-flow work must schedule this first.
- **Untracked SDD/ODSF artifacts** (see follow-up 3): pushed repo loses the design-system documentation and audit trail unless committed.
- **No test framework / no automated regression**: behavioral guarantees rest on grep gates + computed contrast + manual QA; recommend a test runner via `openspec/config.yaml` before the next change.
- **Aurora weight**: `[id]/confirm` 313 kB first-load JS — accepted and unchanged across slices.
- **Edge runtime disables static generation**: pre-existing, intentional, informational only.

## Skill Resolution

`fallback-path` — no `## Project Standards` block injected; no `SKILL: Load` instructions; no skill registry found (`.atl/skill-registry.md` absent); loaded `sdd-archive/SKILL.md` + `_shared/sdd-phase-common.md` + `_shared/openspec-convention.md` from `~/.config/opencode/skills/`. No `openspec/config.yaml` exists (no `rules.archive` overrides).

**Artifacts**: `openspec/specs/design-tokens/spec.md` (synced) · `openspec/specs/component-primitives/spec.md` (synced) · `openspec/changes/archive/2026-08-15-design-system/archive-report.md`
