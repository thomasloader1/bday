import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/pagination';
import BackgroundLayer from "@/components/BackgroundLayer";
import { ConfigProvider } from "@/components/ConfigProvider";
import { readConfig } from "@/lib/config/store";
import { toPublicConfig } from "@/lib/config/schema";
import { getNextBirthday, getTurningAge } from "@/lib/eventDate";

/** The age shown in the tab, from the config (no rebuild needed when it changes). */
const currentAge = async () => {
  const { party } = await readConfig();
  return getTurningAge(party, getNextBirthday(party));
};

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Festejo de mis ${await currentAge()}`,
    description: "Aplicación para invitarlos a un evento especial",
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
// Node runtime (the config lives on disk when there is no Cloudflare KV) and rendered per request.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await readConfig();

  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-spot focus:px-4 focus:py-2 focus:font-bold focus:text-spot-ink"
        >
          Saltar al contenido
        </a>
        <BackgroundLayer />
        <main id="contenido" className="container">
          <ConfigProvider config={toPublicConfig(config)}>{children}</ConfigProvider>
        </main>
      </body>
    </html>
  );
}
