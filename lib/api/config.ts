/**
 * Base URL of my-portfolio-backend, including the version prefix (e.g. http://localhost:5000/api/v1).
 * Inlined at build time because of the NEXT_PUBLIC_ prefix; it is not a secret.
 * Empty means "no backend configured": the public site then renders the static /data content.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/**
 * Server-side override for the same API (e.g. an internal network URL), never sent to browsers.
 * Falls back to NEXT_PUBLIC_API_URL. A relative NEXT_PUBLIC_API_URL ("/api/v1", proxy mode) needs it.
 */
export const SERVER_API_URL = (process.env.API_URL ?? "").replace(/\/+$/, "") || (/^https?:\/\//.test(API_URL) ? API_URL : "");
