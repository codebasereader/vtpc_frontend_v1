// The site is served under /kalaloka on the VTPC domain. next/image does not add
// the base path to plain /public files when images are unoptimized, so every
// public-folder URL is built through this helper.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return `${BASE_PATH}${path}`;
}
