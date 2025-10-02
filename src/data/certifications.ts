export type Certification = {
  name: string;
  issuer: string;
  date: string;
  link?: string;
};

export const CERTIFICATIONS_RESOURCE = "Certifications";

export const certificationsFallback: Certification[] = [];

export const certificationsPlaceholder: Certification[] = [
  {
    name: "Unable to load certifications",
    issuer: "Please try again later.",
    date: "—",
  },
];
