import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { safeConsoleWarn, safeConsoleError } from "../utils/errorSanitizer";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
import { navigateTo } from "../utils/navigation";

const EMAIL = "kiya.rose@sillylittle.tech";

const STRICT_CORS_PATTERNS = ["cors", "cross-origin", "opaque response"];
const GENERIC_CORS_PATTERNS = ["load failed", "failed to fetch"];

// Simple lazy loading for pageclip script
let pageclipLoaded = false;
let pageclipPromise: Promise<void> | null = null;

const loadPageclip = (): Promise<void> => {
  if (pageclipLoaded) {
    return Promise.resolve();
  }

  if (pageclipPromise) {
    return pageclipPromise;
  }

  pageclipPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://s.pageclip.co/v1/pageclip.js";
    script.charset = "utf-8";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      pageclipLoaded = true;
      resolve();
    };
    script.onerror = () => {
      pageclipPromise = null; // Reset so we can try again
      reject(new Error("Failed to load pageclip script"));
    };
    document.head.appendChild(script);
  });

  return pageclipPromise;
};

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const rawTurnstileSiteKey =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY ??
    import.meta.env.VITE_TURNSTYLE_SITE ??
    "") || "";
const trimmedTurnstileSiteKey = rawTurnstileSiteKey.trim();
const TURNSTILE_SITE_KEY = trimmedTurnstileSiteKey
  ? trimmedTurnstileSiteKey
  : undefined;

let turnstileLoaded = false;
let turnstilePromise: Promise<void> | null = null;

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
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
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

type ContactCardProps = {
  copied: boolean;
  onCopy: () => Promise<void>;
  prefersReducedMotion: boolean;
  errorMessage: string | null;
  onErrorChange: (message: string | null) => void;
};

function ContactCard({
  copied,
  onCopy,
  prefersReducedMotion,
  errorMessage,
  onErrorChange,
}: ContactCardProps) {
  return (
    <div className="card-surface space-y-8">
      <SectionHeader
        id="contact"
        icon="material-symbols:contact-mail-rounded"
        label="Contact"
        eyebrow="Let’s Talk"
      />
      <div className="flex flex-col gap-8 md:flex-row">
        <ContactIntro copied={copied} onCopy={onCopy} />
        <ContactForm
          prefersReducedMotion={prefersReducedMotion}
          errorMessage={errorMessage}
          onErrorChange={onErrorChange}
        />
      </div>
    </div>
  );
}

type ContactIntroProps = {
  copied: boolean;
  onCopy: () => Promise<void>;
};

function ContactIntro({ copied, onCopy }: ContactIntroProps) {
  const { theme } = useTheme();
  const introCopyColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const emailColor = themedClass(theme, "text-slate-700", "text-slate-200");
  const copyButtonSurface = themedClass(
    theme,
    "!bg-white !text-accent border border-accent hover:bg-accent/10",
    "!bg-accent !text-white border border-accent/30 hover:bg-accent/90",
  );
  const handlePrivacyPolicyClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      event.preventDefault();
      navigateTo("/privacy-policy");
    },
    [],
  );
  return (
    <div className="flex-1 space-y-4">
      <p className={cn("text-base", introCopyColor)}>
        Send me an email with any questions or if you just want to say hi.
      </p>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "chip transition hover:translate-y-[-2px]",
          copyButtonSurface,
        )}
      >
        <Icon
          icon="material-symbols:content-copy-rounded"
          className="text-lg"
          aria-hidden="true"
        />
        {copied ? "Copied!" : "Copy my email"}
      </button>
      <p className={cn("text-base font-semibold", emailColor)}>{EMAIL}</p>
      <a
        href="/privacy-policy"
        onClick={handlePrivacyPolicyClick}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-yellow-500 transition hover:text-yellow-400"
      >
        <Icon
          icon="material-symbols:shield-person-rounded"
          className="text-base"
          aria-hidden="true"
        />
        Read the Privacy Policy
      </a>
    </div>
  );
}

type ContactFormProps = {
  prefersReducedMotion: boolean;
  errorMessage: string | null;
  onErrorChange: (message: string | null) => void;
};

function ContactForm({
  prefersReducedMotion,
  errorMessage,
  onErrorChange,
}: ContactFormProps) {
  const { theme } = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [pageclipLoading, setPageclipLoading] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState<boolean>(turnstileLoaded);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const turnstileSiteKey = TURNSTILE_SITE_KEY;

  // Use the env var (public key) to build the Pageclip URL.
  const pageclipApiKey = import.meta.env.VITE_PAGECLIP_API_KEY as
    | string
    | undefined;
  const pageclipFormName = "Contact_Me_Form";
  const pageclipUrl = pageclipApiKey
    ? `https://send.pageclip.co/${pageclipApiKey}/${pageclipFormName}`
    : null;

  const ensureTurnstileScript = useCallback(async () => {
    if (!turnstileSiteKey) {
      setTurnstileError(
        "Verification is unavailable right now. Please reach out via email.",
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
        "Unable to load the verification step. Please refresh and try again.",
      );
      safeConsoleWarn("Failed to load Turnstile script", error);
    }
  }, [turnstileSiteKey]);

  const handleDismissError = useCallback(() => {
    onErrorChange(null);
  }, [onErrorChange]);

  // Load pageclip on first form interaction
  const handleFormFocus = useCallback(async () => {
    if (!pageclipLoaded && !pageclipLoading) {
      setPageclipLoading(true);
      try {
        await loadPageclip();
      } catch (error) {
        safeConsoleWarn("Failed to load pageclip script", error);
      } finally {
        setPageclipLoading(false);
      }
    }

    await ensureTurnstileScript();
  }, [ensureTurnstileScript, pageclipLoading]);

  useEffect(() => {
    ensureTurnstileScript();
  }, [ensureTurnstileScript]);

  useEffect(() => {
    if (!turnstileReady || !turnstileSiteKey) {
      return;
    }

    if (typeof window === "undefined" || !window.turnstile) {
      return;
    }

    const container = turnstileContainerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    try {
      const turnstileTheme = theme === "dark" ? "dark" : "light";
      const widgetId = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: turnstileTheme,
        appearance: "always",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileError(null);
        },
        "error-callback": () => {
          setTurnstileToken(null);
          setTurnstileError(
            "Verification failed to load. Please refresh the challenge.",
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
      setTurnstileError(
        "Unable to show the verification challenge. Please reload and try again.",
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

  const sendButtonSurface = themedClass(
    theme,
    "bg-white text-accent border border-accent hover:bg-accent/10 shadow-md",
    "bg-accent text-white border border-accent/40 hover:bg-accent/90 shadow-lg shadow-accent/40",
  );
  const isSubmitDisabled = isSubmitting || !turnstileToken;
  const verificationHelperColor = themedClass(
    theme,
    "text-slate-500",
    "text-slate-400",
  );
  const verificationErrorColor = themedClass(
    theme,
    "text-red-600",
    "text-red-400",
  );
  const verificationSuccessColor = themedClass(
    theme,
    "text-emerald-600",
    "text-emerald-400",
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      onErrorChange(null);

      if (!pageclipApiKey || !pageclipUrl) {
        const errorMsg = "VITE_PAGECLIP_API_KEY is missing or invalid.";
        safeConsoleError(`Cannot submit form: ${errorMsg}`);
        onErrorChange(`Configuration Error: ${errorMsg}`);
        return;
      }

      if (!turnstileSiteKey) {
        const errorMsg =
          "VITE_TURNSTILE_SITE_KEY (or VITE_TURNSTYLE_SITE) is missing or invalid.";
        safeConsoleError(`Cannot submit form: ${errorMsg}`);
        onErrorChange(`Configuration Error: ${errorMsg}`);
        return;
      }

      if (!turnstileToken) {
        setTurnstileError(
          "Please complete the verification challenge before sending your message.",
        );
        return;
      }

      setIsSubmitting(true);

      const form = event.currentTarget;

      // Read fields from the form
      const name =
        (form.elements.namedItem("name") as HTMLInputElement | null)?.value ??
        "";
      const email =
        (form.elements.namedItem("email") as HTMLInputElement | null)?.value ??
        "";
      const message =
        (form.elements.namedItem("message") as HTMLTextAreaElement | null)
          ?.value ?? "";

      // Keep your subject auto-fill behavior
      const subjectInput = form.elements.namedItem(
        "subject",
      ) as HTMLInputElement | null;
      const subject = name ? `Hello from ${name}` : "Hello from a new contact";
      if (subjectInput) subjectInput.value = subject;

      // IMPORTANT: URL-encoded body (not multipart). No custom headers.
      const body = new URLSearchParams();
      body.set("name", name);
      body.set("email", email);
      body.set("message", message);
      body.set("subject", subject);
      body.set("cf-turnstile-response", turnstileToken);

      try {
        const response = await fetch(pageclipUrl, {
          method: "POST",
          body, // application/x-www-form-urlencoded (browser sets header)
          mode: "cors", // ensures the browser sends Origin
          // DO NOT add headers (Content-Type, Authorization, etc.)
          // DO NOT set referrerPolicy to "no-referrer"
        });

        if (!response.ok) {
          let errorText: string;
          try {
            const data = await response.json();
            // Normalize various Pageclip error shapes
            if (data?.message && typeof data.message === "string") {
              errorText = data.message;
            } else if (Array.isArray(data?.errors) && data.errors[0]?.message) {
              errorText = String(data.errors[0].message);
            } else {
              errorText =
                "An unexpected error occurred. Please try again later.";
            }
          } catch {
            errorText = await response.text();
          }
          onErrorChange(
            `API Error (${response.status} ${response.statusText}): ${errorText}`,
          );
          return;
        }

        // Success — parse (don’t log PII), reset form
        try {
          await response.json();
        } catch {
          // If no JSON body, ignore CORS/response reading errors
          // The form submission was successful if we reach this point
        }
        form.reset();
        onErrorChange(null);
        setTurnstileToken(null);
        setTurnstileError(null);
        if (turnstileWidgetIdRef.current) {
          window.turnstile?.reset(turnstileWidgetIdRef.current);
        }
        // Optional: toast/snackbar could go here
      } catch (error) {
        // Check if this is a CORS/opaque response issue or a genuine network failure
        const isOffline =
          typeof navigator !== "undefined" && navigator.onLine === false;
        const likelyCorsError = !isOffline && isLikelyCorsError(error);

        if (likelyCorsError) {
          // We likely hit a CORS/read issue, but connectivity is intact.
          // Treat it as a success: reset the form silently to avoid resubmits.
          safeConsoleWarn("Possible CORS error after form submission", error);
          form.reset();
          onErrorChange(null);
          setTurnstileToken(null);
          setTurnstileError(null);
          if (turnstileWidgetIdRef.current) {
            window.turnstile?.reset(turnstileWidgetIdRef.current);
          }
          return;
        } else {
          // This appears to be an actual network error
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          safeConsoleError(
            "Network error while submitting contact form",
            error,
          );
          onErrorChange(`Network Error: ${errorMessage}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      onErrorChange,
      pageclipApiKey,
      pageclipUrl,
      turnstileSiteKey,
      turnstileToken,
    ],
  );

  if (!pageclipApiKey) {
    safeConsoleError("Contact form configuration error: API key not found");
  }

  if (!turnstileSiteKey) {
    safeConsoleError(
      "Contact form configuration error: Turnstile site key not found. Set VITE_TURNSTILE_SITE_KEY or VITE_TURNSTYLE_SITE.",
    );
  }

  return (
    <form
      ref={formRef}
      className="pageclip-form flex-1 space-y-4"
      onSubmit={handleSubmit}
    >
      {/* Error notification */}
      {errorMessage && (
        <motion.div
          initial={
            prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.95 }
          }
          animate={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            prefersReducedMotion
              ? undefined
              : { opacity: 0, y: -10, scale: 0.95 }
          }
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "rounded-2xl border p-4",
            themedClass(
              theme,
              "border-red-200 bg-red-50",
              "border-red-800/60 bg-red-900/20",
            ),
          )}
        >
          <div className="flex items-start gap-3">
            <Icon
              icon="material-symbols:error-rounded"
              className={cn(
                "mt-0.5 text-lg",
                themedClass(theme, "text-red-600", "text-red-400"),
              )}
              aria-hidden="true"
            />
            <div className="flex-1">
              <pre
                className={cn(
                  "max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-sm",
                  themedClass(theme, "text-red-800", "text-red-200"),
                )}
              >
                {errorMessage}
              </pre>
              <button
                type="button"
                onClick={handleDismissError}
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
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
      )}
      <label
        className={cn(
          "block text-sm font-medium",
          themedClass(theme, "text-slate-600", "text-slate-300"),
        )}
      >
        <span>Name</span>
        <input
          name="name"
          className={cn(
            "mt-1 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none",
            themedClass(
              theme,
              "border-slate-200/60 bg-white/80",
              "border-slate-700/60 bg-slate-900/70",
            ),
          )}
          placeholder="How should I address you?"
          onFocus={handleFormFocus}
        />
      </label>
      <label
        className={cn(
          "block text-sm font-medium",
          themedClass(theme, "text-slate-600", "text-slate-300"),
        )}
      >
        <span>Email</span>
        <input
          type="email"
          name="email"
          className={cn(
            "mt-1 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none",
            themedClass(
              theme,
              "border-slate-200/60 bg-white/80",
              "border-slate-700/60 bg-slate-900/70",
            ),
          )}
          placeholder="Where can I reach you?"
          required
          onFocus={handleFormFocus}
        />
      </label>
      <input
        type="hidden"
        name="subject"
        defaultValue="Hello from a new contact"
      />
      <label
        className={cn(
          "block text-sm font-medium",
          themedClass(theme, "text-slate-600", "text-slate-300"),
        )}
      >
        <span>Message</span>
        <textarea
          name="message"
          rows={4}
          className={cn(
            "mt-1 w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none",
            themedClass(
              theme,
              "border-slate-200/60 bg-white/80",
              "border-slate-700/60 bg-slate-900/70",
            ),
          )}
          placeholder="Let me know how I can help."
          onFocus={handleFormFocus}
        />
      </label>
      <div className="space-y-2">
        <div
          ref={turnstileContainerRef}
          className="flex justify-center"
          data-testid="turnstile-container"
        />
        {!turnstileToken && !turnstileError && (
          <p
            className={cn(
              "text-center text-xs font-medium",
              verificationHelperColor,
            )}
          >
            Complete the verification above to enable Send message.
          </p>
        )}
        {turnstileToken && !turnstileError && (
          <p
            className={cn(
              "text-center text-xs font-medium",
              verificationSuccessColor,
            )}
          >
            Thanks! You're verified and ready to submit.
          </p>
        )}
        {turnstileError && (
          <p
            className={cn(
              "text-center text-xs font-semibold",
              verificationErrorColor,
            )}
            role="alert"
          >
            {turnstileError}
          </p>
        )}
      </div>
      <motion.button
        type="submit"
        className={cn(
          "pageclip-form__submit w-full rounded-2xl px-6 py-3 text-sm font-semibold transition",
          sendButtonSurface,
          isSubmitDisabled && "cursor-not-allowed opacity-60",
        )}
        disabled={isSubmitDisabled}
        aria-disabled={isSubmitDisabled}
        whileHover={
          prefersReducedMotion || isSubmitDisabled ? undefined : { scale: 1.01 }
        }
        whileTap={
          prefersReducedMotion || isSubmitDisabled ? undefined : { scale: 0.97 }
        }
      >
        <span>{isSubmitting ? "Sending..." : "Send message"}</span>
      </motion.button>
    </form>
  );
}

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      safeConsoleWarn("Clipboard operation failed", error);
      setCopied(false);
    }
  }, []);

  return (
    <SectionContainer id="contact" className="pb-28">
      <ContactCard
        copied={copied}
        onCopy={handleCopy}
        prefersReducedMotion={prefersReducedMotion}
        errorMessage={errorMessage}
        onErrorChange={setErrorMessage}
      />
    </SectionContainer>
  );
}
