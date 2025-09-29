declare global {
  interface Window {
    __CSP_NONCE__?: string;
    __webpack_nonce__?: string;
  }
}

const META_CSP_NONCE_SELECTOR = 'meta[name="csp-nonce"], meta[name="csp_nonce"]';

const getAttributeNonce = (element: Element | null): string | undefined => {
  if (!element) {
    return undefined;
  }

  if (element instanceof HTMLScriptElement && element.nonce) {
    return element.nonce;
  }

  const nonce = element.getAttribute("nonce");
  return nonce ? nonce.trim() || undefined : undefined;
};

const readMetaNonce = (): string | undefined => {
  const meta = document.querySelector(META_CSP_NONCE_SELECTOR);
  if (!meta) {
    return undefined;
  }

  const content = meta.getAttribute("content");
  return content ? content.trim() || undefined : undefined;
};

const readWindowNonce = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const nonce = window.__CSP_NONCE__ ?? window.__webpack_nonce__;
  return nonce ? nonce.trim() || undefined : undefined;
};

const readScriptNonce = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const currentScript = document.currentScript;
  const fromCurrent = getAttributeNonce(currentScript as Element | null);
  if (fromCurrent) {
    return fromCurrent;
  }

  const scripts = document.querySelectorAll<HTMLScriptElement>("script[nonce]");
  for (const script of scripts) {
    const nonce = getAttributeNonce(script);
    if (nonce) {
      return nonce;
    }
  }

  return undefined;
};

export const getCspNonce = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  return (
    readMetaNonce() ??
    readWindowNonce() ??
    readScriptNonce()
  );
};

