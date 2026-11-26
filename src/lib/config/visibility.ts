import type { AppConfig, EventConfig, GuestConfig, GuestEvent } from "./schema";

/**
 * Whether a guest sees an event: it is published, the guest is not excluded,
 * and either belongs to one of its groups or is explicitly included.
 * Server-side only: hidden or someone else's events never reach a browser.
 */
export const canSee = (event: EventConfig, guest: GuestConfig): boolean =>
  event.published &&
  !event.exclude.includes(guest.id) &&
  (event.include.includes(guest.id) || event.groups.some((g) => guest.group.includes(g)));

const toGuestEvent = ({ published: _p, groups: _g, include: _i, exclude: _e, ...rest }: EventConfig): GuestEvent => rest;

/** The events this guest sees, in the dashboard's order, without targeting data. */
export const visibleEventsFor = (config: AppConfig, guest: GuestConfig): GuestEvent[] =>
  config.events.filter((event) => canSee(event, guest)).map(toGuestEvent);

/** Guests who see an event (for the dashboard's "lo ven N invitados"). */
export const audienceOf = (config: Pick<AppConfig, "guests">, event: EventConfig): GuestConfig[] =>
  config.guests.filter((guest) => canSee(event, guest));
