export const SKILLS_RESOURCE = "Skills";

export const skillsFallback: string[] = [];

const skillIconEntries = [
  ["information technology skills", "material-symbols:memory-alt-rounded"],
  ["customer service", "material-symbols:handshake-rounded"],
  ["gaining med admin skills", "material-symbols:medical-services-rounded"],
  ["community engagement", "material-symbols:diversity-3-rounded"],
  ["technical leadership", "material-symbols:engineering-rounded"],
  ["team leadership", "material-symbols:groups-3-rounded"],
  ["administration", "material-symbols:badge-rounded"],
  ["voter registration", "mdi:vote"],
  ["canvassing", "material-symbols:campaign-rounded"],
  ["sales", "material-symbols:point-of-sale-rounded"],
  ["picking", "mdi:hand-back-right"],
  ["packing", "mdi:package-variant-closed"],
  ["stowing", "material-symbols:inventory-2-rounded"],
  ["unloading", "material-symbols:forklift"],
  ["logistics", "mdi:truck-outline"],
  ["research", "material-symbols:science-rounded"],
  ["advocacy", "material-symbols:campaign-rounded"],
  ["leadership", "material-symbols:verified-rounded"],
  ["retail", "mdi:storefront-outline"],
  ["order picking", "material-symbols:shopping-cart-rounded"],
  ["product substitutions", "mdi:swap-horizontal"],
  ["order staging", "material-symbols:inventory-rounded"],
  ["order dispensing", "material-symbols:outbox-rounded"],
  ["protonvpn", "simple-icons:protonvpn"],
  ["openvpn", "simple-icons:openvpn"],
  ["javascript", "simple-icons:javascript"],
  ["hpe", "simple-icons:hewlettpackardenterprise"],
  ["windows server", "mdi:microsoft-windows"],
  ["vmware", "simple-icons:vmware"],
  ["ilo", "mdi:server"],
  ["hope", "material-symbols:emoji-emotions-rounded"],
  ["dreams", "material-symbols:nightlight-rounded"],
  ["passion", "material-symbols:favorite-rounded"],
  ["love", "mdi:heart"],
  ["networking", "material-symbols:network-node-rounded"],
  ["windows", "mdi:microsoft-windows"],
  ["cisco", "simple-icons:cisco"],
  ["linux", "simple-icons:linux"],
  ["medical coding", "material-symbols:prescriptions-rounded"],
  ["health informatics", "material-symbols:monitor-heart-rounded"],
  ["excel", "simple-icons:microsoftexcel"],
] as const;

const skillIconMap = skillIconEntries.reduce<Record<string, string>>(
  (acc, [label, icon]) => {
    acc[label] = icon;
    return acc;
  },
  {},
);

export function getSkillIcon(label: string): string | undefined {
  return skillIconMap[label.trim().toLowerCase()];
}

export const skillsPlaceholder: string[] = [
  "Unable to load skills",
  "Please refresh to try again",
];
