import { useEffect, useState } from "react";
import { safeConsoleWarn } from "../utils/errorSanitizer";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      safeConsoleWarn("Failed to read from localStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      safeConsoleWarn("Failed to write to localStorage", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
