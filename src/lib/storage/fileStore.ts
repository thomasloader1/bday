import { promises as fs } from "fs";
import path from "path";

/**
 * Storage on disk, used when there is no Cloudflare KV (Docker, next dev): each key is a
 * JSON file under <cwd>/data (a Docker volume in production, ./data in dev), so dashboard
 * edits survive restarts. The Cloudflare build swaps this module for fileStore.edge.ts
 * (see next.config.js), since the Edge runtime has no file system.
 */

const CONFIG_PATH = process.env.CONFIG_PATH || path.join(process.cwd(), "data", "config.json");
const FILE_PATHS: Record<string, string> = {
  "bday:config": CONFIG_PATH,
  "bday:wishlist-votes":
    process.env.WISHLIST_VOTES_PATH || path.join(path.dirname(CONFIG_PATH), "wishlist-votes.json"),
  "bday:invite-requests": path.join(path.dirname(CONFIG_PATH), "invite-requests.json"),
};

const filePathFor = (key: string): string =>
  FILE_PATHS[key] ?? path.join(path.dirname(CONFIG_PATH), `${key.replace(/[^a-z0-9-]/gi, "_")}.json`);

export async function readFileValue(key: string): Promise<string | null> {
  try {
    return await fs.readFile(filePathFor(key), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Atomic write: temp file + rename, so a crash never leaves half a JSON file. */
export async function writeFileValue(key: string, value: string): Promise<void> {
  const target = filePathFor(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  // Pretty-printed like the files the app wrote before, so they stay readable by hand.
  await fs.writeFile(tmp, JSON.stringify(JSON.parse(value), null, 2) + "\n", "utf8");
  await fs.rename(tmp, target);
}
