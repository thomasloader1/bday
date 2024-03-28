"use client";
import Countdown from "@/components/Countdown";
import { FaBirthdayCake } from "react-icons/fa";
import IconBackground from "@/components/CakeBackground";
import SearchInvitation from "@/components/SearchInvitation";
import { useStore } from "@nanostores/react";
import { $time, setTime } from "@/store/timeStore";


export default function Bday() {
  const { targetDate } = useStore($time)
  
  const handleCountdownComplete = () => {
    const currentDate = new Date();
    targetDate.setFullYear(currentDate.getFullYear());
    setTime(targetDate)
  };

  return (
    <>
      <IconBackground icon={<FaBirthdayCake />} />
      <div className="flex flex-col items-center justify-center h-screen text-center">
      
        <h1 className="text-5xl font-bold mb-4">¡Bienvenido posible invitado!</h1>
        <div className="mb-10 mt-5">
          <Countdown
            targetDate={targetDate}
            onComplete={handleCountdownComplete}
          />
        </div>
        <SearchInvitation tryDemo={true}/>
      </div>
    </>
    
  );
}
