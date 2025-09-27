const NAVIGATION_EVENT = "kiya:navigate";

type NavigationListener = (path: string) => void;

type NavigationEvent = CustomEvent<string>;

function isWindowAvailable() {
  return typeof window !== "undefined";
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  if (prefixed === "/") return "/";
  return prefixed.replace(/\/+$/, "") || "/";
}

export function getCurrentPath(): string {
  if (!isWindowAvailable()) return "/";
  return normalizePath(window.location.pathname);
}

export function navigateTo(path: string) {
  if (!isWindowAvailable()) return;
  const normalized = normalizePath(path);
  const current = getCurrentPath();
  if (normalized === current) return;
  window.history.pushState({}, "", normalized);
  dispatchNavigation(normalized);
}

function dispatchNavigation(path: string) {
  if (!isWindowAvailable()) return;
  const event: NavigationEvent = new CustomEvent(NAVIGATION_EVENT, {
    detail: path,
  });
  window.dispatchEvent(event);
}

export function subscribeToNavigation(listener: NavigationListener) {
  if (!isWindowAvailable()) return () => undefined;
  const handler = (event: Event) => {
    const customEvent = event as NavigationEvent;
    const nextPath = typeof customEvent.detail === "string"
      ? customEvent.detail
      : getCurrentPath();
    listener(normalizePath(nextPath));
  };

  window.addEventListener(NAVIGATION_EVENT, handler as EventListener);
  return () => {
    window.removeEventListener(NAVIGATION_EVENT, handler as EventListener);
  };
}

export function canUseClientNavigation() {
  if (!isWindowAvailable()) return false;
  return window.history.length > 1;
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
