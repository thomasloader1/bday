"use client";
import useGuest from "@/hooks/useGuestData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

import { useEffect } from "react";
import GuestInvitations from "@/components/GuestInvitations";
import Footer from "@/components/Footer";

export default function Page({ params }: { params: { id: number } }) {
  const { guestData, loading, error } = useGuest(params);
  const router = useRouter();

  if (error || (guestData.isDrity && guestData.isConfirmed === false)) {
    router.push(`/${params.id}`);
  }

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <main className="">
          <div className="bg-white p-8 text-gray-800 rounded-lg shadow-md">
            
            <h1 className="text-4xl font-bold mb-10">
              ¡Que bien que vas a venir {guestData.name} 🥳!
            </h1>

            <span>Tenes {guestData.group.length} invitaciones!</span>

            <GuestInvitations guestData={guestData} guestLoaded={loading} />
          </div>
          <Footer />
        </main>
      )}
    </>
  );
}
