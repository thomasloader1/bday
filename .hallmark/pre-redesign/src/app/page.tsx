"use client";
import Countdown from "@/components/Countdown";
import SearchInvitation from "@/components/SearchInvitation";
import BlurTextTitle from "@/components/BlurTextTitle";
import { useStore } from "@nanostores/react";
import { $time, setEventDate } from "@/store/timeStore";
import { getNextBirthday } from "@/lib/eventDate";


export default function Bday() {
  const { eventDate } = useStore($time)
  
  const handleCountdownComplete = () => {
    setEventDate(getNextBirthday())
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
      
        <BlurTextTitle
          text="¡Hola posible invitado!"
          className="mb-4 text-4xl md:text-5xl"
        />
        <div className="mb-10 mt-5">
          <Countdown
            targetDate={eventDate}
            onComplete={handleCountdownComplete}
          />
        </div>
        <SearchInvitation tryDemo={true}/>
      </div>
    </>
    
  );
}
