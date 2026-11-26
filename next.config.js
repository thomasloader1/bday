const path = require("path");

// Set by `npm run cf:build` (OpenNext) and by Cloudflare Workers Builds (WORKERS_CI=1).
const isCloudflare = process.env.BUILD_TARGET === "cloudflare" || process.env.WORKERS_CI === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is used by the Docker runner image; the OpenNext Cloudflare build sets its own output.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  webpack(config, { webpack }) {
    if (isCloudflare) {
      // A Worker has no persistent file system: swap the disk store for its in-memory stand-in
      // (Cloudflare keeps the data in the BDAY_KV binding; see src/lib/kvStore.ts).
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /lib[\\/]storage[\\/]fileStore$/,
          path.resolve(__dirname, "src/lib/storage/fileStore.edge.ts")
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
