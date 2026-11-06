const RANDOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX_STORAGE_KEY = "kiya-portfolio::build-prefix";
const PREFIX_LENGTH = 4;
const BUILD_TIME_ISO =
  typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : null;

function createRandomSegment(length: number) {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const randomValues = crypto.getRandomValues(new Uint32Array(length));
    return Array.from(
      randomValues,
      (value) => RANDOM_CHARS[value % RANDOM_CHARS.length],
    ).join("");
  }

  return Array.from(
    { length },
    () => RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)],
  ).join("");
}

function deriveSeedSegment(seed: string) {
  let hash = 7;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 0xffffff;
  }

  let segment = "";
  let value = hash;

  for (let i = 0; i < PREFIX_LENGTH; i += 1) {
    segment = `${RANDOM_CHARS[value % RANDOM_CHARS.length]}${segment}`;
    value = Math.floor(value / RANDOM_CHARS.length);
  }

  return segment;
}

function getCodeSignature() {
  // Use the build timestamp so SSR and client bundles share the same signature.
  if (BUILD_TIME_ISO) {
    return BUILD_TIME_ISO;
  }

  try {
    const url = new URL(import.meta.url);
    return `${url.pathname}${url.search}`;
  } catch (error) {
    logDebug("Failed to derive code signature", error);
    return import.meta.url;
  }
}

let memoizedPrefix: string | null = null;

function loadOrCreatePrefix(signature: string) {
  if (memoizedPrefix) {
    return memoizedPrefix;
  }

  // Deterministic across SSR and client when tied to the build timestamp.
  if (BUILD_TIME_ISO && signature === BUILD_TIME_ISO) {
    memoizedPrefix = deriveSeedSegment(signature);
    return memoizedPrefix;
  }

  if (typeof window === "undefined") {
    memoizedPrefix = deriveSeedSegment(signature);
    return memoizedPrefix;
  }

  try {
    const storedValue = window.localStorage.getItem(PREFIX_STORAGE_KEY);

    if (storedValue) {
      const parsed = JSON.parse(storedValue) as {
        signature?: string;
        prefix?: string;
      };

      if (parsed.signature === signature && parsed.prefix) {
        memoizedPrefix = parsed.prefix;
        return memoizedPrefix;
      }
    }
  } catch (error) {
    logDebug("Failed to read build prefix from storage", error);
  }

  const nextPrefix = createRandomSegment(PREFIX_LENGTH);

  try {
    window.localStorage.setItem(
      PREFIX_STORAGE_KEY,
      JSON.stringify({ signature, prefix: nextPrefix }),
    );
  } catch (error) {
    logDebug("Failed to persist build prefix", error);
  }

  memoizedPrefix = nextPrefix;
  return memoizedPrefix;
}

// Generates a readable build label: the prefix persists for a given build
// (changing only when the code updates), while the suffix randomizes every
// render so viewers can spot fresh reloads.
export function generateBuildLabel(options?: { stableRenderSuffix?: boolean }) {
  const signature = getCodeSignature();
  const stablePrefix = loadOrCreatePrefix(signature);
  const renderSuffix = options?.stableRenderSuffix
    ? deriveSeedSegment(`${signature}:render`)
    : createRandomSegment(PREFIX_LENGTH);

  return `Build ${stablePrefix}-${renderSuffix}`;
}

export function getBuildUpdatedAt() {
  const candidate =
    BUILD_TIME_ISO ??
    (typeof document !== "undefined" ? document.lastModified : null);

  if (!candidate) {
    return null;
  }

  const date = new Date(candidate);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return date;
}

function logDebug(context: string, error: unknown) {
  if (typeof console !== "undefined" && import.meta.env.DEV) {
    console.warn(`[build-label] ${context}`, error);
  }
}
