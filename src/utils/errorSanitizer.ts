/**
 * Error sanitization utilities to prevent information disclosure and XSS attacks
 */

// Patterns that might contain sensitive information
const SENSITIVE_PATTERNS = [
  // API keys and tokens
  /\b[A-Za-z0-9_-]{20,}\b/g,
  // File system paths
  /[A-Za-z]:\\[\w\s\\.-]+/g,
  /\/[\w\s/.-]+/g,
  // URLs with potential sensitive info
  /https?:\/\/[^\s]+/g,
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Stack trace patterns
  /at\s+[\w$.]+\s*\([^)]*\)/g,
  // Error codes and internal identifiers
  /\b[A-Z]{2,}_[A-Z0-9_]+\b/g,
];

/**
 * Sanitizes error messages by removing potentially sensitive information
 * while preserving enough context for debugging in development
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  let message: string;

  // Handle different error types
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    // Try to extract message from error-like objects
    const errorObj = error as Record<string, unknown>;
    message = String(errorObj.message || errorObj.error || "Unknown error");
  } else {
    message = "An unknown error occurred";
  }

  // In development, we might want less aggressive sanitization
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    // In development, still sanitize obvious sensitive patterns but preserve more context
    return sanitizeText(message, false);
  }

  // In production, use more aggressive sanitization
  return sanitizeText(message, true);
}

/**
 * Sanitizes text by replacing sensitive patterns with safe placeholders
 */
function sanitizeText(text: string, aggressive: boolean): string {
  let sanitized = text;

  // Replace sensitive patterns
  SENSITIVE_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  });

  if (aggressive) {
    // More aggressive sanitization for production
    // Remove any remaining potentially dangerous characters that could be used for injection
    sanitized = sanitized.replace(/[<>'"&]/g, "");

    // Limit message length to prevent information leakage
    if (sanitized.length > 100) {
      sanitized = `${sanitized.substring(0, 97)}...`;
    }
  }

  // Provide a generic message if sanitization removed everything important
  if (sanitized.trim().length < 10 || sanitized.includes("[REDACTED]")) {
    const commonErrors = [
      "network",
      "connection",
      "timeout",
      "permission",
      "access",
      "storage",
      "clipboard",
      "validation",
    ];

    const detectedType = commonErrors.find((type) =>
      text.toLowerCase().includes(type),
    );

    if (detectedType) {
      return `A ${detectedType} error occurred. Please try again.`;
    }

    return "An error occurred. Please try again.";
  }

  return sanitized;
}

/**
 * Safe console logging that sanitizes error messages
 */
export function safeConsoleWarn(message: string, error?: unknown): void {
  const sanitizedMessage = error ? sanitizeErrorMessage(error) : message;
  console.warn(message, sanitizedMessage);
}

export function safeConsoleError(message: string, error?: unknown): void {
  const sanitizedMessage = error ? sanitizeErrorMessage(error) : message;
  console.error(message, sanitizedMessage);
}

/**
 * Generic error messages for common scenarios
 */
export const GENERIC_ERROR_MESSAGES = {
  NETWORK:
    "A network error occurred. Please check your connection and try again.",
  STORAGE:
    "Unable to access local storage. Please check your browser settings.",
  CLIPBOARD: "Unable to access clipboard. Please try copying manually.",
  FORM_SUBMISSION: "Unable to submit form. Please try again later.",
  PERMISSION: "Permission denied. Please check your browser settings.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
} as const;
