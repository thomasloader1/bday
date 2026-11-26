import { AppConfig, ConfigSchema } from "./schema";
import { buildSeedConfig } from "./seed";
import { migrateConfig } from "./migrate";
import { readStoreString, writeStoreString } from "@/lib/kvStore";

/**
 * Server-only persistence for the app config.
 * Uses Cloudflare KV (`BDAY_KV` binding) when deployed on Cloudflare Pages,
 * falling back to an in-memory store seeded from buildSeedConfig() otherwise.
 * Edge-runtime compatible (no Node `fs` imports).
 */

const CONFIG_KV_KEY = "bday:config";

export class VersionConflictError extends Error {
  constructor(public readonly current: number) {
    super(`Config changed since it was loaded (now at version ${current})`);
  }
}

let queue: Promise<unknown> = Promise.resolve();

const serialise = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

async function readCurrent(): Promise<AppConfig> {
  const rawText = await readStoreString(CONFIG_KV_KEY);
  if (rawText) {
    const { config: raw, migrated } = migrateConfig(JSON.parse(rawText));
    const config = ConfigSchema.parse(raw);
    if (migrated) {
      await writeStoreString(CONFIG_KV_KEY, JSON.stringify(config));
    }
    return config;
  }

  // First run: seed from the defaults bundled with the app.
  const seed = ConfigSchema.parse(buildSeedConfig());
  await writeStoreString(CONFIG_KV_KEY, JSON.stringify(seed));
  return seed;
}

export const readConfig = (): Promise<AppConfig> => serialise(readCurrent);

/**
 * Replaces the whole config. `expectedVersion` is the version the editor
 * loaded; if someone saved in between, nothing is written and a
 * VersionConflictError is thrown. Throws a ZodError on invalid input.
 */
export const writeConfig = (next: unknown, expectedVersion: number): Promise<AppConfig> =>
  serialise(async () => {
    const current = await readCurrent();
    if (current.version !== expectedVersion) throw new VersionConflictError(current.version);
    const validated = ConfigSchema.parse({ ...(next as object), version: current.version + 1 });
    await writeStoreString(CONFIG_KV_KEY, JSON.stringify(validated));
    return validated;
  });
