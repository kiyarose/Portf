import { describe, expect, it } from "vitest";
import {
  createDiagramFromData,
  getPathKey,
  parseEditorValue,
  setValueAtPath,
} from "./jsonTree";

describe("jsonTree", () => {
  it("builds path keys", () => {
    expect(getPathKey([])).toBe("__root__");
    expect(getPathKey(["projectsFallback", 0, "title"])).toBe(
      "projectsFallback.[0].title",
    );
  });

  it("layouts diagram nodes", () => {
    const data = { a: 1, b: { c: 2 } };
    const { nodes } = createDiagramFromData(data, new Map());
    expect(nodes.length).toBeGreaterThan(2);
  });

  it("updates nested values immutably", () => {
    const data = { items: [{ title: "A" }] };
    const next = setValueAtPath(data, ["items", 0, "title"], "B");
    expect((next as typeof data).items[0]?.title).toBe("B");
    expect(data.items[0]?.title).toBe("A");
  });

  it("parses editor values", () => {
    expect(parseEditorValue('"hello"', "")).toBe("hello");
    expect(() => parseEditorValue("{bad}", {})).toThrow();
  });
});