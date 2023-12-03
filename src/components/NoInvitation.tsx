import React from "react";
import WhatsAppButton from "./WhatsAppButton";

const NoInvitation = () => {
  return (
    <>
      <h1 className="font-bold text-3xl mb-4">¡Oops! se pico mal.</h1>
      <p className="text-lg mb-4">
        Parece que la invitación que intentas acceder no existe o hay algún
        error.
      </p>
      <p className="text-lg mb-4">
        Por favor, verifica el número de telefono que cumpla con el siguiente
        patron <strong>11XXXXXXXX</strong> o asegúrate de haber sido incluido en
        la lista de invitados.
      </p>
      <p className="text-lg mb-4">
        Si crees que esto es un error, no dudes en ponerte en contacto conmigo.
      </p>
      <WhatsAppButton />
    </>
  );
};

export default NoInvitation;
