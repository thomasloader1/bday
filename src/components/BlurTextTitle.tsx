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
 * the plain static text (no blur/entrance animation).
 */
const BlurTextTitle = ({ text, className, delay = 40 }: BlurTextTitleProps) => {
  const reducedMotion = useReducedMotion();
  const classes = cn("font-display font-bold", className);

  if (reducedMotion) {
    return <h1 className={classes}>{text}</h1>;
  }

  return (
    <h1 className={classes}>
      <BlurText text={text} delay={delay} animateBy="words" />
    </h1>
  );
};

export default BlurTextTitle;
