import type { Metadata } from "next";
import "../globals.css";

export const runtime = "nodejs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="font-sans antialiased">
      <body className="font-sans antialiased p-4">
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for the birthday invitation app",
};