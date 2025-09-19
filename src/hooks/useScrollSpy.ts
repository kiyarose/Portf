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
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin, threshold: 0.4 },
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
