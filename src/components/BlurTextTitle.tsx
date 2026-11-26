"use client";

import React from "react";
import { useReducedMotion } from "motion/react";
import BlurText from "./BlurText";
import { cn } from "@/lib/cn";

interface BlurTextTitleProps {
  text: string;
  className?: string;
  /** Per-word delay in ms (react-bits BlurText). */
  delay?: number;
}

/**
 * Client wrapper around react-bits BlurText for page hero titles.
 * Keeps real h1 heading semantics; under prefers-reduced-motion it renders
 * the plain static text (no blur/entrance animation). BlurText renders a
 * <span> inside the h1 (never a <p> — flow content is invalid in headings).
 */
const BlurTextTitle = ({ text, className, delay = 40 }: BlurTextTitleProps) => {
  const reducedMotion = useReducedMotion();
  // Weight comes from the display token (base h1 rule), never a synthesised bold.
  const classes = cn("font-display", className);

  if (reducedMotion) {
    return <h1 className={classes}>{text}</h1>;
  }

  return (
    <h1 className={classes}>
      <BlurText text={text} delay={delay} animateBy="words" as="span" />
    </h1>
  );
};

export default BlurTextTitle;
