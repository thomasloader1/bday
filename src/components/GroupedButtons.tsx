'use client'
import React, { FC, useState } from "react";
import { Guest } from "@/types/Guest";
import Button from "./Button";
import { useRouter } from 'next/navigation'
import { guestToPersonInFirebase } from "@/infrastructure/guestRepository";

interface GroupedButtonsProps {
  guest: Guest;
}

const GroupedButtons: FC<GroupedButtonsProps> = ({ guest }) => {
  const { isDrity, isConfirmed } = guest;
  const [onRequestConfirm, setOnRequestConfirm] = useState<boolean>(false);
  const [onRequestNoConfirm, setOnRequestNoConfirm] = useState<boolean>(false);
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleConfirm = async () => {
    setOnRequestConfirm(true);
    setError(null); // Limpiar errores previos
    
    const confirmGuest: Guest = {
      ...guest,
      isDrity: true,
      isConfirmed: true,
    };

    try {
      console.log('Intentando confirmar invitación...', confirmGuest);
      await guestToPersonInFirebase(confirmGuest);
      console.log('Invitación confirmada exitosamente');
      router.push(`/${guest.id}/confirm`);
    } catch (error: any) {
      console.error('Error al confirmar invitación:', error);
      setError(error?.message || 'Error al confirmar la invitación. Intenta nuevamente.')
    } finally {
      setOnRequestConfirm(false);
    }
  };

  const handleNoConfirm = async () => {
    setOnRequestNoConfirm(true);
    setError(null); // Limpiar errores previos
    
    const noConfirmGuest = {
      ...guest,
      isDrity: true,
      isConfirmed: false,
    };

    try {
      console.log('Intentando rechazar invitación...', noConfirmGuest);
      await guestToPersonInFirebase(noConfirmGuest);
      console.log('Invitación rechazada exitosamente');
      router.push(`/${guest.id}`);
    } catch (error: any) {
      console.error('Error al rechazar invitación:', error);
      setError(error?.message || 'Error al procesar la respuesta. Intenta nuevamente.')
    } finally {
      setOnRequestNoConfirm(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mt-12 space-x-4">
        {!isDrity && (
          <>
            <button
              onClick={handleConfirm}
              className={`transition-transform transform hover:scale-105 duration-300 ease-in-out bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline ${(onRequestConfirm || onRequestNoConfirm) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={onRequestConfirm || onRequestNoConfirm}
            >
              <span
                className={`absolute left-0 top-0 w-full h-full bg-green-600 rounded-full ${onRequestConfirm ? "animate-pulse" : "hidden"
                  }`}
              ></span>
              <span
                className={`relative z-10 ${onRequestConfirm ? "text-3xl" : "text-sm"
                  }`}
              >
                {onRequestConfirm ? "🥳" : "Confirmar"}
              </span>
            </button>

            <button
              onClick={handleNoConfirm}
              className={`transition-transform transform hover:scale-105 duration-300 ease-in-out bg-slate-300 hover:bg-slate-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline ${(onRequestNoConfirm || onRequestConfirm) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={onRequestNoConfirm || onRequestConfirm}
            >
              <span
                className={`absolute left-0 top-0 w-full h-full bg-slate-600 rounded-full ${onRequestNoConfirm ? "animate-pulse" : "hidden"
                  }`}
              ></span>
              <span
                className={`relative z-10 ${onRequestNoConfirm ? "text-3xl" : "text-sm"
                  }`}
              >
                {onRequestNoConfirm ? "🖕" : "No Confirmar"}
              </span>
            </button>

          </>
        )}

        {isDrity && isConfirmed && (

          <Button text="Mira las instrucciones 🥳" onClick={() => { router.push(`/${guest.id}/confirm`) }} />
        )}

        {isDrity && !isConfirmed && (
          <div>Alla le vamos a hacer el festejo, hij3 de le gorr3, 🖕</div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm font-bold text-center mt-5">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default GroupedButtons;
