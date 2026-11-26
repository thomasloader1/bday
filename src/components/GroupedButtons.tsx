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
    <div className="mt-6 flex flex-col items-start gap-4">
      {!isDrity && (
        <>
          <Button
            variant="success"
            size="lg"
            fullWidth
            loading={onRequestConfirm}
            disabled={onRequestConfirm || onRequestNoConfirm}
            onClick={handleConfirm}
          >
            Confirmar
          </Button>

          <Button
            variant="danger"
            size="md"
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
          fullWidth
          onClick={() => router.push(`/${guestData.id}/confirm`)}
        >
          Mira las instrucciones
        </Button>
      )}

      {isDrity && !isConfirmed && (
        <p className="text-ink-2">
          No has confirmado tu asistencia.
        </p>
      )}
    </div>
  );
};

export default GroupedButtons;
