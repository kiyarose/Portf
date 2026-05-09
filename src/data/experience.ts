export type ExperienceEntry = {
  company: string;
  role: string;
  dates: string;
  description?: string;
  tech?: string[];
};

export const EXPERIENCE_RESOURCE = "Experience";

export const experienceFallback: ExperienceEntry[] = [
  {
    company: "SillyLittleTech",
    role: "Administrative Project Lead",
    dates: "March 2026 – Present",
    description:
      "Served as the Administrative Project Lead for SillyLittleTech, a fiscally sponsored digital equity non-profit",
    tech: ["Non-Profit Operations", "Administration", "Technical Development"],
  },
  {
    company: "B&T Building Services",
    role: "Contract EVS",
    dates: "March 2026 – Present",
    description:
      "Contract EVS work for Primary Health Network & UPMC behavioural health.",
    tech: ["Logistics", "Medical Sanitation"],
  },
  {
    company: "Handshake AI",
    role: "Data Labling",
    dates: "August 2025 – Present",
    description:
      "Developed and evaluated domain-specific prompts to assess the scientific accuracy of large language models (LLMs).",
    tech: ["LLM", "Data Labling", "Scientific Research"],
  },
  {
    company: "YRAB/CAYAH Research Board",
    role: "Board Member",
    dates: "Feb 2025 – Present",
    description:
      "Served as a board member for youth research and advocacy, contributing to research direction and community impact.",
    tech: ["Research", "Advocacy", "Leadership"],
  },
  {
    company: "Walmart",
    role: "Digital / OGP / OPD Associate",
    dates: "Jun 2025 – Sept 2025",
    description:
      "Worked in retail, order picking, product substitutions, order staging, and dispensing as a digital/OGP/OPD associate at Walmart.",
    tech: [
      "Retail",
      "Order Picking",
      "Product Substitutions",
      "Order Staging",
      "Order Dispensing",
      "Customer Service",
    ],
  },
  {
    company: "Amazon",
    role: "Sortation Associate",
    dates: "Jun 2025 – Jul 2025",
    description:
      "Handled picking, packing, stowing, and unloading packages as a sortation associate at Amazon.",
    tech: ["Picking", "Packing", "Stowing", "Unloading", "Logistics"],
  },
  {
    company: "Shawmut Services LLC (Contract)",
    role: "Sales Representative",
    dates: "Nov 2024 – 2024",
    description:
      "Contract sales work including voter registration, canvassing, and direct sales for Shawmut Services.",
    tech: ["Voter Registration", "Canvassing", "Sales", "Customer Service"],
  },
  {
    company: "Google (Contract)",
    role: "Social Media Management",
    dates: "Apr 2021 – Jan 2023",
    description:
      "Managed community engagement and led technical and administrative teams for Google as a contract social media manager.",
    tech: [
      "Community Engagement",
      "Technical Leadership",
      "Team Leadership",
      "Administration",
      "Customer Service",
    ],
  },
];

export const experiencePlaceholder: ExperienceEntry[] = [
  {
    company: "Unable to load experience timeline",
    role: "Please try again later.",
    dates: "—",
    description:
      "We weren't able to load experience details from data.kiya.cat.",
    tech: ["Connection issue"],
  },
];
