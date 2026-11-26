"use client";
import { motion, useReducedMotion } from "motion/react";
import Card from "@/components/ui/Card";
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
      className="flex w-full justify-center py-8 md:items-center"
    >
      <Card variant="elevated" as="article" className="w-full max-w-2xl">
        {findGuest ? <Invitation guestData={guestData} /> : <NoInvitation />}
      </Card>
    </motion.div>
  );
}
