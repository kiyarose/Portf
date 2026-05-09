export type Certification = {
  name: string;
  issuer: string;
  date: string;
  link?: string;
};

export const CERTIFICATIONS_RESOURCE = "Certifications";

export const certificationsFallback: Certification[] = [
  {
    name: "Leveraging AI in a non-profit role by Microsoft & NetHope",
    issuer: "Linkedin Learning",
    date: "2025",
    link:
      "https://www.linkedin.com/learning/certificates/0c6f88118d31982688f22fffa3e0ba2b6ceac5da822a3befa8cef0b8bb97cbc2?trk=share_certificate",
  },
  {
    name: "PSI GitHub Foundations",
    issuer: "PSI",
    date: "2024",
    link: "https://www.credly.com/go/FZfrOlFD9pvCvNOiGFvTrA",
  },
  {
    name: "AZ-900 Microsoft Azure Fundamentals",
    issuer: "Microsoft",
    date: "2024",
  },
];

export const certificationsPlaceholder: Certification[] = [
  {
    name: "Unable to load certifications",
    issuer: "Please try again later.",
    date: "—",
  },
];
