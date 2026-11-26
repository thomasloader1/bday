import { z } from "zod";

/**
 * The app's editable content, stored as one JSON file (see store.ts) and
 * edited from /admin/dashboard. Everything a guest sees comes from here,
 * except confirmations, which stay in Firestore.
 *
 * Events are assigned to groups, plus per-guest exceptions (include /
 * exclude), and can be hidden. Which events a guest sees is decided on the
 * server (visibility.ts); the public config never carries events or guests.
 */

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha con formato AAAA-MM-DD");
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora con formato HH:MM");
const nonEmpty = (label: string) => z.string().trim().min(1, `${label} no puede estar vacío`);
const idString = z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Identificador inválido");

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  /** Optional original Google Maps URL (opens the exact place when clicked). */
  url: z.string().url("El link de Google Maps debe ser una URL válida").optional(),
});

export const PartySchema = z.object({
  /** The birthday recurs every year on month/day at hour:minute (device-local time). */
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  birthYear: z.number().int().min(1900).max(2100),
  homeTitle: nonEmpty("El título de la home"),
  homeLead: nonEmpty("La frase de la home"),
  closedLead: nonEmpty("El texto de invitaciones cerradas"),
  footerLine: nonEmpty("La frase del pie"),
});

export const RequirementSchema = z.object({
  name: nonEmpty("El nombre del requisito"),
  description: nonEmpty("El valor del requisito"),
});

export const GroupSchema = z.object({
  id: idString,
  name: nonEmpty("El nombre del grupo"),
});

export const EventSchema = z.object({
  id: idString,
  /** Hidden events are seen by nobody. */
  published: z.boolean(),
  title: nonEmpty("El título del evento"),
  /** Paragraphs of the card. */
  paragraphs: z.array(nonEmpty("Un párrafo del evento")).min(1, "El evento necesita al menos un párrafo"),
  ps: z.string(),
  /** Empty date means "the birthday" (party date and time). */
  date: dateString.nullable(),
  time: timeString.nullable(),
  food: z.array(nonEmpty("Una comida")),
  requirements: z.array(RequirementSchema),
  location: LocationSchema.nullable(),
  /** Who sees it: these groups, plus `include`, minus `exclude` (guest phone numbers). */
  groups: z.array(idString),
  include: z.array(z.number().int()),
  exclude: z.array(z.number().int()),
});

export const GuestSchema = z.object({
  id: z.number().int().min(10_000_000, "El teléfono debe tener al menos 8 dígitos").max(9_999_999_999_999),
  name: nonEmpty("El nombre del invitado"),
  /** Group ids (see `groups`). */
  group: z.array(idString),
});

export const GiftSchema = z.object({
  name: nonEmpty("El nombre del regalo"),
  image: z.string().url("La imagen debe ser una URL"),
  link: z.string().url("El link debe ser una URL"),
});

export const ConfigSchema = z
  .object({
    version: z.number().int().nonnegative(),
    party: PartySchema,
    letter: z.object({ paragraphs: z.array(nonEmpty("Un párrafo de la carta")).min(1) }),
    groups: z.array(GroupSchema),
    events: z.array(EventSchema),
    guests: z.array(GuestSchema),
    gifts: z.array(GiftSchema),
  })
  .superRefine((config, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    const groupIds = new Set<string>();
    config.groups.forEach((group, i) => {
      if (groupIds.has(group.id)) issue(["groups", i, "id"], `El grupo "${group.name}" está repetido`);
      groupIds.add(group.id);
    });

    const guestIds = new Set<number>();
    config.guests.forEach((guest, i) => {
      if (guestIds.has(guest.id)) issue(["guests", i, "id"], `El teléfono ${guest.id} está repetido`);
      guestIds.add(guest.id);
      guest.group.forEach((g) => {
        if (!groupIds.has(g)) issue(["guests", i, "group"], `${guest.name} está en un grupo que no existe (${g})`);
      });
    });

    const eventIds = new Set<string>();
    config.events.forEach((event, i) => {
      if (eventIds.has(event.id)) issue(["events", i, "id"], `El evento "${event.title}" tiene un id repetido`);
      eventIds.add(event.id);
      if ((event.date === null) !== (event.time === null)) {
        issue(["events", i, "date"], `"${event.title}": completá fecha y hora, o dejá ambas vacías para usar la del cumpleaños`);
      }
      event.groups.forEach((g) => {
        if (!groupIds.has(g)) issue(["events", i, "groups"], `"${event.title}" apunta a un grupo que no existe (${g})`);
      });
      [...event.include, ...event.exclude].forEach((id) => {
        if (!guestIds.has(id)) issue(["events", i, "include"], `"${event.title}" menciona un invitado que no existe (${id})`);
      });
    });
  });

export type AppConfig = z.infer<typeof ConfigSchema>;
export type PartyConfig = z.infer<typeof PartySchema>;
export type EventConfig = z.infer<typeof EventSchema>;
export type GroupConfig = z.infer<typeof GroupSchema>;
export type GuestConfig = z.infer<typeof GuestSchema>;
export type GiftConfig = z.infer<typeof GiftSchema>;

/** An event as a guest receives it: no targeting data. */
export type GuestEvent = Omit<EventConfig, "published" | "groups" | "include" | "exclude">;

/** What the browser of any visitor receives: no guests, no events, no groups. */
export type PublicConfig = Omit<AppConfig, "guests" | "events" | "groups">;

export const toPublicConfig = ({ guests: _g, events: _e, groups: _gr, ...rest }: AppConfig): PublicConfig => rest;

/** A url-safe id from a name, unique against `taken`. */
export const slugId = (name: string, taken: Iterable<string>): string => {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "item";
  const used = new Set(taken);
  let id = base;
  for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
  return id;
};
