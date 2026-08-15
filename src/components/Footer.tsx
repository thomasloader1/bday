import Link from 'next/link'
import React, { FC } from 'react'

const Footer: FC = () => {
  return (
    <footer className="-mx-6 mt-12 border-t border-neutral-200 px-6 py-6 md:-mx-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-neutral-500">
          El regalo es tu presencia misma!, pero si queres hacerme un regalo
          podes ver{" "}
          <Link className="text-primary-600 hover:text-primary-700" href={"/wishlist"}>
            Lista de deseados
          </Link>{" "}
          👀
        </p>

        <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-500">
          <li>
            <a href="/" className="hover:underline hover:text-neutral-700">
              Inicio
            </a>
          </li>
          <li>
            <a
              href="https://gomeztomasgonzalo.com.ar"
              target="_blank"
              rel="noreferrer"
              className="hover:underline hover:text-neutral-700"
            >
              El Cumplañero
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
