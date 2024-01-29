import React from "react";
import WhatsAppButton from "./WhatsAppButton";

const NoInvitation = () => {
  return (
    <>
      <h1 className="font-bold text-5xl mb-8">¡Oops! se pico mal.</h1>
      <div className="max-w-[800px] mb-8">
      <p className="text-md mb-4">
        Parece que la invitación que intentas acceder no existe o hay algún
        error.
      </p>
      <p className="text-md mb-4">
        Por favor, verifica el número de telefono que cumpla con el siguiente
        patron <strong>11XXXXXXXX</strong> o asegúrate de haber sido incluido en
        la lista de invitados.
      </p>
      <p className="text-md mb-4">
        Si crees que esto es un error, no dudes en ponerte en contacto conmigo.
      </p>
      </div>
      <WhatsAppButton />
    </>
  );
};

export default NoInvitation;
