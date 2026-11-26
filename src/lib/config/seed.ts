import guestsJson from "@/data/guests.json";
import familyJson from "@/data/__familyInvitation.json";
import workJson from "@/data/__workInvitation.json";
import giftsJson from "@/data/__gifts.json";
import type { AppConfig } from "./schema";
import { migrateConfig } from "./migrate";

/**
 * The first config.json, built from what the app shipped with before the
 * dashboard existed (the JSON files in src/data and the texts that lived in
 * the components). Only used when the config file does not exist yet.
 */

type LegacyGuest = {
  id: number;
  name: string;
  group: string[];
  lunch?: { _lat: number; _long: number };
  after?: { _lat: number; _long: number };
};

const legacyGuests = (guestsJson as { persons: LegacyGuest[] }).persons;
const firstWith = (key: "lunch" | "after") => legacyGuests.find((g) => g[key])?.[key];
const toLocation = (point?: { _lat: number; _long: number }) =>
  point ? { lat: point._lat, lng: point._long } : null;

const KNOWN_GROUPS = new Set(["friends", "family", "work"]);

/** Built in the pre-events shape and upgraded by the same migration an old config.json goes through. */
export const buildSeedConfig = (): AppConfig => migrateConfig({
  version: 1,
  party: {
    month: 12,
    day: 16,
    hour: 20,
    minute: 0,
    birthYear: 1993,
    homeTitle: "¡Hola posible invitado!",
    homeLead: "Ingresa tu número de teléfono y podrás ver la invitación al cumpleaños.",
    closedLead: "Aún no están disponibles las entradas de este año",
    footerLine: "¡El regalo es tu presencia misma!",
  },
  letter: {
    paragraphs: [
      "La cuenta regresiva ha comenzado y estoy emocionado de invitarte a mi fiesta de cumpleaños.",
      "Este año, quiero compartir mi día especial contigo en un ambiente lleno de alegría y risas.",
      "Tu presencia hará que esta celebración sea aún más significativa.",
      "¡Espero que puedas unirte a mí para festejar juntos!",
      "¡Hagamos que mi cumpleaños sea inolvidable!",
    ],
  },
  personal: {
    title: "Invitación Personal",
    paragraphs: [
      "Honestamente, no tengo ni idea de qué hacer.",
      "Simplemente quiero pasar el día contigo y ver qué onda, dentro de las posibilidades que tengamos.",
    ],
    ps: "PD: Seguramente pidamos pizza",
    requirements: [
      { name: "Vestimenta", description: "Sport" },
      { name: "Horario", description: "20hs a 00hs" },
    ],
  },
  events: {
    family: {
      title: familyJson.title,
      description: familyJson.description,
      date: "2026-12-16",
      time: "13:00",
      food: familyJson.food ?? [],
      location: toLocation(firstWith("lunch")),
    },
    work: {
      title: workJson.title,
      description: workJson.description,
      date: "2026-12-21",
      time: "18:00",
      food: [],
      location: toLocation(firstWith("after")),
    },
  },
  guests: legacyGuests.map((g) => ({
    id: g.id,
    name: g.name,
    group: g.group.filter((group) => KNOWN_GROUPS.has(group)),
  })),
  gifts: giftsJson.gifts,
}).config as AppConfig;
