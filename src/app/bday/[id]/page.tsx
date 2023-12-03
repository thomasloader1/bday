"use client";

import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import { getGuest } from "@/lib/firebase";
import { Guest } from "@/types/Guest";
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

  useEffect(() => {
    getGuest(params.id, setFindGuest, setGuestData, setLoading);
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
        {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation />}
      </div>
    </main>
  );
}
