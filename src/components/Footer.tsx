"use client";
import Link from "next/link";
import React, { FC } from "react";
import { useConfig } from "./ConfigProvider";

/** Statement footer: one closing sentence set large under a hairline, the links beneath. */
const Footer: FC = () => {
  const { party } = useConfig();
  return (
    <footer className="mt-24 border-t border-rule py-16">
      <p className="max-w-[22ch] font-display text-section text-ink">
        {party.footerLine}
      </p>
      <p className="mt-4 max-w-[60ch] text-lg text-ink-2">
        Pero si querés hacerme un regalo, está la{" "}
        <Link className="link" href="/wishlist">
          Lista de deseados
        </Link>{" "}
        👀
      </p>

      <nav aria-label="Navegación principal" className="mt-10">
        <ul className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <li>
            <Link href="/" className="link">
              Inicio
            </Link>
          </li>
          <li>
            <a href="https://gomeztomasgonzalo.com.ar" target="_blank" rel="noreferrer" className="link">
              El Cumpleañero
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
