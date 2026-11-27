// ---------------------------------------------------------------------------
// BASE PATH HANDLING
// ---------------------------------------------------------------------------
// When the app is served from a sub-path (e.g. /Portf/ on GitHub Pages) every
// URL reported by the browser includes that prefix, so window.location.pathname
// looks like "/Portf/privacy-policy" instead of just "/privacy-policy".
//
// The build tool embeds the configured base path (set via BASE_PATH in this
// template) into import.meta.env.BASE_URL, so we read it here to strip the prefix before
// matching routes and re-apply it before calling window.location.assign.
//
// Template users: you do NOT need to change anything in this file.
//   • Deploying to a root domain?  Leave BASE_PATH unset.  BASE_PATH will
//     be "" and both stripBasePath / addBasePath are transparent no-ops.
//   • Deploying to a sub-path?  Set BASE_PATH in your build command or CI
//     environment (see astro.config.mjs and package.json for details).  This file
//     picks it up automatically through import.meta.env.BASE_URL.
// ---------------------------------------------------------------------------
const BASE_PATH = (() => {
  const base = import.meta.env.BASE_URL ?? "/";
  // Normalize to a prefix without trailing slash so it can be stripped cleanly.
  // e.g. "/Portf/" → "/Portf",  "/" → ""
  return base === "/" ? "" : base.replace(/\/$/, "");
})();

function isWindowAvailable() {
  return typeof window !== "undefined";
}

function stripTrailingSlashes(value: string) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return end === value.length ? value : value.slice(0, end);
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  if (prefixed === "/") return "/";
  return stripTrailingSlashes(prefixed) || "/";
}

/** Strip the deployment base path and return an app-relative pathname.
 *  e.g. with BASE_PATH="/Portf":  "/Portf/privacy-policy" → "/privacy-policy"
 *  If no base path is set this is a transparent no-op.
 */
function stripBasePath(pathname: string): string {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length);
  }
  return pathname;
}

/** Prepend the deployment base path to an app-relative path before assigning
 *  browser location.  e.g. with BASE_PATH="/Portf":  "/privacy-policy" →
 *  "/Portf/privacy-policy".  Transparent no-op when no base path is set.
 */
function addBasePath(path: string): string {
  if (!BASE_PATH) return path;
  const stripped = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${stripped}`;
}

export function getCurrentPath(): string {
  if (!isWindowAvailable()) return "/";
  return normalizePath(stripBasePath(window.location.pathname));
}

export function navigateTo(path: string) {
  if (!isWindowAvailable()) return;
  const normalized = normalizePath(path);
  const current = getCurrentPath();
  if (normalized === current) return;
  const target = addBasePath(normalized);
  window.location.assign(target);
}

export function goBackOrNavigateHome() {
  if (!isWindowAvailable()) return;
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  navigateTo("/");
}

export { normalizePath };
