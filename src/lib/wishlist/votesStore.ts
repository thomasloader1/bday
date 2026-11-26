import { z } from "zod";
import { readConfig } from "@/lib/config/store";
import type { AppConfig, GiftConfig } from "@/lib/config/schema";
import { readStoreString, writeStoreString } from "@/lib/kvStore";

/**
 * Server-only persistence for wishlist group-gift votes ("vaquita").
 * Uses Cloudflare KV (`BDAY_KV`) when bound, with an in-memory fallback.
 * Stored under its own key so guest votes never conflict with dashboard config versions.
 */

const VOTES_KV_KEY = "bday:wishlist-votes";

const VotesFileSchema = z.object({
  version: z.literal(1),
  /** Map of normalized gift key -> unique array of invited guest phone IDs. */
  votes: z.record(z.string(), z.array(z.number().int())),
});

type VotesFile = z.infer<typeof VotesFileSchema>;

let queue: Promise<unknown> = Promise.resolve();

const serialise = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

/** Stable key for a gift so reordering gifts in the dashboard preserves votes. */
export const giftKeyFor = (gift: Pick<GiftConfig, "name">): string =>
  gift.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "regalo";

const firstNameOf = (fullName: string): string => {
  const trimmed = fullName.trim();
  const [first] = trimmed.split(/\s+/);
  return first || trimmed;
};

async function readVotesFile(): Promise<VotesFile> {
  const rawText = await readStoreString(VOTES_KV_KEY);
  if (!rawText) {
    return { version: 1, votes: {} };
  }
  return VotesFileSchema.parse(JSON.parse(rawText));
}

async function writeVotesFile(data: VotesFile): Promise<void> {
  await writeStoreString(VOTES_KV_KEY, JSON.stringify(data));
}

export interface GiftVoteSummary {
  key: string;
  count: number;
  voters: string[];
  voted: boolean;
}

export interface WishlistVotesSnapshot {
  gifts: Record<string, GiftVoteSummary>;
  totalVotes: number;
  totalParticipants: number;
  guest: { name: string } | null;
}

export function buildVotesSnapshot(
  config: AppConfig,
  votesFile: VotesFile,
  guestId: number | null
): WishlistVotesSnapshot {
  const guestById = new Map(config.guests.map((g) => [g.id, g]));
  const identifiedGuest = guestId !== null ? guestById.get(guestId) ?? null : null;

  const giftsSummary: Record<string, GiftVoteSummary> = {};
  const uniqueParticipants = new Set<number>();
  let totalVotes = 0;

  for (const gift of config.gifts) {
    const key = giftKeyFor(gift);
    const rawIds = votesFile.votes[key] ?? [];
    // Only count votes from guests who are currently on the invite list.
    const validIds = Array.from(new Set(rawIds)).filter((id) => guestById.has(id));
    validIds.forEach((id) => uniqueParticipants.add(id));
    totalVotes += validIds.length;

    giftsSummary[key] = {
      key,
      count: validIds.length,
      voters: validIds.map((id) => firstNameOf(guestById.get(id)!.name)),
      voted: identifiedGuest !== null && validIds.includes(identifiedGuest.id),
    };
  }

  return {
    gifts: giftsSummary,
    totalVotes,
    totalParticipants: uniqueParticipants.size,
    guest: identifiedGuest ? { name: identifiedGuest.name } : null,
  };
}

export const getWishlistVotes = (guestId: number | null): Promise<WishlistVotesSnapshot> =>
  serialise(async () => {
    const [config, votesFile] = await Promise.all([readConfig(), readVotesFile()]);
    return buildVotesSnapshot(config, votesFile, guestId);
  });

export class VoteError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export const toggleWishlistVote = (
  guestId: number,
  giftKey: string
): Promise<WishlistVotesSnapshot> =>
  serialise(async () => {
    const [config, votesFile] = await Promise.all([readConfig(), readVotesFile()]);
    const guest = config.guests.find((g) => g.id === guestId);
    if (!guest) {
      throw new VoteError("Ese número no está en la lista de invitados.", 403);
    }

    const validKeys = new Set(config.gifts.map((g) => giftKeyFor(g)));
    if (!validKeys.has(giftKey)) {
      throw new VoteError("Ese regalo ya no está en la lista.", 404);
    }

    const current = new Set(votesFile.votes[giftKey] ?? []);
    if (current.has(guest.id)) {
      current.delete(guest.id);
    } else {
      current.add(guest.id);
    }

    const next: VotesFile = {
      version: 1,
      votes: {
        ...votesFile.votes,
        [giftKey]: Array.from(current),
      },
    };

    await writeVotesFile(next);
    return buildVotesSnapshot(config, next, guest.id);
  });
