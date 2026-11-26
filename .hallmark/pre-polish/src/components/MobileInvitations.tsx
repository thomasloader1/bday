import React, { FC } from "react";
import InvitationDeck from "./mobile/InvitationDeck";
import InvitationCard from "./InvitationCard";
import { Guest } from "@/types/Guest";

interface MobileInvitationsProps {
  guestData: Guest;
  guestLoaded: boolean;
}

const MobileInvitations: FC<MobileInvitationsProps> = ({ guestData, guestLoaded }) => {
  const slides = guestData.group.map((groupType, index) => (
    <InvitationCard
      key={`${guestData.id}_${index}`}
      guestData={guestData}
      groupType={groupType}
      index={index}
      guestLoaded={guestLoaded}
    />
  ));

  return (
    <InvitationDeck
      slides={slides}
      total={guestData.group.length}
      guestName={guestData.name}
    />
  );
};

export default MobileInvitations;