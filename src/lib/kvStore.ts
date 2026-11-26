import { promises as fs } from "fs";
import path from "path";
import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Minimal KV interface matching Cloudflare Workers KVNamespace.
 */
interface KvLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/**
 * Returns the Cloudflare KV binding (`BDAY_KV`) when running on Cloudflare Pages
 * with a KV namespace attached; returns null in local dev / Docker / build.
 */
function getCloudflareKv(): KvLike | null {
  try {
    const ctx = getRequestContext();
    const env = ctx?.env as Record<string, unknown> | undefined;
    const binding = env?.BDAY_KV as KvLike | undefined;
    if (binding && typeof binding.get === "function" && typeof binding.put === "function") {
      return binding;
    }
  } catch {
    // Not running inside a Cloudflare Pages request context (e.g. Docker / next dev / build).
  }
  return null;
}

/**
 * Without KV, each key lives in a JSON file under <cwd>/data (a Docker volume
 * in production, ./data in dev), so dashboard edits survive restarts.
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

async function readFile(key: string): Promise<string | null> {
  try {
    return await fs.readFile(filePathFor(key), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Atomic write: temp file + rename, so a crash never leaves half a JSON file. */
async function writeFile(key: string, value: string): Promise<void> {
  const target = filePathFor(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  // Pretty-printed like the files the app wrote before, so they stay readable by hand.
  await fs.writeFile(tmp, JSON.stringify(JSON.parse(value), null, 2) + "\n", "utf8");
  await fs.rename(tmp, target);
}

export async function readStoreString(key: string): Promise<string | null> {
  const kv = getCloudflareKv();
  if (kv) {
    return kv.get(key);
  }
  return readFile(key);
}

export async function writeStoreString(key: string, value: string): Promise<void> {
  const kv = getCloudflareKv();
  if (kv) {
    await kv.put(key, value);
    return;
  }
  await writeFile(key, value);
}
