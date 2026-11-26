"use client";
import useGuest from "@/hooks/useGuestData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, useReducedMotion } from "motion/react";
import Footer from "@/components/Footer";
import { pageEntrance } from "@/lib/motion";
import CurvedLoop from './../../../components/CurvedLoop';
import dynamic from "next/dynamic";

// swiper accede a `window` a nivel de módulo y rompe el SSR edge (500 en hard reload)
const GuestInvitations = dynamic(() => import("@/components/GuestInvitations"), { ssr: false });


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
        className="flex w-full justify-center overflow-x-clip pt-8 pb-[env(safe-area-inset-bottom)] md:pb-8"
      >
       
<section className="relative w-full bg-card-paper py-6">
          <h1 className="sr-only">{`Invitaciones de ${guestData.name}`}</h1>
            
          <div className="relative pt-32 md:pt-56">
            <CurvedLoop 
                marqueeText={`Que✦bien✦que✦vas✦a✦venir✦${guestData.name}✦`}
                speed={1}
                curveAmount={200}
                direction="right"
                interactive
                className="absolute left-1/2 -top-24 z-20 w-[120%] -translate-x-1/2"
              />
      
            <GuestInvitations guestData={guestData} guestLoaded={loading} />
          </div>
        </section>
      </motion.div>
      <Footer />
    </>
  );
}
