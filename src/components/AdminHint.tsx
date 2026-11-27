import { useCallback, useEffect, useRef } from "react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  MouseEvent,
  ReactNode,
  TouchEvent,
} from "react";
import clsx from "clsx";

// Template-friendly admin hint. Replace TARGET_URL with your admin/dashboard
// URL or remove the long-press behavior if you don't need it.
const TARGET_URL = (import.meta.env.VITE_ADMIN_URL as string) || "https://example.com/admin";
const LONG_PRESS_THRESHOLD_MS = 650;

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

function AdminHint<T extends ElementType = "span">({
  as,
  className,
  children = "Your Name",
  ...restProps
}: PolymorphicProps<T>) {
  type MouseHandler = ((event: MouseEvent<HTMLElement>) => void) | undefined;
  type TouchHandler = ((event: TouchEvent<HTMLElement>) => void) | undefined;

  const {
    onMouseDown: originalMouseDown,
    onMouseUp: originalMouseUp,
    onMouseLeave: originalMouseLeave,
    onTouchStart: originalTouchStart,
    onTouchEnd: originalTouchEnd,
    onTouchCancel: originalTouchCancel,
    ...otherProps
  } = restProps as ComponentPropsWithoutRef<T> & {
    onMouseDown?: MouseHandler;
    onMouseUp?: MouseHandler;
    onMouseLeave?: MouseHandler;
    onTouchStart?: TouchHandler;
    onTouchEnd?: TouchHandler;
    onTouchCancel?: TouchHandler;
  };

  const Component = (as ?? "span") as ElementType;
  const timeoutRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
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
    timeoutRef.current = window.setTimeout(
      triggerNavigation,
      LONG_PRESS_THRESHOLD_MS,
    );
  }, [clearTimer, triggerNavigation]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      originalMouseDown?.(event);
      if (event.button === 0) {
        startPressTimer();
      }
    },
    [originalMouseDown, startPressTimer],
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      originalMouseUp?.(event);
      clearTimer();
    },
    [clearTimer, originalMouseUp],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      originalMouseLeave?.(event);
      clearTimer();
    },
    [clearTimer, originalMouseLeave],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      originalTouchStart?.(event);
      startPressTimer();
    },
    [originalTouchStart, startPressTimer],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      originalTouchEnd?.(event);
      clearTimer();
    },
    [clearTimer, originalTouchEnd],
  );

  const handleTouchCancel = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      originalTouchCancel?.(event);
      clearTimer();
    },
    [clearTimer, originalTouchCancel],
  );

  const props: ComponentPropsWithoutRef<T> = {
    ...(otherProps as ComponentPropsWithoutRef<T>),
    className: clsx("font-kiya", className),
    onMouseDown: handleMouseDown as ComponentPropsWithoutRef<T>["onMouseDown"],
    onMouseUp: handleMouseUp as ComponentPropsWithoutRef<T>["onMouseUp"],
    onMouseLeave:
      handleMouseLeave as ComponentPropsWithoutRef<T>["onMouseLeave"],
    onTouchStart:
      handleTouchStart as ComponentPropsWithoutRef<T>["onTouchStart"],
    onTouchEnd: handleTouchEnd as ComponentPropsWithoutRef<T>["onTouchEnd"],
    onTouchCancel:
      handleTouchCancel as ComponentPropsWithoutRef<T>["onTouchCancel"],
    title: "Press and hold to open the secure dashboard",
  };

  return <Component {...props}>{children}</Component>;
}

export default AdminHint;
