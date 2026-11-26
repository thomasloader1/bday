# Delta for admin-dashboard

## ADDED Requirements

### Requirement: 8. Design-system consistency on admin screens

`/admin/login` and `/admin/dashboard` MUST use the design tokens (colors, type, radius, shadow) and primitives (Button, Card) defined by the design-tokens and component-primitives specs; they MUST NOT rely on raw Tailwind default blue-gray. Admin screens MUST belong to the same visual family as the public pages.

#### Scenario: Login uses tokens and primitives

- GIVEN `/admin/login` renders
- THEN its heading uses the Fraunces display token and the submit control uses the Button primitive
- AND no raw Tailwind blue-gray surface or arbitrary hex class appears

#### Scenario: Dashboard uses primitives

- GIVEN `/admin/dashboard` renders
- THEN its surfaces use Card and its actions use Button variants from the token palette
- AND the page passes the token-adoption scan gate

## MODIFIED Requirements

### Requirement: 4. CardRenderer component — client-only loader for ReactBits WebGL

The `<CardRenderer>` is a generic component that mounts the selected ReactBits effects (background + text animation) behind the invitation content. Because ReactBits WebGL components (Aurora, Particles, etc.) are **SSR-unsafe** under edge runtime, `<CardRenderer>` uses a reusable client-only loading pattern.

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

**Resolution**: `CardRenderer` MUST resolve real effect variants — `backgroundEffect` and `titleEffect` config values MUST map to vendored components from `src/components/reactbits/` (e.g. `aurora` → Aurora, `grainient` → Grainient, `particles` → Particles, `orb` → Orb, `blur-text` → BlurText, `gradient-text` → GradientText). The current placeholder — dead `textEffect` switch branches that always render `StaticGradient` — MUST be replaced. Unknown or unmapped effects MUST fall back to the static gradient.

**Key properties**:
- `ssr: false` — never imported in the server bundle; the ogl module never runs server-side.
- `loading: () => StaticGradient` — shows a tokenized static gradient while the WebGL chunk loads; no empty gap.
- `timeout: 3000` — falls back to the static gradient after 3s if the chunk fails to load.
- Wrapper keeps `aria-hidden`, `pointer-events-none`, `absolute inset-0`, `overflow-hidden`, `rounded-xl` — decorative only.
- Aurora props contract (`colorStops`, `amplitude`, `blend`) is preserved; other effects may have different props but follow the same pattern.
(Previously: placeholder that always rendered `StaticGradient` with dead `textEffect` switch branches.)

#### Scenario: Card renders static gradient during SSR and initial client render

- GIVEN a card with a WebGL background is rendered on `[id]`
- WHEN the page renders server-side
- THEN the HTML contains the static gradient, no ogl canvas, and HTTP 200 is returned

#### Scenario: WebGL effect loads after mount

- GIVEN the client mounts and the dynamic import resolves
- THEN the WebGL canvas appears in the backdrop, animated, replacing the static gradient

#### Scenario: Chunk load timeout falls back

- GIVEN the WebGL chunk takes >3s to load
- THEN the static gradient remains visible; no blank or error state

#### Scenario: Reduced-motion keeps static gradient

- GIVEN user prefers reduced motion
- WHEN the CardRenderer mounts
- THEN the static gradient stays; no rAF loop or WebGL canvas starts

#### Scenario: Real variants resolve

- GIVEN a card config with `backgroundEffect: "grainient"` and `titleEffect: "blur-text"`
- WHEN CardRenderer mounts on a motion-enabled client
- THEN the vendored Grainient and BlurText render
- AND the static gradient is not rendered (previously: always StaticGradient)
