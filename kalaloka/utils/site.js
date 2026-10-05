export const SITE_NAME = "Kala Loka";
export const SITE_TAGLINE = "Treasures of Karnataka";
export const SITE_DESCRIPTION =
  "A living catalog of Karnataka's finest GI-tagged treasures. Six legacy government brands of coffee, handicrafts, silk, sandalwood, handlooms and leather.";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
