import { getRequestContext } from "@cloudflare/next-on-pages";
import { readFileValue, writeFileValue } from "@/lib/storage/fileStore";

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

/** KV on Cloudflare; otherwise JSON files on disk (Docker, dev) or memory (Cloudflare without KV). */
export async function readStoreString(key: string): Promise<string | null> {
  const kv = getCloudflareKv();
  if (kv) {
    return kv.get(key);
  }
  return readFileValue(key);
}

export async function writeStoreString(key: string, value: string): Promise<void> {
  const kv = getCloudflareKv();
  if (kv) {
    await kv.put(key, value);
    return;
  }
  await writeFileValue(key, value);
}
