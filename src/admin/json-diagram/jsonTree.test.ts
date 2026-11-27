import { describe, expect, it } from "vitest";
import {
  addArrayItem,
  addObjectProperty,
  createDiagramFromData,
  getPathKey,
  parseEditorValue,
  removeAtPath,
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

  it("adds object properties and array items", () => {
    const root = { items: [{ title: "A" }] };
    const withKey = addObjectProperty(root, [], "newKey", "x");
    expect((withKey as { newKey: string }).newKey).toBe("x");
    const withItem = addArrayItem(
      { list: ["a"] },
      ["list"],
      "b",
    ) as { list: string[] };
    expect(withItem.list).toEqual(["a", "b"]);
  });

  it("removes nested values", () => {
    const root = { a: { b: 1 }, c: 2 };
    const next = removeAtPath(root, ["a", "b"]) as {
      a: Record<string, unknown>;
    };
    expect(next.a.b).toBeUndefined();
  });
});