import { db } from "@/config/firebase";
import { Guest, UpdateGuest } from "@/types/Guest";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Dispatch, SetStateAction } from "react";

export const getGuest = async (
  id: string,
  setFindGuest: Dispatch<SetStateAction<boolean>>,
  setGuestData: Dispatch<SetStateAction<Guest>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<boolean>>
) => {
  try {
    // The guest list lives on the server (dashboard config); ask for this one number only.
    const response = await fetch(`/api/guests/${encodeURIComponent(id)}`, { cache: "no-store" });

    if (response.ok) {
      const person = (await response.json()) as Pick<Guest, "id" | "name" | "group" | "events">;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("bday:guestId", String(person.id));
        } catch {
          // Storage may be blocked in private browsing; ignore.
        }
      }
      const dataFirebase = await getGuestFirebase(id);
      setFindGuest(true);
      // Name and groups come from the config (editable); Firestore only holds the RSVP state.
      setGuestData({
        isConfirmed: false,
        isDrity: false,
        ...(dataFirebase ?? {}),
        name: person.name,
        group: person.group,
        events: person.events ?? [],
        id: Number(id),
      });
    } else {
      setFindGuest(false);
      setError(true);
    }
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    setError(true);
  } finally {
    setLoading(false);
  }
};

export const getGuestFirebase = async (id: string) => {
  try {
    const documentoRef = doc(db, "persons", id);
    const documentoSnapshot = await getDoc(documentoRef);

    if (documentoSnapshot.exists()) {
      const data = documentoSnapshot.data() as Guest;
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el documento:", error);
  }
};

export const addGuest = async (
  guestData: Guest,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    // Agrega el documento a la colección
    const guestsCollectionRef = doc(db, "persons");
    await setDoc(guestsCollectionRef, guestData);
  } catch (error) {
    console.error("Error al agregar el invitado:", error);
  } finally {
    setLoading(false);
  }
};

export const updateGuest = async (
  guestId: string,
  updatedGuestData: UpdateGuest,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    // Referencia al documento del invitado en Firestore
    const guestRef = doc(db, "persons", guestId);

    await updateDoc(guestRef, updatedGuestData);
  } catch (error) {
    console.error("Error al actualizar el invitado:", error);
  } finally {
    setLoading(false);
  }
};
