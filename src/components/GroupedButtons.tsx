import React, { FC } from "react";
import InvitationButton from "./InvitationButton";
import { Guest } from "@/types/Guest";
import Link from "next/link";

interface GroupedButtonsProps {
  handleConfirm: () => void;
  handleNoConfirm: () => void;
  onRequestConfirm: boolean;
  onRequestNoConfirm: boolean;
  guestData: Guest;
}

const GroupedButtons: FC<GroupedButtonsProps> = ({
  handleConfirm,
  onRequestConfirm,
  handleNoConfirm,
  onRequestNoConfirm,
  guestData,
}) => {
  const { isDrity, isConfirmed } = guestData;

  return (
    <div className="flex justify-center mt-12 space-x-4">
      {!isDrity && (
        <>
          <button
            onClick={handleConfirm}
            className={`transition-transform transform hover:scale-105 duration-300 ease-in-out bg-green-300 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline`}
            disabled={onRequestConfirm || onRequestNoConfirm}
          >
            <span
              className={`absolute left-0 top-0 w-full h-full bg-green-600 rounded-full ${
                onRequestConfirm ? "animate-pulse" : "hidden"
              }`}
            ></span>
            <span
              className={`relative z-10 ${
                onRequestConfirm ? "text-3xl" : "text-sm"
              }`}
            >
              {onRequestConfirm ? "🥳" : "Confirmar"}
            </span>
          </button>

          <button
            onClick={handleNoConfirm}
            className={`transition-transform transform hover:scale-105 duration-300 ease-in-out bg-slate-300 hover:bg-slate-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline`}
            disabled={onRequestNoConfirm || onRequestConfirm}
          >
            <span
              className={`absolute left-0 top-0 w-full h-full bg-slate-600 rounded-full ${
                onRequestNoConfirm ? "animate-pulse" : "hidden"
              }`}
            ></span>
            <span
              className={`relative z-10 ${
                onRequestNoConfirm ? "text-3xl" : "text-sm"
              }`}
            >
              {onRequestNoConfirm ? "🖕" : "No Confirmar"}
            </span>
          </button>
        </>
      )}

      {isDrity && isConfirmed && (
        <Link
          href={`/${guestData.id}/confirm`}
          className="bg-green-500 px-6 py-2 rounded-full text-xl text-white"
        >
          Mira las instrucciones 🥳
        </Link>
      )}

      {isDrity && !isConfirmed && (
        <div>Alla le vamos a hacer el festejo, hij3 de le gorr3, 🖕</div>
      )}
    </div>
  );
};

export default GroupedButtons;
