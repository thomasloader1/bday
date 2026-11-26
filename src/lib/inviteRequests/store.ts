import { randomUUID } from "crypto";
import { z } from "zod";
import { readConfig, writeConfig } from "@/lib/config/store";
import type { AppConfig } from "@/lib/config/schema";
import { readStoreString, writeStoreString } from "@/lib/kvStore";

/**
 * Server-only persistence for invitation requests: someone whose number is not on the
 * list asks for an invitation from the "oops" page, and the admin approves it (adding
 * a guest, or linking the number to a guest already on the list) or rejects it.
 * Kept under its own key so requests never bump the dashboard config version.
 */

const REQUESTS_KEY = "bday:invite-requests";
/** Stops a flood of requests from filling the store; the admin clears them by resolving. */
const MAX_PENDING = 100;

export const PhoneSchema = z.number().int().min(10_000_000).max(9_999_999_999_999);

const RequestSchema = z.object({
  id: z.string(),
  phone: PhoneSchema,
  name: z.string(),
  message: z.string(),
  createdAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  resolvedAt: z.string().nullable(),
  /** The guest the number ended up on, when approved. */
  guestName: z.string().nullable(),
});

const RequestsFileSchema = z.object({
  version: z.literal(1),
  requests: z.array(RequestSchema),
});

export type InviteRequest = z.infer<typeof RequestSchema>;
type RequestsFile = z.infer<typeof RequestsFileSchema>;

export class InviteRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

let queue: Promise<unknown> = Promise.resolve();
const serialise = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

async function readFile(): Promise<RequestsFile> {
  const raw = await readStoreString(REQUESTS_KEY);
  return raw ? RequestsFileSchema.parse(JSON.parse(raw)) : { version: 1, requests: [] };
}

const writeFile = (data: RequestsFile) => writeStoreString(REQUESTS_KEY, JSON.stringify(data));

/** Newest first. */
export const listInviteRequests = (): Promise<InviteRequest[]> =>
  serialise(async () => (await readFile()).requests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

/** A visitor asks for an invitation. A second request for the same number replaces the pending one. */
export const createInviteRequest = (input: { phone: number; name: string; message: string }): Promise<InviteRequest> =>
  serialise(async () => {
    const config = await readConfig();
    if (config.guests.some((g) => g.id === input.phone)) {
      throw new InviteRequestError("Ese número ya tiene invitación: buscalo desde el inicio.", 409);
    }

    const file = await readFile();
    const existing = file.requests.find((r) => r.phone === input.phone && r.status === "pending");
    if (existing) {
      existing.name = input.name;
      existing.message = input.message;
      await writeFile(file);
      return existing;
    }
    if (file.requests.filter((r) => r.status === "pending").length >= MAX_PENDING) {
      throw new InviteRequestError("Hay demasiadas solicitudes pendientes. Probá más tarde o escribime por WhatsApp.", 429);
    }

    const request: InviteRequest = {
      id: randomUUID(),
      phone: input.phone,
      name: input.name,
      message: input.message,
      createdAt: new Date().toISOString(),
      status: "pending",
      resolvedAt: null,
      guestName: null,
    };
    file.requests.push(request);
    await writeFile(file);
    return request;
  });

export type Resolution =
  | { action: "approve"; mode: "new"; name: string; groups: string[] }
  | { action: "approve"; mode: "link"; guestId: number }
  | { action: "reject" };

/** Moves every mention of a guest's number in the config to a new number. */
const relinkGuest = (config: AppConfig, from: number, to: number): AppConfig => {
  const swap = (ids: number[]) => ids.map((id) => (id === from ? to : id));
  return {
    ...config,
    guests: config.guests.map((g) => (g.id === from ? { ...g, id: to } : g)),
    events: config.events.map((e) => ({ ...e, include: swap(e.include), exclude: swap(e.exclude) })),
  };
};

/**
 * Approve (writes the dashboard config: a new guest, or the number linked to an existing one)
 * or reject a pending request. Config validation errors (ZodError) and version conflicts
 * propagate to the caller.
 */
export const resolveInviteRequest = (id: string, resolution: Resolution): Promise<InviteRequest> =>
  serialise(async () => {
    const file = await readFile();
    const request = file.requests.find((r) => r.id === id);
    if (!request) throw new InviteRequestError("La solicitud no existe.", 404);
    if (request.status !== "pending") throw new InviteRequestError("La solicitud ya fue resuelta.", 409);

    let guestName: string | null = null;
    if (resolution.action === "approve") {
      const config = await readConfig();
      if (config.guests.some((g) => g.id === request.phone)) {
        throw new InviteRequestError(`El número ${request.phone} ya es de otro invitado.`, 409);
      }
      let next: AppConfig;
      if (resolution.mode === "new") {
        guestName = resolution.name.trim() || request.name;
        next = { ...config, guests: [...config.guests, { id: request.phone, name: guestName, group: resolution.groups }] };
      } else {
        const guest = config.guests.find((g) => g.id === resolution.guestId);
        if (!guest) throw new InviteRequestError("Ese invitado ya no existe.", 404);
        guestName = guest.name;
        next = relinkGuest(config, guest.id, request.phone);
      }
      await writeConfig(next, config.version);
    }

    request.status = resolution.action === "approve" ? "approved" : "rejected";
    request.resolvedAt = new Date().toISOString();
    request.guestName = guestName;
    await writeFile(file);
    return request;
  });
