import { useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedScrollOptions {
  /**
   * Duration of the fade animation in milliseconds
   * @default 400
   */
  duration?: number;
  /**
   * Offset to apply to the final scroll position (useful for sticky headers)
   * @default 0
   */
  offset?: number;
}

/**
 * Custom hook that provides animated scrolling with fade effects
 * to make content appear to "come to you" without showing the scroll journey
 */
export function useAnimatedScroll(options: AnimatedScrollOptions = {}) {
  const { duration = 400, offset = 0 } = options;
  const prefersReducedMotion = useReducedMotion();

  const scrollToElement = useCallback(
    (targetId: string) => {
      const element = document.getElementById(targetId);
      if (!element) return;

      // For reduced motion, use instant browser scroll
      if (prefersReducedMotion) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      const main = document.querySelector("main");
      if (!main) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      const targetPosition =
        element.getBoundingClientRect().top + window.scrollY + offset;

      // Phase 1: Fade out current view
      main.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
      main.style.opacity = "0";
      main.style.transform = "scale(0.95)";

      // Phase 2: After fade out, scroll instantly and fade in
      setTimeout(() => {
        // Instant scroll while content is hidden
        window.scrollTo({
          top: targetPosition,
          behavior: "auto",
        });

        // Trigger reflow to ensure style changes are applied
        void main.offsetHeight;

        // Phase 3: Fade in the target content with scale effect
        requestAnimationFrame(() => {
          main.style.transform = "scale(1.02)";
          main.style.opacity = "1";

          // Settle to final state
          setTimeout(() => {
            main.style.transform = "scale(1)";

            // Clean up after animation completes
            setTimeout(() => {
              main.style.transition = "";
              main.style.transform = "";
              main.style.opacity = "";
            }, duration);
          }, 50);
        });
      }, duration);
    },
    [duration, offset, prefersReducedMotion],
  );

  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const main = document.querySelector("main");
    if (!main) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    // Phase 1: Fade out
    main.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    main.style.opacity = "0";
    main.style.transform = "scale(0.95)";

    // Phase 2: Scroll and fade in
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });

      void main.offsetHeight;

      requestAnimationFrame(() => {
        main.style.transform = "scale(1.02)";
        main.style.opacity = "1";

        setTimeout(() => {
          main.style.transform = "scale(1)";

          setTimeout(() => {
            main.style.transition = "";
            main.style.transform = "";
            main.style.opacity = "";
          }, duration);
        }, 50);
      });
    }, duration);
  }, [duration, prefersReducedMotion]);

  return { scrollToElement, scrollToTop };
}
