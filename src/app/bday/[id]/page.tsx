"use client";
import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import useGuest from "@/hooks/useGuestData";

export default function Page({ params }: { params: { id: string } }) {
  const {guestData,findGuest, loading} = useGuest(params)

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