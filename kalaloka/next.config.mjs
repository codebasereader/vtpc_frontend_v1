// Kala Loka is served as plain static files under /kalaloka on the VTPC domain
// (see ../scripts/buildKalaloka.mjs), so there is no Node server in production.
import path from "node:path";
import { fileURLToPath } from "node:url";

const basePath = "/kalaloka";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  poweredByHeader: false,
  // The image optimiser needs a server. Images are pre-optimised instead
  // (scripts/optimizeKalalokaImages.mjs) and prefixed through components/AppImage.js.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // This folder sits inside the main app's repo, which has its own lockfile; pin the root here.
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
