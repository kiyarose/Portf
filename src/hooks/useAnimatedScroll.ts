import { useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedScrollOptions {
  /**
   * Duration of the scroll animation in milliseconds
   * @default 800
   */
  duration?: number;
  /**
   * Easing function for the scroll animation
   * @default 'easeInOutCubic'
   */
  easing?: (t: number) => number;
  /**
   * Offset to apply to the final scroll position (useful for sticky headers)
   * @default 0
   */
  offset?: number;
}

// Easing functions for smooth animations
const easings = {
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

/**
 * Custom hook that provides animated scrolling with scale/opacity effects
 * to make it feel like content is "coming to you" instead of zipping to it
 */
export function useAnimatedScroll(options: AnimatedScrollOptions = {}) {
  const {
    duration = 800,
    easing = easings.easeInOutCubic,
    offset = 0,
  } = options;
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

      const startPosition = window.scrollY;
      const targetPosition =
        element.getBoundingClientRect().top + window.scrollY + offset;
      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      // Animate the target element appearance
      const animateElement = () => {
        element.style.transition = "transform 0.6s ease-out, opacity 0.6s ease-out";
        element.style.transform = "scale(0.95)";
        element.style.opacity = "0.3";

        // Trigger reflow to ensure transition works
        void element.offsetHeight;

        requestAnimationFrame(() => {
          element.style.transform = "scale(1)";
          element.style.opacity = "1";

          // Clean up styles after animation
          setTimeout(() => {
            element.style.transition = "";
            element.style.transform = "";
            element.style.opacity = "";
          }, 600);
        });
      };

      // Animate the scroll
      const animateScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easing(progress);

        window.scrollTo(0, startPosition + distance * easedProgress);

        // Trigger element animation when we're about halfway through the scroll
        if (progress >= 0.4 && progress < 0.5) {
          animateElement();
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [duration, easing, offset, prefersReducedMotion],
  );

  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const startPosition = window.scrollY;
    const distance = -startPosition;
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easing(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [duration, easing, prefersReducedMotion]);

  return { scrollToElement, scrollToTop };
}
