# Aurora Backdrop Specification

## Purpose

AuroraBackdrop is the decorative animated gradient behind the card content on `GET /[id]/confirm`. It MUST render a tokenized static gradient during SSR and the first client render, then swap to the animated react-bits Aurora (WebGL via ogl) after mount unless the user prefers reduced motion. Critical invariant: the `ogl` module MUST NEVER be evaluated during server rendering — its module-scope DOM access (`document.createElement('canvas')`, `new Image()`) throws `ReferenceError: window is not defined` server-side.

## Requirements

### Requirement: SSR render of /[id]/confirm (HTTP 200)

The system MUST serve `GET /[id]/confirm` with HTTP 200 on the first (SSR) request and MUST include the static gradient backdrop in the server HTML.

#### Scenario: First SSR request succeeds

- GIVEN a first request to `GET /[guestId]/confirm`
- WHEN the server renders the page
- THEN the response is HTTP 200 and contains no `window is not defined` error

#### Scenario: Static gradient in SSR HTML

- GIVEN the SSR response of /[id]/confirm
- WHEN the HTML is inspected
- THEN it contains the tokenized static gradient element, not an ogl canvas

### Requirement: ogl never evaluated server-side

The system MUST NOT evaluate Aurora or ogl during server rendering. Aurora MUST be loaded via `next/dynamic` with `ssr: false`, so the server bundle has no static ogl import graph.

#### Scenario: No ogl in server bundle

- GIVEN `npm run build` succeeds
- WHEN the /confirm server chunk is inspected
- THEN it contains no ogl module code and server rendering touches no DOM globals

#### Scenario: Dynamic import correctness (Next 14.0.3)

- GIVEN Next.js 14.0.3, where only the default `next/dynamic` export exists
- WHEN AuroraBackdrop loads Aurora via the default `dynamic(() => import("./Aurora"), { ssr: false })`
- THEN `npx tsc --noEmit` passes and the client chunk resolves Aurora's default export

### Requirement: Post-mount animated swap

For clients without reduced motion, the system MUST replace the static gradient with the animated Aurora after mount, with the static gradient shown while the Aurora chunk loads.

#### Scenario: Aurora mounts after hydration

- GIVEN a motion-enabled client after hydration
- WHEN the mounted state flips to true
- THEN Aurora renders and a WebGL canvas appears in the backdrop

#### Scenario: Gradient fallback during chunk load

- GIVEN the Aurora client chunk is still loading after mount
- WHEN the backdrop is rendered
- THEN the static gradient remains visible until the chunk resolves (no empty gap)

### Requirement: No hydration mismatch

The first client render MUST produce output identical to the SSR HTML (the static gradient), so hydration succeeds without mismatch warnings.

#### Scenario: First client render equals SSR

- GIVEN SSR rendered the static gradient
- WHEN the client performs its first render
- THEN it renders the same static gradient, matching the SSR markup

#### Scenario: No hydration warnings

- GIVEN the confirm page hydrates after the fix
- WHEN the browser console is inspected
- THEN no hydration-mismatch warnings are emitted

### Requirement: Reduced-motion behavior preserved

For users with `prefers-reduced-motion`, the system MUST keep the static tokenized gradient after mount: no WebGL canvas and no rAF loop.

#### Scenario: Reduced motion stays static

- GIVEN a client with prefers-reduced-motion after mount
- WHEN the backdrop is rendered
- THEN the static gradient remains and no WebGL canvas or requestAnimationFrame loop starts

### Requirement: Decorative semantics preserved

The backdrop wrapper MUST keep `aria-hidden="true"`, `pointer-events-none`, and `absolute inset-0` (plus overflow-hidden, rounded-xl) so it is decorative and sized by its parent.

#### Scenario: Accessibility and hit-testing

- GIVEN the backdrop wrapper element
- WHEN inspected in the DOM
- THEN it is aria-hidden and pointer-events-none, and never intercepts clicks

#### Scenario: Parent-driven sizing

- GIVEN the backdrop inside the confirm card's relative container
- WHEN the wrapper is positioned
- THEN it is absolute inset-0 and fills the parent without its own dimensions

### Requirement: Confirm page guard unchanged

The fix MUST NOT modify `src/app/[id]/confirm/page.tsx`: the guard (redirect unconfirmed guests to /[id], LoadingSpinner, router.replace, effect-only navigation) MUST remain byte-identical and functional.

#### Scenario: Page file untouched

- GIVEN the change is applied
- WHEN `git diff` runs on src/app/[id]/confirm/page.tsx
- THEN it is empty (byte-identical)

#### Scenario: Guard behavior intact

- GIVEN an unconfirmed guest
- WHEN loading completes on the confirm page
- THEN the effect calls `router.replace(/${id})` exactly as before

### Requirement: Aurora props preserved

Aurora MUST still receive `colorStops` from AuroraBackdrop plus `amplitude={0.9}` and `blend={0.5}`; the `AuroraProps` contract MUST remain unchanged.

#### Scenario: Default props passthrough

- GIVEN AuroraBackdrop with default colorStops
- WHEN the animated Aurora mounts
- THEN it receives colorStops ["#6366F1","#F97316","#FFEAA7"], amplitude 0.9, blend 0.5

#### Scenario: Custom colorStops honored

- GIVEN AuroraBackdrop with a custom colorStops prop
- WHEN the animated Aurora mounts
- THEN the custom stops reach the WebGL shader
