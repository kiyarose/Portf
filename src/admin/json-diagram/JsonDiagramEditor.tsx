import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useTheme } from "../../hooks/useTheme";
import {
  ROOT_KEY,
  NODE_HEIGHT,
  NODE_WIDTH,
  addArrayItem,
  addObjectProperty,
  createDiagramFromData,
  findNodeByPathKey,
  formatEditorValue,
  parseEditorValue,
  pathToDisplay,
  removeAtPath,
  setValueAtPath,
  type DiagramNode,
} from "./jsonTree";

const INITIAL_SCALE = 1.15;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const DIAGRAM_PADDING = 40;

const DIAGRAM_THEME = {
  light: {
    nodeFill: "#ffffff",
    nodeMutedFill: "rgba(148, 163, 184, 0.14)",
    labelFill: "#0f172a",
    summaryFill: "#64748b",
    edgeStroke: "rgba(148, 163, 184, 0.55)",
    nodeStroke: "rgba(148, 163, 184, 0.45)",
  },
  dark: {
    nodeFill: "#1e293b",
    nodeMutedFill: "rgba(51, 65, 85, 0.85)",
    labelFill: "#f1f5f9",
    summaryFill: "#94a3b8",
    edgeStroke: "rgba(148, 163, 184, 0.4)",
    nodeStroke: "rgba(148, 163, 184, 0.35)",
  },
} as const;

type JsonDiagramEditorProps = {
  data: unknown;
  onChange: (next: unknown) => void;
  className?: string;
};

type ContextMenuState = {
  x: number;
  y: number;
  node: DiagramNode | null;
};

function AdminModalShell({
  labelledBy,
  onClose,
  panelClassName,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 w-full rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card dark:border-slate-700/60 dark:bg-slate-900",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function NodeEditModal({
  node,
  onClose,
  onApply,
}: {
  node: DiagramNode;
  onClose: () => void;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = useState(() => formatEditorValue(node.value));
  const [error, setError] = useState<string | null>(null);

  return (
    <AdminModalShell
      labelledBy="node-modal-title"
      onClose={onClose}
      panelClassName="max-w-xl"
    >
        <div>
          <h2
            id="node-modal-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {node.label || "Root"}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
              {node.type}
            </span>
            <span className="ml-2">{pathToDisplay(node.path)}</span>
          </p>
        </div>
        <textarea
          spellCheck={false}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          className="mt-4 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        {error ? (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                parseEditorValue(draft, node.value);
                onApply(draft);
                setError(null);
              } catch (applyError) {
                setError(
                  applyError instanceof Error
                    ? applyError.message
                    : "Invalid value",
                );
              }
            }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
          >
            Apply
          </button>
        </div>
    </AdminModalShell>
  );
}

function NewPropertyModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (key: string) => void;
}) {
  const [keyName, setKeyName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <AdminModalShell
      labelledBy="new-property-title"
      onClose={onClose}
      panelClassName="max-w-md"
    >
        <h3
          id="new-property-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          New property name
        </h3>
        <input
          ref={inputRef}
          type="text"
          value={keyName}
          onChange={(event) => setKeyName(event.target.value)}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const trimmed = keyName.trim();
              if (trimmed) {
                onApply(trimmed);
              }
            }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>
    </AdminModalShell>
  );
}

function DeleteConfirmModal({
  label,
  onClose,
  onConfirm,
}: {
  label: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModalShell
      labelledBy="delete-node-title"
      onClose={onClose}
      panelClassName="max-w-md"
    >
        <h3
          id="delete-node-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Delete node?
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Delete {label}? This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white"
          >
            Delete
          </button>
        </div>
    </AdminModalShell>
  );
}

function ContextMenu({
  menu,
  onClose,
  onAction,
}: {
  menu: ContextMenuState;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const node = menu.node;
  const value = node?.value;
  const canAddProperty =
    node &&
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
  const canAddArrayItem = node && Array.isArray(value);
  const canDelete = node && node.path.length > 0;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40"
        aria-label="Close menu"
        onClick={onClose}
        onContextMenu={onClose}
      />
      <div
        className="fixed z-50 min-w-[168px] rounded-2xl border border-slate-200/80 bg-white py-1 shadow-card dark:border-slate-700 dark:bg-slate-900"
        style={{ left: menu.x, top: menu.y }}
        role="menu"
      >
        {node ? (
          <>
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => onAction("edit")}
            >
              Edit value
            </button>
            {canAddProperty ? (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onAction("addProperty")}
              >
                Add property…
              </button>
            ) : null}
            {canAddArrayItem ? (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => onAction("addArrayItem")}
              >
                Add array item
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                onClick={() => onAction("delete")}
              >
                Delete node
              </button>
            ) : null}
          </>
        ) : (
          <p className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
            Right-click a node for actions
          </p>
        )}
      </div>
    </>
  );
}

export default function JsonDiagramEditor({
  data,
  onChange,
  className,
}: JsonDiagramEditorProps) {
  const { theme } = useTheme();
  const palette = DIAGRAM_THEME[theme];
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Map<string, boolean>>(
    () => new Map([[ROOT_KEY, false]]),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [propertyTarget, setPropertyTarget] = useState<DiagramNode | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DiagramNode | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0, scale: INITIAL_SCALE });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const { root, nodes } = useMemo(
    () => createDiagramFromData(data, collapsed),
    [data, collapsed],
  );

  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { width: 400, height: 200, offsetX: 0, offsetY: 0 };
    }
    const xs = nodes.map((node) => node.x);
    const ys = nodes.map((node) => node.y);
    const minX = Math.min(...xs) - NODE_WIDTH;
    const maxX = Math.max(...xs) + NODE_WIDTH;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_HEIGHT;
    return {
      width: maxX - minX + DIAGRAM_PADDING * 2,
      height: maxY - minY + DIAGRAM_PADDING * 2,
      offsetX: minX - DIAGRAM_PADDING,
      offsetY: minY - DIAGRAM_PADDING,
    };
  }, [nodes]);

  const selectedNode = selectedKey
    ? findNodeByPathKey(root, selectedKey)
    : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapsed = useCallback((pathKey: string) => {
    setCollapsed((current) => {
      const next = new Map(current);
      next.set(pathKey, !(current.get(pathKey) === true));
      return next;
    });
  }, []);

  const applyNodeEdit = useCallback(
    (pathKey: string, editorValue: string) => {
      const node = findNodeByPathKey(root, pathKey);
      if (!node) {
        return;
      }
      const parsed = parseEditorValue(editorValue, node.value);
      const next =
        node.path.length === 0
          ? parsed
          : setValueAtPath(data, node.path, parsed);
      onChange(next);
      setSelectedKey(pathKey);
    },
    [data, onChange, root],
  );

  const runContextAction = useCallback(
    (action: string) => {
      const node = contextMenu?.node;
      setContextMenu(null);
      if (!node) {
        return;
      }
      try {
        if (action === "edit") {
          setSelectedKey(node.pathKey);
          return;
        }
        if (action === "addProperty") {
          setPropertyTarget(node);
          return;
        }
        if (action === "addArrayItem") {
          onChange(addArrayItem(data, node.path, ""));
          return;
        }
        if (action === "delete") {
          setDeleteTarget(node);
        }
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Action failed.",
        );
      }
    },
    [contextMenu?.node, data, onChange],
  );

  const openContextMenu = (
    event: React.MouseEvent,
    node: DiagramNode | null,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }
    if ((event.target as HTMLElement).closest("[data-diagram-node]")) {
      return;
    }
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag?.active) {
      return;
    }
    setPan((current) => ({
      ...current,
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    }));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = -event.deltaY * 0.002;
    setPan((current) => ({
      ...current,
      scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale + delta)),
    }));
  };

  const edges: Array<{ from: DiagramNode; to: DiagramNode }> = [];
  for (const node of nodes) {
    for (const child of node.visibleChildren) {
      edges.push({ from: node, to: child });
    }
  }

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {nodes.length} nodes — click to edit; right-click for add/delete;
        double-click to expand/collapse; drag to pan; scroll to zoom.
      </p>
      {actionError ? (
        <p
          className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className="relative h-[min(520px,60vh)] overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white shadow-inner dark:border-slate-700 dark:from-slate-950 dark:to-slate-900"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onContextMenu={(event) => openContextMenu(event, null)}
      >
        <svg
          className="h-full w-full touch-none"
          role="img"
          aria-label="JSON diagram"
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${pan.scale})`}>
            <g transform={`translate(${-bounds.offsetX} ${-bounds.offsetY})`}>
              {edges.map(({ from, to }) => (
                <line
                  key={`${from.id}-${to.id}`}
                  x1={from.x}
                  y1={from.y + NODE_HEIGHT / 2}
                  x2={to.x}
                  y2={to.y - NODE_HEIGHT / 2}
                  stroke={palette.edgeStroke}
                  strokeWidth={2}
                />
              ))}
              {nodes.map((node) => {
                const isCollapsed = collapsed.get(node.pathKey) === true;
                const isSelected = selectedKey === node.pathKey;
                return (
                  <g
                    key={node.id}
                    data-diagram-node
                    transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedKey(node.pathKey)}
                    onContextMenu={(event) => openContextMenu(event, node)}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      if (node.children.length > 0) {
                        toggleCollapsed(node.pathKey);
                      }
                    }}
                  >
                    <rect
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx={18}
                      fill={
                        isSelected
                          ? "rgba(249, 115, 22, 0.22)"
                          : isCollapsed
                            ? palette.nodeMutedFill
                            : palette.nodeFill
                      }
                      stroke={
                        isSelected ? "rgb(236, 72, 153)" : palette.nodeStroke
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={NODE_WIDTH / 2}
                      y={22}
                      textAnchor="middle"
                      fill={palette.labelFill}
                      fontSize={11}
                      fontWeight={600}
                    >
                      {node.label}
                    </text>
                    <text
                      x={NODE_WIDTH / 2}
                      y={42}
                      textAnchor="middle"
                      fill={palette.summaryFill}
                      fontSize={10}
                    >
                      {node.summary}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {contextMenu ? (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={runContextAction}
        />
      ) : null}

      {selectedNode ? (
        <NodeEditModal
          node={selectedNode}
          onClose={() => setSelectedKey(null)}
          onApply={(value) => {
            applyNodeEdit(selectedNode.pathKey, value);
            setSelectedKey(null);
          }}
        />
      ) : null}

      {propertyTarget ? (
        <NewPropertyModal
          onClose={() => setPropertyTarget(null)}
          onApply={(key) => {
            try {
              onChange(addObjectProperty(data, propertyTarget.path, key, ""));
              setPropertyTarget(null);
              setActionError(null);
            } catch (error) {
              setActionError(
                error instanceof Error ? error.message : "Action failed.",
              );
              setPropertyTarget(null);
            }
          }}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          label={pathToDisplay(deleteTarget.path)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            try {
              onChange(removeAtPath(data, deleteTarget.path));
              setSelectedKey(null);
              setDeleteTarget(null);
              setActionError(null);
            } catch (error) {
              setActionError(
                error instanceof Error ? error.message : "Action failed.",
              );
              setDeleteTarget(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
