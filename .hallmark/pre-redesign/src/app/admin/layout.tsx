import type { Metadata } from "next";
import "../globals.css";

export const runtime = "nodejs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El root layout ya provee <html>, <body> y <main>; anidarlos rompe la hidratación (React #418/#423).
  return <div className="p-4">{children}</div>;
}

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for the birthday invitation app",
};