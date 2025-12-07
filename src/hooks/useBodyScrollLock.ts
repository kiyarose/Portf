import { useEffect } from "react";

/**
 * Custom hook to lock/unlock body scroll
 * @param isLocked - Whether the body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    // Early return if not in browser environment
    if (
      globalThis.window === undefined ||
      typeof document === "undefined"
    ) {
      return undefined;
    }

    if (!isLocked) return undefined;

    // Store original body overflow and padding
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth =
      globalThis.window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = "hidden";

    // Add padding to compensate for scrollbar disappearance
    if (scrollbarWidth > 0) {
      // Get computed padding in pixels
      const computedStyle = globalThis.window.getComputedStyle(document.body);
      const currentPadding = Number.parseFloat(computedStyle.paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    // Cleanup function to restore original state
    return () => {
      // Restore or remove overflow property
      if (originalOverflow) {
        document.body.style.overflow = originalOverflow;
      } else {
        document.body.style.removeProperty("overflow");
      }

      // Restore or remove padding-right property
      if (originalPaddingRight) {
        document.body.style.paddingRight = originalPaddingRight;
      } else {
        document.body.style.removeProperty("padding-right");
      }
    };
  }, [isLocked]);
}
