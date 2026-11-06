import {
  Icon as IconifyIcon,
  type IconProps as IconifyIconProps,
} from "@iconify/react";
import { useHydrated } from "../hooks/useHydrated";

export type IconProps = IconifyIconProps;

/** Iconify wrapper that avoids SSR/client SVG text mismatches during hydration. */
export function Icon({ className, ...props }: IconProps) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <span
        className={className}
        aria-hidden={props["aria-hidden"] ?? true}
        style={{ display: "inline-block", width: "1em", height: "1em" }}
      />
    );
  }

  return <IconifyIcon className={className} {...props} />;
}
