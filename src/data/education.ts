export type EducationEntry = {
  school: string;
  program: string;
  dates: string;
  tech?: string[];
};

export const educationTimeline: EducationEntry[] = [
   {
    school: "Colorado Mountain College",
    program: "Medical Billing and Coding",
    dates: "2025 – 2026",
    tech: ["Medical Coding", "Health Informatics", "Excel"],
  },
  {
    school: "Greater Altoona CTC",
    program: "Computer and Networking Technology",
    dates: "2019 — Jun 2025",
    tech: ["Networking", "Windows", "Cisco", "Linux"],
  },
];
