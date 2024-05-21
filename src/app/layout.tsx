import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/effect-cards';
import {AuthContextProvider} from "@/context/AuthContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Festejo de mis 30",
  description: "Aplicacion para invitarlos a un evento especial",
};
export const runtime = 'edge';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="relative container px-2 mx-auto">
          <AuthContextProvider>
            {children}
          </AuthContextProvider>
        </main>  
      </body>
    </html>
  );
}
