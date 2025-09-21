const RANDOM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX_STORAGE_KEY = "kiya-portfolio::build-prefix";
const PREFIX_LENGTH = 4;

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
    // Ignore storage errors (incognito / storage-disabled environments).
    logDebug("Failed to read build prefix from storage", error);
  }

  const nextPrefix = createRandomSegment(PREFIX_LENGTH);

  try {
    window.localStorage.setItem(
      PREFIX_STORAGE_KEY,
      JSON.stringify({ signature, prefix: nextPrefix }),
    );
  } catch (error) {
    // Swallow storage write errors and fall back to ephemeral prefix.
    logDebug("Failed to persist build prefix", error);
  }

  memoizedPrefix = nextPrefix;
  return memoizedPrefix;
}

// Generates a readable build label: the prefix persists for a given build
// (changing only when the code updates), while the suffix randomizes every
// render so viewers can spot fresh reloads.
export function generateBuildLabel() {
  const signature = getCodeSignature();
  const stablePrefix = loadOrCreatePrefix(signature);
  const renderSuffix = createRandomSegment(PREFIX_LENGTH);

  return `Build ${stablePrefix}-${renderSuffix}`;
}

function logDebug(context: string, error: unknown) {
  if (typeof console !== "undefined" && import.meta.env.DEV) {
    console.warn(`[build-label] ${context}`, error);
  }
}
