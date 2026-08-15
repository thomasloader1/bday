"use client";

import React from "react";
import { useReducedMotion } from "motion/react";
import Aurora from "./Aurora";

interface AuroraBackdropProps {
  className?: string;
  /** Three color stops for the aurora gradient (react-bits Aurora). */
  colorStops?: string[];
}

/**
 * Client wrapper around react-bits Aurora, gated by prefers-reduced-motion:
 * - reduced motion: static tokenized gradient (no WebGL canvas, no rAF loop).
 * - otherwise: animated aurora gradient.
 * Decorative only: pointer-events-none + aria-hidden; sized by parent
 * (`absolute inset-0`), intended to sit behind card content.
 */
const AuroraBackdrop = ({
  className = "",
  colorStops = ["#6366F1", "#F97316", "#FFEAA7"],
}: AuroraBackdropProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-xl ${className}`}
    >
      {reducedMotion ? (
        <div className="h-full w-full bg-gradient-to-br from-accent-500/15 via-transparent to-primary-500/15" />
      ) : (
        <Aurora colorStops={colorStops} amplitude={0.9} blend={0.5} />
      )}
    </div>
  );
};

export default AuroraBackdrop;
