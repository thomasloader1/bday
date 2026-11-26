import React from "react";
import Button from "./ui/Button";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";

const WhatsAppButton = () => {
  const numeroTelefono = "1155011250";
  const router = useRouter();
  const abrirWhatsApp = () => {
    const url = `https://web.whatsapp.com/send?phone=${numeroTelefono}`;
    window.open(url, "_blank");
  };
  const goToHome = () => {
   router.push("/")
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="primary" size="lg" fullWidth icon={<FaWhatsapp />} onClick={abrirWhatsApp}>WhatsApp</Button>
      <Button variant="secondary" onClick={goToHome}>Ir a inicio</Button>
    </div>
  );
};

export default WhatsAppButton;
