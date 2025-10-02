export type ExperienceEntry = {
  company: string;
  role: string;
  dates: string;
  description?: string;
  tech?: string[];
};

export const EXPERIENCE_RESOURCE = "Experience";

export const experienceFallback: ExperienceEntry[] = [];

export const experiencePlaceholder: ExperienceEntry[] = [
  {
    company: "Unable to load experience timeline",
    role: "Please try again later.",
    dates: "—",
    description:
      "We weren't able to load experience details from data.sillylittle.tech.",
    tech: ["Connection issue"],
  },
];
