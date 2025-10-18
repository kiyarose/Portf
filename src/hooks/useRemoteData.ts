import { useEffect, useMemo, useRef, useState } from "react";

const DATA_BASE_URL =
  import.meta.env.VITE_DATA_BASE_URL ??
  (import.meta.env.DEV ? "/__remote-data/data" : "/data");

const CACHE_NAMESPACE = "kiya-portfolio::remote-data" as const;
const CACHE_TTL_MS = import.meta.env.DEV ? 1000 * 60 * 5 : 1000 * 60 * 60 * 6;
const BUILD_SIGNATURE =
  typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : "dev-local";
const CACHE_KEY_PREFIX = `${CACHE_NAMESPACE}::${BUILD_SIGNATURE}::` as const;

export type RemoteDataStatus = "fallback" | "loaded" | "error";

type CacheState = "miss" | "hit" | "stale";

type UseRemoteDataOptions<TData> = {
  resource: string;
  fallbackData: TData;
  placeholderData: TData;
};

type UseRemoteDataResult<TData> = {
  data: TData;
  status: RemoteDataStatus;
  debugAttributes: Record<string, string>;
};

export function useRemoteData<TData>(
  options: UseRemoteDataOptions<TData>,
): UseRemoteDataResult<TData> {
  const { resource, fallbackData, placeholderData } = options;
  const initialCache = useMemo(
    () => readCachedData<TData>(resource),
    [resource],
  );
  const fallbackRef = useRef(fallbackData);
  const placeholderRef = useRef(placeholderData);
  const [data, setData] = useState<TData>(
    initialCache ? initialCache.data : fallbackData,
  );
  const [status, setStatus] = useState<RemoteDataStatus>(
    initialCache ? "loaded" : "fallback",
  );
  const [cacheState, setCacheState] = useState<CacheState>(() => {
    if (!initialCache) {
      return "miss";
    }
    return isCacheFresh(initialCache.cachedAt) ? "hit" : "stale";
  });

  useEffect(() => {
    fallbackRef.current = fallbackData;
  }, [fallbackData]);

  useEffect(() => {
    placeholderRef.current = placeholderData;
  }, [placeholderData]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const cachedEntry = readCachedData<TData>(resource);
    const cacheIsFresh = cachedEntry
      ? isCacheFresh(cachedEntry.cachedAt)
      : false;

    if (cachedEntry) {
      setData(cachedEntry.data);
      setStatus("loaded");
      setCacheState(cacheIsFresh ? "hit" : "stale");
    } else {
      setData(fallbackRef.current);
      setStatus("fallback");
      setCacheState("miss");
    }

    if (cacheIsFresh) {
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    async function loadRemoteData() {
      try {
        const response = await fetch(`${DATA_BASE_URL}/${resource}.json`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Request for ${resource} failed with status ${response.status}`,
          );
        }

        const payloadText = await response.text();
        const remoteData = parseRemotePayload<TData>(payloadText);

        if (!isMounted) {
          return;
        }

        setData(remoteData);
        setStatus("loaded");
        setCacheState("hit");
        writeCachedData(resource, remoteData);
      } catch (error) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        console.error(`Failed to load ${resource} data`, error);
        const fallbackCache = readCachedData<TData>(resource);
        if (fallbackCache) {
          setData(fallbackCache.data);
          setStatus("loaded");
          setCacheState(isCacheFresh(fallbackCache.cachedAt) ? "hit" : "stale");
          return;
        }

        setData(placeholderRef.current);
        setStatus("error");
        setCacheState("miss");
      }
    }

    loadRemoteData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [resource]);

  const debugAttributes = useMemo(
    () => ({
      "data-remote-resource": resource,
      "data-remote-status": status,
      "data-remote-loaded": status === "loaded" ? "true" : "false",
      "data-remote-cache": cacheState,
    }),
    [resource, status, cacheState],
  );

  return { data, status, debugAttributes };
}

function parseRemotePayload<TData>(raw: string): TData {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const value = unwrapRemotePayload<TData>(parsed);
    if (value === undefined || value === null) {
      throw new Error("Parsed remote payload was empty");
    }
    return value;
  } catch (parseError) {
    const extracted = extractJsonFromRtf(raw);
    if (!extracted) {
      throw parseError;
    }

    const parsed = JSON.parse(extracted) as unknown;
    const value = unwrapRemotePayload<TData>(parsed);
    if (value === undefined || value === null) {
      throw new Error("Extracted remote payload was empty");
    }
    return value;
  }
}

function unwrapRemotePayload<TData>(payload: unknown): TData {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const entries = Object.entries(payload as Record<string, unknown>).filter(
      ([key]) => key !== "__meta",
    );

    if (entries.length === 1) {
      return entries[0][1] as TData;
    }
  }

  return payload as TData;
}

// Some upstream data files were saved from TextEdit and ship as RTF even though
// they use a .json extension. This helper strips the minimal RTF syntax back to
// plain JSON so we can still hydrate the UI without blocking on content fixes.
function extractJsonFromRtf(raw: string): string | null {
  if (!raw.trim().startsWith("{\\rtf")) {
    return null;
  }

  const marker = "\\f0\\fs24 \\cf0 ";
  const markerIndex = raw.indexOf(marker);
  const body = markerIndex >= 0 ? raw.slice(markerIndex + marker.length) : raw;
  let result = "";
  const dashMappings: Record<string, string> = {
    endash: "–",
    emdash: "—",
    hyphen: "-",
    minus: "-",
  };
  const cp1252Map: Record<number, string> = {
    0x80: "€",
    0x82: "‚",
    0x83: "ƒ",
    0x84: "„",
    0x85: "…",
    0x86: "†",
    0x87: "‡",
    0x88: "ˆ",
    0x89: "‰",
    0x8a: "Š",
    0x8b: "‹",
    0x8c: "Œ",
    0x8e: "Ž",
    0x91: "‘",
    0x92: "’",
    0x93: "“",
    0x94: "”",
    0x95: "•",
    0x96: "–",
    0x97: "—",
    0x98: "˜",
    0x99: "™",
    0x9a: "š",
    0x9b: "›",
    0x9c: "œ",
    0x9e: "ž",
    0x9f: "Ÿ",
  };

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (char === "\\") {
      const next = body[index + 1];

      if (next === "-") {
        result += "-";
        index += 1;
        continue;
      }

      if (next === "{" || next === "}" || next === "\\") {
        result += next;
        index += 1;
        continue;
      }

      if (next === "'") {
        const hex = body.slice(index + 2, index + 4);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          const code = Number.parseInt(hex, 16);
          result += cp1252Map[code] ?? String.fromCharCode(code);
          index += 3;
          continue;
        }
      }

      if (/^[a-zA-Z]$/.test(next ?? "")) {
        let cursor = index + 1;
        while (
          cursor < body.length &&
          /[a-zA-Z0-9-]/.test(body[cursor] ?? "")
        ) {
          cursor += 1;
        }

        const controlWord = body.slice(index + 1, cursor);
        const normalizedControl = controlWord.toLowerCase();
        let handledControlWord = false;

        if (normalizedControl in dashMappings) {
          result += dashMappings[normalizedControl];
          handledControlWord = true;
        } else {
          const unicodeMatch = /^u(-?\d+)$/u.exec(normalizedControl);
          if (unicodeMatch) {
            const parsed = Number.parseInt(unicodeMatch[1] ?? "", 10);
            if (Number.isInteger(parsed)) {
              const codePoint = parsed < 0 ? 65536 + parsed : parsed;
              try {
                result += String.fromCodePoint(codePoint);
                handledControlWord = true;
              } catch (unicodeError) {
                logCacheDebug(
                  `Failed to decode \\u sequence ${controlWord}`,
                  unicodeError,
                );
              }
            }
          }
        }

        if (body[cursor] === " ") {
          cursor += 1;
        }

        if (handledControlWord) {
          const fallbackChar = body[cursor];
          if (fallbackChar === "'") {
            const hex = body.slice(cursor + 1, cursor + 3);
            if (/^[0-9a-fA-F]{2}$/.test(hex)) {
              cursor += 3;
            }
          } else if (fallbackChar !== undefined) {
            cursor += 1;
          }
        }

        index = cursor - 1;
        continue;
      }
    }

    if (char === "{" || char === "}") {
      continue;
    }

    result += char;
  }

  let sanitized = result.replace(/\\\r?\n/g, "\n").replace(/\\([{}])/g, "$1");

  sanitized = sanitized
    .split("\n")
    .map((line) => line.replace(/\\+$/u, "").trimEnd())
    .join("\n")
    .trim();

  return sanitized.length > 0 ? sanitized : null;
}

type CachedEntry<T> = {
  cachedAt: number;
  data: T;
};

function getCacheKey(resource: string): string {
  return `${CACHE_KEY_PREFIX}${resource}`;
}

function isCacheFresh(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL_MS;
}

function readCachedData<T>(resource: string): CachedEntry<T> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getCacheKey(resource));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CachedEntry<T>>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.cachedAt !== "number" ||
      !("data" in parsed)
    ) {
      return null;
    }
    return { cachedAt: parsed.cachedAt, data: parsed.data as T };
  } catch (error) {
    logCacheDebug(`Failed to read cache for ${resource}`, error);
    return null;
  }
}

function writeCachedData<T>(resource: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload = JSON.stringify({ cachedAt: Date.now(), data: value });
    window.localStorage.setItem(getCacheKey(resource), payload);
  } catch (error) {
    logCacheDebug(`Failed to write cache for ${resource}`, error);
  }
}

function logCacheDebug(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[useRemoteData][cache] ${context}`, error);
  }
}
