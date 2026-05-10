export type EducationEntry = {
  school: string;
  program: string;
  dates: string;
  tech?: string[];
};

export const EDUCATION_RESOURCE = "Education";

export const educationFallback: EducationEntry[] = [
  {
    school: "Colorado Mountain College",
    program: "Medical Billing and Coding",
    dates: "Aug 2025 – Jun 2028",
    tech: ["Medical Coding", "Health Informatics", "Excel"],
  },
  {
    school: "Greater Altoona CTC",
    program: "Computer and Networking Technology",
    dates: "2019 — Jun 2025",
    tech: ["Networking", "Windows", "Cisco", "Linux"],
  },
];

export const educationPlaceholder: EducationEntry[] = [
  {
    school: "Unable to load education timeline",
    program: "We couldn't fetch the most recent education data.",
    dates: "—",
    tech: ["Please try again later"],
  },
];
