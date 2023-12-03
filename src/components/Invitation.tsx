import React, { FC, useState } from "react";
import InvitationText from "./InvitationText";
import { Guest } from "@/types/Guest";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import InvitationButton from "./InvitationButton";
import GroupedButtons from "./GroupedButtons";

interface InvitationProps {
  guestData: Guest;
}

const Invitation: FC<InvitationProps> = ({ guestData }) => {
  const [onRequestConfirm, setOnRequestConfirm] = useState<boolean>(false);
  const [onRequestNoConfirm, setOnRequestNoConfirm] = useState<boolean>(false);

  const handleConfirm = async () => {
    setOnRequestConfirm(true);

    const confirmGuest = {
      isDrity: true,
      confirmed: true,
    };

    try {
      const documentoRef = doc(db, "persons", guestData.id);
      await updateDoc(documentoRef, confirmGuest);
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    } finally {
      setOnRequestConfirm(false);
    }
  };

  const handleNoConfirm = async () => {
    setOnRequestNoConfirm(true);
    const documentoRef = doc(db, "persons", guestData.id);

    const confirmGuest = {
      isDirty: true,
    };

    try {
      await updateDoc(documentoRef, confirmGuest);
      console.log("Documento actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    } finally {
      setOnRequestNoConfirm(false);
    }
  };

  return (
    <>
      <h1 className="font-bold text-5xl mb-10">¡Hola {guestData.name}!</h1>
      <InvitationText />
      <GroupedButtons
        handleConfirm={handleConfirm}
        onRequestConfirm={onRequestConfirm}
        handleNoConfirm={handleNoConfirm}
        onRequestNoConfirm={onRequestNoConfirm}
        guestData={guestData}
      />
    </>
  );
};

export default Invitation;
