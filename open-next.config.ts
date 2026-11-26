import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext adapter config for Cloudflare Workers (`npm run cf:build`).
// Defaults: no incremental cache backend — the app renders per request and keeps its
// own data in the BDAY_KV binding (see src/lib/kvStore.ts).
export default defineCloudflareConfig();
