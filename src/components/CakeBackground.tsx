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
  delay: number;
  duration: number;
}

const DRIFT_COLORS = [
  "text-primary-600/40",
  "text-accent-500/40",
  "text-festive-yellow/40",
  "text-success/40",
  "text-danger/40",
  "text-warning/40",
];

const CakeBackground: FC<CakeBackgroundProps> = ({ icon, count = 18 }) => {
  // Positions are generated ONCE at mount: no setState loop, no re-renders,
  // no stale-closure teleport interval. Drift is pure CSS (GPU composited).
  const items = useMemo<DriftItem[]>(() => {
    const generated: DriftItem[] = [];
    for (let i = 0; i < count; i += 1) {
      generated.push({
        left: `${Math.random() * 85}vw`,
        top: `${Math.random() * 85}vh`,
        color: DRIFT_COLORS[i % DRIFT_COLORS.length],
        delay: -(i * 2.4),
        duration: 14 + (i % 5) * 2,
      });
    }
    return generated;
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`animate-drift absolute text-5xl ${item.color}`}
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
