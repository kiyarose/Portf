import type { Theme } from "../providers/theme-context";

export function themedClass(theme: Theme, light: string, dark: string) {
  return theme === "dark" ? dark : light;
}
