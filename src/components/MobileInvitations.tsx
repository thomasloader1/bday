import React, { FC } from "react";
import InvitationDeck from "./mobile/InvitationDeck";
import InvitationCard from "./InvitationCard";
import { Guest } from "@/types/Guest";

interface MobileInvitationsProps {
  guestData: Guest;
  guestLoaded: boolean;
}

const MobileInvitations: FC<MobileInvitationsProps> = ({ guestData, guestLoaded }) => {
  const events = guestData.events ?? [];
  const slides = events.map((event) => (
    <InvitationCard key={`${guestData.id}_${event.id}`} event={event} guestLoaded={guestLoaded} />
  ));

  return (
    <InvitationDeck
      slides={slides}
      total={events.length}
      guestName={guestData.name}
    />
  );
};

export default MobileInvitations;