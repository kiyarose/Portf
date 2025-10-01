/* eslint-env browser */
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import TypeScript from "typescript/lib/typescript";

declare global {
  interface Window {
    ts?: typeof TypeScript;
  }
}

const fallbackTs = typeof window !== "undefined" ? window.ts : undefined;
const ts =
  TypeScript && Object.keys(TypeScript).length > 0 ? TypeScript : fallbackTs;
const hasTypeScript = typeof ts !== "undefined" && ts !== null;

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Visualizer expected #${id} to exist.`);
  }
  return element as T;
}

const HorizontalSpacing = 200;
const VerticalSpacing = 120;
const NodeWidth = 160;
const NodeHeight = 60;
const NodeRadius = 18;
const DiagramPadding = 40;
const CollapsedNodeFill = "rgba(148, 163, 184, 0.12)";
const ROOT_KEY = "__root__";

const jsonInput = requireElement<HTMLTextAreaElement>("json-source");
const fileInput = requireElement<HTMLInputElement>("json-file");
const rootLabelInput = requireElement<HTMLInputElement>("root-label");
const renderButton = requireElement<HTMLButtonElement>("render");
const clearButton = requireElement<HTMLButtonElement>("clear");
const loadSampleButton = requireElement<HTMLButtonElement>("load-sample");
const statusBox = requireElement<HTMLDivElement>("status");
const openJsonEditorButton =
  requireElement<HTMLButtonElement>("open-json-editor");
const diagramContainer = requireElement<HTMLDivElement>("diagram");
const emptyState = requireElement<HTMLDivElement>("empty-state");
const searchInput = requireElement<HTMLInputElement>("search");
const expandAllButton = requireElement<HTMLButtonElement>("expand-all");
const collapseAllButton = requireElement<HTMLButtonElement>("collapse-all");
const downloadSvgButton = requireElement<HTMLButtonElement>("download-svg");
const downloadTsButton = requireElement<HTMLButtonElement>("download-ts");
const statsBadge = requireElement<HTMLSpanElement>("stats");
const nodeModal = requireElement<HTMLDivElement>("node-modal");
const nodeModalTitle = requireElement<HTMLHeadingElement>("node-modal-title");
const nodeModalMeta = requireElement<HTMLDivElement>("node-modal-meta");
const nodeModalEditor =
  requireElement<HTMLTextAreaElement>("node-modal-editor");
const nodeModalApply = requireElement<HTMLButtonElement>("node-modal-apply");
const nodeModalReset = requireElement<HTMLButtonElement>("node-modal-reset");
const nodeModalClose = requireElement<HTMLButtonElement>("node-modal-close");
const jsonModal = requireElement<HTMLDivElement>("json-modal");
const jsonModalEditor =
  requireElement<HTMLTextAreaElement>("json-modal-editor");
const jsonModalApply = requireElement<HTMLButtonElement>("json-modal-apply");
const jsonModalReset = requireElement<HTMLButtonElement>("json-modal-reset");
const jsonModalClose = requireElement<HTMLButtonElement>("json-modal-close");

let dataModel = null;
let tree = null;
let nodeIdCounter = 0;
let collapsed = new Map([[ROOT_KEY, false]]);
const INITIAL_SCALE = 1.65;
let panZoom = { x: 0, y: 0, scale: INITIAL_SCALE };
const MIN_SCALE = 0.1;
const MAX_SCALE = 6;
const PAN_SENSITIVITY = 1.6;
const WHEEL_SENSITIVITY = 0.35;
let panInitialized = false;
let isPanning = false;
let panPointerId = null;
let panStart = { x: 0, y: 0 };
let panOrigin = { x: 0, y: 0 };
let svgElement = null;
let viewportGroup = null;
let searchTerm = "";
let selectedPathKey = null;
let conversionMeta = null;
let tsSourcePath = null;
const inputModeSelect = requireElement<HTMLSelectElement>("input-mode");
let inputMode = inputModeSelect ? inputModeSelect.value : "json";
const SEARCH_DEBOUNCE_MS = 140;
let searchDebounceId = null;
let nodeElements = new Map();
let edgeElements = new Map();
let nodeIndex = new Map();
let hoverNodeGroups = [];
let hoverEdgePaths = [];
let hoverPathCache = new Map();
let activeHoverPathKey = null;

let printer = null;
let printerSourceFile = null;

function forceJsonMode() {
  if (inputModeSelect) {
    inputModeSelect.value = "json";
  }
  inputMode = "json";
}

if (hasTypeScript) {
  printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  printerSourceFile = ts.createSourceFile(
    "converter.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
} else {
  if (inputModeSelect) {
    inputModeSelect.value = "json";
    const tsOption = inputModeSelect.querySelector('option[value="ts"]');
    if (tsOption) {
      tsOption.disabled = true;
      tsOption.textContent = "TypeScript (unavailable)";
    }
  }
  if (downloadTsButton) {
    downloadTsButton.disabled = true;
  }
  showStatus(
    "TypeScript support is unavailable. JSON mode remains fully functional.",
    "error",
  );
}

function showStatus(message, kind = "success") {
  statusBox.textContent = message;
  statusBox.className = kind === "error" ? "status error" : "status success";
  statusBox.style.display = "block";
}

function clearStatus() {
  statusBox.style.display = "none";
  statusBox.textContent = "";
}

function formatType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }
  return typeof value;
}

function summariseValue(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return `Object(${keys.length})`;
  }
  if (typeof value === "string") {
    return value.length > 32 ? `${value.slice(0, 32)}…` : value;
  }
  return String(value);
}

const PLACEHOLDER_PREFIX = "__DATA_PLACEHOLDER__";

function unwrapLiteral(node) {
  if (!node) {
    return node;
  }
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression?.(node)) {
    return unwrapLiteral(node.expression);
  }
  if (ts.isSatisfiesExpression?.(node) || ts.isNonNullExpression?.(node)) {
    return unwrapLiteral(node.expression);
  }
  if (ts.isParenthesizedExpression(node)) {
    return unwrapLiteral(node.expression);
  }
  return node;
}

function evaluateLiteral(node) {
  const literal = unwrapLiteral(node);

  if (ts.isArrayLiteralExpression(literal)) {
    return literal.elements.map((element) => {
      if (ts.isOmittedExpression(element)) {
        throw new Error("Array holes are not supported in exported literals.");
      }
      if (ts.isSpreadElement(element)) {
        throw new Error(
          "Spread elements are not supported in exported arrays.",
        );
      }
      return evaluateLiteral(element);
    });
  }

  if (ts.isObjectLiteralExpression(literal)) {
    const result = {};
    for (const prop of literal.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        throw new Error(
          "Only standard property assignments are supported in exported objects.",
        );
      }

      let key;
      if (ts.isIdentifier(prop.name)) {
        key = prop.name.text;
      } else if (
        ts.isStringLiteralLike(prop.name) ||
        ts.isNumericLiteral(prop.name)
      ) {
        key = prop.name.text;
      } else {
        throw new Error(
          "Unsupported property name in exported object literal.",
        );
      }

      result[key] = evaluateLiteral(prop.initializer);
    }
    return result;
  }

  if (ts.isStringLiteralLike(literal)) {
    return literal.text;
  }

  if (ts.isTemplateExpression(literal)) {
    if (literal.templateSpans.length === 0) {
      return literal.head.text;
    }
    throw new Error(
      "Template expressions with interpolations are not supported.",
    );
  }

  if (ts.isNumericLiteral(literal)) {
    return Number(literal.text);
  }

  if (ts.isPrefixUnaryExpression(literal)) {
    if (
      literal.operator === ts.SyntaxKind.MinusToken &&
      ts.isNumericLiteral(literal.operand)
    ) {
      return -Number(literal.operand.text);
    }
    throw new Error("Unsupported unary expression in exported literal.");
  }

  if (literal.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (literal.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (literal.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }

  throw new Error(
    "Encountered an unsupported expression while parsing the export literal.",
  );
}

function computeBaseIndent(sourceText, valueStart) {
  const lineStart = sourceText.lastIndexOf("\n", valueStart - 1) + 1;
  let indent = "";
  for (let index = lineStart; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (char === " " || char === "\t") {
      indent += char;
      continue;
    }
    break;
  }
  return indent;
}

function collectTsExports(sourceFile, sourceText) {
  const entries = [];
  const values = {};
  const seen = new Set();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      if (ts.isExportAssignment(statement)) {
        const expression = unwrapLiteral(statement.expression);
        if (
          ts.isArrayLiteralExpression(expression) ||
          ts.isObjectLiteralExpression(expression)
        ) {
          const name = "default";
          if (seen.has(name)) {
            throw new Error("Duplicate default export detected.");
          }

          const value = evaluateLiteral(expression);
          const valueStart = expression.getStart(sourceFile);
          const valueEnd = expression.getEnd();
          const placeholder = `${PLACEHOLDER_PREFIX}${name}_${valueStart}_${valueEnd}__`;
          const baseIndent = computeBaseIndent(sourceText, valueStart);

          entries.push({
            name,
            valueStart,
            valueEnd,
            placeholder,
            baseIndent,
          });
          values[name] = value;
          seen.add(name);
        }
      }
      continue;
    }

    const hasExportModifier =
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ) ?? false;
    if (!hasExportModifier) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue;
      }

      const name = declaration.name.text;
      if (seen.has(name)) {
        throw new Error(`Duplicate export named \`${name}\` was found.`);
      }

      const literalNode = unwrapLiteral(declaration.initializer);
      if (
        !ts.isArrayLiteralExpression(literalNode) &&
        !ts.isObjectLiteralExpression(literalNode)
      ) {
        continue;
      }

      const value = evaluateLiteral(literalNode);
      const valueStart = literalNode.getStart(sourceFile);
      const valueEnd = literalNode.getEnd();
      const placeholder = `${PLACEHOLDER_PREFIX}${name}_${valueStart}_${valueEnd}__`;
      const baseIndent = computeBaseIndent(sourceText, valueStart);

      entries.push({
        name,
        valueStart,
        valueEnd,
        placeholder,
        baseIndent,
      });
      values[name] = value;
      seen.add(name);
    }
  }

  return { entries, values };
}

function buildTemplate(sourceText, entries) {
  const sorted = [...entries].sort((a, b) => a.valueStart - b.valueStart);
  let cursor = 0;
  let template = "";

  for (const entry of sorted) {
    template += sourceText.slice(cursor, entry.valueStart);
    template += entry.placeholder;
    cursor = entry.valueEnd;
  }

  template += sourceText.slice(cursor);
  return template;
}

function isIdentifierCandidate(text) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(text);
}

function createLiteralFromValue(value) {
  if (!hasTypeScript || !ts) {
    throw new Error("TypeScript support is not available.");
  }
  if (value === null) {
    return ts.factory.createNull();
  }

  if (Array.isArray(value)) {
    const elements = value.map((item) => createLiteralFromValue(item));
    return ts.factory.createArrayLiteralExpression(
      elements,
      elements.length > 0,
    );
  }

  switch (typeof value) {
    case "string":
      return ts.factory.createStringLiteral(value);
    case "number":
      return Number.isFinite(value)
        ? ts.factory.createNumericLiteral(value)
        : ts.factory.createStringLiteral(String(value));
    case "boolean":
      return value ? ts.factory.createTrue() : ts.factory.createFalse();
    case "object": {
      const properties = Object.entries(value).map(([key, item]) => {
        const nameNode = isIdentifierCandidate(key)
          ? ts.factory.createIdentifier(key)
          : ts.factory.createStringLiteral(key);
        return ts.factory.createPropertyAssignment(
          nameNode,
          createLiteralFromValue(item),
        );
      });
      return ts.factory.createObjectLiteralExpression(
        properties,
        properties.length > 0,
      );
    }
    default:
      throw new Error(`Unsupported value type: ${typeof value}`);
  }
}

function formatValueForTs(value, baseIndent = "") {
  if (!hasTypeScript || !ts || !printer || !printerSourceFile) {
    throw new Error("TypeScript support is not available.");
  }
  const literal = createLiteralFromValue(value);
  const printed = printer.printNode(
    ts.EmitHint.Expression,
    literal,
    printerSourceFile,
  );
  const lines = printed.split("\n");

  if (lines.length === 1) {
    return lines[0];
  }

  const formatted = [lines[0]];
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.length === 0) {
      formatted.push(line);
      continue;
    }
    const match = line.match(/^(\s*)(.*)$/);
    const leading = match ? match[1].length : 0;
    const remainder = leading % 4;
    const level = (leading - remainder) / 4;
    const adjustedIndent = `${baseIndent}${"  ".repeat(level)}${remainder > 0 ? " ".repeat(remainder) : ""}`;
    formatted.push(`${adjustedIndent}${match ? match[2] : line.trimStart()}`);
  }

  return formatted.join("\n");
}

function convertTsSourceToJson(sourceText, sourceName = "module.ts") {
  if (!hasTypeScript || !ts) {
    throw new Error(
      "TypeScript input cannot be processed because the compiler failed to load.",
    );
  }
  const scriptKind = sourceName.toLowerCase().endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    sourceName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );

  const { entries, values } = collectTsExports(sourceFile, sourceText);

  if (entries.length === 0) {
    throw new Error(
      "No convertible exported arrays or objects were found in the TypeScript module.",
    );
  }

  const template = buildTemplate(sourceText, entries);
  const meta = {
    version: 1,
    template,
    source: sourceName,
    entries: entries.map(({ name, placeholder, baseIndent }) => ({
      name,
      placeholder,
      baseIndent,
    })),
    generatedAt: new Date().toISOString(),
  };

  return { meta, data: values };
}

function convertJsonToTs(meta, data) {
  if (!hasTypeScript || !ts) {
    throw new Error(
      "TypeScript export is unavailable because the compiler failed to load.",
    );
  }
  if (
    !meta ||
    typeof meta !== "object" ||
    !meta.template ||
    !Array.isArray(meta.entries)
  ) {
    throw new Error(
      "Missing conversion metadata. Load a TypeScript module first.",
    );
  }

  let output = meta.template;

  for (const entry of meta.entries) {
    if (!entry || !entry.name || !entry.placeholder) {
      throw new Error("Conversion metadata is malformed.");
    }

    if (!(entry.name in data)) {
      throw new Error(`JSON data is missing export \`${entry.name}\`.`);
    }

    const replacement = formatValueForTs(
      data[entry.name],
      entry.baseIndent ?? "",
    );

    if (!output.includes(entry.placeholder)) {
      throw new Error(
        `Placeholder for export \`${entry.name}\` was not found in the template. The metadata may be out of sync.`,
      );
    }

    output = output.replace(entry.placeholder, replacement);
  }

  return output;
}

function cloneData(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function getSerializablePayload() {
  if (conversionMeta) {
    const metaClone = cloneData(conversionMeta);
    const dataClone = cloneData(dataModel);
    if (
      dataClone &&
      typeof dataClone === "object" &&
      !Array.isArray(dataClone)
    ) {
      return { __meta: metaClone, ...dataClone };
    }
    return { __meta: metaClone, value: dataClone };
  }
  return cloneData(dataModel);
}

function updateJsonTextarea({ refreshTimestamp = false } = {}) {
  if (conversionMeta && refreshTimestamp) {
    conversionMeta.generatedAt = new Date().toISOString();
  }

  const payload = getSerializablePayload();
  if (typeof payload === "undefined") {
    jsonInput.value = "";
    if (jsonModal.classList.contains("is-open")) {
      jsonModalEditor.value = "";
    }
    return;
  }

  try {
    jsonInput.value = JSON.stringify(payload, null, 2);
    if (jsonModal.classList.contains("is-open")) {
      jsonModalEditor.value = jsonInput.value;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Failed to serialize JSON payload:", message);
    // Fallback in case of unexpected serialization issues.
    jsonInput.value = "";
  }
}

function updateDownloadButtons(hasDiagram) {
  downloadSvgButton.disabled = !hasDiagram;
  downloadTsButton.disabled = !hasTypeScript || !hasDiagram || !conversionMeta;
}

function getPathKey(path) {
  if (!path || path.length === 0) {
    return ROOT_KEY;
  }
  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".");
}

function pathToDisplay(path) {
  if (!path || path.length === 0) {
    return "(root)";
  }
  return path.reduce((acc, segment) => {
    if (typeof segment === "number") {
      return `${acc}[${segment}]`;
    }
    return acc ? `${acc}.${segment}` : segment;
  }, "");
}

function formatEditorValue(value) {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

function buildTree(value, label, path, parentPathKey = null) {
  const id = `node-${(nodeIdCounter += 1)}`;
  const pathKey = getPathKey(path);
  let children = [];

  if (Array.isArray(value)) {
    children = value.map((item, index) =>
      buildTree(item, `[${index}]`, [...path, index], pathKey),
    );
  } else if (value && typeof value === "object") {
    children = Object.entries(value).map(([key, item]) =>
      buildTree(item, key, [...path, key], pathKey),
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

function measure(node) {
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

function assignPositions(node, center, depth) {
  node.y = depth * VerticalSpacing;
  const isCollapsed = collapsed.get(node.pathKey) === true;

  if (!node.children || node.children.length === 0 || isCollapsed) {
    node.x = center;
    node.visibleChildren = [];
    return;
  }

  let cursor = center - (node.width * HorizontalSpacing) / 2;
  node.visibleChildren = [];

  for (const child of node.children) {
    const childSpan = child.width * HorizontalSpacing;
    const childCenter = cursor + childSpan / 2;
    assignPositions(child, childCenter, depth + 1);
    node.visibleChildren.push(child);
    cursor += childSpan;
  }

  if (node.visibleChildren.length > 0) {
    const first = node.visibleChildren[0];
    const last = node.visibleChildren[node.visibleChildren.length - 1];
    node.x = (first.x + last.x) / 2;
  } else {
    node.x = center;
  }
}

function collectVisibleNodes(node, list = []) {
  list.push(node);
  if (node.visibleChildren) {
    for (const child of node.visibleChildren) {
      collectVisibleNodes(child, list);
    }
  }
  return list;
}

function indexTree(node, chain = []) {
  if (!node) {
    return;
  }
  const currentChain =
    chain.length === 0 ? [node.pathKey] : [...chain, node.pathKey];
  nodeIndex.set(node.pathKey, node);
  hoverPathCache.set(node.pathKey, currentChain);
  if (node.children) {
    for (const child of node.children) {
      indexTree(child, currentChain);
    }
  }
}

function findNodeByPathKey(node, pathKey) {
  if (!node) {
    return null;
  }
  if (node.pathKey === pathKey) {
    return node;
  }
  if (!node.children) {
    return null;
  }
  for (const child of node.children) {
    const match = findNodeByPathKey(child, pathKey);
    if (match) {
      return match;
    }
  }
  return null;
}

function getNodeByPathKeyCached(pathKey) {
  if (!pathKey) {
    return null;
  }
  return nodeIndex.get(pathKey) ?? findNodeByPathKey(tree, pathKey);
}

function matchesSearch(node, term) {
  const valueString =
    typeof node.value === "object"
      ? JSON.stringify(node.value)
      : String(node.value);
  const pathString = pathToDisplay(node.path);
  const label = node.label || "";
  const summary = node.summary || "";
  const haystack =
    `${label} ${summary} ${pathString} ${valueString}`.toLowerCase();
  return haystack.includes(term.toLowerCase());
}

let transformFrame = null;
function requestTransformUpdate() {
  if (transformFrame !== null) {
    return;
  }
  transformFrame = requestAnimationFrame(() => {
    transformFrame = null;
    if (!viewportGroup) {
      return;
    }
    viewportGroup.setAttribute(
      "transform",
      `translate(${panZoom.x}, ${panZoom.y}) scale(${panZoom.scale})`,
    );
  });
}

function applyTransform() {
  panZoom.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, panZoom.scale));
  requestTransformUpdate();
}

function resetPanZoom() {
  panInitialized = false;
  panZoom = { x: 0, y: 0, scale: INITIAL_SCALE };
  applyTransform();
}

function getLocalPoint(event) {
  if (!svgElement) {
    return { x: 0, y: 0 };
  }
  const rect = svgElement.getBoundingClientRect();
  const clientX = event.clientX - rect.left;
  const clientY = event.clientY - rect.top;
  return {
    x: (clientX - panZoom.x) / panZoom.scale,
    y: (clientY - panZoom.y) / panZoom.scale,
  };
}

function setupPanZoomHandlers(svg) {
  svg.style.touchAction = "none";

  const handlePointerDown = (event) => {
    const nodeTarget = event.target.closest?.("[data-node-id]");
    const shouldPan =
      event.button === 1 ||
      (event.button === 0 && (event.shiftKey || !nodeTarget));

    if (!shouldPan) {
      return;
    }

    event.preventDefault();
    isPanning = true;
    panPointerId = event.pointerId;
    panStart = { x: event.clientX, y: event.clientY };
    panOrigin = { x: panZoom.x, y: panZoom.y };
    diagramContainer.classList.add("panning");
    svg.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isPanning || event.pointerId !== panPointerId) {
      return;
    }
    const dx = (event.clientX - panStart.x) * PAN_SENSITIVITY;
    const dy = (event.clientY - panStart.y) * PAN_SENSITIVITY;
    panZoom.x = panOrigin.x + dx;
    panZoom.y = panOrigin.y + dy;
    applyTransform();
  };

  const handlePointerUp = (event) => {
    if (event.pointerId !== panPointerId) {
      return;
    }
    isPanning = false;
    panPointerId = null;
    diagramContainer.classList.remove("panning");
    try {
      svg.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (event) => {
    if (!viewportGroup) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY * WHEEL_SENSITIVITY;
    const scaleFactor = Math.exp(-delta / 180);
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, panZoom.scale * scaleFactor),
    );
    const localPoint = getLocalPoint(event);

    panZoom.x =
      localPoint.x - (localPoint.x - panZoom.x) * (newScale / panZoom.scale);
    panZoom.y =
      localPoint.y - (localPoint.y - panZoom.y) * (newScale / panZoom.scale);
    panZoom.scale = newScale;
    applyTransform();
  };

  svg.addEventListener("pointerdown", handlePointerDown);
  svg.addEventListener("pointermove", handlePointerMove);
  svg.addEventListener("pointerup", handlePointerUp);
  svg.addEventListener("pointercancel", handlePointerUp);
  svg.addEventListener("wheel", handleWheel, { passive: false });
}

function renderTree(root) {
  if (!root) {
    clearHoverPath();
    nodeElements = new Map();
    edgeElements = new Map();
    hoverPathCache = new Map();
    activeHoverPathKey = null;
    diagramContainer.innerHTML = "";
    diagramContainer.appendChild(emptyState);
    emptyState.hidden = false;
    svgElement = null;
    viewportGroup = null;
    updateDownloadButtons(false);
    statsBadge.hidden = true;
    if (nodeModal.classList.contains("is-open")) {
      closeNodeModal();
      clearStatus();
    } else {
      highlightSelected(null);
      selectedPathKey = null;
    }
    applySearchFilter();
    return;
  }

  measure(root);
  clearHoverPath();
  nodeElements = new Map();
  edgeElements = new Map();
  assignPositions(root, 0, 0);
  const nodes = collectVisibleNodes(root, []);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let deepestY = -Infinity;

  for (const node of nodes) {
    if (node.x < minX) {
      minX = node.x;
    }
    if (node.x > maxX) {
      maxX = node.x;
    }
    if (node.y < minY) {
      minY = node.y;
    }
    if (node.y > maxY) {
      maxY = node.y;
    }
    if (node.y > deepestY) {
      deepestY = node.y;
    }
  }

  if (!Number.isFinite(minX)) {
    minX = 0;
    maxX = 0;
    minY = 0;
    maxY = 0;
    deepestY = 0;
  }

  const width = Math.max(960, maxX - minX + NodeWidth + DiagramPadding * 2);
  const height = Math.max(640, maxY - minY + NodeHeight + DiagramPadding * 2);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.minWidth = "100%";
  svg.style.minHeight = "100%";

  const defs = document.createElementNS(svg.namespaceURI, "defs");
  const edgeGradient = document.createElementNS(
    svg.namespaceURI,
    "linearGradient",
  );
  edgeGradient.setAttribute("id", "edgeGradient");
  edgeGradient.setAttribute("x1", "0%");
  edgeGradient.setAttribute("y1", "0%");
  edgeGradient.setAttribute("x2", "100%");
  edgeGradient.setAttribute("y2", "100%");
  edgeGradient.setAttribute("gradientUnits", "objectBoundingBox");

  const edgeStop1 = document.createElementNS(svg.namespaceURI, "stop");
  edgeStop1.setAttribute("offset", "0%");
  edgeStop1.setAttribute("stop-color", "rgba(148, 163, 184, 0.7)");

  const edgeStop2 = document.createElementNS(svg.namespaceURI, "stop");
  edgeStop2.setAttribute("offset", "60%");
  edgeStop2.setAttribute("stop-color", "rgba(236, 72, 153, 0.55)");

  const edgeStop3 = document.createElementNS(svg.namespaceURI, "stop");
  edgeStop3.setAttribute("offset", "100%");
  edgeStop3.setAttribute("stop-color", "rgba(249, 115, 22, 0.6)");

  edgeGradient.append(edgeStop1, edgeStop2, edgeStop3);
  defs.append(edgeGradient);

  svg.appendChild(defs);

  const viewport = document.createElementNS(svg.namespaceURI, "g");
  svg.appendChild(viewport);
  viewportGroup = viewport;

  const edgesGroup = document.createElementNS(svg.namespaceURI, "g");
  edgesGroup.setAttribute("fill", "none");
  edgesGroup.setAttribute("stroke", "var(--edge-default)");
  edgesGroup.setAttribute("stroke-width", "1.6");
  viewport.appendChild(edgesGroup);

  const nodesGroup = document.createElementNS(svg.namespaceURI, "g");
  viewport.appendChild(nodesGroup);

  const edgesFragment = document.createDocumentFragment();
  const nodesFragment = document.createDocumentFragment();

  for (const node of nodes) {
    if (!node.visibleChildren || node.visibleChildren.length === 0) {
      continue;
    }
    for (const child of node.visibleChildren) {
      const path = document.createElementNS(svg.namespaceURI, "path");
      const startX = node.x - minX + DiagramPadding + NodeWidth / 2;
      const startY = node.y - minY + DiagramPadding + NodeHeight;
      const endX = child.x - minX + DiagramPadding + NodeWidth / 2;
      const endY = child.y - minY + DiagramPadding;
      const controlOffset = (endY - startY) / 2;
      const pathDefinition = `M ${startX} ${startY} C ${startX} ${startY + controlOffset}, ${endX} ${endY - controlOffset}, ${endX} ${endY}`;
      path.setAttribute("d", pathDefinition);
      const edgeKey = `${node.pathKey}->${child.pathKey}`;
      path.dataset.edge = "true";
      path.dataset.from = node.pathKey;
      path.dataset.to = child.pathKey;
      path.classList.add("tree-edge");
      path.setAttribute("stroke", "url(#edgeGradient)");
      edgeElements.set(edgeKey, path);
      edgesFragment.appendChild(path);
    }
  }

  for (const node of nodes) {
    const group = document.createElementNS(svg.namespaceURI, "g");
    group.dataset.nodeId = node.id;
    group.dataset.pathKey = node.pathKey;
    group.dataset.parentPathKey = node.parentPathKey ?? "";
    group.classList.add("tree-node");
    const x = node.x - minX + DiagramPadding;
    const y = node.y - minY + DiagramPadding;

    const rect = document.createElementNS(svg.namespaceURI, "rect");
    rect.setAttribute("x", `${x}`);
    rect.setAttribute("y", `${y}`);
    rect.setAttribute("rx", `${NodeRadius}`);
    rect.setAttribute("ry", `${NodeRadius}`);
    rect.setAttribute("width", `${NodeWidth}`);
    rect.setAttribute("height", `${NodeHeight}`);
    rect.setAttribute(
      "fill",
      collapsed.get(node.pathKey) ? CollapsedNodeFill : "var(--node)",
    );
    rect.setAttribute("stroke", "var(--node-border)");
    rect.setAttribute("stroke-width", "1.3");
    group.appendChild(rect);

    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", `${x + 16}`);
    label.setAttribute("y", `${y + 26}`);
    label.setAttribute("class", "node-label");
    label.textContent = node.label || "(root)";
    group.appendChild(label);

    const summary = document.createElementNS(svg.namespaceURI, "text");
    summary.setAttribute("x", `${x + 16}`);
    summary.setAttribute("y", `${y + 46}`);
    summary.setAttribute("class", "node-meta");
    summary.textContent = `${node.type} • ${node.summary}`;
    group.appendChild(summary);

    if (node.children && node.children.length > 0) {
      const toggle = document.createElementNS(svg.namespaceURI, "text");
      toggle.setAttribute("x", `${x + NodeWidth - 22}`);
      toggle.setAttribute("y", `${y + 24}`);
      toggle.setAttribute("fill", "var(--accent)");
      toggle.setAttribute("font-size", "16");
      toggle.setAttribute(
        "font-family",
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      );
      toggle.textContent = collapsed.get(node.pathKey) ? "+" : "−";
      toggle.classList.add("toggle-icon");
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleNode(node.pathKey);
      });
      group.appendChild(toggle);
    }

    group.addEventListener("click", (event) => {
      event.stopPropagation();
      setSelectedNode(node);
    });

    group.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      toggleNode(node.pathKey);
    });

    group.addEventListener("mouseenter", () => {
      highlightHoverPath(node.pathKey);
    });

    group.addEventListener("mouseleave", () => {
      clearHoverPath();
    });

    nodesFragment.appendChild(group);
    nodeElements.set(node.pathKey, group);
  }

  edgesGroup.appendChild(edgesFragment);
  nodesGroup.appendChild(nodesFragment);

  diagramContainer.replaceChildren(svg);
  emptyState.hidden = true;
  svgElement = svg;
  diagramContainer.classList.remove("panning");
  setupPanZoomHandlers(svg);

  if (!panInitialized) {
    const containerWidth = diagramContainer.clientWidth || width;
    const containerHeight = diagramContainer.clientHeight || height;
    panZoom.scale = INITIAL_SCALE;
    const scaledWidth = width * panZoom.scale;
    const scaledHeight = height * panZoom.scale;
    panZoom.x = (containerWidth - scaledWidth) / 2;
    panZoom.y = Math.max(48, (containerHeight - scaledHeight) / 2);
    panInitialized = true;
  }

  applyTransform();

  const totalNodes = nodes.length;
  const depth = deepestY / VerticalSpacing + 1;
  statsBadge.textContent = `${totalNodes} node${totalNodes === 1 ? "" : "s"} • depth ${Math.round(depth)}`;
  statsBadge.hidden = false;

  restoreSelection();
  updateDownloadButtons(true);
  applySearchFilter();
}

function updateModalContent(node) {
  nodeModalTitle.textContent = node.label || "Root";
  nodeModalMeta.textContent = "";
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = node.type;
  const pathSpan = document.createElement("span");
  pathSpan.style.color = "var(--text-muted)";
  pathSpan.style.marginLeft = "12px";
  pathSpan.style.fontSize = "0.85rem";
  pathSpan.textContent = pathToDisplay(node.path);
  nodeModalMeta.appendChild(badge);
  nodeModalMeta.appendChild(pathSpan);
  nodeModalEditor.value = formatEditorValue(node.value);
}

function highlightSelected(nodeId) {
  if (!svgElement) {
    return;
  }
  svgElement.querySelectorAll("[data-node-id]").forEach((group) => {
    const rect = group.querySelector("rect");
    if (!rect) {
      return;
    }
    const pathKey = group.dataset.pathKey;
    if (nodeId && group.dataset.nodeId === nodeId) {
      rect.setAttribute("fill", "var(--node-selected)");
      rect.setAttribute("stroke", "var(--accent-muted)");
    } else {
      rect.setAttribute(
        "fill",
        collapsed.get(pathKey) ? CollapsedNodeFill : "var(--node)",
      );
      rect.setAttribute("stroke", "var(--node-border)");
    }
  });
}

function clearHoverPath() {
  if (hoverNodeGroups.length > 0) {
    for (const group of hoverNodeGroups) {
      group.classList.remove("hover-path");
    }
    hoverNodeGroups = [];
  }

  if (hoverEdgePaths.length > 0) {
    for (const edge of hoverEdgePaths) {
      edge.classList.remove("hover-path-edge");
    }
    hoverEdgePaths = [];
  }

  activeHoverPathKey = null;
}

function applyHoverStylesToNode(group) {
  group.classList.add("hover-path");
  hoverNodeGroups.push(group);
}

function applyHoverStylesToEdge(edge) {
  edge.classList.add("hover-path-edge");
  hoverEdgePaths.push(edge);
}

function highlightHoverPath(pathKey) {
  if (!tree || !pathKey) {
    clearHoverPath();
    return;
  }

  if (pathKey === activeHoverPathKey) {
    return;
  }

  const chain = hoverPathCache.get(pathKey);
  if (!chain || chain.length === 0) {
    clearHoverPath();
    return;
  }

  clearHoverPath();

  for (const key of chain) {
    const group = nodeElements.get(key);
    if (group) {
      applyHoverStylesToNode(group);
    }
  }

  for (let index = 0; index < chain.length - 1; index += 1) {
    const edgeKey = `${chain[index]}->${chain[index + 1]}`;
    const edge = edgeElements.get(edgeKey);
    if (edge) {
      applyHoverStylesToEdge(edge);
    }
  }

  activeHoverPathKey = pathKey;
}

function applySearchFilter() {
  const term = searchTerm.trim().toLowerCase();
  if (!nodeElements || nodeElements.size === 0) {
    return;
  }

  nodeElements.forEach((group, pathKey) => {
    if (!group) {
      return;
    }
    if (!term) {
      group.classList.remove("search-hit");
      return;
    }

    const node = getNodeByPathKeyCached(pathKey);
    if (!node) {
      group.classList.remove("search-hit");
      return;
    }

    const match = matchesSearch(node, term);
    group.classList.toggle("search-hit", match);
  });
}

function openNodeModal(node) {
  selectedPathKey = node.pathKey;
  updateModalContent(node);
  nodeModal.setAttribute("aria-hidden", "false");
  nodeModal.classList.add("is-open");
  highlightSelected(node.id);
  requestAnimationFrame(() => {
    nodeModalEditor.focus({ preventScroll: true });
  });
}

function closeNodeModal() {
  nodeModal.classList.remove("is-open");
  nodeModal.setAttribute("aria-hidden", "true");
  highlightSelected(null);
  selectedPathKey = null;
  clearHoverPath();
}

function openJsonModal() {
  if (!jsonModal) {
    return;
  }
  forceJsonMode();
  jsonModalEditor.value = jsonInput.value;
  jsonModal.classList.add("is-open");
  jsonModal.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    jsonModalEditor.focus({ preventScroll: true });
  });
}

function closeJsonModal() {
  if (!jsonModal) {
    return;
  }
  jsonModal.classList.remove("is-open");
  jsonModal.setAttribute("aria-hidden", "true");
}

function setSelectedNode(node) {
  openNodeModal(node);
}

function restoreSelection() {
  if (!selectedPathKey || !tree) {
    if (nodeModal.classList.contains("is-open")) {
      closeNodeModal();
      clearStatus();
    } else {
      highlightSelected(null);
    }
    return;
  }
  const node = findNodeByPathKey(tree, selectedPathKey);
  if (node) {
    if (nodeModal.classList.contains("is-open")) {
      updateModalContent(node);
    }
    highlightSelected(node.id);
  } else {
    if (nodeModal.classList.contains("is-open")) {
      closeNodeModal();
      clearStatus();
    } else {
      highlightSelected(null);
      selectedPathKey = null;
    }
  }
}

function toggleNode(pathKey) {
  if (pathKey === ROOT_KEY) {
    return;
  }
  const current = collapsed.get(pathKey) === true;
  collapsed.set(pathKey, !current);
  renderTree(tree);
}

function expandAllNodes() {
  collapsed = new Map([[ROOT_KEY, false]]);
  renderTree(tree);
}

function collapseAllNodes() {
  if (!tree) {
    return;
  }
  collapsed = new Map([[ROOT_KEY, false]]);
  const queue = [...tree.children];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) {
      continue;
    }
    if (node.children && node.children.length > 0) {
      collapsed.set(node.pathKey, true);
      queue.push(...node.children);
    }
  }
  renderTree(tree);
}

function pruneCollapsedForPath(pathKey) {
  if (!pathKey) {
    return;
  }
  for (const key of [...collapsed.keys()]) {
    if (key === pathKey) {
      continue;
    }
    if (key.startsWith(`${pathKey}.`)) {
      collapsed.delete(key);
    }
  }
}

function updateDataModel(path, newValue) {
  if (!path || path.length === 0) {
    dataModel = newValue;
    return;
  }

  let target = dataModel;
  for (let index = 0; index < path.length - 1; index += 1) {
    if (!target || typeof target !== "object") {
      throw new Error("Cannot update value on a non-object path segment.");
    }
    const segment = path[index];
    target = target[segment];
  }

  if (!target || typeof target !== "object") {
    throw new Error("Cannot update value on a non-object target.");
  }

  const lastSegment = path[path.length - 1];
  if (typeof lastSegment !== "string" && typeof lastSegment !== "number") {
    throw new Error("Unsupported path segment type.");
  }
  target[lastSegment] = newValue;
}

function parseEditorValue(rawValue, currentValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "") {
    return "";
  }
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Failed to parse editor value as JSON:", message);
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

function commitNodeChange(
  pathKey,
  editorValue,
  { showStatusMessage = false } = {},
) {
  if (!tree) {
    return false;
  }
  const node = findNodeByPathKey(tree, pathKey);
  if (!node) {
    if (showStatusMessage) {
      showStatus("Selected node is no longer available.", "error");
    }
    return false;
  }

  let newValue;
  try {
    newValue = parseEditorValue(editorValue, node.value);
  } catch (error) {
    if (showStatusMessage) {
      showStatus(error.message, "error");
    }
    return false;
  }

  if (node.path.length === 0) {
    collapsed = new Map([[ROOT_KEY, false]]);
  } else {
    pruneCollapsedForPath(node.pathKey);
  }

  updateDataModel(node.path, newValue);
  updateJsonTextarea({ refreshTimestamp: true });
  rebuildTree({ preserveSelection: true });

  if (nodeModal.classList.contains("is-open")) {
    const refreshed = findNodeByPathKey(tree, pathKey);
    if (refreshed) {
      updateModalContent(refreshed);
      highlightSelected(refreshed.id);
    } else {
      closeNodeModal();
      clearStatus();
    }
  }

  if (showStatusMessage) {
    showStatus("Node updated.", "success");
  }

  return true;
}

function rebuildTree({
  preserveSelection = true,
  preserveCollapsed = true,
  resetPan = false,
} = {}) {
  if (dataModel === null || typeof dataModel === "undefined") {
    renderTree(null);
    return;
  }
  if (!preserveCollapsed) {
    collapsed = new Map([[ROOT_KEY, false]]);
  }
  if (!preserveSelection) {
    if (nodeModal.classList.contains("is-open")) {
      closeNodeModal();
      clearStatus();
    } else {
      selectedPathKey = null;
    }
  }
  if (resetPan) {
    resetPanZoom();
  }

  nodeIdCounter = 0;
  tree = buildTree(dataModel, rootLabelInput.value.trim() || "root", [], null);
  nodeIndex = new Map();
  hoverPathCache = new Map();
  activeHoverPathKey = null;
  indexTree(tree);
  renderTree(tree);
}

function renderFromInput() {
  clearStatus();
  const rawText = jsonInput.value.trim();
  if (!rawText) {
    showStatus(
      `Provide ${inputMode === "ts" ? "TypeScript" : "JSON"} input to render a diagram.`,
      "error",
    );
    return false;
  }

  if (inputMode === "ts") {
    if (!hasTypeScript || !ts) {
      showStatus(
        "TypeScript input cannot be processed because the compiler failed to load.",
        "error",
      );
      return false;
    }
    try {
      const sourceName = tsSourcePath || "module.ts";
      const { meta, data } = convertTsSourceToJson(rawText, sourceName);
      conversionMeta = meta;
      tsSourcePath = meta.source || sourceName;
      dataModel = cloneData(data);
      collapsed = new Map([[ROOT_KEY, false]]);
      updateJsonTextarea({ refreshTimestamp: false });
      rebuildTree({
        preserveSelection: false,
        preserveCollapsed: false,
        resetPan: true,
      });
      showStatus(
        `Converted ${tsSourcePath || "module.ts"} to JSON.`,
        "success",
      );
      return true;
    } catch (error) {
      renderTree(null);
      updateDownloadButtons(false);
      showStatus(
        error instanceof Error ? error.message : String(error),
        "error",
      );
      return false;
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("Failed to parse JSON input:", message);
    showStatus("Input is not valid JSON.", "error");
    return false;
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    parsed.__meta &&
    parsed.__meta.template
  ) {
    const { __meta: metaInfo, ...rest } = parsed;
    conversionMeta = metaInfo;
    tsSourcePath = conversionMeta.source || tsSourcePath;
    dataModel = Object.keys(rest).length > 0 ? rest : {};
  } else {
    conversionMeta = null;
    tsSourcePath = null;
    dataModel = parsed;
  }

  collapsed = new Map([[ROOT_KEY, false]]);
  updateJsonTextarea({ refreshTimestamp: false });
  rebuildTree({
    preserveSelection: false,
    preserveCollapsed: false,
    resetPan: true,
  });
  showStatus("Diagram generated successfully.", "success");
  return true;
}

function clearAll() {
  dataModel = null;
  tree = null;
  conversionMeta = null;
  tsSourcePath = null;
  jsonInput.value = "";
  if (inputModeSelect) {
    inputModeSelect.value = "json";
  }
  inputMode = "json";
  collapsed = new Map([[ROOT_KEY, false]]);
  selectedPathKey = null;
  panInitialized = false;
  resetPanZoom();
  renderTree(null);
  clearStatus();
  if (jsonModal.classList.contains("is-open")) {
    closeJsonModal();
  }
  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
    searchDebounceId = null;
  }
}

function loadSample() {
  const sample = {
    name: "Kiya Rose",
    location: {
      city: "Altoona",
      state: "PA",
      timezone: "America/New_York",
    },
    projects: [
      {
        title: "SillyLittleFiles",
        stack: ["ProtonVPN", "OpenVPN", "JavaScript"],
      },
      {
        title: "Enterprise Virtualization Project",
        stack: ["HPE", "Windows Server", "VMWare", "ILO"],
      },
    ],
    skills: {
      core: ["Information Technology", "Customer Service", "Research"],
      developing: ["Medical Coding", "Health Informatics"],
    },
    socials: [
      { label: "GitHub", url: "https://github.com/kiyarose" },
      { label: "LinkedIn", url: "https://linkedin.com/in/kiyarose" },
    ],
  };
  if (inputModeSelect) {
    inputModeSelect.value = "json";
  }
  inputMode = "json";
  conversionMeta = null;
  tsSourcePath = null;
  dataModel = cloneData(sample);
  collapsed = new Map([[ROOT_KEY, false]]);
  selectedPathKey = null;
  rootLabelInput.value = "portfolio";
  updateJsonTextarea({ refreshTimestamp: false });
  rebuildTree({
    preserveSelection: false,
    preserveCollapsed: false,
    resetPan: true,
  });
  showStatus("Loaded sample portfolio data.", "success");
}

function downloadSvg() {
  if (!svgElement) {
    return;
  }
  const clone = svgElement.cloneNode(true);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  downloadText("json-diagram.svg", svgString, "image/svg+xml");
}

function downloadText(filename, text, mimeType = "text/plain") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "ts" || extension === "tsx") {
    if (!hasTypeScript || !ts) {
      showStatus(
        "TypeScript files cannot be parsed because the compiler failed to load.",
        "error",
      );
      if (inputModeSelect) {
        inputModeSelect.value = "json";
      }
      inputMode = "json";
      tsSourcePath = null;
    } else {
      if (inputModeSelect) {
        inputModeSelect.value = "ts";
      }
      inputMode = "ts";
      tsSourcePath = file.name;
    }
  } else {
    if (inputModeSelect) {
      inputModeSelect.value = "json";
    }
    inputMode = "json";
    tsSourcePath = null;
  }
  const reader = new FileReader();
  reader.onload = () => {
    jsonInput.value = String(reader.result ?? "");
    renderFromInput();
  };
  reader.readAsText(file);
});

if (inputModeSelect) {
  inputModeSelect.addEventListener("change", () => {
    if (inputModeSelect.value === "ts" && (!hasTypeScript || !ts)) {
      inputModeSelect.value = "json";
      showStatus(
        "TypeScript mode is unavailable because the compiler failed to load.",
        "error",
      );
      inputMode = "json";
      return;
    }
    inputMode = inputModeSelect.value;
  });
}

renderButton.addEventListener("click", renderFromInput);
clearButton.addEventListener("click", clearAll);
loadSampleButton.addEventListener("click", loadSample);
expandAllButton.addEventListener("click", () => {
  expandAllNodes();
});
collapseAllButton.addEventListener("click", () => {
  collapseAllNodes();
});
downloadSvgButton.addEventListener("click", downloadSvg);
downloadTsButton.addEventListener("click", () => {
  if (!hasTypeScript || !ts) {
    showStatus(
      "TypeScript export is unavailable because the compiler failed to load.",
      "error",
    );
    return;
  }
  if (!conversionMeta) {
    showStatus(
      "No TypeScript metadata available. Load a TypeScript module first.",
      "error",
    );
    return;
  }
  try {
    const targetData =
      dataModel && typeof dataModel === "object" && !Array.isArray(dataModel)
        ? dataModel
        : { value: dataModel };
    const tsText = convertJsonToTs(conversionMeta, targetData);
    const baseCandidate = tsSourcePath || conversionMeta.source || "data.ts";
    const baseName = baseCandidate.split(/[\\/]/).pop() || "data.ts";
    const sanitized = baseName.replace(/[\s]+/g, "-");
    const tsExtensionPattern = /\.tsx?$/;
    const filename = tsExtensionPattern.test(sanitized)
      ? sanitized.replace(tsExtensionPattern, ".ts")
      : `${sanitized}.ts`;
    downloadText(filename, tsText, "text/typescript");
    showStatus(`Exported ${filename}.`, "success");
  } catch (error) {
    showStatus(error instanceof Error ? error.message : String(error), "error");
  }
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  if (searchDebounceId) {
    clearTimeout(searchDebounceId);
  }
  searchDebounceId = setTimeout(() => {
    searchDebounceId = null;
    applySearchFilter();
  }, SEARCH_DEBOUNCE_MS);
});

if (openJsonEditorButton) {
  openJsonEditorButton.addEventListener("click", () => {
    openJsonModal();
  });
}

jsonModalApply.addEventListener("click", () => {
  forceJsonMode();
  jsonInput.value = jsonModalEditor.value;
  const succeeded = renderFromInput();
  if (succeeded) {
    closeJsonModal();
  }
});

jsonModalReset.addEventListener("click", () => {
  jsonModalEditor.value = jsonInput.value;
  clearStatus();
});

jsonModalClose.addEventListener("click", () => {
  closeJsonModal();
});

jsonModal.addEventListener("click", (event) => {
  if (event.target === jsonModal) {
    closeJsonModal();
  }
});

nodeModalApply.addEventListener("click", () => {
  if (!selectedPathKey) {
    showStatus("Select a node before applying changes.", "error");
    return;
  }
  commitNodeChange(selectedPathKey, nodeModalEditor.value, {
    showStatusMessage: true,
  });
});

nodeModalReset.addEventListener("click", () => {
  if (!tree || !selectedPathKey) {
    return;
  }
  const node = findNodeByPathKey(tree, selectedPathKey);
  if (node) {
    updateModalContent(node);
  }
  clearStatus();
});

nodeModalClose.addEventListener("click", () => {
  closeNodeModal();
  clearStatus();
});

nodeModal.addEventListener("click", (event) => {
  if (event.target === nodeModal) {
    closeNodeModal();
    clearStatus();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nodeModal.classList.contains("is-open")) {
    closeNodeModal();
    clearStatus();
  }
  if (event.key === "Escape" && jsonModal.classList.contains("is-open")) {
    closeJsonModal();
  }
});

diagramContainer.addEventListener("click", () => {
  if (nodeModal.classList.contains("is-open")) {
    closeNodeModal();
    clearStatus();
  }
});

diagramContainer.addEventListener("mouseleave", () => {
  clearHoverPath();
});

clearAll();
