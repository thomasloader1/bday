"use client";

import { useState, useEffect } from "react";
import { doc, getDocs, collection } from "firebase/firestore";
import { db } from "@/config/firebase";

interface Guest {
  id: number;
  name: string;
  group: string[];
}

interface Card {
  id: string;
  name: string;
  titleText: string;
  bodyText: string;
  colorStops: string[];
}

export default function AdminDashboardPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch guests from Firestore persons collection
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const guestsCol = collection(db, "persons");
        const guestsSnapshot = await getDocs(guestsCol);
        const guestsData = guestsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: Number(doc.id),
            name: data.name || "",
            group: data.group || [],
          } as Guest;
        });
        setGuests(guestsData);
      } catch (error) {
        console.error("Error fetching guests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  // Fetch cards from Firestore cards collection
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsCol = collection(db, "cards");
        const cardsSnapshot = await getDocs(cardsCol);
        const cardsData = cardsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            titleText: data.titleText || "",
            bodyText: data.bodyText || "",
            colorStops: data.colorStops || [],
          } as Card;
        });
        setCards(cardsData);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <a href="/admin/logout" className="text-primary-800 hover:underline">
              Logout
            </a>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Guest List */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Guest List</h2>
              <ul className="space-y-2">
                {guests.map((guest) => (
                  <li key={guest.id} className="p-3 bg-white rounded-md shadow-sm">
                    {guest.name} ({guest.group.join(", ")})
                  </li>
                ))}
                {guests.length === 0 && <li className="text-neutral-500">No guests found</li>}
              </ul>
            </div>

            {/* Card List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Card List</h2>
              <ul className="space-y-2">
                {cards.map((card) => (
                  <li key={card.id} className="p-3 bg-white rounded-md shadow-sm">
                    <p className="font-medium">{card.name}</p>
                    <p className="text-sm text-neutral-500">Title: {card.titleText}</p>
                  </li>
                ))}
                {cards.length === 0 && <li className="text-neutral-500">No cards found</li>}
              </ul>
            </div>

            {/* Card Editor */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Card Editor</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Card Name</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded-md"
                    placeholder="e.g., aurora-birthday"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Title Text</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded-md"
                    placeholder="e.g., ¡Feliz cumple!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Body Text</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded-md"
                    placeholder="e.g., Únete a la celebración"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Color Stops</label>
                  <input
                    type="text"
                    className="mt-1 p-2 border rounded-md"
                    placeholder="e.g., #6366F1,#F97316,#FFEAA7"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 bg-primary-700 text-white rounded-md hover:bg-primary-800"
                >
                  Save Card
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}