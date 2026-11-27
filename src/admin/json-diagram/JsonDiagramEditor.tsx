import { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ROOT_KEY,
  NODE_HEIGHT,
  NODE_WIDTH,
  createDiagramFromData,
  findNodeByPathKey,
  formatEditorValue,
  parseEditorValue,
  pathToDisplay,
  setValueAtPath,
  type DiagramNode,
} from "./jsonTree";

const INITIAL_SCALE = 1.15;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const DIAGRAM_PADDING = 40;

type JsonDiagramEditorProps = {
  data: unknown;
  onChange: (next: unknown) => void;
  className?: string;
};

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="node-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card dark:border-slate-700/60 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <motionSafeHeader id="node-modal-title" label={node.label} node={node} />
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
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
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
      </div>
    </div>
  );
}

function motionSafeHeader({
  id,
  label,
  node,
}: {
  id: string;
  label: string;
  node: DiagramNode;
}) {
  return (
    <div>
      <h2 id={id} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {label || "Root"}
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
          {node.type}
        </span>
        <span className="ml-2">{pathToDisplay(node.path)}</span>
      </p>
    </div>
  );
}

export default function JsonDiagramEditor({
  data,
  onChange,
  className,
}: JsonDiagramEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Map<string, boolean>>(
    () => new Map([[ROOT_KEY, false]]),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
      return { width: 400, height: 200 };
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

  const selectedNode = selectedKey ? findNodeByPathKey(root, selectedKey) : null;

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

  const offsetX = bounds.offsetX ?? 0;
  const offsetY = bounds.offsetY ?? 0;

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {nodes.length} nodes — click a node to edit; double-click to expand or
        collapse; drag background to pan; scroll to zoom.
      </p>
      <div
        ref={containerRef}
        className="relative h-[min(520px,60vh)] overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white shadow-inner dark:border-slate-700 dark:from-slate-950 dark:to-slate-900"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <svg className="h-full w-full touch-none" role="img" aria-label="JSON diagram">
          <g
            transform={`translate(${pan.x} ${pan.y}) scale(${pan.scale})`}
          >
            <g transform={`translate(${-offsetX} ${-offsetY})`}>
              {edges.map(({ from, to }) => (
                <line
                  key={`${from.id}-${to.id}`}
                  x1={from.x}
                  y1={from.y + NODE_HEIGHT / 2}
                  x2={to.x}
                  y2={to.y - NODE_HEIGHT / 2}
                  stroke="rgba(148, 163, 184, 0.55)"
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
                          ? "rgba(249, 115, 22, 0.18)"
                          : isCollapsed
                            ? "rgba(148, 163, 184, 0.12)"
                            : "white"
                      }
                      stroke={
                        isSelected ? "rgb(236, 72, 153)" : "rgba(148, 163, 184, 0.45)"
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={NODE_WIDTH / 2}
                      y={22}
                      textAnchor="middle"
                      className="fill-slate-900 text-[11px] font-semibold dark:fill-slate-100"
                    >
                      {node.label}
                    </text>
                    <text
                      x={NODE_WIDTH / 2}
                      y={42}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] dark:fill-slate-400"
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
    </div>
  );
}