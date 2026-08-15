// components/Countdown.tsx
import { calculateTimeLeft, TimeLeft } from "@/lib/calculateTimeLeft";
import React, { useState, useEffect, useRef } from "react";

interface CountdownProps {
  targetDate: Date;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
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

  return (
    <div className="flex flex-col items-center">
      <div className="mr-2 text-3xl font-bold mb-2">
        {timeLeft === null
          ? "00 dias 00 horas 00 minutos"
          : timeLeft.isOver
          ? "La fiesta ya pasó"
          : `${formatNumber(timeLeft.days)} dias ${formatNumber(timeLeft.hours)} horas ${formatNumber(timeLeft.minutes)} minutos`}
      </div>
    </div>
  );
};

export default Countdown;
