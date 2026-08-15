"use client";
import useGuest from "@/hooks/useGuestData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, useReducedMotion } from "motion/react";

import GuestInvitations from "@/components/GuestInvitations";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import BlurTextTitle from "@/components/BlurTextTitle";
import { pageEntrance } from "@/lib/motion";

export default function Page({ params }: { params: { id: number } }) {
  const { guestData, findGuest, loading, error } = useGuest(params);
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!loading && (error || !findGuest || !guestData.isConfirmed)) {
      router.replace(`/${params.id}`);
    }
  }, [loading, error, findGuest, guestData.isConfirmed, params.id, router]);

  if (loading) {
    return <LoadingSpinner standalone />;
  }

  if (error || !findGuest || !guestData.isConfirmed) {
    return null;
  }

  return (
    <>
      <motion.div
        variants={pageEntrance}
        initial={reducedMotion ? false : "hidden"}
        animate="show"
        className="flex w-full justify-center py-8"
      >
        <Card variant="paper" className="relative w-full max-w-3xl">
          <AuroraBackdrop />
          <div className="relative">
            <BlurTextTitle
              text={`¡Que bien que vas a venir ${guestData.name} 🥳!`}
              className="mb-10 text-4xl"
            />
            <GuestInvitations guestData={guestData} guestLoaded={loading} />
          </div>
        </Card>
      </motion.div>
      <Footer />
    </>
  );
}
