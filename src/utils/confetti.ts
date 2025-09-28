// Global confetti utility functions that can be called from anywhere
// This creates confetti effects by dynamically rendering React components
//
// Note: Math.random() usage in this file is for visual effects only (particle positions,
// colors, animations) and does not require cryptographic security. SonarCloud warnings
// about pseudo-random number generation are not applicable for these use cases.

export interface CelebrationOptions {
  /** X coordinate in pixels (defaults to center of screen) */
  x?: number;
  /** Y coordinate in pixels (defaults to center of screen) */
  y?: number;
  /** Duration in milliseconds to show the effect (defaults to 3000ms) */
  duration?: number;
}

/**
 * Trigger the original simple confetti effect
 * @param options Configuration options for the confetti effect
 */
export async function celebrateOld(
  options: CelebrationOptions = {},
): Promise<void> {
  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    duration = 3000,
  } = options;

  // Dynamically import React and required components
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { motion, useReducedMotion } = await import("framer-motion");

  // Original confetti particle component
  const OriginalConfettiParticle = ({
    initialX,
    initialY,
  }: {
    initialX: number;
    initialY: number;
  }) => {
    const prefersReducedMotion = useReducedMotion();
    if (prefersReducedMotion) return null;

    return React.createElement(motion.div, {
      className: "absolute h-2 w-2 rounded-full",
      style: {
        background: `hsl(${Math.random() * 360}, 70%, 60%)`, // NOSONAR - visual effect only
        left: `${initialX}px`,
        top: `${initialY}px`,
      },
      initial: { opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 },
      animate: {
        opacity: 0,
        scale: [0, 1, 0],
        x: (Math.random() - 0.5) * 200, // NOSONAR - visual effect only
        y: (Math.random() - 0.5) * 200, // NOSONAR - visual effect only
        rotate: Math.random() * 360, // NOSONAR - visual effect only
      },
      transition: { duration: 1.5 + Math.random() * 0.5, ease: "easeOut" }, // NOSONAR - visual effect only
    });
  };

  // Container component
  const ConfettiContainer = () => {
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: `old-confetti-${Date.now()}-${i}`,
      initialX: x,
      initialY: y,
    }));

    return React.createElement(
      "div",
      {
        className: "fixed inset-0 overflow-visible pointer-events-none z-50",
      },
      particles.map((particle) =>
        React.createElement(OriginalConfettiParticle, {
          key: particle.id,
          initialX: particle.initialX,
          initialY: particle.initialY,
        }),
      ),
    );
  };

  // Create container and render
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(React.createElement(ConfettiContainer));

  // Clean up after animation
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, duration);
}

/**
 * Trigger the new Discord-style bold confetti effect
 * @param options Configuration options for the confetti effect
 */
export async function celebrateNew(
  options: CelebrationOptions = {},
): Promise<void> {
  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    duration = 4000,
  } = options;

  // Dynamically import React and required components
  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const { motion, useReducedMotion } = await import("framer-motion");

  const BOLD_CONFETTI_COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#EE5A24",
    "#0ABDE3",
    "#10AC84",
    "#F79F1F",
    "#A3CB38",
    "#FD79A8",
    "#6C5CE7",
    "#A29BFE",
    "#74B9FF",
    "#81ECEC",
  ];

  const CONFETTI_SHAPES = ["circle", "square", "triangle"] as const;

  // New Discord-style confetti particle component
  const NewConfettiParticle = ({
    initialX,
    initialY,
    angle,
    size,
    shape,
    color,
  }: {
    initialX: number;
    initialY: number;
    angle: number;
    size: number;
    shape: "circle" | "square" | "triangle";
    color: string;
  }) => {
    const prefersReducedMotion = useReducedMotion();
    if (prefersReducedMotion) return null;

    const distance = 300 + Math.random() * 400; // NOSONAR - visual effect only
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    const getShapeClass = () => {
      switch (shape) {
        case "circle":
          return "rounded-full";
        case "square":
          return "rounded-sm";
        case "triangle":
          return "rounded-sm transform rotate-45";
        default:
          return "rounded-full";
      }
    };

    return React.createElement(motion.div, {
      className: `absolute ${getShapeClass()}`,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        left: `${initialX}px`,
        top: `${initialY}px`,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      },
      initial: { opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 },
      animate: {
        opacity: 0,
        scale: [0, 1.2, 0.8, 0],
        x: moveX,
        y: moveY,
        rotate: Math.random() * 720, // NOSONAR - visual effect only
      },
      transition: { duration: 2 + Math.random(), ease: "easeOut" }, // NOSONAR - visual effect only
    });
  };

  // Container component
  const ConfettiContainer = () => {
    const particles = Array.from({ length: 25 }, (_, i) => ({
      id: `new-confetti-${Date.now()}-${i}`,
      initialX: x,
      initialY: y,
      angle: (Math.PI * 2 * i) / 25 + (Math.random() - 0.5) * 0.8, // NOSONAR - visual effect only
      size: 8 + Math.random() * 12, // NOSONAR - visual effect only
      shape:
        CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)], // NOSONAR - visual effect only
      color:
        BOLD_CONFETTI_COLORS[
          Math.floor(Math.random() * BOLD_CONFETTI_COLORS.length) // NOSONAR - visual effect only
        ],
    }));

    return React.createElement(
      "div",
      {
        className: "fixed inset-0 overflow-visible pointer-events-none z-50",
      },
      particles.map((particle) =>
        React.createElement(NewConfettiParticle, {
          key: particle.id,
          initialX: particle.initialX,
          initialY: particle.initialY,
          angle: particle.angle,
          size: particle.size,
          shape: particle.shape,
          color: particle.color,
        }),
      ),
    );
  };

  // Create container and render
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(React.createElement(ConfettiContainer));

  // Clean up after animation
  setTimeout(() => {
    root.unmount();
    document.body.removeChild(container);
  }, duration);
}

// Convenience functions for common use cases
export async function celebrateAtElement(
  element: HTMLElement,
  style: "old" | "new" = "new",
): Promise<void> {
  const rect = element.getBoundingClientRect();
  const options = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };

  if (style === "old") {
    await celebrateOld(options);
  } else {
    await celebrateNew(options);
  }
}

export async function celebrateAtCenter(
  style: "old" | "new" = "new",
): Promise<void> {
  const options = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  if (style === "old") {
    await celebrateOld(options);
  } else {
    await celebrateNew(options);
  }
}
