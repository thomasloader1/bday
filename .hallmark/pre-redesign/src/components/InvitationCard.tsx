import React, { FC } from "react";
import InvitationInfo from "./InvitationInfo";
import InvitationPersonalInfo from "./InvitationPersonalInfo";
import Card from "./ui/Card";
import workInvitationJson from "../data/__workInvitation.json";
import familyInvitationJson from "../data/__familyInvitation.json";
import { Guest } from "@/types/Guest";

interface InvitationData {
  title: string;
  description: string;
  food?: string[];
}

interface InvitationCardProps {
  guestData: Guest;
  groupType: string;
  index: number;
  guestLoaded: boolean;
}

const InvitationCard: FC<InvitationCardProps> = ({
  guestData,
  groupType,
  index,
  guestLoaded,
}) => {
  const isFamily = groupType.includes("family");
  const isWork = groupType.includes("work");
  const isCommon = isFamily || isWork;

  const invitation: InvitationData = isFamily
    ? (familyInvitationJson as InvitationData)
    : isWork
    ? (workInvitationJson as InvitationData)
    : { title: "Celebración", description: "Te esperamos para festejar juntos el 21/12/2026" };

  if (isCommon) {
    return (
      <Card variant="paper" as="article" key={`${guestData.id}_${index}`} className="relative h-full overflow-hidden">
        <InvitationInfo
          text={invitation.title}
          description={invitation.description}
          food={invitation.food}
          lat={guestData?.lunch?._lat}
          long={guestData?.lunch?._long}
          loading={guestLoaded}
        />
      </Card>
    );
  }

  return (
    <Card variant="default" as="article" key={`${guestData.id}_${index}`} className="relative h-full overflow-hidden">
      <InvitationPersonalInfo />
    </Card>
  );
};

export default InvitationCard;