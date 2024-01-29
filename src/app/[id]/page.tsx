"use client";
import IconBackground from "@/components/CakeBackground";
import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import useGuest from "@/hooks/useGuestData";
import { GiPartyPopper } from "react-icons/gi";

export default function Page({ params }: { params: { id: number } }) {
  const { guestData, findGuest, loading } = useGuest(params);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative">
    <IconBackground icon={<GiPartyPopper />} />

    <main className="container mx-auto px-8 pt-10 md:flex md:justify-center md:items-center">
      <div className="bg-white p-10 text-gray-800 rounded-lg shadow-md">
        {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation />}
      </div>
    </main>
    </div>
  );
}
