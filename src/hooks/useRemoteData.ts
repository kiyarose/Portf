import { useEffect, useMemo, useRef, useState } from "react";
import { extractJsonFromRtf } from "../utils/extractJsonFromRtf";

// NOTE: Remote data is opt-in. Set VITE_REMOTE_DATA_URL to enable remote fetches.
// When no URL is configured, components use their local fallback data directly.
export function resolveRemoteDataBaseUrl(rawUrl?: string): string | null {
  const normalized = (rawUrl ?? "").trim().replace(/\/$/, "");
  return normalized.length > 0 ? normalized : null;
}

const DATA_BASE_URL = resolveRemoteDataBaseUrl(
  import.meta.env.VITE_REMOTE_DATA_URL as string | undefined,
);
const REMOTE_DATA_ENABLED = DATA_BASE_URL !== null;
const REMOTE_DATA_PATH = `${import.meta.env.BASE_URL}__remote-data`;

// LocalStorage namespace for cached remote data. Rename if you fork the template
// to avoid collisions with other apps in the browser.
const CACHE_NAMESPACE = "template-portfolio::remote-data" as const;
const CACHE_TTL_MS = import.meta.env.DEV ? 1000 * 60 * 5 : 1000 * 60 * 60 * 6;
const BUILD_SIGNATURE =
  typeof __BUILD_TIME__ === "string" ? __BUILD_TIME__ : "dev-local";
const CACHE_KEY_PREFIX = `${CACHE_NAMESPACE}::${BUILD_SIGNATURE}::` as const;

const BYPASS_REMOTE_CACHE =
  import.meta.env.VITE_REMOTE_DATA_BYPASS_CACHE === "true" ||
  // When a real remote base is configured, treat it as the source of truth.
  // Skip caching so updates to the remote JSON reflect immediately.
  Boolean(import.meta.env.VITE_REMOTE_DATA_URL);

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

/** Synced JSON from data-converter uses `{ socialsFallback, socialsPlaceholder, __meta }` etc. */
function normalizeRemoteExport<TData>(value: unknown, resource: string): TData {
  if (Array.isArray(value)) {
    return value as TData;
  }
  if (value && typeof value === "object") {
    const base = resource.charAt(0).toLowerCase() + resource.slice(1);
    const fallbackKey = `${base}Fallback`;
    const record = value as Record<string, unknown>;
    if (fallbackKey in record) {
      return record[fallbackKey] as TData;
    }
  }
  return value as TData;
}

export function useRemoteData<TData>(
  options: UseRemoteDataOptions<TData>,
): UseRemoteDataResult<TData> {
  const { resource, fallbackData, placeholderData } = options;
  const initialCache = useMemo(() => {
    if (!REMOTE_DATA_ENABLED) {
      return null;
    }
    return BYPASS_REMOTE_CACHE ? null : readCachedData<TData>(resource);
  }, [resource]);
  const fallbackRef = useRef(fallbackData);
  const placeholderRef = useRef(placeholderData);
  const [data, setData] = useState<TData>(() =>
    initialCache
      ? normalizeRemoteExport(initialCache.data as unknown, resource)
      : fallbackData,
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

    if (!REMOTE_DATA_ENABLED) {
      setData(fallbackRef.current);
      setStatus("fallback");
      setCacheState("miss");
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    const cachedEntry = BYPASS_REMOTE_CACHE
      ? null
      : readCachedData<TData>(resource);
    const cacheIsFresh = cachedEntry
      ? isCacheFresh(cachedEntry.cachedAt)
      : false;

    if (cachedEntry) {
      setData(normalizeRemoteExport(cachedEntry.data as unknown, resource));
      setStatus("loaded");
      setCacheState(cacheIsFresh ? "hit" : "stale");
    } else {
      setData(fallbackRef.current);
      setStatus("fallback");
      setCacheState("miss");
    }

    if (cacheIsFresh && !BYPASS_REMOTE_CACHE) {
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    async function loadRemoteData() {
      try {
        const response = await fetch(`${REMOTE_DATA_PATH}/${resource}.json`, {
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
        const remoteData = parseRemotePayload<TData>(payloadText, resource);

        if (!isMounted) {
          return;
        }

        setData(remoteData);
        setStatus("loaded");
        setCacheState("hit");
        if (!BYPASS_REMOTE_CACHE) {
          writeCachedData(resource, remoteData);
        }
      } catch (error) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        console.error(`Failed to load ${resource} data`, error);
        const fallbackCache = BYPASS_REMOTE_CACHE
          ? null
          : readCachedData<TData>(resource);
        if (fallbackCache) {
          setData(
            normalizeRemoteExport(fallbackCache.data as unknown, resource),
          );
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
      "data-remote-enabled": REMOTE_DATA_ENABLED ? "true" : "false",
      "data-remote-status": status,
      "data-remote-loaded": status === "loaded" ? "true" : "false",
      "data-remote-cache": cacheState,
    }),
    [resource, status, cacheState],
  );

  return { data, status, debugAttributes };
}

function parseRemotePayload<TData>(raw: string, resource: string): TData {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const value = unwrapRemotePayload<TData>(parsed, resource);
    if (value === undefined || value === null) {
      throw new Error("Parsed remote payload was empty");
    }
    return normalizeRemoteExport<TData>(value, resource);
  } catch (parseError) {
    const extracted = extractJsonFromRtf(raw);
    if (!extracted) {
      throw parseError;
    }

    const parsed = JSON.parse(extracted) as unknown;
    const value = unwrapRemotePayload<TData>(parsed, resource);
    if (value === undefined || value === null) {
      throw new Error("Extracted remote payload was empty");
    }
    return normalizeRemoteExport<TData>(value, resource);
  }
}

function unwrapRemotePayload<TData>(payload: unknown, resource: string): TData {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const source = payload as Record<string, unknown>;
    const entries = Object.entries(source).filter(([key]) => key !== "__meta");

    if (entries.length === 1) {
      return entries[0][1] as TData;
    }

    const normalizedResource = resource.trim().toLowerCase();
    const preferredKeys = [
      normalizedResource,
      `${normalizedResource}fallback`,
      `${normalizedResource}data`,
      `${normalizedResource}s`,
    ];

    for (const preferred of preferredKeys) {
      const match = entries.find(([key]) => key.toLowerCase() === preferred);
      if (match?.[1] != null) {
        return match[1] as TData;
      }
    }

    const firstFallback = entries.find(([key]) =>
      key.toLowerCase().endsWith("fallback"),
    );
    if (firstFallback?.[1] !== undefined) {
      return firstFallback[1] as TData;
    }
  }

  return payload as TData;
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
