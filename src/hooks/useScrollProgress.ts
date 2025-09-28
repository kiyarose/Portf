import { useEffect, useState } from "react";

/**
 * Custom hook to track scroll progress as a percentage of total scrollable content
 * @returns number between 0 and 1 representing scroll progress (0 = top, 1 = bottom)
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      
      // Calculate total scrollable distance
      const totalScrollableDistance = scrollHeight - viewportHeight;
      
      // Calculate progress as a percentage (0 to 1)
      const progress = totalScrollableDistance > 0 
        ? Math.min(scrollY / totalScrollableDistance, 1)
        : 0;
      
      setScrollProgress(progress);
    }

    handleScroll(); // Set initial value
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollProgress;
}