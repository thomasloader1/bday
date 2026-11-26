const path = require("path");

const isCloudflare = process.env.CF_PAGES === "1" || process.env.BUILD_TARGET === "cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is used by the Docker runner image; Cloudflare Pages uses the standard build.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  webpack(config, { webpack }) {
    if (isCloudflare) {
      // The Edge runtime has no file system: swap the disk store for its in-memory stand-in
      // (Cloudflare keeps the data in the BDAY_KV binding). See scripts/prebuild.mjs for the runtime switch.
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
