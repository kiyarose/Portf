import { describe, expect, it } from "vitest";
import {
  MAX_EDADMIN_BODY_BYTES,
  handleEdadminRequest,
  isEdadminEnabled,
  normalizeDataBaseUrl,
  parseEdadminResource,
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

  it("returns 404 when feature flag is off", async () => {
    const response = await handleEdadminRequest(
      new Request("http://localhost/", { method: "PUT", body: "{}" }),
      "Projects",
      {},
    );
    expect(response.status).toBe(404);
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
  });

  it("enforces body size limit constant", () => {
    expect(MAX_EDADMIN_BODY_BYTES).toBeGreaterThan(0);
  });
});
