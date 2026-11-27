export const ROOT_KEY = "__root__";

export const HORIZONTAL_SPACING = 200;
export const VERTICAL_SPACING = 120;
export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 60;

export type JsonPathSegment = string | number;

export type DiagramNode = {
  id: string;
  label: string;
  type: string;
  summary: string;
  value: unknown;
  children: DiagramNode[];
  path: JsonPathSegment[];
  pathKey: string;
  parentPathKey: string | null;
  width: number;
  x: number;
  y: number;
  visibleChildren: DiagramNode[];
};

let nodeIdCounter = 0;

export function resetNodeIdCounter() {
  nodeIdCounter = 0;
}

export function getPathKey(path: JsonPathSegment[]): string {
  if (!path || path.length === 0) {
    return ROOT_KEY;
  }
  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".");
}

export function pathToDisplay(path: JsonPathSegment[]): string {
  if (!path || path.length === 0) {
    return "(root)";
  }
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === "number") {
      return `${acc}[${segment}]`;
    }
    return acc ? `${acc}.${segment}` : segment;
  }, "");
}

export function formatType(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  return typeof value;
}

export function summariseValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as object);
    return `Object(${keys.length})`;
  }
  if (typeof value === "string") {
    return value.length > 32 ? `${value.slice(0, 32)}…` : value;
  }
  return String(value);
}

export function formatEditorValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

export function parseEditorValue(
  rawValue: string,
  currentValue: unknown,
): unknown {
  const trimmed = rawValue.trim();
  if (trimmed === "") {
    return "";
  }
  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    if (
      Array.isArray(currentValue) ||
      (currentValue && typeof currentValue === "object")
    ) {
      throw new Error(
        "Provide valid JSON for objects or arrays (use double quotes).",
      );
    }
    return rawValue;
  }
}

export function buildTree(
  value: unknown,
  label: string,
  path: JsonPathSegment[],
  parentPathKey: string | null = null,
): DiagramNode {
  const id = `node-${(nodeIdCounter += 1)}`;
  const pathKey = getPathKey(path);
  let children: DiagramNode[] = [];

  if (Array.isArray(value)) {
    children = value.map((item, index) =>
      buildTree(item, `[${index}]`, [...path, index], pathKey),
    );
  } else if (value && typeof value === "object") {
    children = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => buildTree(item, key, [...path, key], pathKey),
    );
  }

  return {
    id,
    label,
    type: formatType(value),
    summary: summariseValue(value),
    value,
    children,
    path,
    pathKey,
    parentPathKey,
    width: 1,
    x: 0,
    y: 0,
    visibleChildren: [],
  };
}

function measure(node: DiagramNode): number {
  if (!node.children || node.children.length === 0) {
    node.width = 1;
    return node.width;
  }
  let sum = 0;
  for (const child of node.children) {
    sum += measure(child);
  }
  node.width = Math.max(sum, 1);
  return node.width;
}

function assignPositions(
  node: DiagramNode,
  center: number,
  depth: number,
  collapsed: Map<string, boolean>,
): void {
  node.y = depth * VERTICAL_SPACING;
  const isCollapsed = collapsed.get(node.pathKey) === true;

  if (!node.children || node.children.length === 0 || isCollapsed) {
    node.x = center;
    node.visibleChildren = [];
    return;
  }

  let cursor = center - (node.width * HORIZONTAL_SPACING) / 2;
  node.visibleChildren = [];

  for (const child of node.children) {
    const childSpan = child.width * HORIZONTAL_SPACING;
    const childCenter = cursor + childSpan / 2;
    assignPositions(child, childCenter, depth + 1, collapsed);
    node.visibleChildren.push(child);
    cursor += childSpan;
  }

  if (node.visibleChildren.length > 0) {
    const first = node.visibleChildren[0]!;
    const last = node.visibleChildren[node.visibleChildren.length - 1]!;
    node.x = (first.x + last.x) / 2;
  } else {
    node.x = center;
  }
}

export function layoutTree(
  root: DiagramNode,
  collapsed: Map<string, boolean>,
): DiagramNode[] {
  const startWidth = measure(root);
  assignPositions(root, (startWidth * HORIZONTAL_SPACING) / 2, 0, collapsed);
  return collectVisibleNodes(root);
}

export function collectVisibleNodes(
  node: DiagramNode,
  list: DiagramNode[] = [],
): DiagramNode[] {
  list.push(node);
  for (const child of node.visibleChildren) {
    collectVisibleNodes(child, list);
  }
  return list;
}

export function findNodeByPathKey(
  node: DiagramNode | null,
  pathKey: string,
): DiagramNode | null {
  if (!node) {
    return null;
  }
  if (node.pathKey === pathKey) {
    return node;
  }
  for (const child of node.children) {
    const match = findNodeByPathKey(child, pathKey);
    if (match) {
      return match;
    }
  }
  return null;
}

export function setValueAtPath(
  root: unknown,
  path: JsonPathSegment[],
  newValue: unknown,
): unknown {
  if (path.length === 0) {
    return newValue;
  }

  if (Array.isArray(root)) {
    const clone = [...root];
    const [head, ...rest] = path;
    if (typeof head !== "number") {
      throw new Error("Invalid array path segment.");
    }
    clone[head] =
      rest.length === 0
        ? newValue
        : setValueAtPath(clone[head], rest, newValue);
    return clone;
  }

  if (root && typeof root === "object") {
    const record = { ...(root as Record<string, unknown>) };
    const [head, ...rest] = path;
    if (typeof head !== "string") {
      throw new Error("Invalid object path segment.");
    }
    record[head] =
      rest.length === 0
        ? newValue
        : setValueAtPath(record[head], rest, newValue);
    return record;
  }

  throw new Error("Cannot update value on a non-object path.");
}

export function createDiagramFromData(
  data: unknown,
  collapsed: Map<string, boolean>,
): { root: DiagramNode; nodes: DiagramNode[] } {
  resetNodeIdCounter();
  const root = buildTree(data, "root", []);
  const nodes = layoutTree(root, collapsed);
  return { root, nodes };
}
