import {
  Icon as OfflineIcon,
  type IconProps as OfflineIconProps,
} from "@iconify/react/offline";
import "../utils/icons";

export type IconProps = OfflineIconProps;

/** Offline Iconify icon (bundled SVG data, SSR-safe hydration). */
export function Icon(props: IconProps) {
  return <OfflineIcon {...props} />;
}
