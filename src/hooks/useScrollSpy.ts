import { useEffect, useState } from "react";

export function useScrollSpy(
  sectionIds: string[],
  rootMargin = "-50% 0px -50% 0px",
) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

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

    function cleanupObserver() {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    }

    return cleanupObserver;
  }, [rootMargin, sectionIds]);

  return activeId;
}
