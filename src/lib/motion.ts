/**
 * Motion tokens shared by the design system.
 * Durations/easing/keyframes live in tailwind.config.ts; only cross-component
 * stagger constants live here (DT-6).
 */
import type { Variants } from "motion/react";

export const stagger = {
  pageLoad: 0.08,
};

/**
 * Single page-load entrance (one container per page, per DT-6): fade + rise,
 * party easing. Reduced-motion consumers pass `initial={false}` to render at
 * the final state without animation.
 */
export const pageEntrance: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};
