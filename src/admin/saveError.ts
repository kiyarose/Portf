export type EdadminErrorPayload = {
  error?: string;
  status?: number;
  stage?: string;
  hint?: string;
  resource?: string;
  upstreamHost?: string | null;
  upstreamStatus?: number;
};

export function formatEdadminSaveError(
  status: number,
  payload: EdadminErrorPayload | null,
  fallbackDetail: string,
): string {
  if (payload?.hint && payload.error) {
    const parts = [
      `[${payload.error}] HTTP ${status}`,
      payload.stage ? `stage=${payload.stage}` : null,
      payload.upstreamHost ? `host=${payload.upstreamHost}` : null,
      payload.hint,
    ].filter(Boolean);
    return parts.join(" — ");
  }
  return fallbackDetail || `Save failed (HTTP ${status})`;
}

export async function parseEdadminErrorResponse(
  response: Response,
): Promise<EdadminErrorPayload | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return (await response.json()) as EdadminErrorPayload;
  } catch {
    return null;
  }
}