import React, { FC } from "react";
import InvitationButton from "./InvitationButton";
import { Guest } from "@/types/Guest";
import Link from "next/link";

interface GroupedButtonsProps {
  handleConfirm: () => void;
  handleNoConfirm: () => void;
  onRequestConfirm: boolean;
  onRequestNoConfirm: boolean;
  guestData: Guest;
}

const GroupedButtons: FC<GroupedButtonsProps> = ({
  handleConfirm,
  onRequestConfirm,
  handleNoConfirm,
  onRequestNoConfirm,
  guestData,
}) => {
  const { isDrity, confirmed } = guestData;

  return (
    <div className="flex justify-center mt-12 space-x-4">
      {!isDrity && (
        <>
          <InvitationButton
            colorClass="bg-orange"
            onClick={handleConfirm}
            onDisabled={onRequestConfirm}
            emoji="🥳"
            label="Confirmar"
          />

          <InvitationButton
            colorClass="bg-gray"
            onClick={handleNoConfirm}
            onDisabled={onRequestNoConfirm}
            emoji="🖕"
            label="No Confirmar"
          />
        </>
      )}

      {isDrity && confirmed && (
        <Link
          href={`/bday/${guestData.id}/confirm`}
          className="bg-green-500 px-6 py-2 rounded-full text-xl text-white"
        >
          Mira las instrucciones 🥳
        </Link>
      )}

      {isDrity && !confirmed && (
        <div>Alla le vamos a hacer el festejo, hije de le gorre, 🖕</div>
      )}
    </div>
  );
};

export default GroupedButtons;
