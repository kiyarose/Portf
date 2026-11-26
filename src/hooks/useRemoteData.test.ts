import { describe, expect, it } from "vitest";
import {
  resolveRemoteDataBaseUrl,
  resolveRemoteResourceUrl,
} from "./useRemoteData";

describe("resolveRemoteDataBaseUrl", () => {
  it("returns null when URL is missing", () => {
    expect(resolveRemoteDataBaseUrl()).toBeNull();
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

describe("resolveRemoteResourceUrl", () => {
  it("uses the configured data base when present", () => {
    expect(
      resolveRemoteResourceUrl(
        "Experience",
        "https://data.kiya.cat/data",
        "/__remote-data",
      ),
    ).toBe("https://data.kiya.cat/data/Experience.json");
  });

  it("falls back to the same-origin proxy path when no base is set", () => {
    expect(
      resolveRemoteResourceUrl("Skills", null, "/Portf/__remote-data"),
    ).toBe("/Portf/__remote-data/Skills.json");
  });
});
