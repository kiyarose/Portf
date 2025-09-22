import { useCallback } from "react";
import { GENERIC_ERROR_MESSAGES } from "../utils/errorSanitizer";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

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
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);
  const { theme } = useTheme();
  const headingColor = themedClass(theme, "text-slate-800", "text-slate-200");
  const bodyColor = themedClass(theme, "text-slate-600", "text-slate-400");
  const outlineButton = themedClass(
    theme,
    "border-slate-300 text-slate-700 hover:bg-slate-50",
    "border-slate-600 text-slate-300 hover:bg-slate-800",
  );
  const debugSummary = themedClass(
    theme,
    "text-slate-500 hover:text-slate-700",
    "text-slate-400 hover:text-slate-300",
  );
  const debugSurface = themedClass(
    theme,
    "bg-slate-100 text-slate-700",
    "bg-slate-800 text-slate-300",
  );

  return (
    <div className="card-surface mx-auto max-w-md space-y-4 text-center">
      <div className="space-y-2">
        <h2 className={cn("text-xl font-semibold", headingColor)}>
          Something went wrong
        </h2>
        <p className={cn("text-sm", bodyColor)}>
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
          onClick={handleReload}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-medium transition",
            outlineButton,
          )}
        >
          Reload page
        </button>
      </div>

      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className={cn("cursor-pointer text-xs", debugSummary)}>
            Debug info (development only)
          </summary>
          <p
            className={cn(
              "mt-2 rounded-lg p-2 text-xs font-mono",
              debugSurface,
            )}
          >
            Error ID: {errorId}
          </p>
        </details>
      )}
    </div>
  );
}
