import React, { FC, useEffect, useState } from "react";
import { Guest } from "@/types/Guest";
import DesktopInvitations from "./DesktopInvitations";
import MobileInvitations from "./MobileInvitations";

interface GuestInvitationsProps {
  guestData: Guest;
  guestLoaded: boolean;
}

const DESKTOP_QUERY = "(min-width: 640px)";

const GuestInvitations: FC<GuestInvitationsProps> = ({ guestData, guestLoaded }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_QUERY).matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!isDesktop) {
    return <MobileInvitations guestData={guestData} guestLoaded={guestLoaded} />;
  }

  return <DesktopInvitations guestData={guestData} guestLoaded={guestLoaded} />;
};

export default GuestInvitations;