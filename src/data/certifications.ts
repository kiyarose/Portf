export type Certification = {
  name: string;
  issuer: string;
  date: string;
};

export const certifications: Certification[] = [
  {
    name: "PSI GitHub Foundations",
    issuer: "PSI",
    date: "2024",
  },
  {
    name: "AZ-900 Microsoft Azure Fundamentals",
    issuer: "Microsoft",
    date: "2024",
  },
];
