import { ComponentPropsWithoutRef, ElementType, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";

const TARGET_URL = "https://kiyaverse.cloudflareaccess.com";
const LONG_PRESS_THRESHOLD_MS = 650;

interface PressableKiyaNameProps<T extends ElementType> {
  as?: T;
  className?: string;
  children?: ComponentPropsWithoutRef<T>["children"];
}

type PolymorphicProps<T extends ElementType> = PressableKiyaNameProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PressableKiyaNameProps<T>>;

function PressableKiyaName<T extends ElementType = "span">({
  as,
  className,
  children = "Kiya Rose",
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...rest
}: PolymorphicProps<T>) {
  const Component = (as ?? "span") as ElementType;
  const timeoutRef = useRef<number>();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const triggerNavigation = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.open(TARGET_URL, "_blank", "noopener,noreferrer");
  }, []);

  const startPressTimer = useCallback(() => {
    clearTimer();
    timeoutRef.current = window.setTimeout(triggerNavigation, LONG_PRESS_THRESHOLD_MS);
  }, [clearTimer, triggerNavigation]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <Component
      {...rest}
      className={clsx("font-kiya", className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (event.button === 0) {
          startPressTimer();
        }
      }}
      onMouseUp={(event) => {
        onMouseUp?.(event);
        clearTimer();
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        clearTimer();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        startPressTimer();
      }}
      onTouchEnd={(event) => {
        onTouchEnd?.(event);
        clearTimer();
      }}
      onTouchCancel={(event) => {
        onTouchCancel?.(event);
        clearTimer();
      }}
      title="Press and hold to open the secure dashboard"
    >
      {children}
    </Component>
  );
}

export default PressableKiyaName;
