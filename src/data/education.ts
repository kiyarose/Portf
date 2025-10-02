export type EducationEntry = {
  school: string;
  program: string;
  dates: string;
  tech?: string[];
};

export const EDUCATION_RESOURCE = "Education";

export const educationFallback: EducationEntry[] = [];

export const educationPlaceholder: EducationEntry[] = [
  {
    school: "Unable to load education timeline",
    program: "We couldn't fetch the most recent education data.",
    dates: "—",
    tech: ["Please try again later"],
  },
];
