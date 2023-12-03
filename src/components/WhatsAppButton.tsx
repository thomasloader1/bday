import React from "react";

const WhatsAppButton = () => {
  const numeroTelefono = "1155011250";

  const abrirWhatsApp = () => {
    const url = `https://web.whatsapp.com/send?phone=${numeroTelefono}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={abrirWhatsApp}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
    >
      WhatsApp
    </button>
  );
};

export default WhatsAppButton;
