"use client";
import Countdown from "@/components/Countdown";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export default function Bday() {
  const [inviteNumber, setInviteNumber] = useState("");
  const [items, setItems] = useState<Array<{}>>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteNumber(event.target.value);
  };

  const handleCountdownComplete = () => {
    // Aquí puedes ejecutar alguna acción cuando el contador llega a cero
    console.log("Contador llegó a cero");
  };

  const targetDate = new Date("2023-12-16T00:00:00");

  useEffect(() => {
    const q = query(collection(db, "persons"));
    const unsuscribe = onSnapshot(q, (qs) => {
      let itemsArray: Array<{}> = [];

      qs.forEach((doc) => {
        itemsArray.push({ ...doc.data(), id: doc.id });
      });

      setItems(itemsArray);
    });
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">¡Bienvenido posible invitado!</h1>
      <div className="mb-10 mt-5">
        <Countdown
          targetDate={targetDate}
          onComplete={handleCountdownComplete}
        />
      </div>
      <p className="text-lg mb-8">
        Ingresa tu número de telefono y podras ver la invitación al cumpleaños.
      </p>

      <div className="flex mb-4">
        <input
          type="text"
          value={inviteNumber}
          onChange={handleInputChange}
          className="border border-gray-300 text-black px-4 py-2 rounded-l-md focus:outline-none focus:border-orange-500 flex-1"
          placeholder="Número telefonico"
        />
        <Link
          href={`/${inviteNumber}`}
          className="bg-orange-500 px-6 py-2 rounded-r-md hover:bg-orange-700 transition flex items-center"
        >
          <FaPaperPlane />
        </Link>
      </div>
    </div>
  );
}
