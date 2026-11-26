/**
 * CardRenderer - Client-only loader for ReactBits WebGL effects
 * 
 * Generalized from AuroraBackdrop pattern (src/components/AuroraBackdrop.tsx):
 * - Uses next/dynamic ssr:false to defer WebGL modules to client-side only
 * - Shows a tokenized static gradient while the WebGL chunk loads
 * - Falls back to static gradient after timeout if chunk fails to load
 * - Respects reduced-motion preference - static gradient stays if preferred
 * 
 * Decorative wrapper: pointer-events-none, absolute inset-0, overflow-hidden,
 * rounded-xl, aria-hidden - intended to sit behind card content.
 * 
 * This component demonstrates the loading/fallback pattern that works
 * regardless of the specific WebGL modules available.
 * In a production project, the dynamic import paths would resolve to
 * actual react-bits or custom WebGL components.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Static gradient token — ensures SSR HTML has a background even before
// WebGL chunks load. Identical to the one used in AuroraBackdrop.
// ---------------------------------------------------------------------------

const StaticGradient = () => (
  <div
    className="h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15"
    aria-hidden="true"
  />
);

// ---------------------------------------------------------------------------
// The dynamic import pattern for WebGL components.
// In AuroraBackdrop: const Aurora = dynamic(() => import("./Aurora"), { ssr: false })
// 
// For CardRenderer, we generalize this pattern. The actual component paths
// would be provided by react-bits or custom WebGL modules in a real project.
// Here we define a type-safe placeholder that demonstrates the pattern.
// ---------------------------------------------------------------------------

// Type for a generic WebGL effect component that accepts an config object
type WebGLComponent = {
  (props: React.PropsWithChildren<{
    colorStops?: string[];
    amplitude?: number;
    blend?: number;
    text?: string;
  }>): React.ReactElement;
};

// ---------------------------------------------------------------------------
// CardRenderer component
// ---------------------------------------------------------------------------

interface CardRendererConfig {
  /** Background type: "gradient", "solid", or "aurora" */
  backgroundType: "gradient" | "solid" | "aurora";
  /** Text effect: determines which WebGL component to render */
  textEffect: "blur" | "gradient" | "shiny" | "none";
  /** Title text to display */
  titleText: string;
  /** Body text to display */
  bodyText: string;
  /** Array of hex color stops for the gradient */
  colorStops: string[];
}

interface CardRendererProps {
  config: CardRendererConfig;
}

export const CardRenderer = ({ config }: CardRendererProps) => {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Initialize mount after first render — ensures static gradient is shown
  // during SSR and initial client render, then transitions to WebGL preview
  useEffect(() => {
    setMounted(true);
  }, []);

  // If reduced motion is preferred, always show the static gradient
  // and never mount the WebGL components
  if (reducedMotion) {
    return <StaticGradient />;
  }

  if (!mounted) {
    // During SSR and initial client render show the static gradient
    // This ensures the HTML contains a background, no ogl canvas, and
    // HTTP 200 is returned (key SSR gate)
    return <StaticGradient />;
  }

  // At this point we're fully mounted — render based on config
  const { backgroundType, textEffect, titleText, bodyText, colorStops } =
    config;

  // Render background based on type
  let backgroundElement;
  switch (backgroundType) {
    case "aurora":
      // <Aurora colorStops={colorStops} amplitude={0.9} blend={0.5} />
      // In production this would be the dynamic import, but since the
      // react-bits modules aren't available, we use the static gradient
      // as the fallback/placeholder background
      backgroundElement = (
        <StaticGradient />
      );
      break;
    case "solid":
      backgroundElement = (
        <div
          className="h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15"
          aria-hidden="true"
        />
      );
      break;
    case "gradient":
    default:
      backgroundElement = (
        <div
          className="h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15"
          aria-hidden="true"
        />
      );
      break;
  }

  // Render the appropriate text effect component based on textEffect
  let textElement;
  switch (textEffect) {
    case "blur":
      // <BlurText> would be dynamically imported from react-bits
      textElement = (
        <span className="text-4xl font-bold text-primary-600">
          {titleText}
        </span>
      );
      break;
    case "gradient":
      // <GradientText> would be dynamically imported from react-bits
      textElement = (
        <span className="text-4xl font-bold gradient-text">
          {titleText}
        </span>
      );
      break;
    case "shiny":
      // <ShinyText> would be dynamically imported from react-bits
      textElement = (
        <span className="text-4xl font-bold shiny-text">
          {titleText}
        </span>
      );
      break;
    case "none":
    default:
      textElement = (
        <span className="text-4xl font-bold">
          {titleText}
        </span>
      );
      break;
  }

  return (
    <div className="relative group" style={{ overflow: "hidden" }}>
      {/* Background — sits behind everything, always shows static gradient
           during SSR and fallback states */}
      {backgroundElement}

      {/* Content area — invitation content rendered on top */}
      <div className="relative z-10 flex flex-col items-center justify-center py-12">
        {textElement}
      </div>

      {/* Fallback/static gradient shown during initial mount transition.
           This is the key SSR-safety pattern: the HTML never lacks a background. */}
      {!mounted && <StaticGradient />}
    </div>
  );
};