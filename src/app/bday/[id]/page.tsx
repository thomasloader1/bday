"use client";

import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import { db } from "@/config/firebase";
import { Guest } from "@/types/Guest";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [guestData, setGuestData] = useState<Guest>({
    id: "",
    name: "",
    group: "",
    place: "",
    confirmed: false,
    isDrity: false,
  });

  const [findGuest, setFindGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const getGuest = async (id: string) => {
    try {
      const documentoRef = doc(db, "persons", id);
      const documentoSnapshot = await getDoc(documentoRef);

      if (documentoSnapshot.exists()) {
        const data = documentoSnapshot.data() as Guest;
        setFindGuest(true);
        setGuestData(data);
      } else {
        setFindGuest(false);
      }
    } catch (error) {
      console.error("Error al obtener el documento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGuest(params.id);
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
        {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation />}
      </div>

      <pre className="bg-gray-100 text-black mt-3 p-4">
        {JSON.stringify(guestData, null, 2)}
      </pre>
    </main>
  );
}
