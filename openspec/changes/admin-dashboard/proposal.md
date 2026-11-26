# Proposal: Admin Dashboard (admin-dashboard)

## Intent
Add an admin dashboard to design invitation cards with ReactBits effects and manage which card each guest sees (guest → card assignment). The app is a personal birthday invitation site (Next 14, Firebase Firestore already used client-side, no auth today).

## Scope
- Admin route: card designer (picker: ReactBits background + text animation; color stops; title/body text; live preview), guest list, card list, guest→card assignments.
- New Firestore collections: `cards` (card configs), `assignments` (`{guestId → cardId}`).
- `[id]` route resolves an assignment (if any) and renders the assigned card config via a generic `<CardRenderer>`; otherwise the current default invitation (backward compatible).
- **Prerequisite**: commit the already-applied `/confirm` SSR fix (AuroraBackdrop dynamic import) — blocks dashboard's own WebGL preview route.

## Approach
1. **Runtime isolation**: `/admin` segment uses `export const runtime = "nodejs"` (layout.tsx's root edge runtime otherwise crashes WebGL/Firebase). Public invite routes stay edge.
2. **SSR-safety pattern**: reusable client-only loader for any ReactBits WebGL component (Aurora, Particles, etc.) — `next/dynamic` `ssr:false` + mounted gate + static fallback. AuroraBackdrop already proves this; generalize it (e.g., `ClientOnly` wrapper or `useClientWebGL` helper).
3. **Editor**: pick effect from catalog (SSR-safe text effects always safe; WebGL backgrounds lazy-loaded), edit props, live client-side preview.
4. **Assign**: select a card per guest/group from the dashboard; assignment stored in Firestore.

## Key decisions (explicit, to confirm)
- **Auth model**: lightweight single-admin password gate — `ADMIN_PASSWORD` env var + `/api/login` + cookie + middleware protecting `/admin/*`. NOT Firebase Auth (overkill/quota for a party app). **Assumption: user wants this simple approach** — please confirm or pick another:
  - (a) simple password gate (proposed)
  - (b) Firebase Auth (Google sign-in — heavier, needs billing/config)
  - (c) no auth, unlisted route only (fastest, least safe)
- **Cards storage**: Firestore `cards` + `assignments` (reuses existing `db`). Not local files (would not survive deploys / would require rebuild).
- **Editor scope (MVP)**: background-effect selector + text-animation selector + editable text/colors. NOT a full visual WYSIWYG; prop-driven config.

## Out of scope
- Redesigning the public invite UX beyond card rendering.
- Moving all of reactbits' 110 components in — only picker for backgrounds + text animations in MVP.
- Removing the edge runtime from public routes (kept; only the Aurora SSR fix is needed).

## Risks
- Runtime override (edge→Node for /admin) + existing edge layout: must verify no provider mismatch (Firebase client SDK works in both; no `next/font` edge-only features in dashboard).
- Bundle/permission: if you intend to run the dev server and `next build` for verification, the rule is "never build after changes" in this AGENTS.md — but the sdd-apply gates require a build to validate SSR. Tension to resolve with you.
- Card configs rendered on `[id]` must be safe to fetch client-side; SSR of the public invite page must stay fast (cache assignment lookup).

## Deliverable
Proposal written. Next phase: sdd-spec (delta spec for aurora SSR fix is done/ready; new spec for admin-dashboard).

## Recommendation
Proceed to proposal #1 (auth) decision now, then propose a single SDD change for the dashboard. I'll fold the pending Aurora SSR fix commit into this work as the first implementation step.
