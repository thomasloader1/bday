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
    // Events are derived on the server per request; they never go to Firestore.
    const { id, events: _events, ...person } = guestData;

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

    // Events are derived on the server per request; they never go to Firestore.
    const { id, events: _events, ...person } = guestData;

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
    <section aria-labelledby={invitationId} className="grid gap-12 md:grid-cols-12 md:gap-8">
      <p id={invitationId} className="sr-only">
        Invitación para {guestData.name}
      </p>
      {/* The letter: the greeting at display size, the words at reading size. */}
      <div className="min-w-0 md:col-span-7">
        <BlurTextTitle text={`¡Hola ${guestData.name}!`} className="mb-10 text-display text-ink" />
        <InvitationText />
      </div>
      {/* The answer, in the page's one well, held beside the letter. */}
      <div className="well self-start p-8 md:sticky md:top-8 md:col-span-4 md:col-start-9">
        <h2 className="text-title text-ink">¿Venís?</h2>
        <GroupedButtons
          handleConfirm={handleConfirm}
          onRequestConfirm={onRequestConfirm}
          handleNoConfirm={handleNoConfirm}
          onRequestNoConfirm={onRequestNoConfirm}
          guestData={guestData}
        />
      </div>
    </section>
  );
};

export default Invitation;