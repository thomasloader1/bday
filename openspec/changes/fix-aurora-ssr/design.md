# Design: Fix SSR crash on /[id]/confirm (Aurora/ogl)

## Technical Approach

Single-file fix in `src/components/AuroraBackdrop.tsx`. Replace the static `import Aurora from "./Aurora"` with `dynamic(() => import("./Aurora"), { ssr: false })` so ogl lands in a client-only chunk and is never evaluated server-side, plus a `mounted` gate so SSR and the first client render both paint the tokenized static gradient (no hydration mismatch). Post-mount, non-reduced-motion users get the animated Aurora; reduced-motion users keep the gradient. `Aurora.tsx` and `page.tsx` stay byte-identical.

**Root cause (verified)**: ogl@1.0.11 ships raw ESM source (`"type": "module"`, `main: ./src/index.js`) with unguarded DOM references — `core/Renderer.js:18` default param `canvas = document.createElement('canvas')`, `extras/Texture3D.js:12` `new Image()`. The static import drags ogl into the server bundle; any server-side execution throws `ReferenceError: window is not defined`.

## Architecture Decisions

### Decision 1: next/dynamic import shape (Next 14.0.3)

| Option | Tradeoff | Decision |
|---|---|---|
| `import { dynamic } from "next/dynamic"` | Named export was added in Next 15; **absent in 14.0.3** — installed `dist/shared/lib/dynamic.js` exports only `{ noSSR, default }`; `dynamic.d.ts` has only `export default` → compile/type error | `import dynamic from "next/dynamic"` |
| `dynamic(() => import("./Aurora"), { ssr: false })` in a "use client" component | `ssr: false` is rejected in Server Components but valid in Client Components (App Router) | Adopt — AuroraBackdrop is already `"use client"` |

### Decision 2: Mounted gate

`const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);` — SSR and the first client render see `mounted=false` → gradient, byte-identical to SSR HTML (no hydration mismatch, no flash). StrictMode double-effect is safe: `setMounted(true)` is idempotent.

### Decision 3: Reduced-motion precedence (render decision table)

| Phase | mounted | reducedMotion | Rendered |
|---|---|---|---|
| SSR | false | null | `StaticGradient` |
| First client render | false | null/bool | `StaticGradient` (matches SSR → no mismatch) |
| After mount, motion OK | true | false | `<Aurora colorStops={colorStops} amplitude={0.9} blend={0.5} />` (fallback while chunk loads) |
| After mount, reduced motion | true | true | `StaticGradient` |

Form: `mounted && !reducedMotion ? <Aurora … /> : <StaticGradient />`.

### Decision 4: Loading fallback

| Option | Tradeoff | Decision |
|---|---|---|
| No `loading` prop | Default loading returns `null` pre-pastDelay → empty card between mount and chunk load | Provide `loading: () => <StaticGradient />` |
| `loading: () => null` | Same empty flash | Reject |

The fallback reuses the exact element SSR painted → continuous visual, zero mismatch, no layout shift.

### Decision 5: Props passthrough

`className` / `colorStops` remain props; `amplitude={0.9}` / `blend={0.5}` stay hardcoded at the Aurora call site (current behavior). Wrapper div unchanged (`aria-hidden`, `pointer-events-none absolute inset-0 overflow-hidden rounded-xl`, className interpolation).

### Decision 6: page.tsx

No change needed. `import AuroraBackdrop from "@/components/AuroraBackdrop"` stays valid: AuroraBackdrop remains a default-export `"use client"` component in the server-rendered tree, and no longer statically imports ogl → SSR succeeds. Grep confirms AuroraBackdrop is imported only by the confirm page and Aurora only by AuroraBackdrop.

### Decision 7: Bundle / performance

`dynamic(() => import("./Aurora"))` splits Aurora+ogl into a separate client chunk; the /confirm server bundle no longer contains ogl. First paint is unchanged (gradient); WebGL work starts only after mount on non-reduced-motion clients.

## Code Sketch (AuroraBackdrop.tsx)

```tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; // default import — no named `dynamic` in Next 14
import { useReducedMotion } from "motion/react";

interface AuroraBackdropProps {
  className?: string;
  /** Three color stops for the aurora gradient (react-bits Aurora). */
  colorStops?: string[];
}

/** Tokenized static gradient: SSR + first paint + reduced-motion + chunk-load fallback. */
const StaticGradient = () => (
  <div className="h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15" />
);

// ogl touches DOM at module/constructor scope — MUST stay client-only.
const Aurora = dynamic(() => import("./Aurora"), {
  ssr: false,
  loading: () => <StaticGradient />,
});

const AuroraBackdrop = ({
  className = "",
  colorStops = ["#6366F1", "#F97316", "#FFEAA7"],
}: AuroraBackdropProps) => {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-xl ${className}`}
    >
      {mounted && !reducedMotion ? (
        <Aurora colorStops={colorStops} amplitude={0.9} blend={0.5} />
      ) : (
        <StaticGradient />
      )}
    </div>
  );
};

export default AuroraBackdrop;
```

## Data Flow

```
/confirm (SSR) → AuroraBackdrop: mounted=false → StaticGradient (HTML sent)
client hydrate → mounted=false → StaticGradient (matches SSR)
useEffect      → mounted=true
   ├─ reducedMotion=true  → StaticGradient (final state)
   └─ else → dynamic(Aurora) → client chunk (Aurora+ogl) loads
             → fallback StaticGradient until ready → WebGL canvas
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/AuroraBackdrop.tsx` | Modify | dynamic `ssr: false` + mounted gate + StaticGradient loading fallback |
| `src/components/Aurora.tsx` | Unchanged | `"use client"`; DOM access only inside `useEffect`; now client-only chunk |
| `src/app/[id]/confirm/page.tsx` | Unchanged | byte-identical |

## Interfaces / Contracts

`AuroraBackdropProps` unchanged. `dynamic()` resolves the loader via `convertModule` → `{ default: Aurora }` — Aurora's existing default export already fits.

## Testing Strategy

No test runner — gates + manual:

| Gate | Command | Checks |
|---|---|---|
| Types | `npx tsc --noEmit` | dynamic import + types |
| Lint | `npm run lint` | exhaustive-deps |
| Build | `npm run build` | server bundle free of ogl; route builds |
| Smoke | `curl /[id]/confirm` | 200; no `window is not defined` |

Manual: gradient→aurora swap after mount; reduced-motion keeps gradient; no hydration warnings in console; confirm page `git diff` empty; visual byte-identical pre/post.

## Migration / Rollout

No migration. Rollback: `git checkout -- src/components/AuroraBackdrop.tsx`.

## Commit Plan

One atomic commit — dynamic import and mounted gate are halves of the same fix (gate without dynamic still crashes SSR; dynamic without gate flashes and risks mismatch):

```
fix(confirm): defer ogl aurora to client via next/dynamic ssr:false
```

## Open Questions

None.
