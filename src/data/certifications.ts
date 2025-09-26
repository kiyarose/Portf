export type Certification = {
  name: string;
  issuer: string;
  date: string;
  link?: string;
};

export const certifications: Certification[] = [
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
