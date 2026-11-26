/**
 * In-memory stand-in for fileStore.ts, swapped in by next.config.js for the Cloudflare build
 * (a Worker has no persistent file system). On Cloudflare the data lives in the BDAY_KV
 * binding; this only runs when that binding is missing, and keeps values in memory
 * for the life of the isolate (lost on restart, as on a preview without KV).
 */

const globalForStore = globalThis as unknown as { __bdayMemoryKv?: Map<string, string> };
const memory: Map<string, string> = globalForStore.__bdayMemoryKv ?? (globalForStore.__bdayMemoryKv = new Map());

export async function readFileValue(key: string): Promise<string | null> {
  return memory.get(key) ?? null;
}

export async function writeFileValue(key: string, value: string): Promise<void> {
  memory.set(key, value);
}
