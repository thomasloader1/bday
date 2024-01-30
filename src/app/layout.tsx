import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/effect-cards';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Festejo de mis 30",
  description: "Aplicacion para invitarlos a un evento especial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
