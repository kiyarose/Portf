export type SocialLink = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export const SOCIALS_RESOURCE = "Socials";

// Common profile links — kept as fallback so the UI has usable targets when
// remote payloads are missing or the sync job provides an empty array.
export const socialsFallback: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://kiya.party/GH",
    icon: "mdi:github",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://kiya.party/IG",
    icon: "mdi:instagram",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://kiya.party/LI",
    icon: "mdi:linkedin",
  },
  {
    id: "bluesky",
    label: "Bluesky",
    href: "https://kiya.party/BS",
    icon: "simple-icons:bluesky",
  },
];

export const socialsPlaceholder: SocialLink[] = [
  {
    id: "socials-unavailable",
    label: "Socials unavailable",
    href: "https://status.sillylittle.tech/",
    icon: "mdi:alert-circle-outline",
  },
];
