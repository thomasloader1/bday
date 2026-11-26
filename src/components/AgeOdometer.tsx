"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { PartyConfig } from "@/lib/config/schema";
import { getAgeProgress, type AgeProgress } from "@/lib/eventDate";
import { fireConfetti } from "./Confetti";

type Party = Pick<PartyConfig, "month" | "day" | "hour" | "minute" | "birthYear">;

/**
 * Outside production, `?ahora=2026-12-16T20:00` previews the odometer at another moment
 * (e.g. the party itself, to see the confetti).
 */
const readNow = (): Date => {
  if (process.env.NODE_ENV !== "production") {
    const override = new URLSearchParams(window.location.search).get("ahora");
    const parsed = override ? new Date(override) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

/**
 * The age on the cake as an odometer: the age being left (32) on top, the next one (33)
 * rising from below over the last RISE_DAYS before the party. On the day the new number is fully in and
 * confetti goes off; a tap on the cake that day fires it again.
 */
export default function AgeOdometer({ party, age }: { party: Party; age: number }) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<AgeProgress | null>(null);
  const progress = useMotionValue(0);
  const y = useTransform(progress, (p) => `${-p}em`);
  const wasCelebrating = useRef<boolean | null>(null);
  const hasRolled = useRef(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    // Kept as an offset so the clock keeps ticking from a previewed moment.
    offsetRef.current = readNow().getTime() - Date.now();
    const update = () => {
      const next = getAgeProgress(party, new Date(Date.now() + offsetRef.current));
      setState((prev) =>
        prev && prev.from === next.from && prev.celebrating === next.celebrating && Math.abs(prev.progress - next.progress) < 0.0005
          ? prev
          : next
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [party]);

  // Roll to the year's position: a slow intro on load, small nudges after.
  useEffect(() => {
    if (!state) return;
    if (reduceMotion) {
      progress.set(state.progress);
      return;
    }
    const firstRun = !hasRolled.current;
    const controls = animate(progress, state.progress, {
      duration: firstRun ? 2.2 : 0.8,
      delay: firstRun ? 0.4 : 0,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        hasRolled.current = true;
      },
    });
    return () => controls.stop();
  }, [state, progress, reduceMotion]);

  // Confetti when the day arrives: on load during the celebration, or live at the zero crossing.
  useEffect(() => {
    if (!state) return;
    if (state.celebrating && wasCelebrating.current !== true) {
      // The ref flips only once the burst fires, so a cancelled effect (Strict Mode) does not skip it.
      const timer = setTimeout(() => {
        wasCelebrating.current = true;
        fireConfetti();
      }, wasCelebrating.current === null ? 2400 : 300);
      return () => clearTimeout(timer);
    }
    wasCelebrating.current = state.celebrating;
  }, [state]);

  // Server render and first paint: the age being left, the one coming below it (rolled in once mounted).
  const from = String(state?.from ?? age - 1);
  const to = String(state?.to ?? age);
  // Digits aligned from the right (99 -> 100 gains a column); only the ones that change roll.
  const width = Math.max(from.length, to.length);
  const fromDigits = from.padStart(width, " ").split("");
  const toDigits = to.padStart(width, " ").split("");

  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => state?.celebrating && fireConfetti()}
      className={`poster flex h-[1em] text-left text-spot-ink ${state?.celebrating ? "cursor-pointer" : "cursor-default"}`}
    >
      {toDigits.map((digit, i) =>
        digit === fromDigits[i] ? (
          <span key={i} className="block h-[1em] leading-[1em]">
            {digit}
          </span>
        ) : (
          <span key={i} className="block h-[1em] overflow-hidden">
            <motion.span className="flex flex-col" style={{ y }}>
              <span className="block h-[1em] leading-[1em]">{fromDigits[i] === " " ? "\u00a0" : fromDigits[i]}</span>
              <span className="block h-[1em] leading-[1em]">{digit}</span>
            </motion.span>
          </span>
        )
      )}
    </button>
  );
}
