import { useEffect } from "react";

/**
 * Custom hook to lock/unlock body scroll
 * @param isLocked - Whether the body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Store original body overflow and padding
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth =
      typeof window !== "undefined"
        ? window.innerWidth - document.documentElement.clientWidth
        : 0;

    // Lock scroll
    document.body.style.overflow = "hidden";

    // Add padding to compensate for scrollbar disappearance
    if (scrollbarWidth > 0) {
      const currentPadding = parseInt(originalPaddingRight || "0", 10);
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    // Cleanup function to restore original state
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
