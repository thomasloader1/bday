import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/pagination';
import BackgroundLayer from "@/components/BackgroundLayer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Festejo de mis 30",
  description: "Aplicacion para invitarlos a un evento especial",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const runtime = 'edge';
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <BackgroundLayer />
        <main className="container mx-auto px-6 md:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
