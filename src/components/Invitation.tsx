import React, { FC, useState } from "react";
import InvitationText from "./InvitationText";
import { Guest } from "@/types/Guest";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import GroupedButtons from "./GroupedButtons";
import {DB_NAME} from "@/lib/firebase";

interface InvitationProps {
  guestData: Guest;
}

const Invitation: FC<InvitationProps> = ({ guestData }) => {
  const [onRequestConfirm, setOnRequestConfirm] = useState<boolean>(false);
  const [onRequestNoConfirm, setOnRequestNoConfirm] = useState<boolean>(false);

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
      const documentoRef = doc(db, DB_NAME, idPerson);
      const documentSnapshot = await getDoc(documentoRef);

      if (documentSnapshot.exists()) {
        // La persona ya existe, entonces actualizamos el documento
        await updateDoc(documentoRef, confirmGuest);
        console.log("Documento actualizado correctamente.");
      } else {
        // La persona no existe, así que la agregamos como nuevo documento
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
        // La persona ya existe, entonces actualizamos el documento
        await updateDoc(documentoRef, confirmGuest);
        console.log("Documento actualizado correctamente.");
      } else {
        // La persona no existe, así que la agregamos como nuevo documento
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
