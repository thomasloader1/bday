"use client";
import { motion, useReducedMotion } from "motion/react";
import Invitation from "@/components/Invitation";
import LoadingSpinner from "@/components/LoadingSpinner";
import NoInvitation from "@/components/NoInvitation";
import useGuest from "@/hooks/useGuestData";
import { pageEntrance } from "@/lib/motion";

export default function Page({ params }: { params: { id: number } }) {
  const { guestData, findGuest, loading } = useGuest(params);
  const reducedMotion = useReducedMotion();

  if (loading) {
    return <LoadingSpinner standalone />;
  }

  return (
    <motion.div
      variants={pageEntrance}
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      className="py-12 md:py-20"
    >
      {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation phone={String(params.id)} />}
    </motion.div>
  );
}
