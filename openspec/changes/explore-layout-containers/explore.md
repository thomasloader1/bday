# Exploration: Layout container stacking ("muchos containers")

User report (ES): "En la página de confirmación y otras se ve todo como dentro de muchos containers" — confirm page and others read as heavily nested boxes after the design-system refactor. Expected: minimal, airy, whitespace-over-boxes.

Status: success — read-only exploration; no code changed, no build run.

---

## 1. Current state: the full wrapper chain

### Site-wide (every page)

| file:line | element/class | visual contribution |
|---|---|---|
| `src/app/globals.css:5-7` | `body { @apply bg-neutral-50 text-neutral-900 antialiased; }` | page bg = very light slate (F8FAFC). Base surface of every page. |
| `src/app/layout.tsx:34` | `<main class="container mx-auto px-6 md:px-8 pb-16">` | max-width + page gutter (invisible). Single `<main>` per the design-system fix (6ad76d9). |
| `src/components/BackgroundLayer.tsx:22-25` | `div.pointer-events-none.fixed.inset-0.-z-10.overflow-hidden` | invisible; hosts CakeBackground (icon drift) + Cubes (bottom-right, opacity-40). Not a box. |
| `src/components/Footer.tsx:6` | `footer.-mx-6.mt-12.border-t.border-neutral-200.bg-white.px-6.py-6 md:-mx-8 md:px-8` | **visible band**: white fill + top border. Rendered only on confirm page (`[id]/confirm/page.tsx:53`). |

### Page: `[id]/confirm` (WORST — CRITICAL)

```
body (bg-neutral-50)                                    globals.css:5
└─ main (container mx-auto px-6 md:px-8 pb-16)          layout.tsx:34            invisible
   └─ motion.div (flex w-full justify-center py-8)      [id]/confirm/page.tsx:40 invisible (centers, py)
      └─ Card variant="paper" (relative w-full max-w-3xl)  :42  VISIBLE BOX #1
         └─ Card base: rounded-xl border border-neutral-200 p-6 bg-festive-cream  Card.tsx:17-19
         ├─ AuroraBackdrop (absolute inset-0, gradient) :43   decorative glow layer (not a box)
         └─ div.relative                                :44   invisible
            ├─ BlurTextTitle (h1, mb-10)                :45-48
            └─ GuestInvitations                         :49
               └─ Swiper.className="my-4"               GuestInvitations.tsx:19
                  └─ .swiper global: padding 50px top/bottom  globals.css:9-13  big void inside box #1
                     ├─ SwiperSlide (rounded-xl via globals.css:19)
                     │  └─ Card variant="paper" (relative h-full overflow-hidden)  :43  VISIBLE BOX #2
                     │     └─ base: rounded-xl border border-neutral-200 p-6 bg-festive-cream  Card.tsx
                     │        ├─ glow blob bg-festive-yellow/50 blur-2xl          :44   decorative
                     │        ├─ glow blob bg-accent-500/10 blur-2xl             :45   decorative
                     │        └─ InvitationInfo (div.my-5.mb-10.px-3)            InvitationInfo.tsx:20 (invisible)
                     │           └─ Badge / Button / LocationButton (map)        expected controls
                     └─ SwiperSlide (personal branch)
                        └─ Card variant="default" (relative h-full overflow-hidden)  :59  VISIBLE BOX #2'
                           └─ base: rounded-xl border border-neutral-200 p-6 bg-white
                              └─ InvitationPersonalInfo (div.px-2.py-4.rounded-md)   InvitationPersonalInfo.tsx:12 (invisible)
                                 └─ div.p-4.rounded-lg.bg-gray-50 (role=alert)      :18  VISIBLE BOX #3 (gray)
      └─ Footer (bg-white, border-t)                    :53                   VISIBLE BAND #4
```

**Bordered surfaces on confirm: 2 full Cards nested (cream box inside cream box on the common-group slides), 1 gray alert on personal slides, 1 white footer band.** Plus: Aurora gradient + 2 glow blobs per slide (noise layers), `.swiper` 50px vertical padding (extra void inside the outer box), and coverflow `slideShadows: true` (`GuestInvitations.tsx:30`) drawing shadows behind the visible neighbor slides — side slides read as MORE stacked boxes.

### Page: `[id]` invitation (MODERATE — single surface, by design)

```
body (bg-neutral-50)                                    globals.css:5
└─ main (container ...)                                 layout.tsx:34   invisible
   └─ motion.div (flex w-full justify-center py-8 md:items-center)  [id]/page.tsx:19-24  invisible
      └─ Card variant="elevated" (w-full max-w-2xl)     :25   VISIBLE BOX #1
         └─ base: rounded-xl border border-neutral-200 p-6 bg-white shadow-md  Card.tsx
            ├─ Invitation → BlurTextTitle + InvitationText + GroupedButtons (all plain, no boxes)
            └─ NoInvitation → h1 + p + WhatsAppButton (plain)
```

ONE bordered surface. This is the intended "invitation card". Severity: LOW (no nested boxes; only the Card base's border+shadow look on neutral-50).

### Page: home (CLEAN)

```
body (bg-neutral-50) → main (container) → div.flex.min-h-screen.flex-col.items-center.justify-center
   → BlurTextTitle / Countdown (plain text) / SearchInvitation (p + Button) / SearchInvitationForm (form → input, no wrapper box)
```

Zero container boxes. The only bordered element is the search `<input>` itself (expected). Severity: NONE.

### Page: wishlist (CLEAN — grid of product cards is the point)

```
body → main → section.py-5 → h1 + grid of ProductCard2
   ProductCard2 → Card variant="elevated" (border + shadow + white) + p-0/p-6 layout  ProductCard2.tsx:15-18
   + Button asChild "Ir al inicio"
```

One Card per product, no nesting. Severity: NONE (SUGGESTION only: `p-0` on the Card overrides the primitive's p-6 — the base p-6 is applied then undone by className; acceptable, but note it).

---

## 2. Root cause

**Commit `4fe4335` (`refactor(pages): apply tokens and primitives across pages`, design-system slice 3) introduced the Card-in-Card on confirm.**

Evidence from `git show`:

- Pre-refactor outer surface (`4fe4335^:src/app/[id]/confirm/page.tsx`): `div.p-5.px-4.rounded-lg.shadow-md.bg-white.bg-[radial-gradient(...)]` — **NO border**, one soft elevated panel.
- Pre-refactor slides (`4fe4335^:src/components/GuestInvitations.tsx`): `SwiperSlide className='bg-white relative'` with flat grid/radial decorations — **flat panels, NO border, NO rounded box**.
- Post-refactor: outer div → `Card variant="paper"` (now `border-neutral-200` + `rounded-xl` + `p-6` + cream) AND slides → `Card variant="paper"/"default"` (each `border-neutral-200` + `rounded-xl` + `p-6`). Two bordered, rounded, padded surfaces nested = "cajas dentro de cajas".

Contributing pattern — **the Card primitive bakes `border border-neutral-200 rounded-xl p-6` into every variant** (`src/components/ui/Card.tsx:17-19`). The design-system spec (`openspec/changes/archive/2026-08-15-design-system/specs/component-primitives/spec.md:47-49`) mandated exactly this pairing — "confirm page radial-gradient div → Card paper" + "GuestInvitations SwiperSlides → Card default/paper" — so the nesting was *spec'd in* rather than accidental, but it violates the design language's own rule "ONE surface per level": the layout owns page width, Card owns its own surface — but confirm now has TWO Card-owned surfaces on top of the page background (plus the alert = three on personal slides).

Amplifiers: coverflow `slideShadows: true` + `rotate: 50` + `slidesPerView={2}` (visible tilted neighbor cards with shadows), `.swiper` 50px top/bottom padding (globals.css:9-13) creating void inside the outer card, two `blur-2xl` glow blobs per slide, and the Aurora gradient — all inside/on top of the outer bordered box.

The guard refactor (`fix-confirm-guard`, 5905cf4) is NOT a factor — it kept the JSX byte-identical; the boxes predate it.

---

## 3. Severity classification

| Page | Severity | Verdict |
|---|---|---|
| `[id]/confirm` | **CRITICAL** | 2 nested bordered Cards (+ gray alert on personal slides, + white footer band). This is the reported page. |
| `[id]` | LOW (WARNING) | 1 surface — correct pattern; only the Card base's border+shadow+white-on-neutral-50 look. No nesting. |
| home | NONE | Zero boxes. Nothing to change. |
| wishlist | NONE (SUGGESTION) | Per-product cards are intended; no nesting. |

---

## 4. Ordered fix list

**F1 — CRITICAL — confirm: remove ONE of the two box levels.** (Choose per tradeoff, see below.)

- **Option B (recommended): flatten the OUTER surface.** `[id]/confirm/page.tsx:42` — stop using `Card` for the page surface, or use it borderless: either plain `<div className="relative w-full max-w-3xl">` keeping AuroraBackdrop + content, or `Card variant="paper" className="relative w-full max-w-3xl border-0 shadow-none"` (keeps the cream tint as a soft backdrop). Inner slide Cards (`GuestInvitations.tsx:43,59`) stay as the only boxes — the coverflow swipe interaction needs distinct card shapes, and this yields "title + swipable cards" = airy. Remove nothing from `GuestInvitations` except optionally the weaker glow blob.
- **Option A (alternative): flatten the INNER slides.** Keep outer Card paper as the single surface; in `GuestInvitations.tsx:43,59` replace `Card` with borderless panels (`bg-transparent` or `bg-white/60`, no border/rounded/p-6) and keep only the glow blob. Result: 1 box total; tradeoff: side slides in the coverflow lose card affordance and can look mushy on cream.
- **Option C (minimal patch): kill the double-border read without structural change** — inner Cards keep `border-neutral-200` but the outer loses it (same as B) — effectively B. Not a third option, listed for clarity.
- **Whatever the choice: do NOT touch the guard logic** (`useEffect` at `:20-24`, loading/error branches `:26-32`), hook order, or `pageEntrance` wrapper. Pure class/JSX-surface changes only. Verify the confirmed-path render (`guestData.isConfirmed === true`) still shows title + swiper + footer.

**F2 — CRITICAL — confirm: deflate the void inside the outer surface.** `globals.css:9-13` `.swiper { padding-top: 50px; padding-bottom: 50px }` — the 50px padding was tuned for a full-bleed page swiper; inside a padded card it adds a second gutting layer. Either remove it (swiper fills the card's p-6 naturally) or move the vertical spacing to the card/page level. Also reconsider `coverflowEffect.slideShadows: true` (`GuestInvitations.tsx:30`) — shadows behind visible neighbor slides read as extra boxes; `slideShadows: false` keeps depth without the boxy shadow.

**F3 — WARNING — confirm personal slides: soften the third nested box.** `InvitationPersonalInfo.tsx:18` — the `role="alert"` div (`p-4 rounded-lg bg-gray-50`) is a gray box inside the white card. Either restyle as a plain bordered-left text note (no fill, e.g. `border-l-4 border-warning/50 pl-3`) or keep the alert but drop the `bg-gray-50` fill for a transparent surface. Keep `role="alert"`.

**F4 — SUGGESTION — confirm: Footer band.** `Footer.tsx:6` — `bg-white` makes the footer a white box below the card on neutral-50. Drop `bg-white` (keep `border-t border-neutral-200`) so it reads as a hairline end-of-page, not a container. Safe everywhere (only confirm renders it today).

**F5 — SUGGESTION — Card primitive hygiene (no layout change).** `Card.tsx:17-19` — consider making the border opt-out via a `className="border-0"` pattern (already possible; document that nested Cards should drop the border at one level). Also `ProductCard2.tsx:17` uses `p-0` to fight the base `p-6` — acceptable, but a `padding`-less variant or documented override is cleaner. No urgency.

**Explicitly NOT touched (no action):**
- `[id]` page — single Card elevated is the intended invitation surface.
- home — no boxes; `min-h-screen` + centered column is correct.
- wishlist — per-product cards are the point.
- `layout.tsx`, `BackgroundLayer`, `CakeBackground`, `Cubes`, `AuroraBackdrop` — all correctly invisible as containers; the background layer is NOT a source of the "containers" feel.

---

## 5. Tradeoffs summary

| Option | Pros | Cons | Effort |
|---|---|---|---|
| F1-B flatten outer | 1 box level left (the swiper cards); coverflow keeps affordance; most airy | loses the cream full-width surface as a "frame" (Aurora still tints) | Low |
| F1-A flatten inner | 1 box total; outer cream panel frames title + slides | slides lose card shape; coverflow side-slides look mushy | Low |
| F1-C (no-op of B) | — | — | — |
| F2 swiper padding/shadows | removes 2nd void + false boxes | slight change to coverflow look | Trivial |
| F3 alert restyle | removes 3rd box on personal slides | loses filled-alert prominence | Trivial |
| F4 footer bg | footer stops reading as a box | none | Trivial |

**Recommended package**: F1-B + F2 + F3 + F4 — pure class-level changes in 4 files (`[id]/confirm/page.tsx`, `globals.css` or `GuestInvitations.tsx`, `InvitationPersonalInfo.tsx`, `Footer.tsx`), no guard/behavior change, no logic risk.

---

## Affected areas (complete list)

- `src/app/[id]/confirm/page.tsx` — outer Card surface (F1)
- `src/components/GuestInvitations.tsx` — inner slide Cards + coverflow shadows (F1/F2)
- `src/app/globals.css` — `.swiper` vertical padding (F2)
- `src/components/InvitationPersonalInfo.tsx` — alert box (F3)
- `src/components/Footer.tsx` — white band (F4)
- `src/components/ui/Card.tsx`, `src/components/ProductCard2.tsx` — primitive hygiene (F5, optional)
- Unaffected: `[id]/page.tsx`, home `page.tsx`, `wishlist/page.tsx`, `layout.tsx`, `BackgroundLayer.tsx`, `CakeBackground.tsx`, `AuroraBackdrop.tsx`, `Cubes.tsx`, `Button.tsx`, `InvitationInfo.tsx`, `GroupedButtons.tsx`, `Badge.tsx`, `LocationButton.tsx`, `WhatsAppButton.tsx`, `SearchInvitationForm.tsx`, `Countdown.tsx`, `LoadingSpinner.tsx`, `BlurTextTitle.tsx`, `lib/motion.ts`.

## Risks

- Any change touching the confirm page must preserve the guard effect/hook order and the confirmed-path JSX structure; the earlier `fix-confirm-guard` refactor kept JSX byte-identical and this must remain so. Pure class/component-surface swaps only.
- F1-A (flatten inner) degrades the coverflow interaction; only choose it if the outer cream panel is deemed more valuable than the card affordance.
- No test runner and no build allowed in this exploration; the changes above are class-only and verifiable by `tsc`/lint + browser once apply phase runs.
