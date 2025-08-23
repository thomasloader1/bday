import React from "react";
import Button from "./Button";

const WhatsAppButton = () => {
  const numeroTelefono = "1155011250";
  const abrirWhatsApp = () => {
    const url = `https://web.whatsapp.com/send?phone=${numeroTelefono}`;
    window.open(url, "_blank");
  };
  const goToHome = () => {
   window.location.href ="/"
  };

  return (
    <div className="flex justify-end">
      <Button text="Ir a inicio" onClick={goToHome} className="text-lg" color="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" />
      <Button text="WhatsApp" onClick={abrirWhatsApp} className="text-lg" />
    </div>
  );
};

export default WhatsAppButton;
