"use client";
import Countdown from "@/components/Countdown";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBirthdayCake, FaPaperPlane } from "react-icons/fa";

import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import IconBackground from "@/components/CakeBackground";
import SearchInvitation from "@/components/SearchInvitation";

export default function Bday() {
  const [targetDate, setTargetDate] = useState<Date>(new Date("2023-12-16T00:00:00"));
  
  const handleCountdownComplete = () => {
    const currentDate = new Date();
    targetDate.setFullYear(currentDate.getFullYear());
  };

  return (
    <div className="relative">
    <IconBackground icon={<FaBirthdayCake />} />
    <div className="flex flex-col items-center justify-center h-screen text-center">
    
      <h1 className="text-5xl font-bold mb-4">¡Bienvenido posible invitado!</h1>
      <div className="mb-10 mt-5">
        <Countdown
          targetDate={targetDate}
          onComplete={handleCountdownComplete}
        />
      </div>
      <p className="text-lg mb-8">
        Ingresa tu número de telefono y podras ver la invitación al cumpleaños.
      </p>

      <SearchInvitation />
    </div>
    </div>
    
  );
}
