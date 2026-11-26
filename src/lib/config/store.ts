import { promises as fs } from "fs";
import path from "path";
import { AppConfig, ConfigSchema } from "./schema";
import { buildSeedConfig } from "./seed";
import { migrateConfig } from "./migrate";

/**
 * Server-only persistence for the app config: one JSON file, by default
 * <cwd>/data/config.json (a Docker volume in production, ./data in dev).
 * Writes are validated, version-checked and atomic (temp file + rename), and
 * serialised inside the process so two saves never interleave.
 */

export const CONFIG_PATH = process.env.CONFIG_PATH || path.join(process.cwd(), "data", "config.json");

export class VersionConflictError extends Error {
  constructor(public readonly current: number) {
    super(`Config changed since it was loaded (now at version ${current})`);
  }
}

let cache: { mtimeMs: number; config: AppConfig } | null = null;
let queue: Promise<unknown> = Promise.resolve();

const serialise = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

async function writeAtomic(config: AppConfig): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  const tmp = `${CONFIG_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(config, null, 2) + "\n", "utf8");
  await fs.rename(tmp, CONFIG_PATH);
  cache = null;
}

async function readFromDisk(): Promise<AppConfig> {
  try {
    const stat = await fs.stat(CONFIG_PATH);
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.config;
    const { config: raw, migrated } = migrateConfig(JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")));
    const config = ConfigSchema.parse(raw);
    if (migrated) {
      // Older file (fixed personal/family/work cards): store it once in the current shape.
      await writeAtomic(config);
      return config;
    }
    cache = { mtimeMs: stat.mtimeMs, config };
    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    // First run: create the file from what the app shipped with.
    const seed = ConfigSchema.parse(buildSeedConfig());
    await writeAtomic(seed);
    return seed;
  }
}

export const readConfig = (): Promise<AppConfig> => serialise(readFromDisk);

/**
 * Replaces the whole config. `expectedVersion` is the version the editor
 * loaded; if someone saved in between, nothing is written and a
 * VersionConflictError is thrown. Throws a ZodError on invalid input.
 */
export const writeConfig = (next: unknown, expectedVersion: number): Promise<AppConfig> =>
  serialise(async () => {
    const current = await readFromDisk();
    if (current.version !== expectedVersion) throw new VersionConflictError(current.version);
    const validated = ConfigSchema.parse({ ...(next as object), version: current.version + 1 });
    await writeAtomic(validated);
    return validated;
  });
