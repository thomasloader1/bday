import React from "react";

/**
 * Short, plain candles stuck into the flat top of the age card (the cake).
 * The SVG sits behind the card with its bottom overlapping the card's top
 * edge, so each candle's base is hidden "inside" the cake; some stand
 * straight, some lean. Flames flicker, a soft glow pulses, sparkles twinkle.
 * Decorative; motion is transform/opacity only and stops under reduced motion
 * (.cake-flame, .candle-glow, .candle-spark in globals.css).
 */
const CANDLES = [
  { x: 92, tilt: -11, h: 44 },
  { x: 148, tilt: 4, h: 52 },
  { x: 200, tilt: 0, h: 48 },
  { x: 252, tilt: -6, h: 54 },
  { x: 308, tilt: 10, h: 46 },
];

const BASE = 104; // below the visible area: the card covers the candles' bottoms

const SPARKS = [
  { x: 66, y: 30, s: 1 },
  { x: 334, y: 22, s: 0.85 },
  { x: 176, y: 10, s: 0.7 },
  { x: 228, y: 34, s: 0.6 },
  { x: 120, y: 14, s: 0.55 },
];

const BirthdayCandles = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 400 104" preserveAspectRatio="xMidYMax meet" overflow="visible" aria-hidden="true" className={className}>
    <defs>
      <radialGradient id="candle-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: "var(--color-lime)", stopOpacity: 0.6 }} />
        <stop offset="100%" style={{ stopColor: "var(--color-lime)", stopOpacity: 0 }} />
      </radialGradient>
    </defs>

    {CANDLES.map(({ x, tilt, h }, i) => {
      const top = BASE - h - 20; // where the candle body starts
      return (
        <g key={x} transform={`rotate(${tilt} ${x} ${BASE})`}>
          <circle className="candle-glow" cx={x} cy={top - 18} r={20} fill="url(#candle-glow)" style={{ animationDelay: `${i * -0.4}s` }} />
          {/* plain body, one colour */}
          <rect x={x - 6} y={top} width={12} height={h + 20} rx={3} style={{ fill: "var(--color-lime)" }} />
          {/* wick */}
          <line x1={x} y1={top} x2={x} y2={top - 7} style={{ stroke: "var(--color-ink)", strokeWidth: 1.6, strokeLinecap: "round" }} />
          {/* flame */}
          <g className="cake-flame" style={{ transformOrigin: `${x}px ${top - 7}px`, animationDelay: `${i * -0.29}s` }}>
            <path d={`M${x},${top - 31} C${x + 8},${top - 21} ${x + 7},${top - 9} ${x},${top - 7} C${x - 7},${top - 9} ${x - 8},${top - 21} ${x},${top - 31} Z`} style={{ fill: "var(--color-accent)" }} />
            <path d={`M${x},${top - 21} C${x + 4},${top - 15} ${x + 3},${top - 10} ${x},${top - 9} C${x - 3},${top - 10} ${x - 4},${top - 15} ${x},${top - 21} Z`} style={{ fill: "var(--color-lime)" }} />
          </g>
        </g>
      );
    })}

    {SPARKS.map(({ x, y, s }, i) => (
      <path
        key={i}
        className="candle-spark"
        d={`M${x},${y - 7 * s} L${x + 2 * s},${y - 2 * s} L${x + 7 * s},${y} L${x + 2 * s},${y + 2 * s} L${x},${y + 7 * s} L${x - 2 * s},${y + 2 * s} L${x - 7 * s},${y} L${x - 2 * s},${y - 2 * s} Z`}
        style={{ fill: "var(--color-accent)", transformOrigin: `${x}px ${y}px`, animationDelay: `${i * -0.55}s` }}
      />
    ))}
  </svg>
);

export default BirthdayCandles;
