"use client";
import IconBackground from "@/components/CakeBackground";
import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import useGuest from "@/hooks/useGuestData";
import { GiPartyPopper } from "react-icons/gi";
import {useRouter} from "next/navigation";


export default function Page({ params }: { params: { id: number } }) {
  const { guestData, findGuest, loading } = useGuest(params);
  const router = useRouter();

  if(guestData.isConfirmed){
    router.push(`/${params.id}/confirm`);
    return
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative">
      <IconBackground icon={<GiPartyPopper />} />

      <main className="container mx-auto my-auto sm:px-8 sm:pt-10 md:flex md:justify-center md:items-center">
        <div className="bg-white p-4 pt-6 sm:p-10 text-gray-800 sm:rounded-lg shadow-md">
          {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation />}
        </div>
      </main>
    </div>
  );
}
