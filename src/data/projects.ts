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
    description: "A class project involving enterprise hardware and virtualization.",
    tech: ["HPE", "Windows Server", "VMWare", "ILO"],
  },
  {
    title: "Placeholder",
    description: "Hopefully I will gain more cool things to show off once I progress my career.",
    tech: ["Hope", "Dreams", "Passion", "Love"],
  },
];
