import { Icon } from "@iconify/react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCallback, useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import { useScrollProgress } from "../hooks/useScrollProgress";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
import { safeConsoleError } from "../utils/errorSanitizer";
import { celebrateNew } from "../utils/confetti";
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

interface FeedbackBubbleProps {
  className?: string;
}

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => Promise<void>;
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

  const handleDismissError = useCallback(() => {
    onErrorChange(null);
  }, [onErrorChange]);

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

      try {
        await onSubmit(formData);
      } catch (error) {
        safeConsoleError("Feedback form submission failed", error);
        onErrorChange("Failed to submit feedback. Please try again.");
      }
    },
    [formData, onSubmit, onErrorChange],
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
              <button
                type="button"
                onClick={handleDismissError}
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
                "bg-orange-500 text-white hover:bg-orange-600",
                "bg-orange-500 text-white hover:bg-orange-600",
              ),
            )}
            disabled={isSubmitting}
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
    // Position higher to avoid clipping with smaller button (bottom-16 instead of bottom-14)
    "absolute bottom-16 right-0 rounded-2xl border p-4 shadow-2xl backdrop-blur-lg",
    // Smaller on desktop, larger on mobile as requested
    "w-64 sm:w-60",
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
    "absolute bottom-14 right-0 rounded-2xl border p-5 shadow-2xl backdrop-blur-lg",
    // Mobile responsive width
    "w-72 sm:w-80",
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

interface FeedbackFormContainerProps {
  theme: Theme;
  prefersReducedMotion: boolean | null;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
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
    "absolute bottom-14 right-0 rounded-2xl border p-5 shadow-2xl backdrop-blur-lg",
    // Mobile responsive width - wider for better usability
    "w-80 sm:w-96",
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

  const pageclipApiKey = import.meta.env.VITE_PAGECLIP_API_KEY as
    | string
    | undefined;
  const pageclipFormName = "Feedback";
  const pageclipUrl = pageclipApiKey
    ? `https://send.pageclip.co/${pageclipApiKey}/${pageclipFormName}`
    : null;

  const handleSubmit = useCallback(
    async (data: FeedbackFormData) => {
      if (!pageclipApiKey || !pageclipUrl) {
        const errorMsg = "VITE_PAGECLIP_API_KEY is missing or invalid.";
        safeConsoleError(`Cannot submit feedback: ${errorMsg}`);
        setErrorMessage(`Configuration Error: ${errorMsg}`);
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        // Convert feedbackType to binary (0 for suggestion, 1 for bug as specified)
        const feedbackTypeBinary = data.feedbackType === "bug" ? "1" : "0";

        const body = new URLSearchParams();
        body.set("email", data.email);
        body.set("feedbackType", feedbackTypeBinary);
        body.set("subject", data.feedbackTitle); // Use subject field for PageClip
        body.set("feedbackTitle", data.feedbackTitle);
        body.set("feedbackDescription", data.feedbackDescription);
        body.set("impact", data.impact);

        const response = await fetch(pageclipUrl, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success
        setFeedbackStep("submitted");
        sessionStorage.setItem("feedback-submitted", "true");

        // Hide completely after showing success message
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } catch (error) {
        safeConsoleError("Feedback submission failed", error);
        setErrorMessage("Failed to submit feedback. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [pageclipApiKey, pageclipUrl],
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

  const handleConfirmNo = useCallback(() => {
    setFeedbackStep("initial");
    setSelectedThumb(null);
    setIsVisible(false);
    // Mark as completed in session storage to prevent reshowing
    sessionStorage.setItem("feedback-submitted", "true");
  }, []);

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
