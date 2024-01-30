// components/Countdown.tsx
import { calculateTimeLeft } from "@/lib/calculateTimeLeft";
import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    if(timeLeft.days === 0){
      onComplete()
    }

    return () => {
      clearInterval(timer);
    };
  }, [targetDate]);

  const formatNumber = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="mr-2 text-3xl font-bold mb-2">
        {formatNumber(timeLeft.days)} dias {formatNumber(timeLeft.hours)} horas{" "}
        {formatNumber(timeLeft.minutes)} minutos
      </div>
    </div>
  );
};

export default Countdown;
