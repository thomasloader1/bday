import React from "react";

/**
 * Decorations for the age card (the cake): icing dripping from the top edge, sprinkles,
 * two wavy filling layers and a row of cream dollops along the base. All decorative
 * (the card is aria-hidden) and static; they sit behind the number (z-0).
 */

/** Warm-white icing across the top with drips of different lengths running down. */
export function CakeIcing() {
  // Drips as [x, length] in a 400-wide box; the icing band itself is BAND high.
  const BAND = 20;
  const drips: Array<[number, number]> = [
    [24, 30], [62, 52], [100, 22], [140, 62], [182, 34], [222, 48], [262, 20], [300, 58], [340, 28], [378, 44],
  ];
  const d =
    `M0,0 H400 V${BAND} ` +
    drips
      .slice()
      .reverse()
      .map(([x, len]) => `L${x + 11},${BAND} C${x + 11},${BAND + len} ${x - 11},${BAND + len} ${x - 11},${BAND}`)
      .join(" ") +
    ` L0,${BAND} Z`;
  return (
    <svg
      viewBox="0 0 400 90"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-16 w-full md:h-24"
    >
      {/* a soft shadow under the icing so it reads as a layer on top */}
      <path d={d} transform="translate(0 4)" style={{ fill: "var(--color-accent-deep)", opacity: 0.45 }} />
      {/* a shade darker than the page so the cake's top edge still reads */}
      <path d={d} style={{ fill: "var(--color-paper-2)" }} />
    </svg>
  );
}

/** Sprinkles placed in % so they keep their shape at every card size; clear of the number (bottom-left). */
const SPRINKLES = [
  { x: 12, y: 22, r: 24, c: "--color-lime" },
  { x: 30, y: 30, r: -40, c: "--color-ink" },
  { x: 48, y: 20, r: 70, c: "--color-paper" },
  { x: 66, y: 28, r: 12, c: "--color-lime" },
  { x: 84, y: 18, r: -60, c: "--color-ink" },
  { x: 20, y: 40, r: 85, c: "--color-paper" },
  { x: 38, y: 36, r: -15, c: "--color-lime" },
  { x: 56, y: 32, r: 45, c: "--color-ink" },
  { x: 78, y: 42, r: -80, c: "--color-paper" },
  { x: 90, y: 34, r: 30, c: "--color-lime" },
  { x: 86, y: 54, r: -25, c: "--color-ink" },
  { x: 92, y: 66, r: 60, c: "--color-paper" },
  { x: 80, y: 62, r: 10, c: "--color-lime" },
  { x: 6, y: 30, r: -50, c: "--color-ink" },
  { x: 70, y: 50, r: 75, c: "--color-paper" },
];

export function CakeSprinkles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {SPRINKLES.map(({ x, y, r, c }, i) => (
        <span
          key={i}
          className="absolute block h-1.5 w-4 rounded-full md:h-2 md:w-5"
          style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${r}deg)`, background: `var(${c})` }}
        />
      ))}
    </div>
  );
}

/** The base: two wavy filling layers (lime, deep coral) and cream dollops piped along the bottom edge. */
export function CakeBase() {
  const wave = (y: number) =>
    `M0,${y} C50,${y - 8} 100,${y + 8} 150,${y} S250,${y - 8} 300,${y} S400,${y + 8} 400,${y} V${y + 12} C350,${y + 20} 300,${y + 4} 250,${y + 12} S150,${y + 20} 100,${y + 12} S0,${y + 4} 0,${y + 12} Z`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-12 md:h-24">
      <svg viewBox="0 0 400 48" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-3/4 w-full">
        <path d={wave(8)} style={{ fill: "var(--color-lime)" }} />
        <path d={wave(28)} style={{ fill: "var(--color-accent-deep)" }} />
      </svg>
      {/* Dollops: half-circles of cream repeated along the edge, a darker crease under each. */}
      <div
        className="absolute inset-x-0 bottom-0 h-4 md:h-7"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 100%, var(--color-paper) 58%, var(--color-paper-3) 64%, transparent 66%)",
          backgroundSize: "1.75rem 100%",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center bottom",
        }}
      />
    </div>
  );
}
