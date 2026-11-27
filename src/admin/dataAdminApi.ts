import { PORTFOLIO_DATA_RESOURCES } from "../data/resources";

export { PORTFOLIO_DATA_RESOURCES };

export function isAdminEditorEnabled(): boolean {
  return (
    typeof __PF_ALLOW_NOEDIT__ !== "undefined" && __PF_ALLOW_NOEDIT__ === true
  );
}

export function resolveResourceReadUrl(resource: string): string {
  const remoteBase = (
    import.meta.env.VITE_REMOTE_DATA_URL as string | undefined
  )
    ?.trim()
    .replace(/\/$/, "");

  if (import.meta.env.DEV && remoteBase) {
    return `${remoteBase}/${resource}.json`;
  }

  const base = import.meta.env.BASE_URL;
  return `${base}__remote-data/${resource}.json`;
}

export function resolveEdadminSaveUrl(resource: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}api/edadmin/${resource}.json`;
}

export async function loadResourceJson(resource: string): Promise<string> {
  const response = await fetch(resolveResourceReadUrl(resource), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load ${resource}.json (${response.status})`);
  }
  return response.text();
}

export async function saveResourceJson(
  resource: string,
  body: string,
): Promise<void> {
  const response = await fetch(resolveEdadminSaveUrl(resource), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!response.ok) {
    const detail = (await response.text()).trim();
    throw new Error(
      detail || `Save failed for ${resource}.json (${response.status})`,
    );
  }
}
