import { describe, expect, it, vi } from "vitest";
import {
  MAX_EDADMIN_BODY_BYTES,
  handleEdadminRequest,
  isEdadminEnabled,
  normalizeDataBaseUrl,
  parseEdadminResource,
  resolveUpstreamToken,
} from "../../functions/lib/edadminProxy.mjs";

describe("edadminProxy", () => {
  it("is disabled unless PF_ALLOW_NOEDIT=1", () => {
    expect(isEdadminEnabled({})).toBe(false);
    expect(isEdadminEnabled({ PF_ALLOW_NOEDIT: "0" })).toBe(false);
    expect(isEdadminEnabled({ PF_ALLOW_NOEDIT: "1" })).toBe(true);
  });

  it("parses allowlisted resources", () => {
    expect(parseEdadminResource("Projects")).toBe("Projects");
    expect(parseEdadminResource("Projects.json")).toBe("Projects");
    expect(parseEdadminResource("../Skills")).toBeNull();
    expect(parseEdadminResource("Unknown")).toBeNull();
  });

  it("normalizes data base URLs", () => {
    expect(normalizeDataBaseUrl("https://data.example.com/data/")).toBe(
      "https://data.example.com/data",
    );
    expect(normalizeDataBaseUrl("  ")).toBeNull();
  });

  it("strips duplicate Bearer prefix from secrets", () => {
    expect(resolveUpstreamToken("Bearer my-token")).toBe("my-token");
    expect(resolveUpstreamToken("  bearer   tok  ")).toBe("tok");
    expect(resolveUpstreamToken("raw-token")).toBe("raw-token");
  });

  it("returns JSON 404 when feature flag is off", async () => {
    const response = await handleEdadminRequest(
      new Request("http://localhost/", { method: "PUT", body: "{}" }),
      "Projects",
      {},
    );
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error: string; stage: string };
    expect(body.error).toBe("editor_disabled");
    expect(body.stage).toBe("proxy");
  });

  it("rejects invalid JSON", async () => {
    const response = await handleEdadminRequest(
      new Request("http://localhost/", { method: "PUT", body: "not-json" }),
      "Projects",
      {
        PF_ALLOW_NOEDIT: "1",
        PF_EDADMIN_TOKEN: "secret",
        PF_DATA_BASE_URL: "https://data.example.com/data",
      },
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("invalid_json");
  });

  it("returns proxy_misconfigured when token missing", async () => {
    const response = await handleEdadminRequest(
      new Request("http://localhost/", { method: "PUT", body: "{}" }),
      "Projects",
      {
        PF_ALLOW_NOEDIT: "1",
        PF_DATA_BASE_URL: "https://data.example.com/data",
      },
    );
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("proxy_misconfigured");
  });

  it("forwards upstream 401 with structured body", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("denied", { status: 401 }),
    );
    const response = await handleEdadminRequest(
      new Request("http://localhost/", { method: "PUT", body: "{}" }),
      "Experience",
      {
        PF_ALLOW_NOEDIT: "1",
        PF_EDADMIN_TOKEN: "Bearer bad",
        PF_DATA_BASE_URL: "https://data.kiya.cat/data",
      },
      { fetchImpl },
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("X-Edadmin-Stage")).toBe("upstream");
    const body = (await response.json()) as {
      error: string;
      upstreamHost: string;
      upstreamStatus: number;
    };
    expect(body.error).toBe("upstream_rejected");
    expect(body.upstreamHost).toBe("data.kiya.cat");
    expect(body.upstreamStatus).toBe(401);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://data.kiya.cat/data/Experience.json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer bad",
        }),
      }),
    );
  });

  it("enforces body size limit constant", () => {
    expect(MAX_EDADMIN_BODY_BYTES).toBeGreaterThan(0);
  });
});