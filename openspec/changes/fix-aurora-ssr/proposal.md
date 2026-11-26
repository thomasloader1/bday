# Proposal: Fix SSR crash on /[id]/confirm (Aurora/ogl)

## Intent

`GET /[id]/confirm` 500s (CRITICAL). `AuroraBackdrop` → `Aurora` → static `import ... from 'ogl'`; ogl's `extras/Texture3D.js` touches DOM globals, so module evaluation during SSR throws `ReferenceError: window is not defined`. Only confirm imports Aurora; other routes work. Goal: ogl NEVER evaluated server-side; visual design and confirm guard byte-identical.

## Scope

**In**
- `AuroraBackdrop`: `next/dynamic(() => import("./Aurora"), { ssr: false })` + mounted gate (static gradient during SSR/first paint; Aurora after mount, non-reduced-motion)
- ogl confined to client chunk; verify tsc / lint / build + curl 200

**Out**
- Confirm-guard changes (byte-identical)
- Raw-WebGL rewrite / ogl removal / other routes / design-copy-token changes

## Capabilities

**New:** `aurora-backdrop` — MUST NOT evaluate `ogl` on the server; MUST render the static tokenized gradient during SSR and first client render; MUST swap to Aurora after mount unless reduced motion.

**Modified:** None (`confirm-guard`, `component-primitives`, `design-tokens`, `event-date` unchanged).

## Approach

Approach 2 (dynamic `ssr: false`) + mounted gate — the only way ogl never evaluates server-side. In `AuroraBackdrop.tsx`: `const Aurora = dynamic(() => import("./Aurora"), { ssr: false })`; `mounted` state set in `useEffect`; render `mounted && !reducedMotion ? <Aurora/> : <static gradient>`. Mounted-gate alone fails (static import still evaluated server-side); here it keeps first client render = SSR HTML (no hydration mismatch/flash). Rejected: drop Aurora (loses design intent), raw WebGL (out of scope). AuroraBackdrop is imported only by the confirm page (verified) → single-file fix; `page.tsx` untouched.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/components/AuroraBackdrop.tsx` | Modified | dynamic ssr:false + mounted gate + SSR fallback |
| `src/components/Aurora.tsx` | Unchanged | "use client"; window only in useEffect; now client-only chunk |
| `src/app/[id]/confirm/page.tsx` | Unchanged | guard byte-identical |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hydration mismatch | Med | Mounted gate → first client render = gradient, matches SSR |
| Chunk-load flash | Low | Gradient fills space (same design intent) |
| next/dynamic ssr:false in client comp (Next 14.0.3) | Low | Supported; build validates |

## Rollback Plan

`git checkout -- src/components/AuroraBackdrop.tsx`. No deps/data/migrations.

## Dependencies

None new. Verification (no test runner): `npx tsc --noEmit`, `npm run lint`, `npm run build`, `curl /[id]/confirm` = 200, aurora renders post-mount.

## Success Criteria

- [ ] `GET /[id]/confirm` → 200; no `window is not defined`
- [ ] Static gradient during SSR/first paint; no hydration-mismatch warnings
- [ ] Aurora post-mount (non-reduced-motion); gradient only for reduced-motion
- [ ] Confirm page `git diff` empty
- [ ] tsc / lint / build pass
