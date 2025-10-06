export type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

export const PROJECTS_RESOURCE = "Projects";

export const projectsFallback: Project[] = [];

export const projectsPlaceholder: Project[] = [
  {
    title: "Projects failed to load",
    description:
      "We couldn't reach data.kiya.cat to fetch the latest projects.",
    tech: ["Connection issue"],
  },
];
