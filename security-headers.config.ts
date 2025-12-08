/**
 * Master Security Headers Configuration
 *
 * This file defines all security headers in a centralized location.
 * These headers are used across:
 * - public/_headers (Cloudflare Pages)
 * - firebase.json (Firebase Hosting)
 * - vite.config.ts (Local preview server)
 *
 * DO NOT modify headers in individual files - update this master config instead.
 */

export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Embedder-Policy": "credentialless",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "img-src 'self' data: https://www.googletagmanager.com; " +
    "script-src 'self' https://s.pageclip.co https://www.googletagmanager.com https://challenges.cloudflare.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://s.pageclip.co; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://send.pageclip.co https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://data.kiya.cat; " +
    "frame-src 'self' https://challenges.cloudflare.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://send.pageclip.co; " +
    "frame-ancestors 'none'; " +
    "manifest-src 'self';",
} as const;

/**
 * Cache control headers for different resource types
 */
export const CACHE_HEADERS = {
  // Static assets (JS, CSS, SVG) - immutable, 1 year
  STATIC_ASSETS: "public, max-age=31536000, immutable",
  // Dynamic content like robots.txt and sitemap.xml - 1 hour
  DYNAMIC_CONTENT: "public, max-age=3600",
} as const;

/**
 * Convert headers object to Cloudflare Pages _headers format
 */
export function toCloudflareHeadersFormat(
  headers: Record<string, string>,
): string {
  return Object.entries(headers)
    .map(([key, value]) => `  ${key}: ${value}`)
    .join("\n");
}

/**
 * Convert headers object to Firebase hosting format
 */
export function toFirebaseHeadersFormat(
  headers: Record<string, string>,
): Array<{ key: string; value: string }> {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}
