// Runs before `npm run build` (npm "prebuild" hook).
//
// Docker and `next dev` run every route on the Node runtime (the config is a file on disk).
// Cloudflare Pages (next-on-pages) requires the Edge runtime on every dynamic route, and
// `export const runtime` must be a literal Next reads statically, so it cannot depend on an
// env var at runtime. On a Cloudflare build (CF_PAGES=1, set by Pages; or
// BUILD_TARGET=cloudflare) this rewrites those literals to "edge" in the build checkout.
// It never runs that rewrite anywhere else, so local files stay on "nodejs".
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const isCloudflare = process.env.CF_PAGES === "1" || process.env.BUILD_TARGET === "cloudflare";
if (!isCloudflare) process.exit(0);

const RUNTIME = /export const runtime = (["'])nodejs\1;/g;
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(tsx?|jsx?)$/.test(name) ? [full] : [];
  });

let changed = 0;
for (const file of walk("src/app")) {
  const source = readFileSync(file, "utf8");
  const next = source.replace(RUNTIME, 'export const runtime = "edge";');
  if (next !== source) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`[prebuild] Cloudflare build: ${changed} route files switched to the Edge runtime.`);
