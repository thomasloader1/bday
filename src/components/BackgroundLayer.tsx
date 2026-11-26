"use client";

import React from "react";
import CakeBackground from "./CakeBackground";
import { FaBirthdayCake } from "react-icons/fa";

/**
 * Site-wide decorative background layer (rendered once in the root layout):
 * the festive cake drift, printed in the page's one ink at low strength.
 * Decorative only: pointer-events-none + aria-hidden, fixed behind content.
 * Reduced motion: the drift is killed by CSS (.animate-drift media query).
 */
const BackgroundLayer = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <CakeBackground icon={<FaBirthdayCake />} />
  </div>
);

export default BackgroundLayer;
