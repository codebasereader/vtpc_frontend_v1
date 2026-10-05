// The localhost fallback is for `npm run dev` only; production builds must set
// VITE_API_BASE_URL (vite.config.js refuses to build without it).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:4200' : '')
