import { describe, expect, it } from "vitest";
import { resolveRemoteDataBaseUrl } from "./useRemoteData";

describe("resolveRemoteDataBaseUrl", () => {
  it("returns null when URL is missing", () => {
    expect(resolveRemoteDataBaseUrl(undefined)).toBeNull();
    expect(resolveRemoteDataBaseUrl("")).toBeNull();
    expect(resolveRemoteDataBaseUrl("   ")).toBeNull();
  });

  it("normalizes trailing slash from configured URL", () => {
    expect(resolveRemoteDataBaseUrl("https://data.example.com/")).toBe(
      "https://data.example.com",
    );
  });

  it("keeps valid URL when no trailing slash exists", () => {
    expect(resolveRemoteDataBaseUrl("https://data.example.com/data")).toBe(
      "https://data.example.com/data",
    );
  });
});
