import React, { FC } from "react";
import { Guest } from "@/types/Guest";
import Button from "./ui/Button";
import { useRouter } from 'next/navigation'

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
  const { isDrity, isConfirmed } = guestData;
  const router = useRouter()

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-12">
      {!isDrity && (
        <>
          <Button
            variant="success"
            size="lg"
            loading={onRequestConfirm}
            disabled={onRequestConfirm || onRequestNoConfirm}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>

          <Button
            variant="danger"
            size="lg"
            loading={onRequestNoConfirm}
            disabled={onRequestNoConfirm || onRequestConfirm}
            onClick={handleNoConfirm}
          >
            No Confirmar
          </Button>
        </>
      )}

      {isDrity && isConfirmed && (
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push(`/${guestData.id}/confirm`)}
        >
          Mira las instrucciones
        </Button>
      )}

      {isDrity && !isConfirmed && (
        <div>Alla le vamos a hacer el festejo, hij3 de le gorr3, 🖕</div>
      )}
    </div>
  );
};

export default GroupedButtons;
