import React, { FC } from "react";
import InvitationText from "./InvitationText";
import { Guest } from "@/types/Guest";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

interface InvitationProps {
  guestData: Guest;
}

const Invitation: FC<InvitationProps> = ({ guestData }) => {
  const handleConfirm = async () => {
    const documentoRef = doc(db, "persons", guestData.id);

    const confirmGuest = {
      isDirty: true,
      confirm: true,
    };

    try {
      await updateDoc(documentoRef, confirmGuest);
      console.log("Documento actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    }
  };

  return (
    <>
      <h1 className="font-bold text-5xl mb-10">¡Hola {guestData.name}!</h1>

      <InvitationText />

      <div className="flex justify-center mt-12 space-x-4">
        <button
          onClick={() => {}}
          className="transition-transform transform hover:scale-105 duration-300 ease-in-out bg-orange-300 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
        >
          Confirmar
        </button>
        <button
          onClick={() => {}}
          className="transition-transform transform hover:scale-105 duration-300 ease-in-out bg-gray-300 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
        >
          No Confirmar
        </button>
      </div>
    </>
  );
};

export default Invitation;
