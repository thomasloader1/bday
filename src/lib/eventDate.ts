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

const DAY_MS = 24 * 60 * 60 * 1000;
/** How long after the party moment the new age is celebrated (confetti, number fully in). */
export const CELEBRATION_MS = DAY_MS;
/** The next age starts rising this many days before the party (spread over a whole year it would barely move). */
export const RISE_DAYS = 60;
/** How many days before the party invitations open (and the demo link hides). */
export const INVITATION_WINDOW_DAYS = 60;

/**
 * True from INVITATION_WINDOW_DAYS before `eventDate` until the party moment.
 * Once the birthday passes (and `eventDate` rolls to next year), returns false
 * until 60 days before the next birthday.
 */
export const isInvitationWindow = (eventDate: Date, now: Date = new Date()): boolean => {
  const remaining = eventDate.getTime() - now.getTime();
  return remaining > 0 && remaining <= INVITATION_WINDOW_DAYS * DAY_MS;
};

export interface AgeProgress {
  /** The age being left behind (e.g. 32). */
  from: number;
  /** The age being reached (e.g. 33). */
  to: number;
  /** 0 until RISE_DAYS before the party, 1 on the day: how far `to` has risen into place. */
  progress: number;
  /** True during the CELEBRATION_MS after the party moment. */
  celebrating: boolean;
}

/**
 * Where the year stands between two birthdays. During the celebration window
 * the number just turned is shown in full; after it the next one starts rising.
 */
export const getAgeProgress = (party: PartyWhen & Pick<PartyConfig, "birthYear">, now: Date = new Date()): AgeProgress => {
  const next = getNextBirthday(party, now);
  const last = new Date(next);
  last.setFullYear(next.getFullYear() - 1);
  const sinceLast = now.getTime() - last.getTime();

  if (sinceLast < CELEBRATION_MS) {
    const age = getTurningAge(party, last);
    return { from: age - 1, to: age, progress: 1, celebrating: true };
  }

  const to = getTurningAge(party, next);
  const progress = Math.min(1, Math.max(0, 1 - (next.getTime() - now.getTime()) / (RISE_DAYS * DAY_MS)));
  return { from: to - 1, to, progress, celebrating: false };
};

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
