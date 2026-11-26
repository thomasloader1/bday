// components/Countdown.tsx
import { calculateTimeLeft, TimeLeft } from "@/lib/calculateTimeLeft";
import React, { useState, useEffect, useRef } from "react";

interface CountdownProps {
  targetDate: Date;
  onComplete: () => void;
  /** The line under the figures, e.g. "Hasta el 16 de diciembre a las 20 h". */
  caption?: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete, caption }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const prevOverRef = useRef<boolean | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const initial = calculateTimeLeft(targetDate);
    prevOverRef.current = initial.isOver;
    setTimeLeft(initial);

    const timer = setInterval(() => {
      const next = calculateTimeLeft(targetDate);
      setTimeLeft(next);
      // Fire exactly once on the zero-crossing tick (false -> true transition).
      if (prevOverRef.current === false && next.isOver) {
        onCompleteRef.current();
      }
      prevOverRef.current = next.isOver;
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [targetDate]);

  const formatNumber = (value: number) => value.toString().padStart(2, "0");

  if (timeLeft?.isOver) {
    return <p className="font-display text-section text-ink">La fiesta ya pasó</p>;
  }

  const units = [
    { label: "días", value: timeLeft ? formatNumber(timeLeft.days) : "00" },
    { label: "horas", value: timeLeft ? formatNumber(timeLeft.hours) : "00" },
    { label: "minutos", value: timeLeft ? formatNumber(timeLeft.minutes) : "00" },
  ];

  return (
    <div>
      {/* The countdown as figures in the display face, hairlines between. */}
      <dl aria-label="Cuenta regresiva" className="grid grid-cols-3 divide-x divide-rule border-y border-rule">
        {units.map((unit) => (
          <div key={unit.label} className="flex flex-col-reverse gap-1 py-4 pl-4 first:pl-0 md:pl-6">
            <dt className="text-sm font-medium text-muted">{unit.label}</dt>
            <dd className="font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-none tabular-nums text-ink">
              {unit.value}
            </dd>
          </div>
        ))}
      </dl>
      {caption && <p className="mt-3 text-sm text-muted">{caption}</p>}
    </div>
  );
};

export default Countdown;
