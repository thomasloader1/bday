
import Link from 'next/link'
import React, { FC } from 'react'

const Footer: FC = () => {

    return (
        <footer className="fixed bottom-0 left-0 z-[9999] w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              El regalo es tu presencia misma!, pero si queres hacerme un regalo
              podes ver{" "}
              <Link className="text-orange-600 hover:text-orange-400 " href={"/wishlist"}>
                Lista de deseados
              </Link>{" "}
              👀
            </span>

            <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">About</a>
                </li>
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                </li>
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                </li>
                <li>
                    <a href="#" className="hover:underline">Contact</a>
                </li>
            </ul>

        </footer>
        )
}

export default Footer