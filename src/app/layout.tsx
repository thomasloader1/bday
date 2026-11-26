import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/pagination';
import BackgroundLayer from "@/components/BackgroundLayer";
import { ConfigProvider } from "@/components/ConfigProvider";
import { readConfig } from "@/lib/config/store";
import { toPublicConfig } from "@/lib/config/schema";
import { getNextBirthday, getTurningAge } from "@/lib/eventDate";

/** The age shown in the tab and the bar, from the config (no rebuild needed when it changes). */
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
// Node runtime (the config lives on disk) and rendered per request, so dashboard edits show at once.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await readConfig();
  const AGE = getTurningAge(config.party, getNextBirthday(config.party));

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
        {/* Edge-aligned bar: the wordmark and one destination */}
        <header className="relative z-10 border-b border-rule bg-paper">
          <div className="container flex h-16 items-center justify-between gap-6">
            <Link href="/" aria-label={`Festejo de mis ${AGE}, inicio`} className="whitespace-nowrap font-display text-lg font-bold leading-none text-ink sm:text-xl">
              {/* Under 640px the full wordmark and the link do not fit on one line at 320. */}
              <span className="sm:hidden">Mis {AGE}</span>
              <span className="hidden sm:inline">Festejo de mis {AGE}</span>
            </Link>
            <Link href="/wishlist" className="link whitespace-nowrap text-sm font-medium">
              Lista de deseados
            </Link>
          </div>
        </header>
        <main id="contenido" className="container">
          <ConfigProvider config={toPublicConfig(config)}>{children}</ConfigProvider>
        </main>
      </body>
    </html>
  );
}
