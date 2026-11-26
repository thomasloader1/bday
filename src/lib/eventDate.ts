import type { PartyConfig } from "@/lib/config/schema";

type PartyWhen = Pick<PartyConfig, "month" | "day" | "hour" | "minute">;

/**
 * Next party occurrence strictly after `now`, computed in device-local time.
 * The birthday recurs every year, so once it passes the next one is used and
 * the age moves on with it.
 */
export const getNextBirthday = (party: PartyWhen, now: Date = new Date()): Date => {
  const at = (year: number) => new Date(year, party.month - 1, party.day, party.hour, party.minute, 0, 0);
  const thisYear = at(now.getFullYear());
  return thisYear > now ? thisYear : at(now.getFullYear() + 1);
};

/** The age turned at the given party date. */
export const getTurningAge = (party: Pick<PartyConfig, "birthYear">, eventDate: Date): number =>
  eventDate.getFullYear() - party.birthYear;

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "Hasta el 16 de diciembre a las 20 h" (built from the fields, so server and client print the same). */
export const formatPartyLine = (party: PartyWhen): string =>
  `Hasta el ${party.day} de ${MONTHS[party.month - 1]} a las ${party.hour}${party.minute ? `:${String(party.minute).padStart(2, "0")}` : ""} h`;

/** A local Date from an event's "AAAA-MM-DD" and "HH:MM". */
export const eventDateTime = (date: string, time: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};
