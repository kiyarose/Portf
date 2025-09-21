export type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

export const projects: Project[] = [
  {
    title: "SillyLittleFiles",
    description:
      "A VPN program & documentation focused on secure remote access for small teams.",
    tech: ["ProtonVPN", "OpenVPN", "JavaScript"],
  },
  {
    title: "2025 Class Project",
    description:
    tech: ["HPE", "Windows Server", "VMWare", "ILO"],
  },
  {
    // Placeholder (etc.)
      description: "Hopefully I will gain more cool things to show off once I progress my career.",
    descriptions:
      "Hopefully I will gain more cool things to show off once I progress my career.",
    tech: ["Hope", "Dreams", "Passion", "Love"],
  },
];
