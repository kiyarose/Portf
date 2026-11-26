import { useCallback, useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import {
  PORTFOLIO_DATA_RESOURCES,
  isAdminEditorEnabled,
  loadResourceJson,
  saveResourceJson,
} from "../../admin/dataAdminApi";
import JsonDiagramEditor from "../../admin/json-diagram/JsonDiagramEditor";

type ViewMode = "visual" | "source";

export function DataAdminApp() {
  const enabled = isAdminEditorEnabled();
  const [resource, setResource] = useState<string>(PORTFOLIO_DATA_RESOURCES[0] ?? "Projects");
  const [rawJson, setRawJson] = useState("");
  const [parsed, setParsed] = useState<unknown | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [status, setStatus] = useState<{
    kind: "idle" | "success" | "error" | "loading";
    message: string;
  }>({ kind: "idle", message: "" });

  const parseError = useMemo(() => {
    if (!rawJson.trim()) {
      return null;
    }
    try {
      JSON.parse(rawJson);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid JSON";
    }
  }, [rawJson]);

  const syncParsedFromRaw = useCallback((text: string) => {
    setRawJson(text);
    try {
      setParsed(JSON.parse(text) as unknown);
    } catch {
      setParsed(null);
    }
  }, []);

  const handleLoad = useCallback(async () => {
    setStatus({ kind: "loading", message: `Loading ${resource}.json…` });
    try {
      const text = await loadResourceJson(resource);
      syncParsedFromRaw(text);
      setStatus({ kind: "success", message: `Loaded ${resource}.json` });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Load failed",
      });
    }
  }, [resource, syncParsedFromRaw]);

  const handleSave = useCallback(async () => {
    if (parseError) {
      setStatus({ kind: "error", message: parseError });
      return;
    }
    setStatus({ kind: "loading", message: `Saving ${resource}.json…` });
    try {
      await saveResourceJson(resource, rawJson);
      setStatus({ kind: "success", message: `Saved ${resource}.json` });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Save failed",
      });
    }
  }, [parseError, rawJson, resource]);

  const handleVisualChange = useCallback(
    (next: unknown) => {
      setParsed(next);
      setRawJson(JSON.stringify(next, null, 2));
    },
    [],
  );

  if (!enabled) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Not Found
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          The data editor is disabled. Set{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
            PF_ALLOW_NOEDIT=1
          </code>{" "}
          at build time and protect{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
            /admin/
          </code>{" "}
          with Cloudflare Access before enabling.
        </p>
        <a
          href={import.meta.env.BASE_URL}
          className="mt-8 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          Back to site
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Remote data
        </p>
        <h1 className="font-kiya mt-2 text-3xl text-slate-900 dark:text-slate-100">
          Portfolio data editor
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Edits sync to your data host through a same-origin write proxy. Keep
          this route behind Cloudflare Zero Trust.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-card backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[180px] flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Resource
            </span>
            <select
              value={resource}
              onChange={(event) => setResource(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {PORTFOLIO_DATA_RESOURCES.map((name) => (
                <option key={name} value={name}>
                  {name}.json
                </option>
              ))}
            </select>
          </label>

          <motionButton onClick={handleLoad} disabled={status.kind === "loading"}>
            Reload
          </motionButton>
          <motionButton
            onClick={handleSave}
            disabled={status.kind === "loading" || Boolean(parseError)}
            variant="primary"
          >
            Save to data host
          </motionButton>

          <div className="ml-auto flex rounded-full border border-slate-200 p-1 dark:border-slate-700">
            {(["visual", "source"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                  viewMode === mode
                    ? "bg-accent text-white"
                    : "text-slate-600 dark:text-slate-300",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {status.kind !== "idle" ? (
          <p
            className={clsx(
              "mt-4 text-sm",
              status.kind === "error"
                ? "text-rose-600 dark:text-rose-400"
                : status.kind === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300",
            )}
            role="status"
          >
            {status.message}
          </p>
        ) : null}
        {parseError ? (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
            JSON syntax: {parseError}
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        {viewMode === "visual" && parsed !== null ? (
          <JsonDiagramEditor data={parsed} onChange={handleVisualChange} />
        ) : null}
        {viewMode === "source" || parsed === null ? (
          <textarea
            spellCheck={false}
            value={rawJson}
            onChange={(event) => syncParsedFromRaw(event.target.value)}
            className="min-h-[420px] w-full rounded-3xl border border-slate-200/70 bg-slate-50 p-4 font-mono text-sm text-slate-900 shadow-card dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder={`Load ${resource}.json to begin editing…`}
          />
        ) : null}
      </section>
    </main>
  );
}

function motionButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50",
        variant === "primary"
          ? "bg-accent text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
      )}
    >
      {children}
    </button>
  );
}