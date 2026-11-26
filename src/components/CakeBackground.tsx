import React, { FC, ReactNode, useMemo } from "react";

interface CakeBackgroundProps {
  icon: ReactNode;
  /** Number of decorative icons (design cap: 18). */
  count?: number;
}

interface DriftItem {
  left: string;
  top: string;
  color: string;
  size: string;
  delay: number;
  duration: number;
}

/** One ink: the spot and the page's own stocks, never a second colour. */
const DRIFT_COLORS = ["text-spot/[0.09]", "text-paper-3/70", "text-spot/[0.06]", "text-rule/60", "text-ink/[0.04]", "text-spot/[0.12]"];
const DRIFT_SIZES = ["text-4xl", "text-5xl", "text-6xl"];

const CakeBackground: FC<CakeBackgroundProps> = ({ icon, count = 18 }) => {
  // Positions are generated ONCE at mount: no setState loop, no re-renders.
  // Drift is pure CSS (GPU composited).
  const items = useMemo<DriftItem[]>(() => {
    const generated: DriftItem[] = [];
    for (let i = 0; i < count; i += 1) {
      generated.push({
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`,
        color: DRIFT_COLORS[i % DRIFT_COLORS.length],
        size: DRIFT_SIZES[i % DRIFT_SIZES.length],
        delay: -(i * 2.4),
        duration: 14 + (i % 5) * 2,
      });
    }
    return generated;
  }, [count]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, index) => (
        <div
          key={index}
          className={`animate-drift absolute ${item.size} ${item.color}`}
          style={{
            left: item.left,
            top: item.top,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

export default CakeBackground;
