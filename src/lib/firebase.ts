import { db } from "@/config/firebase";
import { Guest } from "@/types/Guest";
import { doc, getDoc } from "firebase/firestore";
import { Dispatch, SetStateAction } from "react";

export const getGuest = async (
  id: string,
  setFindGuest: Dispatch<SetStateAction<boolean>>,
  setGuestData: Dispatch<SetStateAction<Guest>>,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const documentoRef = doc(db, "persons", id);
    const documentoSnapshot = await getDoc(documentoRef);

    if (documentoSnapshot.exists()) {
      const data = documentoSnapshot.data() as Guest;
      setFindGuest(true);
      setGuestData({ ...data, id });
    } else {
      setFindGuest(false);
    }
  } catch (error) {
    console.error("Error al obtener el documento:", error);
  } finally {
    setLoading(false);
  }
};
