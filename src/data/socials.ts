export type SocialLink = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export const SOCIALS_RESOURCE = "Socials";

export const socialsFallback: SocialLink[] = [];

export const socialsPlaceholder: SocialLink[] = [
  {
    id: "socials-unavailable",
    label: "Socials unavailable",
    href: "https://status.sillylittle.tech/",
    icon: "mdi:alert-circle-outline",
  },
];
