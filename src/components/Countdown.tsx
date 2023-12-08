// components/Countdown.tsx
import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onComplete }) => {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

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
        {/* {formatNumber(timeLeft.seconds)}s */}
      </div>
    </div>
  );
};

export default Countdown;
