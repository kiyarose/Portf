import { useEffect, useState } from "react";

export function useScrollSpy(
  sectionIds: string[],
  rootMargin = "-50% 0px -50% 0px",
) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(
    function registerScrollSpy(): (() => void) | undefined {
      if (typeof window === "undefined") {
        return cleanupNoop;
      }
      const elements = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      if (elements.length === 0) {
        return cleanupNoop;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

          if (visibleEntries[0]) {
            setActiveId(visibleEntries[0].target.id);
            return;
          }

          const exiting = entries.find((entry) => entry.intersectionRatio === 0);
          if (!exiting) return;

          const exitingIndex = elements.findIndex(
            (element) => element.id === exiting.target.id,
          );
          if (exitingIndex <= 0) return;

          const previousElement = elements[exitingIndex - 1];
          if (previousElement) {
            setActiveId(previousElement.id);
          }
        },
        { rootMargin, threshold: [0, 0.25, 0.5, 0.75] },
      );

      elements.forEach((element) => observer.observe(element));

      function cleanupObserver(): void {
        elements.forEach((element) => observer.unobserve(element));
        observer.disconnect();
      }

      return cleanupObserver;
    },
    [rootMargin, sectionIds],
  );

  return activeId;
}

function cleanupNoop(): void {
  // intentionally empty
}
