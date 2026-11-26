"use client";

import React from "react";
import { useReducedMotion } from "motion/react";
import CakeBackground from "./CakeBackground";
import Cubes from "./Cubes";
import { FaBirthdayCake } from "react-icons/fa";

/**
 * Site-wide decorative background layer (rendered once in the root layout):
 * - Festive cake-icon drift (CakeBackground) as the main texture.
 * - react-bits Cubes 3D accent in the bottom-right corner, small and low
 *   opacity so it never fights the content.
 * Decorative only: pointer-events-none + aria-hidden, fixed behind content.
 * Reduced motion: cake drift is killed by CSS (.animate-drift media query),
 * Cubes is a pure animation and is not rendered at all.
 */
const BackgroundLayer = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <CakeBackground icon={<FaBirthdayCake />} />
      {!reducedMotion && (
        <div className="absolute bottom-4 right-4 opacity-40">
          <Cubes
            gridSize={5}
            cubeSize={8}
            radius={2}
            maxAngle={30}
            faceColor="var(--color-cube-face)"
            borderStyle="1px solid var(--color-cube-edge)"
            autoAnimate
            rippleOnClick={false}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundLayer;
