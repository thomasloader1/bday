import React, { FC, useState } from "react";
import InvitationText from "./InvitationText";
import BlurTextTitle from "./BlurTextTitle";
import { Guest } from "@/types/Guest";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import GroupedButtons from "./GroupedButtons";

interface InvitationProps {
  guestData: Guest;
}

const Invitation: FC<InvitationProps> = ({ guestData }) => {
  const [onRequestConfirm, setOnRequestConfirm] = useState<boolean>(false);
  const [onRequestNoConfirm, setOnRequestNoConfirm] = useState<boolean>(false);
  const invitationId = `invitation-${guestData.id}`;

  const handleConfirm = async () => {
    setOnRequestConfirm(true);
    const { id, ...person } = guestData;

    const confirmGuest = {
      ...person,
      isDrity: true,
      isConfirmed: true,
    };

    const idPerson = id.toString();

    try {
      const documentoRef = doc(db, "persons", idPerson);
      const documentSnapshot = await getDoc(documentoRef);

      if (documentSnapshot.exists()) {
        await updateDoc(documentoRef, confirmGuest);
        console.log("Documento actualizado correctamente.");
      } else {
        await setDoc(documentoRef, confirmGuest);
        console.log("Documento agregado correctamente.");
      }

      window.location.href = `/${id}`;
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    } finally {
      setOnRequestConfirm(false);
    }
  };

  const handleNoConfirm = async () => {
    setOnRequestNoConfirm(true);

    const { id, ...person } = guestData;

    const confirmGuest = {
      ...person,
      isDrity: true,
      isConfirmed: false,
    };

    const idPerson = guestData.id.toString();

    try {
      const documentoRef = doc(db, "persons", idPerson);
      const documentSnapshot = await getDoc(documentoRef);

      if (documentSnapshot.exists()) {
        await updateDoc(documentoRef, confirmGuest);
        console.log("Documento actualizado correctamente.");
      } else {
        await setDoc(documentoRef, confirmGuest);
        console.log("Documento agregado correctamente.");
      }

      window.location.href = `/${id}`;
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
    } finally {
      setOnRequestConfirm(false);
    }
  };

  return (
    <section aria-labelledby={invitationId}>
      <p id={invitationId} className="sr-only">
        Invitación para {guestData.name}
      </p>
      <BlurTextTitle text={`¡Hola ${guestData.name}!`} className="mb-10 text-4xl md:text-5xl" />
      <InvitationText />
      <GroupedButtons
        handleConfirm={handleConfirm}
        onRequestConfirm={onRequestConfirm}
        handleNoConfirm={handleNoConfirm}
        onRequestNoConfirm={onRequestNoConfirm}
        guestData={guestData}
      />
    </section>
  );
};

export default Invitation;