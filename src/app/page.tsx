"use client";
import Countdown from "@/components/Countdown";
import { FaBirthdayCake } from "react-icons/fa";
import IconBackground from "@/components/CakeBackground";
import SearchInvitation from "@/components/SearchInvitation";
import { useStore } from "@nanostores/react";
import { $time, setTime } from "@/store/timeStore";
import Button from "@/components/Button";
import { UserAuth } from "@/context/AuthContext";

export default function Bday() {
  const { targetDate } = useStore($time)
  const { user, googleSignIn, logOut} = UserAuth();

  const authUser:{displayName?:string} = user;
  const handleCountdownComplete = () => {
    const currentDate = new Date();
    targetDate.setFullYear(currentDate.getFullYear());
    setTime(targetDate)
  };

  const handleLoginGoogle = async () => {
    try{
      await googleSignIn()
    }catch(e){
      console.log(e)
    }
  }

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
       
        {!authUser?.displayName ? (<Button onClick={handleLoginGoogle} text="Ingresar con Google" />) :(
          <>
           <p>¡Hola, {authUser.displayName}! </p>
           <div className="flex mt-4 gap-x-2">
            <Button onClick={logOut} text="Salir" color="red"  />
            <Button isLink={{href:"/dashboard"}} color="blue" text="Dashboard" />
           </div>
          </>
        )}
        
      </div>
    </>
    
  );
}
