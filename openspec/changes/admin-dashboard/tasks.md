## SDD Tasks Response

### status
ready_for_implementation

### executive_summary
The admin-dashboard spec (270 lines, all gates pass) resolves 7 key decisions for the next-bday project. This task breakdown divides the implementation into 7 logical work units following work-unit-commits conventions: (1) Auth setup with ADMIN_PASSWORD env var, login endpoint, and middleware; (2) Firestore cards + assignments collections with typed CRUD; (3) /admin route with nodejs runtime override and middleware integration; (4) CardRenderer client-only WebGL loader with reduced-motion and timeout fallback; (5) [id] route assignment resolution with default invitation fallback; (6) Admin dashboard UI — guest list, card editor, assignment mapping; (7) Unit + integration tests targeting ≥80% coverage. Each task produces a single deliverable (behavior/fix/component) with test criteria, modified/created files, and a conventional commit message. The Aurora SSR fix (fix-aurora-ssr) must be committed and verified first, as the admin dashboard depends on the client-only WebGL loading pattern it implements.

### artifacts (file paths that would be created)
New files to create:
- `.env.example` — contains `ADMIN_PASSWORD=`
- `src/pages/api/admin/login.ts` — POST login endpoint
- `src/pages/api/admin/logout.ts` — POST logout endpoint
- `src/middleware.ts` — `/admin*` guard checking HttpOnly cookie
- `src/app/admin/layout.tsx` — layout with `export const runtime = "nodejs"`
- `src/app/admin/login/page.tsx` — password login page
- `src/components/ui/CardRenderer.tsx` — client-only WebGL loader pattern
- `src/app/admin/dashboard/page.tsx` — guest list + card list UI
- `src/app/cards/[id]/page.tsx` — card editor / live preview
- `src/app/assignments/page.tsx` — guest → card mapping table
- `src/tests/auth.test.ts` — unit tests for middleware and API endpoints
- `src/tests/card-renderer.test.ts` — renders SSR gradient, client load, reduced-motion
- `src/tests/assignment-resolver.test.ts` — assignment resolution + fallback
- `src/tests/integration.test.ts` — end-to-end card creation → assignment → guest view

Modified files (existing, no new):
- `src/lib/firebase.ts` — add `cards` and `assignments` collection references + typed CRUD
- `src/types/Guest.ts` — add `CardConfig`, `Assignment` interfaces
- `src/app/[id]/page.tsx` — integrate assignment resolution logic
- `src/hooks/useGuestData.ts` — fetch assignment from Firestore

### next_recommended
First, ensure the Aurora SSR fix (`fix-aurora-ssr`) is committed and all three gates pass (`tsc`, `lint`, `build`) including the `/confirm` route. Then start Task 1 (Auth setup) as it has no dependencies other than the existing codebase structure. After auth is in place, proceed in order: Task 2 (Firestore), Task 3 (admin route), Task 4 (CardRenderer), Task 5 ([id] resolution), Task 6 (dashboard UI), Task 7 (tests). Run gates after each task to catch regressions early.

### risks
1. **Edge/Node runtime mismatch**: The root layout uses `runtime = "edge"`; the new `/admin` segment uses `runtime = "nodejs"`. Must verify no edge-only features (e.g., `next/font` Google font loading, `window`/`document` references) leak into the admin segment. The Aurora SSR fix must land first.
2. **Firebase client SDK in Node**: The Firebase JS client SDK works in both Edge and Node runtimes, but configuration (e.g., `autoDelete`, `experimentalForceLongPolling`) must be compatible. No Admin SDK is used — only the client SDK via the existing `db` export.
3. **Bundle size impact**: Importing ReactBits WebGL components (Aurora, Particles) grows the client bundle. Lazy-loading via `next/dynamic ssr:false` mitigates this, but the initial client payload will increase. Keep the CardRenderer fallback gradient prominent.
4. **Reduced-motion gating**: The `useReducedMotion()` hook from `motion/react` must be tested carefully — if the user prefers reduced motion, the CardRenderer must stay on the static gradient and never mount the WebGL component. A bug here could cause runtime errors or inaccessible content.
5. **Build gate after admin changes**: `npm run build` must succeed with the new `/admin` segment. If the dynamic import paths or middleware cause server-side errors, the build will fail. Each task should be verified with `npm run build` before proceeding.

### skill_resolution
The sdd-tasks skill was used to break down the admin-dashboard specification into work-unit commits. Each task follows the convention of: single deliverable, test criteria, files created/modified, conventional commit message. The breakdown covers all 7 implementation areas specified by the user (auth, firestore, route, card renderer, [id] resolution, dashboard UI, tests) and aligns with the existing project conventions (Next.js 14 App Router, Firebase client SDK, Tailwind CSS, Vitest for testing).