import { Icon } from "@iconify/react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
import { safeConsoleError } from "../utils/errorSanitizer";
import type {
  FeedbackFormData,
  FeedbackType,
  FeedbackImpact,
} from "../types/feedback";
import { FEEDBACK_IMPACT_OPTIONS } from "../types/feedback";

// Time in milliseconds before showing the feedback bubble
const SHOW_AFTER_TIME = 30000; // 30 seconds

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

// Confetti component for celebration effect
function ConfettiParticle({ initialX, initialY }: { initialX: number; initialY: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute h-2 w-2 rounded-full"
      style={{
        background: `hsl(${Math.random() * 360}, 70%, 60%)`,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      initial={{
        opacity: 1,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
      }}
      animate={{
        opacity: 0,
        scale: [0, 1, 0],
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.5,
        ease: "easeOut",
      }}
    />
  );
}

function ConfettiEffect({ isActive }: { isActive: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  // Generate stable particles data to avoid re-renders changing positions
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: `confetti-${Date.now()}-${i}`,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
    })),
    [] // Empty dependency array means this only runs once
  );

  if (!isActive || prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          initialX={particle.initialX}
          initialY={particle.initialY}
        />
      ))}
    </div>
  );
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
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const selectClass = cn(
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:border-accent focus:outline-none",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const textareaClass = cn(
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none resize-none",
    themedClass(
      theme,
      "border-slate-200 bg-white text-slate-900",
      "border-slate-700 bg-slate-900/50 text-white",
    ),
  );

  const labelClass = cn(
    "block text-xs font-medium",
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-medium transition",
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
              "flex-1 rounded-xl px-3 py-2 text-xs font-medium transition",
              themedClass(
                theme,
                "bg-accent text-white hover:bg-accent/90",
                "bg-accent text-white hover:bg-accent/90",
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

export function FeedbackBubble({ className }: FeedbackBubbleProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Show bubble after specified time
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if feedback was already submitted in this session
      const hasSubmitted = sessionStorage.getItem("feedback-submitted");
      if (!hasSubmitted) {
        setIsVisible(true);
        setShowConfetti(true);
        // Stop confetti after animation completes
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, SHOW_AFTER_TIME);

    return () => clearTimeout(timer);
  }, []);

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
        setIsSubmitted(true);
        setIsExpanded(false);
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
    if (isSubmitted) return;
    setIsExpanded(!isExpanded);
  }, [isSubmitted, isExpanded]);

  const handleFormClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const bubbleClass = cn("fixed bottom-6 right-6 z-50", className);

  const bubbleButtonClass = cn(
    "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300",
    themedClass(
      theme,
      "bg-accent text-white hover:bg-accent/90 hover:shadow-xl",
      "bg-accent text-white hover:bg-accent/90 hover:shadow-xl shadow-accent/20",
    ),
  );

  const formContainerClass = cn(
    "absolute bottom-14 right-0 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-lg",
    themedClass(
      theme,
      "border-white/60 bg-white/90 text-slate-700",
      "border-slate-700/60 bg-slate-900/90 text-slate-300",
    ),
  );

  if (!isVisible) return null;

  return (
    <div className={bubbleClass}>
      <AnimatePresence>
        {isExpanded && !isSubmitted && (
          <motion.div
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, scale: 0.9, y: 20 }
            }
            animate={
              prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, scale: 0.9, y: 20 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={formContainerClass}
          >
            <div className="mb-3">
              <h3
                className={cn(
                  "text-sm font-semibold mb-1",
                  themedClass(theme, "text-slate-900", "text-white"),
                )}
              >
                Share Your Feedback
              </h3>
              <p
                className={cn(
                  "text-xs",
                  themedClass(theme, "text-slate-600", "text-slate-400"),
                )}
              >
                Help me improve this website by sharing your thoughts.
              </p>
            </div>
            <FeedbackForm
              onSubmit={handleSubmit}
              onClose={handleFormClose}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              onErrorChange={setErrorMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={bubbleButtonClass}
        onClick={handleBubbleClick}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: isSubmitted ? [1, 1.2, 1] : 1,
              }
        }
        transition={{
          duration: isSubmitted ? 0.6 : 0.2,
          ease: "easeOut",
        }}
        title={isSubmitted ? "Thank you for your feedback!" : "Share feedback"}
      >
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={
                prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }
              }
              animate={
                prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
              }
              exit={
                prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }
              }
              transition={{ duration: 0.2 }}
            >
              <Icon icon="material-symbols:check-rounded" className="text-xl" />
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
              exit={
                prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }
              }
              transition={{ duration: 0.2 }}
            >
              <Icon
                icon="material-symbols:feedback-rounded"
                className={cn("text-xl", isExpanded && "rotate-12")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Confetti effect when bubble first appears */}
      <ConfettiEffect isActive={showConfetti} />
    </div>
  );
}
