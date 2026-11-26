import React from "react";
import WhatsAppButton from "./WhatsAppButton";

const NoInvitation = () => {
  return (
    <section className="grid gap-12 md:grid-cols-12 md:gap-8">
      <div className="min-w-0 md:col-span-7">
        <h1 className="mb-10 text-display text-ink">¡Oops! se picó mal.</h1>
        <div className="max-w-[60ch] space-y-4 text-lg leading-relaxed text-ink-2">
          <p className="lead text-ink">
            Parece que la invitación que intentas acceder no existe o hay algún
            error.
          </p>
          <p>
            Por favor, verifica el número de teléfono que cumpla con el siguiente
            patrón <strong className="font-bold text-ink">11XXXXXXXX</strong> o asegúrate de haber sido incluido en
            la lista de invitados.
          </p>
          <p>
            Si crees que esto es un error, no dudes en ponerte en contacto conmigo.
          </p>
        </div>
      </div>
      <div className="well self-start p-8 md:col-span-4 md:col-start-9">
        <WhatsAppButton />
      </div>
    </section>
  );
};

export default NoInvitation;
