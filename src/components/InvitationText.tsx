import { Guest } from "@/types/Guest";
import React, { FC } from "react";
import GuestFrom from "@/components/GuestFrom";

const InvitationText = () => {
  return (
    <div className="mb-6 text-gray-700">
      <p className="mb-4 text-lg">
        Quiero que seas parte de este dia tan especial para mi.
      </p>
      <p className="mb-4 text-lg">
        Porfavor haceme saber si vas a asistir a mi celebración completando el siguiente formulario.
      </p>
    </div>
  );
};

export default InvitationText;
