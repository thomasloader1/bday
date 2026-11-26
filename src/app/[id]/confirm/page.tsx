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
        className="flex w-full justify-center pt-4 sm:pt-8 pb-[env(safe-area-inset-bottom)] md:pb-8"
      >
       
<section className="relative w-full">
          <h1 className="sr-only">{`Invitaciones de ${guestData.name}`}</h1>
            
          {/* The ribbon's lower edge sits at ~24vw; cards start above it, over the band's lower part but below its text (23px at 390; from md up 7.5vw - 10px, which keeps them under the text: 52px at 820, 98px at 1440). */}
          <div className="relative pt-[calc(24vw-min(3rem,6vw))] md:pt-[calc(24vw-7.5vw+10px)]">
            {/* Full-bleed band (asked for): spans the viewport and clips the ribbon, whose curve starts past both edges,
                so nothing past the edge adds to the page's scroll width. It sits under the cards (asked for). */}
            <div className="absolute left-1/2 top-0 z-0 w-screen -translate-x-1/2 overflow-x-clip">
              <CurvedLoop
                marqueeText={`Que✦bien✦que✦vas✦a✦venir✦${guestData.name}✦`}
                speed={1}
                curveAmount={200}
                direction="right"
                interactive
                className="relative"
              />
            </div>
      
            <div className="relative z-10">
              <GuestInvitations guestData={guestData} guestLoaded={loading} />
            </div>
          </div>
        </section>
      </motion.div>
      <Footer />
    </>
  );
}
