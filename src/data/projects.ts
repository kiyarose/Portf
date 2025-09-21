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
      description: "Converted an HPE server rack running VMWare to a domain controller and file server using Windows Server 2017",
      tech: ["HPE", "Windows Server", "VMWare", "ILO"],
  },
  {
      // Placeholder (etc.)
      title: "...And Hopefully More",
      descriptions: "Hopefully I will gain more cool things to show off once I progress my career.",
      tech: ["Hope","Dreams","Passion","Love"],
  },
];
