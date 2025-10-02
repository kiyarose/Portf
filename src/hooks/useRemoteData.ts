import { useEffect, useRef, useState } from "react";

const DATA_BASE_URL = "https://data.sillylittle.tech/data" as const;

export type RemoteDataStatus = "fallback" | "loaded" | "error";

type UseRemoteDataOptions<TData> = {
  resource: string;
  fallbackData: TData;
  placeholderData: TData;
};

type UseRemoteDataResult<TData> = {
  data: TData;
  status: RemoteDataStatus;
};

export function useRemoteData<TData>(
  options: UseRemoteDataOptions<TData>,
): UseRemoteDataResult<TData> {
  const { resource, fallbackData, placeholderData } = options;
  const fallbackRef = useRef(fallbackData);
  const placeholderRef = useRef(placeholderData);
  const [data, setData] = useState<TData>(fallbackData);
  const [status, setStatus] = useState<RemoteDataStatus>("fallback");

  useEffect(() => {
    fallbackRef.current = fallbackData;
  }, [fallbackData]);

  useEffect(() => {
    placeholderRef.current = placeholderData;
  }, [placeholderData]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadRemoteData() {
      setData(fallbackRef.current);
      setStatus("fallback");

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

        const remoteData = (await response.json()) as TData;

        if (!isMounted) {
          return;
        }

        setData(remoteData);
        setStatus("loaded");
      } catch (error) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        console.error(`Failed to load ${resource} data`, error);
        setData(placeholderRef.current);
        setStatus("error");
      }
    }

    loadRemoteData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [resource]);

  return { data, status };
}
