import { Icon } from "@iconify/react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCallback, useState, useEffect, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import { useScrollProgress } from "../hooks/useScrollProgress";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
import { safeConsoleError, safeConsoleWarn } from "../utils/errorSanitizer";
import { celebrateNew } from "../utils/confetti";
import { getCspNonce } from "../utils/getCspNonce";
import type {
  FeedbackFormData,
  FeedbackType,
  FeedbackImpact,
} from "../types/feedback";
import { FEEDBACK_IMPACT_OPTIONS } from "../types/feedback";

// Time in milliseconds before showing the feedback bubble
const SHOW_AFTER_TIME = 30000; // 30 seconds
// Scroll progress threshold (50% of page) to show feedback bubble
const SHOW_AFTER_SCROLL_PROGRESS = 0.5; // 50%

// Turnstile configuration
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const DEFAULT_TURNSTYLE_SITE_KEY = "0x4AAAAAAB4acfsOidxt5FKe";
const rawTurnstileSiteKey =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY ??
    import.meta.env.VITE_TURNSTYLE_SITE ??
    DEFAULT_TURNSTYLE_SITE_KEY ??
    "") ||
  "";
const trimmedTurnstileSiteKey = rawTurnstileSiteKey.trim();
const TURNSTILE_SITE_KEY = trimmedTurnstileSiteKey
  ? trimmedTurnstileSiteKey
  : undefined;

const DEFAULT_PAGECLIP_API_KEY = "YLDHAohhRJSQJX3izF30KRLNxy5NYhiz";
const rawPageclipApiKey = (import.meta.env.VITE_PAGECLIP_API_KEY ??
  DEFAULT_PAGECLIP_API_KEY ??
  "") as string | undefined;
const trimmedPageclipApiKey = (rawPageclipApiKey ?? "").trim();
const PAGECLIP_API_KEY = trimmedPageclipApiKey
  ? trimmedPageclipApiKey
  : undefined;

let turnstileLoaded = false;
let turnstilePromise: Promise<void> | null = null;

const STRICT_CORS_PATTERNS = ["cors", "cross-origin", "opaque response"];
const GENERIC_CORS_PATTERNS = ["load failed", "failed to fetch"];

const isLikelyCorsError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalizedMessage = message.toLowerCase();

  if (
    STRICT_CORS_PATTERNS.some((pattern) => normalizedMessage.includes(pattern))
  ) {
    return true;
  }

  const errorName =
    error instanceof Error
      ? error.name
      : typeof error === "object" && error !== null && "name" in error
        ? String((error as { name?: unknown }).name ?? "")
        : "";
  const isTypeError = errorName.toLowerCase().includes("typeerror");

  if (!isTypeError) {
    return false;
  }

  return GENERIC_CORS_PATTERNS.some((pattern) =>
    normalizedMessage.includes(pattern),
  );
};

type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "compact";
  action?: string;
  cData?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      reset: (id?: string) => void;
      getResponse?: (id?: string) => string | undefined;
    };
  }
}

const loadTurnstile = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (turnstileLoaded) {
    return Promise.resolve();
  }

  if (turnstilePromise) {
    return turnstilePromise;
  }

  turnstilePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    const nonce = getCspNonce();
    if (nonce) {
      script.nonce = nonce;
      script.setAttribute("nonce", nonce);
    }
    script.onload = () => {
      turnstileLoaded = true;
      resolve();
    };
    script.onerror = () => {
      turnstilePromise = null;
      reject(new Error("Failed to load Turnstile script"));
    };
    document.head.appendChild(script);
  });

  return turnstilePromise;
};

interface FeedbackBubbleProps {
  className?: string;
}

interface ErrorNotificationProps {
  errorMessage: string;
  theme: Theme;
  prefersReducedMotion: boolean | null;
  onDismiss: () => void;
  onContactFormNavigation: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function ErrorNotification({
  errorMessage,
  theme,
  prefersReducedMotion,
  onDismiss,
  onContactFormNavigation,
}: ErrorNotificationProps) {
  return (
    <motion.div
      initial={
        prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.95 }
      }
      animate={
        prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
      }
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.95 }
      }
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-xl border p-3",
        themedClass(
          theme,
          "border-red-200 bg-red-50",
          "border-red-800/60 bg-red-900/20",
        ),
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          icon="material-symbols:error-rounded"
          className={cn(
            "mt-0.5 text-sm",
            themedClass(theme, "text-red-600", "text-red-400"),
          )}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p
            className={cn(
              "text-xs",
              themedClass(theme, "text-red-800", "text-red-200"),
            )}
          >
            {errorMessage}
          </p>
          <p
            className={cn(
              "mt-2 text-xs",
              themedClass(theme, "text-red-700", "text-red-300"),
            )}
          >
            Please try using the{" "}
            <a
              href="#contact"
              className="underline font-medium hover:text-accent"
              onClick={onContactFormNavigation}
            >
              contact form
            </a>{" "}
            instead.
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "mt-1 text-xs font-medium transition-colors",
              themedClass(
                theme,
                "text-red-600 hover:text-red-700",
                "text-red-400 hover:text-red-300",
              ),
            )}
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData, turnstileToken: string) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorChange: (message: string | null) => void;
}

function FeedbackForm({
  onSubmit,
  onClose,
  isSubmitting,
  errorMessage,
  onErrorChange,
}: FeedbackFormProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState<FeedbackFormData>({
    email: "",
    feedbackType: "suggestion",
    feedbackTitle: "",
    feedbackDescription: "",
    impact: "site-wide",
  });

  // Turnstile state
  const [turnstileReady, setTurnstileReady] =
    useState<boolean>(turnstileLoaded);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const turnstileSiteKey = TURNSTILE_SITE_KEY;

  // Load Turnstile script when component mounts
  useEffect(() => {
    const loadScript = async () => {
      if (!turnstileSiteKey) {
        setTurnstileError(
          "Verification is unavailable right now. Please use the contact form.",
        );
        return;
      }

      if (turnstileLoaded) {
        setTurnstileReady(true);
        return;
      }

      try {
        await loadTurnstile();
        setTurnstileReady(true);
      } catch (error) {
        setTurnstileError(
          "Unable to load the verification step. Please use the contact form.",
        );
        safeConsoleWarn("Failed to load Turnstile script", error);
      }
    };

    loadScript();
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (!turnstileReady || !turnstileSiteKey) {
      return undefined;
    }

    if (typeof window === "undefined" || !window.turnstile) {
      return undefined;
    }

    const container = turnstileContainerRef.current;
    if (!container) {
      return undefined;
    }

    container.innerHTML = "";

    try {
      const turnstileTheme = theme === "dark" ? "dark" : "light";
      const widgetId = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: turnstileTheme,
        appearance: "always",
        size: "compact",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileError(null);
        },
        "error-callback": () => {
          setTurnstileToken(null);
          setTurnstileError(
            "Verification failed to load. Please use the contact form.",
          );
        },
        "expired-callback": () => {
          setTurnstileToken(null);
          setTurnstileError(
            "Verification expired. Please complete the challenge again.",
          );
          if (turnstileWidgetIdRef.current) {
            window.turnstile?.reset(turnstileWidgetIdRef.current);
          }
        },
      } as TurnstileRenderOptions);

      turnstileWidgetIdRef.current = widgetId;
    } catch (error) {
      safeConsoleError("Failed to render Turnstile widget", error);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Error handling in effect is intentional
      setTurnstileError(
        "Unable to show the verification challenge. Please use the contact form.",
      );
    }

    return () => {
      if (turnstileWidgetIdRef.current) {
        window.turnstile?.reset(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
      container.innerHTML = "";
    };
  }, [theme, turnstileReady, turnstileSiteKey]);

  const handleDismissError = useCallback(() => {
    onErrorChange(null);
  }, [onErrorChange]);

  const handleContactFormNavigation = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onClose();
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onClose],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, email: e.target.value }));
    },
    [],
  );

  const handleFeedbackTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        feedbackType: e.target.value as FeedbackType,
      }));
    },
    [],
  );

  const handleFeedbackTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, feedbackTitle: e.target.value }));
    },
    [],
  );

  const handleFeedbackDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, feedbackDescription: e.target.value }));
    },
    [],
  );

  const handleImpactChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        impact: e.target.value as FeedbackImpact,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onErrorChange(null);

      // Basic validation
      if (
        !formData.email ||
        !formData.feedbackTitle ||
        !formData.feedbackDescription
      ) {
        onErrorChange("Please fill in all required fields.");
        return;
      }

      if (!turnstileToken) {
        setTurnstileError(
          "Please complete the verification challenge before submitting.",
        );
        return;
      }

      try {
        await onSubmit(formData, turnstileToken);
        // Reset Turnstile on success
        if (turnstileWidgetIdRef.current) {
          window.turnstile?.reset(turnstileWidgetIdRef.current);
        }
        setTurnstileToken(null);
      } catch (error) {
        safeConsoleError("Feedback form submission failed", error);
        onErrorChange(
          "Failed to submit feedback. Please try using the contact form instead.",
        );
      }
    },
    [formData, onSubmit, onErrorChange, turnstileToken],
  );

  const inputClass = cn(
    "mt-2 w-full rounded-xl border placeholder:text-slate-400 focus:border-accent focus:outline-none",
    // Better mobile touch targets
    "px-4 py-3 text-base sm:text-sm",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const selectClass = cn(
    "mt-2 w-full rounded-xl border focus:border-accent focus:outline-none",
    // Better mobile touch targets
    "px-4 py-3 text-base sm:text-sm",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const textareaClass = cn(
    "mt-2 w-full rounded-xl border placeholder:text-slate-400 focus:border-accent focus:outline-none resize-none",
    // Better mobile touch targets and height
    "px-4 py-3 text-base sm:text-sm h-24 sm:h-20",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const labelClass = cn(
    "block font-medium",
    // Larger labels for mobile
    "text-sm sm:text-xs",
    themedClass(theme, "text-slate-600", "text-slate-300"),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error notification */}
      {errorMessage && (
        <ErrorNotification
          errorMessage={errorMessage}
          theme={theme}
          prefersReducedMotion={prefersReducedMotion}
          onDismiss={handleDismissError}
          onContactFormNavigation={handleContactFormNavigation}
        />
      )}

      <label className={labelClass}>
        <span>Email *</span>
        <input
          type="email"
          name="email"
          className={inputClass}
          value={formData.email}
          onChange={handleEmailChange}
          placeholder="your.email@example.com"
          required
        />
      </label>

      <label className={labelClass}>
        <span>Feedback Type *</span>
        <select
          name="feedbackType"
          className={selectClass}
          value={formData.feedbackType}
          onChange={handleFeedbackTypeChange}
          required
        >
          <option value="suggestion">Suggestion</option>
          <option value="bug">Bug</option>
        </select>
      </label>

      <label className={labelClass}>
        <span>Feedback Title *</span>
        <input
          type="text"
          name="feedbackTitle"
          className={inputClass}
          value={formData.feedbackTitle}
          onChange={handleFeedbackTitleChange}
          placeholder="Brief description of your feedback"
          required
        />
      </label>

      <label className={labelClass}>
        <span>Feedback Description *</span>
        <textarea
          name="feedbackDescription"
          className={textareaClass}
          rows={3}
          value={formData.feedbackDescription}
          onChange={handleFeedbackDescriptionChange}
          placeholder="Please provide detailed feedback..."
          required
        />
      </label>

      <label className={labelClass}>
        <span>Impact Area</span>
        <select
          name="impact"
          className={selectClass}
          value={formData.impact}
          onChange={handleImpactChange}
        >
          {FEEDBACK_IMPACT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Turnstile Verification Widget */}
      <div className="space-y-2">
        <div
          ref={turnstileContainerRef}
          className={cn(
            "flex justify-center items-center overflow-hidden",
            !turnstileToken && !turnstileError && "min-h-[65px]",
          )}
          aria-label="Verification challenge"
        />
        {turnstileError && (
          <p
            className={cn(
              "text-xs text-center",
              themedClass(theme, "text-red-600", "text-red-400"),
            )}
          >
            {turnstileError}
          </p>
        )}
        {turnstileToken && !turnstileError && (
          <p
            className={cn(
              "text-xs text-center",
              themedClass(theme, "text-emerald-600", "text-emerald-400"),
            )}
          >
            ✓ Verification complete
          </p>
        )}
        {!turnstileReady && !turnstileError && (
          <p
            className={cn(
              "text-xs text-center",
              themedClass(theme, "text-slate-500", "text-slate-400"),
            )}
          >
            Loading verification...
          </p>
        )}
      </div>

      <div className="pt-2">
        <p
          className={cn(
            "text-xs mb-3",
            themedClass(theme, "text-slate-500", "text-slate-400"),
          )}
        >
          <strong>Developer?</strong>{" "}
          <a
            href="https://github.com/kiyarose/Portf"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "underline transition-colors",
              themedClass(
                theme,
                "text-accent hover:text-accent/80",
                "text-accent hover:text-accent/80",
              ),
            )}
          >
            Check out the GitHub repo
          </a>
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 rounded-xl font-medium transition",
              // Better mobile touch targets
              "px-4 py-3 text-sm",
              themedClass(
                theme,
                "bg-slate-100 text-slate-700 hover:bg-slate-200",
                "bg-slate-800 text-slate-300 hover:bg-slate-700",
              ),
            )}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={cn(
              "flex-1 rounded-xl font-medium transition",
              // Better mobile touch targets
              "px-4 py-3 text-sm",
              themedClass(
                theme,
                "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500",
                "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500",
              ),
            )}
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? "Submitting..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </form>
  );
}

interface ThumbsSelectorProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
  selectedThumb: "up" | "down" | null;
  onThumbClick: (thumb: "up" | "down") => void;
}

function ThumbsSelector({
  theme,
  prefersReducedMotion,
  selectedThumb,
  onThumbClick,
}: ThumbsSelectorProps) {
  const handleThumbUpClick = useCallback(() => {
    onThumbClick("up");
  }, [onThumbClick]);

  const handleThumbDownClick = useCallback(() => {
    onThumbClick("down");
  }, [onThumbClick]);

  const thumbsContainerClass = cn(
    // Fixed positioning to respect safe area
    "fixed rounded-2xl border p-4 shadow-2xl backdrop-blur-lg",
    // Position from bottom with safe spacing
    "bottom-24 right-4 sm:bottom-20 sm:right-6",
    // Constrain width to screen
    "w-[calc(100vw-2rem)] max-w-[16rem] sm:max-w-[15rem]",
    themedClass(
      theme,
      "border-white/60 bg-white/90 text-slate-700",
      "border-slate-700/60 bg-slate-900/90 text-slate-300",
    ),
  );

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      animate={
        prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
      }
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={thumbsContainerClass}
    >
      <div className="mb-4">
        <p
          className={cn(
            "text-sm text-center sm:text-base",
            themedClass(theme, "text-slate-600", "text-slate-400"),
          )}
        >
          How was your experience?
        </p>
      </div>
      <div className="flex gap-4 justify-center">
        <motion.button
          type="button"
          data-gtm="feedback-thumbs-up"
          onClick={handleThumbUpClick}
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200",
            // Larger buttons for mobile
            "w-14 h-14 sm:w-16 sm:h-16",
            selectedThumb === "up"
              ? "bg-green-500 text-white shadow-lg"
              : themedClass(
                  theme,
                  "bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600",
                  "bg-slate-800 hover:bg-green-900/50 text-slate-400 hover:text-green-400",
                ),
          )}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          title="Good experience"
        >
          <Icon
            icon="material-symbols:thumb-up-rounded"
            className="text-2xl sm:text-3xl"
          />
        </motion.button>
        <motion.button
          type="button"
          data-gtm="feedback-thumbs-down"
          onClick={handleThumbDownClick}
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-200",
            // Larger buttons for mobile
            "w-14 h-14 sm:w-16 sm:h-16",
            selectedThumb === "down"
              ? "bg-red-500 text-white shadow-lg"
              : themedClass(
                  theme,
                  "bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600",
                  "bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400",
                ),
          )}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          title="Poor experience"
        >
          <Icon
            icon="material-symbols:thumb-down-rounded"
            className="text-2xl sm:text-3xl"
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

interface ConfirmationDialogProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
  onYes: () => void;
  onNo: () => void;
}

function ConfirmationDialog({
  theme,
  prefersReducedMotion,
  onYes,
  onNo,
}: ConfirmationDialogProps) {
  const confirmContainerClass = cn(
    // Fixed positioning to respect safe area
    "fixed rounded-2xl border p-5 shadow-2xl backdrop-blur-lg",
    // Position from bottom with safe spacing
    "bottom-24 right-4 sm:bottom-20 sm:right-6",
    // Constrain width to screen
    "w-[calc(100vw-2rem)] max-w-[18rem] sm:max-w-[20rem]",
    themedClass(
      theme,
      "border-white/60 bg-white/90 text-slate-700",
      "border-slate-700/60 bg-slate-900/90 text-slate-300",
    ),
  );

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      animate={
        prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
      }
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={confirmContainerClass}
    >
      <div className="mb-5">
        <p
          className={cn(
            "text-base text-center sm:text-lg",
            themedClass(theme, "text-slate-700", "text-slate-300"),
          )}
        >
          Want to leave more detailed feedback?
        </p>
      </div>
      <div className="flex gap-3">
        <motion.button
          type="button"
          data-gtm="feedback-detailed-yes"
          onClick={onYes}
          className={cn(
            "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition",
            themedClass(
              theme,
              "bg-orange-500 text-white hover:bg-orange-600",
              "bg-orange-500 text-white hover:bg-orange-600",
            ),
          )}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          Yes
        </motion.button>
        <motion.button
          type="button"
          data-gtm="feedback-detailed-no"
          onClick={onNo}
          className={cn(
            "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition",
            themedClass(
              theme,
              "border border-slate-300 text-slate-600 hover:bg-slate-50",
              "border border-slate-600 text-slate-300 hover:bg-slate-800",
            ),
          )}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        >
          No
        </motion.button>
      </div>
    </motion.div>
  );
}

interface ThankYouNotificationProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
}

function ThankYouNotification({
  theme,
  prefersReducedMotion,
}: ThankYouNotificationProps) {
  const notificationClass = cn(
    // Fixed positioning to respect safe area
    "fixed rounded-2xl border p-5 shadow-2xl backdrop-blur-lg",
    // Position from bottom with safe spacing
    "bottom-24 right-4 sm:bottom-20 sm:right-6",
    // Constrain width to screen
    "w-[calc(100vw-2rem)] max-w-[16rem] sm:max-w-[18rem]",
    themedClass(
      theme,
      "border-white/60 bg-white/90 text-slate-700",
      "border-slate-700/60 bg-slate-900/90 text-slate-300",
    ),
  );

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      animate={
        prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
      }
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={notificationClass}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon
          icon="material-symbols:check-circle-rounded"
          className={cn(
            "text-2xl",
            themedClass(theme, "text-green-600", "text-green-400"),
          )}
          aria-hidden="true"
        />
        <p
          className={cn(
            "text-lg font-medium text-center",
            themedClass(theme, "text-slate-700", "text-slate-300"),
          )}
        >
          Thank you!
        </p>
      </div>
    </motion.div>
  );
}

interface FeedbackFormContainerProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
  onSubmit: (data: FeedbackFormData, turnstileToken: string) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorChange: (message: string | null) => void;
}

function FeedbackFormContainer({
  theme,
  prefersReducedMotion,
  onSubmit,
  onClose,
  isSubmitting,
  errorMessage,
  onErrorChange,
}: FeedbackFormContainerProps) {
  const formContainerClass = cn(
    // Fixed positioning to respect safe area - use fixed with inset spacing
    "fixed rounded-2xl border p-5 shadow-2xl backdrop-blur-lg",
    // Position from bottom with safe spacing, and from right
    "bottom-24 right-4 sm:bottom-20 sm:right-6",
    // Constrain max height to prevent overflow, enable scrolling if needed
    "max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto",
    // Mobile responsive width - wider for better usability
    "w-[calc(100vw-2rem)] max-w-[20rem] sm:max-w-[24rem]",
    themedClass(
      theme,
      "border-white/60 bg-white/90 text-slate-700",
      "border-slate-700/60 bg-slate-900/90 text-slate-300",
    ),
  );

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      animate={
        prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
      }
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={formContainerClass}
    >
      <div className="mb-4">
        <h3
          className={cn(
            "text-base font-semibold mb-2 sm:text-lg",
            themedClass(theme, "text-slate-900", "text-white"),
          )}
        >
          Share Your Feedback
        </h3>
        <p
          className={cn(
            "text-sm sm:text-base",
            themedClass(theme, "text-slate-600", "text-slate-400"),
          )}
        >
          Help me improve this website by sharing your thoughts.
        </p>
      </div>
      <FeedbackForm
        onSubmit={onSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onErrorChange={onErrorChange}
      />
    </motion.div>
  );
}

interface FeedbackBubbleButtonProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
  feedbackStep: "initial" | "thumbs" | "confirm" | "form" | "submitted";
  onClick: () => void;
}

function FeedbackBubbleButton({
  theme,
  prefersReducedMotion,
  feedbackStep,
  onClick,
}: FeedbackBubbleButtonProps) {
  const bubbleButtonClass = cn(
    "flex items-center justify-center rounded-full shadow-lg transition-all duration-300",
    // Smaller button size - reduced from h-14 w-14 sm:h-16 sm:w-16
    "h-12 w-12 sm:h-14 sm:w-14",
    themedClass(
      theme,
      "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-xl",
      "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-xl shadow-orange-500/20",
    ),
  );

  return (
    <motion.button
      className={bubbleButtonClass}
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              scale: feedbackStep === "submitted" ? [1, 1.2, 1] : 1,
            }
      }
      transition={{
        duration: feedbackStep === "submitted" ? 0.6 : 0.2,
        ease: "easeOut",
      }}
      title={
        feedbackStep === "submitted"
          ? "Thank you for your feedback!"
          : "Share feedback"
      }
    >
      <AnimatePresence mode="wait">
        {feedbackStep === "submitted" ? (
          <motion.div
            key="success"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }
            }
            animate={
              prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
            }
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              icon="material-symbols:check-rounded"
              className="text-2xl sm:text-3xl"
            />
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }
            }
            animate={
              prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
            }
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              icon="material-symbols:feedback-rounded"
              className={cn(
                "text-2xl sm:text-3xl",
                feedbackStep !== "initial" && "rotate-12",
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function FeedbackBubble({ className }: FeedbackBubbleProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const scrollProgress = useScrollProgress();

  const [isVisible, setIsVisible] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState<
    "initial" | "thumbs" | "confirm" | "form" | "submitted"
  >("initial");
  const [selectedThumb, setSelectedThumb] = useState<"up" | "down" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // Function to trigger confetti at the button location
  const triggerConfetti = useCallback(() => {
    // Calculate button position in pixels - updated for smaller button sizes
    const isMobile = window.innerWidth < 640; // Tailwind sm breakpoint
    const bottomOffset = isMobile ? 80 : 24; // bottom-20 = 80px, bottom-6 = 24px
    const rightOffset = isMobile ? 16 : 24; // right-4 = 16px, right-6 = 24px
    const buttonSize = isMobile ? 48 : 56; // h-12 w-12 (48px) or h-14 w-14 (56px)

    // Calculate center of button from bottom-right of viewport
    const buttonCenterX = window.innerWidth - rightOffset - buttonSize / 2;
    const buttonCenterY = window.innerHeight - bottomOffset - buttonSize / 2;

    // Trigger the new Discord-style confetti
    celebrateNew({
      x: buttonCenterX,
      y: buttonCenterY,
      duration: 4000, // 4 seconds for the animation
    });
  }, []);

  // Show bubble after specified time OR after user scrolls 25% of the page
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if feedback was already submitted in this session
      const hasSubmitted = sessionStorage.getItem("feedback-submitted");
      if (!hasSubmitted) {
        setIsVisible(true);
        triggerConfetti();
      }
    }, SHOW_AFTER_TIME);

    return () => clearTimeout(timer);
  }, [triggerConfetti]);

  // Also show bubble when user scrolls more than 50% of the page
  useEffect(() => {
    if (scrollProgress >= SHOW_AFTER_SCROLL_PROGRESS && !isVisible) {
      // Check if feedback was already submitted in this session
      const hasSubmitted = sessionStorage.getItem("feedback-submitted");
      if (!hasSubmitted) {
        setIsVisible(true);
        triggerConfetti();
      }
    }
  }, [scrollProgress, isVisible, triggerConfetti]);

  const pageclipApiKey = PAGECLIP_API_KEY;
  const pageclipFormName = "Contact_Me_Form";
  const pageclipUrl = pageclipApiKey
    ? `https://send.pageclip.co/${pageclipApiKey}/${pageclipFormName}`
    : null;

  const handleSubmit = useCallback(
    async (data: FeedbackFormData, turnstileToken: string) => {
      if (!pageclipApiKey || !pageclipUrl) {
        const errorMsg = "VITE_PAGECLIP_API_KEY is missing or invalid.";
        safeConsoleError(`Cannot submit feedback: ${errorMsg}`);
        setErrorMessage(`Configuration Error: ${errorMsg}`);
        return;
      }

      if (!TURNSTILE_SITE_KEY) {
        const errorMsg =
          "VITE_TURNSTILE_SITE_KEY (or VITE_TURNSTYLE_SITE) is missing or invalid.";
        safeConsoleError(`Cannot submit feedback: ${errorMsg}`);
        setErrorMessage(`Configuration Error: ${errorMsg}`);
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        // Format the feedback data for the Contact_Me_Form endpoint
        const feedbackTypeLabel =
          data.feedbackType === "bug" ? "Bug" : "Suggestion";
        const subject = `[Feedback - ${feedbackTypeLabel}] ${data.feedbackTitle}`;
        const message = `Feedback Type: ${feedbackTypeLabel}
Impact Area: ${data.impact}

${data.feedbackDescription}`;

        const body = new URLSearchParams();
        body.set("email", data.email);
        body.set("name", "Feedback Submission");
        body.set("subject", subject);
        body.set("message", message);
        body.set("cf-turnstile-response", turnstileToken);
        // Add EXT field with P (positive) or N (negative) based on thumb selection
        body.set("EXT", selectedThumb === "up" ? "P" : "N");

        const response = await fetch(pageclipUrl, {
          method: "POST",
          body,
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - parse response, clear error and mark as submitted
        try {
          await response.json();
        } catch {
          // If no JSON body, ignore CORS/response reading errors
          // The form submission was successful if we reach this point
        }
        setErrorMessage(null);
        setFeedbackStep("submitted");
        sessionStorage.setItem("feedback-submitted", "true");

        // Hide completely after showing success message
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } catch (error) {
        // Check if this is a CORS/opaque response issue or a genuine network failure
        const isOffline =
          typeof navigator !== "undefined" && navigator.onLine === false;
        const likelyCorsError = !isOffline && isLikelyCorsError(error);

        if (likelyCorsError) {
          // We likely hit a CORS/read issue, but connectivity is intact.
          // Treat it as a success: mark as submitted silently to avoid resubmits.
          safeConsoleWarn("Possible CORS error after form submission", error);
          setErrorMessage(null);
          setFeedbackStep("submitted");
          sessionStorage.setItem("feedback-submitted", "true");
          setTimeout(() => {
            setIsVisible(false);
          }, 3000);
          return;
        }

        // This appears to be an actual network error
        safeConsoleError("Feedback submission failed", error);
        setErrorMessage(
          "Failed to submit feedback. Please try using the contact form instead.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [pageclipApiKey, pageclipUrl, selectedThumb],
  );

  const handleBubbleClick = useCallback(() => {
    if (feedbackStep === "submitted") return;
    setFeedbackStep("thumbs");
  }, [feedbackStep]);

  const handleThumbClick = useCallback((thumb: "up" | "down") => {
    setSelectedThumb(thumb);
    setFeedbackStep("confirm");
  }, []);

  const handleConfirmYes = useCallback(() => {
    setFeedbackStep("form");
  }, []);

  // Silent submission for sentiment-only feedback (no additional details)
  const submitSentimentOnly = useCallback(async () => {
    if (!pageclipApiKey || !pageclipUrl || !selectedThumb) {
      // If we can't submit, just mark as complete silently
      sessionStorage.setItem("feedback-submitted", "true");
      return;
    }

    try {
      // Submit minimal data with just the sentiment
      const sentiment = selectedThumb === "up" ? "P" : "N";
      const body = new URLSearchParams();
      body.set("email", "sentiment-only@feedback.local");
      body.set("name", "Quick Sentiment");
      body.set(
        "subject",
        `[Quick Feedback] ${selectedThumb === "up" ? "Positive" : "Negative"} Experience`,
      );
      body.set(
        "message",
        "User provided sentiment without additional details.",
      );
      body.set("EXT", sentiment);
      // Note: Skipping Turnstile for quick sentiment-only submission

      const response = await fetch(pageclipUrl, {
        method: "POST",
        body,
        mode: "cors",
      });

      // Don't throw on non-OK response for this silent submission
      // We'll treat any response (including CORS errors) as success
      if (response.ok) {
        try {
          await response.json();
        } catch {
          // Ignore JSON parsing errors
        }
      }
    } catch (error) {
      // Silently handle any errors - we don't want to bother the user
      safeConsoleWarn("Sentiment-only submission encountered an issue", error);
    } finally {
      // Always mark as submitted to prevent re-prompting
      sessionStorage.setItem("feedback-submitted", "true");
    }
  }, [pageclipApiKey, pageclipUrl, selectedThumb]);

  const handleConfirmNo = useCallback(() => {
    // Immediately hide confirmation dialog and show thank you notification
    setFeedbackStep("submitted");
    setShowThankYou(true);

    // Submit sentiment silently in the background (non-blocking)
    submitSentimentOnly();

    // Hide the thank you notification after 2 seconds and reset state
    setTimeout(() => {
      setShowThankYou(false);
      setIsVisible(false);
      setSelectedThumb(null);
      setFeedbackStep("initial");
    }, 2000);
  }, [submitSentimentOnly]);

  const handleFormClose = useCallback(() => {
    setFeedbackStep("initial");
    setSelectedThumb(null);
  }, []);

  const bubbleClass = cn(
    "fixed z-50",
    // Position to avoid back-to-top button collision on mobile
    "bottom-20 right-4",
    // On larger screens, use more compact positioning
    "sm:bottom-6 sm:right-6",
    className,
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={bubbleClass}
          initial={
            prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5, y: 20 }
          }
          animate={
            prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.3, y: 20 }
          }
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <AnimatePresence>
            {/* Thumbs Up/Down Selection */}
            {feedbackStep === "thumbs" && (
              <ThumbsSelector
                theme={theme}
                prefersReducedMotion={prefersReducedMotion}
                selectedThumb={selectedThumb}
                onThumbClick={handleThumbClick}
              />
            )}

            {/* Confirmation Dialog */}
            {feedbackStep === "confirm" && (
              <ConfirmationDialog
                theme={theme}
                prefersReducedMotion={prefersReducedMotion}
                onYes={handleConfirmYes}
                onNo={handleConfirmNo}
              />
            )}

            {/* Thank You Notification */}
            {showThankYou && (
              <ThankYouNotification
                theme={theme}
                prefersReducedMotion={prefersReducedMotion}
              />
            )}

            {/* Full Feedback Form */}
            {feedbackStep === "form" && (
              <FeedbackFormContainer
                theme={theme}
                prefersReducedMotion={prefersReducedMotion}
                onSubmit={handleSubmit}
                onClose={handleFormClose}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onErrorChange={setErrorMessage}
              />
            )}
          </AnimatePresence>

          <FeedbackBubbleButton
            theme={theme}
            prefersReducedMotion={prefersReducedMotion}
            feedbackStep={feedbackStep}
            onClick={handleBubbleClick}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
