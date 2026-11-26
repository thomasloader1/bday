# Tasks: Fix SSR crash on /[id]/confirm (Aurora/ogl)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40 (1 file: `src/components/AuroraBackdrop.tsx`) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single commit / PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Single-file AuroraBackdrop fix + build/curl verification | PR 1 (only) | ~40 lines, 1 file; `Aurora.tsx` + `page.tsx` byte-identical |

## Phase 1: Core Implementation (`src/components/AuroraBackdrop.tsx`)

- [x] 1.1 Replace static `import Aurora from "./Aurora"` with `import dynamic from "next/dynamic"` (default import — named `{ dynamic }` is Next 15-only) + `const Aurora = dynamic(() => import("./Aurora"), { ssr: false, loading: () => <StaticGradient /> })`; extract `StaticGradient` component (`h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15`). Verify: no static ogl import remains; `Aurora.tsx` untouched.
- [x] 1.2 Add mounted gate: `const [mounted, setMounted] = useState(false)` + `useEffect(() => setMounted(true), [])`; render `mounted && !reducedMotion ? <Aurora colorStops={colorStops} amplitude={0.9} blend={0.5} /> : <StaticGradient />`. Verify: wrapper keeps `aria-hidden`, `pointer-events-none`, `absolute inset-0 overflow-hidden rounded-xl` + className; Aurora props passthrough preserved (Req 6, 8).

## Phase 2: Verification (no test runner — all TDD-irrelevant; build/curl gates)

- [ ] 2.1 Type gate (TDD-irrelevant): `npx tsc --noEmit` passes — validates dynamic import shape on Next 14 (Spec: dynamic import correctness).
- [ ] 2.2 Lint gate (TDD-irrelevant): `npm run lint` passes — exhaustive-deps on the new effect.
- [ ] 2.3 Build gate (TDD-irrelevant): `npm run build` succeeds; /confirm route builds.
- [ ] 2.4 Grep gate (TDD-irrelevant): after build, search `.next/server` for `ogl` — no module code (Spec: ogl never evaluated server-side); any `ogl` reference resolves only in client chunks (`.next/static`).
- [ ] 2.5 Smoke (TDD-irrelevant): start dev server; `curl http://localhost:3000/1155011250/confirm` → HTTP 200, HTML contains static gradient, no `window is not defined` (Spec: SSR render).
- [ ] 2.6 Regression/scope guard (TDD-irrelevant): `git diff` on `src/app/[id]/confirm/page.tsx` and `src/components/Aurora.tsx` → empty (byte-identical); browser manual: no hydration-mismatch warnings, gradient→Aurora swap post-mount, reduced-motion (DevTools emulate) keeps gradient (Spec: no mismatch, reduced motion, guard unchanged).

## Commit

One atomic commit after 2.6 passes: `fix(confirm): defer ogl aurora to client via next/dynamic ssr:false` (dynamic import + mounted gate are halves of one fix; rollback: `git checkout -- src/components/AuroraBackdrop.tsx`).
