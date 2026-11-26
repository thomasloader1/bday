# Admin Dashboard Specification (admin-dashboard)

## Purpose

Add an admin dashboard to the personal birthday invitation app (next-bday) for designing invitation cards with ReactBits effects and managing guest‑to‑card assignments. The admin route is a protected segment that coexists with the edge‑runtime public invite routes. This spec documents the design decisions, Firestore structure, route isolation, and verification gates so the change can be implemented, verified, and committed with confidence.

## Requirements

### Requirement: 1. Auth model — simple password gate

The `/admin` segment MUST be protected by a lightweight password gate using an `ADMIN_PASSWORD` environment variable. Access flow:

- **Login**: `POST /api/admin/login` with `{ password }`. On success, sets a secure HttpOnly cookie. The middleware `src/middleware.ts` (or equivalent) checks the cookie on every `/admin/*` request and redirects to `/admin/login` when missing or invalid.
- **Logout**: `POST /api/admin/logout` clears the cookie.
- **Middleware**: `next/middleware.ts` guards `/admin/:path*` — if no valid cookie, redirects to `/admin/login` (307). The login page itself is public (no auth check).
- **Why not (b) Firebase Auth**: overkill for a single‑person party app; requires billing config, OAuth setup, and token management. The quota and complexity are unjustified when the app is unlisted and personal.
- **Why not (c) no auth**: fastest but provides zero protection; the admin routes are unlisted but still visible in the source. The password gate is a trivial tradeoff for peace of mind.

**Decision**: Option (a) simple password gate with `ADMIN_PASSWORD` env var. Documented in `.env.example` and referenced by middleware.

#### Scenario: Admin login with correct password

- GIVEN the admin navigates to `/admin/login` and enters the correct `ADMIN_PASSWORD`
- WHEN `POST /api/admin/login` is called
- THEN the cookie is set and the guest is redirected to `/admin/dashboard`

#### Scenario: Admin login with wrong password

- GIVEN the admin enters an incorrect password
- WHEN `POST /api/admin/login` is called
- THEN the response is 401 and the cookie is not set; the login page re‑prompts

#### Scenario: Unauthenticated access to /admin/dashboard

- GIVEN a guest (or bot) accesses `/admin/dashboard` without a valid cookie
- WHEN the middleware runs
- THEN a 307 redirect to `/admin/login` occurs

#### Scenario: Admin logout

- GIVEN the admin clicks "Logout" on the dashboard
- WHEN `POST /api/admin/logout` is called
- THEN the cookie is cleared and the guest is redirected to `/`

### Requirement: 2. Cards storage — Firestore `cards` + `assignments` collections

Firestore stores card configs and guest‑to‑card mappings. The existing `db` client from `src/config/firebase` (client SDK) is used for all reads/writes. No Admin SDK is needed; operations are client‑side within the `/admin` Node runtime.

**`cards` collection**:
- Document ID = card unique ID (e.g., auto‑generated or `name`-derived)
- Fields: `name`, `guestGroupId?`, `backgroundEffect`, `titleEffect`, `titleText`, `bodyText`, `colorStops` (array of hex strings), `createdAt`, `updatedAt`
- Example doc: `{ name: "aurora‑birthday", backgroundEffect: "gradient-swirl", titleEffect: "blur‑text", titleText: "¡Feliz cumple!", bodyText: "Únete a la celebración", colorStops: ["#6366F1","#F97316","#FFEAA7"], createdAt: timestamp }`

**`assignments` collection**:
- Composite document ID: `{guestId}` (maps one guest to one card)
- Fields: `cardId`, `assignedAt`, `assignedBy` (admin user ID or "password‑gate")
- Example doc (guest `1155011250` → card `aurora‑birthday`): `{ cardId: "aurora-birthday", assignedAt: timestamp, assignedBy: "password-gate" }`

**Backward compatibility**: If a guest has no assignment doc, the `[id]` route renders the default invitation (current behavior unchanged). This means existing guests without an assignment see the normal invitation.

#### Scenario: Card created and stored in Firestore

- GIVEN the admin creates a new card via the editor
- WHEN the card config is saved
- THEN a new doc is added to `cards` with `createdAt` timestamp
- AND the card appears in the card list UI

#### Scenario: Guest assigned a card

- GIVEN the admin assigns an existing card to a guest from the guest list
- WHEN the assignment is saved
- THEN a doc is added to `assignments` with `guestId → cardId`
- AND the next time that guest opens `[id]`, the assigned card renders instead of the default

#### Scenario: Guest with no assignment

- GIVEN a guest opens `[id]` and has no assignment doc
- WHEN the route resolves
- THEN the default invitation (current behavior) renders, backward‑compatible

### Requirement: 3. `/admin` route structure with runtime isolation

The `/admin` segment uses a **nodejs** runtime override, while the root and all public routes (`/`, `/[id]`, `/[id]/confirm`, `/wishlist`) remain **edge**. This is achieved by placing the admin files under `src/app/admin/` and adding `export const runtime = "nodejs"` in `src/app/admin/layout.tsx`.

**Route map**:
- `/admin/login` — password login page (Node runtime, SSR‑safe, no WebGL)
- `/admin/dashboard` — guest list + card list (Node runtime, fetches Firestore)
- `/admin/cards/[id]` — card editor / live preview (Node runtime, client‑only WebGL preview via `ssr:false` dynamic import)
- `/admin/assignments` — guest → card mapping table (Node runtime)

**Why segment‑level override (not root off‑edge)**:
- Keeps the public invite routes on edge for maximum performance (fast first paint, no DOM during SSR).
- The Aurora SSR fix (already committed) ensures edge routes are stable.
- The dashboard needs Node because it uses the Firebase client SDK (`db`) which works in both runtimes, and it may render WebGL previews that would crash under edge.

#### Scenario: Public route stays edge

- GIVEN the root layout has `export const runtime = "edge"`
- WHEN a request comes in for `/`
- THEN the server renders with Edge runtime, no `window`/`document` errors

#### Scenario: Admin route uses nodejs

- GIVEN a request comes in for `/admin/dashboard`
- THEN the server renders with Node.js runtime, Firebase client SDK works, WebGL previews can lazy‑load client‑side

#### Scenario: Runtime mismatch prevented

- GIVEN no `next/font` google‑font loading or edge‑only features inside `src/app/admin/`
- WHEN `npm run build` runs
- THEN no edge‑only errors appear in the build output

### Requirement: 4. CardRenderer component — client‑only loader for ReactBits WebGL

The `<CardRenderer>` is a generic component that mounts the selected ReactBits effects (background + text animation) behind the invitation content. Because ReactBits WebGL components (Aurora, Particles, etc.) are **SSR‑unsafe** under edge runtime, `<CardRenderer>` uses a reusable client‑only loading pattern.

**Pattern** (generalized from `AuroraBackdrop`):
```tsx
// src/components/ui/CardRenderer.tsx
import dynamic from "next/dynamic";

const StaticGradient = /* decorative gradient HTML, tokenized */;
const WebGLComponent = dynamic(() => import(`./${effectName}`), {
  ssr: false,
  loading: () => StaticGradient,
  timeout: 3000,
});

export const CardRenderer = ({ config }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <StaticGradient />;

  const Component = WebGLComponent; // resolved at runtime
  return <Component {...config} />;
};
```

**Key properties**:
- `ssr: false` — never imported in the server bundle; the ogl module never runs server-side.
- `loading: () => StaticGradient` — shows a tokenized static gradient while the WebGL chunk loads; no empty gap.
- `timeout: 3000` — falls back to the static gradient after 3s if the chunk fails to load.
- Wrapper keeps `aria-hidden`, `pointer-events-none`, `absolute inset-0`, `overflow-hidden`, `rounded-xl` — decorative only.
- Aurora props contract (`colorStops`, `amplitude`, `blend`) is preserved; other effects may have different props but follow the same pattern.

#### Scenario: Card renders static gradient during SSR and initial client render

- GIVEN a card with a WebGL background is rendered on `[id]`
- WHEN the page renders server‑side
- THEN the HTML contains the static gradient, no ogl canvas, and HTTP 200 is returned

#### Scenario: WebGL effect loads after mount

- GIVEN the client mounts and the dynamic import resolves
- THEN the WebGL canvas appears in the backdrop, animated, replacing the static gradient

#### Scenario: Chunk load timeout falls back

- GIVEN the WebGL chunk takes >3s to load
- THEN the static gradient remains visible; no blank or error state

#### Scenario: Reduced‑motion keeps static gradient

- GIVEN user prefers reduced motion
- WHEN the CardRenderer mounts
- THEN the static gradient stays; no rAF loop or WebGL canvas starts

### Requirement: 5. Guest → card assignment mapping

The mapping is stored in Firestore `assignments` collection. The `[id]` route resolves the assignment before rendering the card.

**Resolution algorithm** (run client‑side or in the Node `/admin` runtime, never on edge):
1. Fetch the guest doc from `guests.json` or `persons/{id}` in Firestore.
2. Fetch the assignment doc from `assignments/{guestId}`.
3. If an assignment exists **and** its `cardId` matches a doc in `cards`, render the assigned card via `<CardRenderer config={cardConfig} />`.
4. If no assignment or the card is missing, render the default invitation (current `[id]` behavior).

**Edge case — deleted card**: If the assigned card doc was deleted, fall back to the default invitation and surface a warning in the console (admin‑visible only).

#### Scenario: Assigned card renders for a guest

- GIVEN guest ID `1155011250` has an assignment doc `{ cardId: "aurora-birthday" }`
- WHEN the `[id]` page loads
- THEN the server fetches the card config from `cards/aurora-birthday` and renders it via `<CardRenderer>`
- AND the WebGL Aurora effect loads client‑side after mount

#### Scenario: Default invitation renders when no assignment exists

- GIVEN guest ID `9999999999` has no assignment doc
- WHEN the `[id]` page loads
- THEN the default invitation (current UI, no card renderer) appears
- AND the page is identical to the pre‑dashboard behavior

### Requirement: 6. Prerequisite — Aurora SSR fix commit must land first

The admin‑dashboard change depends on the Aurora SSR fix being committed and verified. The fix (already code‑applied in `fix-aurora-ssr`) defers the ogl/Aurora module to client‑only via `next/dynamic ssr:false`. Without this fix, any admin‑dashboard route that imports or references WebGL components would 500 under the edge runtime.

**The Aurora SSR fix commit** must satisfy these gates before the admin-dashboard spec is considered ready for apply:
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run build` succeeds and the `/confirm` route builds
- `git diff` on `src/app/[id]/confirm/page.tsx` is byte‑identical
- Manual: `curl http://localhost:3000/<id>/confirm` → HTTP 200, static gradient in HTML, no `window is not defined` error

Until the Aurora SSR fix is committed and verified, the admin‑dashboard work must **not** introduce any new WebGL imports at the module level in any `src/app/admin/**` layout or page file.

### Requirement: 7. Gate verification — type, lint, and build gates

All changes must pass the three standard static gates before commit. These are the same gates used by `confirm-guard` and `design‑tokens` specs.

- **Type gate**: `npx tsc --noEmit` must pass with zero errors across the entire project.
- **Lint gate**: `npm run lint` must pass with zero warnings.
- **Build gate**: `npm run build` must succeed (including the `/admin` segment and all public routes).
- **Post‑build grep gate**: After `npm run build`, search the `.next/server` directory for any un‑expected `ogl` module code; all `ogl` references must resolve only in client chunks (`.next/static/chunks`).

#### Scenario: All three gates pass after admin-dashboard changes

- GIVEN the admin-dashboard implementation is complete
- WHEN `npx tsc --noEmit`, `npm run lint`, and `npm run build` are run
- THEN all three pass with no new errors or warnings

#### Scenario: Build includes /admin segment

- GIVEN `npm run build` runs successfully
- WHEN the build output is inspected
- THEN the `/admin` route chunks are generated under Node.js runtime, no edge‑only errors

## Non-Goals

- Full visual WYSIWYG card editor — MVP scope is effect picker + text/color editing, not drag‑and‑drop layout.
- Moving all 110+ ReactBits components into the app — only background‑effect and text‑animation picker for MVP.
- Removing the edge runtime from public routes — the Aurora SSR fix keeps edge stable; only the dashboard segment goes Node.
- Multi‑admin support or role‑based access beyond the single password gate.
- Persistent admin session beyond cookie‑based login (session expiry can be added later).
- Changing the public invite UX or invitation copy beyond what’s needed for card rendering.

## Discoveries (to fill after implementation)

- [Technical findings, gotchas, non-obvious learnings]

## Accomplished (to fill after implementation)

- [Completed items with key details]

## Next Steps

- Commit the Aurora SSR fix (`fix-aurora-ssr`) and verify all three gates pass.
- Implement the admin-dashboard changes per this spec:
  1. Add `ADMIN_PASSWORD` to `.env.example` and implement `/api/admin/login` + middleware.
  2. Create Firestore `cards` and `assignments` collection structure.
  3. Add `src/app/admin/` route group with `export const runtime = "nodejs"`.
  4. Implement `<CardRenderer>` with client‑only WebGL loader pattern.
  5. Add guest‑to‑card assignment resolution in `[id]` route.
- Run `npx tsc --noEmit`, `npm run lint`, `npm run build` — all must pass.
- Manual verification: `curl` the `/admin/login` page, create a card, assign it to a guest, and confirm the assigned card renders on the guest's `[id]` page.

## Relevant Files (to create/modify)

- `openspec/specs/admin-dashboard/spec.md` — this specification
- `.env.example` — add `ADMIN_PASSWORD=`
- `src/app/admin/layout.tsx` — new file with `export const runtime = "nodejs"`
- `src/app/admin/login/page.tsx` — new login page
- `src/app/admin/dashboard/page.tsx` — new dashboard page
- `src/app/admin/cards/[id]/page.tsx` — card editor preview
- `src/components/ui/CardRenderer.tsx` — new client‑only renderer
- `src/lib/firebase.ts` — may need `assignments` collection reference
- `src/middleware.ts` — add `/admin*` guard (or modify existing)
- `src/app/[id]/confirm/page.tsx` — **must remain byte‑identical** (Aurora SSR fix prerequisite)
- Firestore collections `cards` and `assignments` — new data model