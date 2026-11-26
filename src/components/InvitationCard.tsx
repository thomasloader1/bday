import React, { FC } from "react";
import InvitationInfo from "./InvitationInfo";
import Card from "./ui/Card";
import type { GuestEvent } from "@/lib/config/schema";

interface InvitationCardProps {
  event: GuestEvent;
  guestLoaded: boolean;
}

/** One event the guest can see, as a card in the deck / swiper. */
const InvitationCard: FC<InvitationCardProps> = ({ event, guestLoaded }) => (
  <Card variant="default" as="article" className="relative h-full overflow-hidden">
    <InvitationInfo event={event} loading={guestLoaded} />
  </Card>
);

export default InvitationCard;
