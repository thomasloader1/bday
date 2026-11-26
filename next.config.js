/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is used by the Docker runner image; Cloudflare Pages uses the standard build.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
}

module.exports = nextConfig
