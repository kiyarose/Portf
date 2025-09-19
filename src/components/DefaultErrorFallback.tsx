import { GENERIC_ERROR_MESSAGES } from "../utils/errorSanitizer";

interface DefaultErrorFallbackProps {
  errorId: string;
  onRetry: () => void;
}

/**
 * Default error fallback component with safe, user-friendly messaging
 */
export function DefaultErrorFallback({
  errorId,
  onRetry,
}: DefaultErrorFallbackProps) {
  return (
    <div className="card-surface mx-auto max-w-md space-y-4 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {GENERIC_ERROR_MESSAGES.UNKNOWN}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onRetry}
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reload page
        </button>
      </div>

      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
            Debug info (development only)
          </summary>
          <p className="mt-2 rounded-lg bg-slate-100 p-2 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Error ID: {errorId}
          </p>
        </details>
      )}
    </div>
  );
}
