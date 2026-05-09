export type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

export const PROJECTS_RESOURCE = "Projects";

export const projectsFallback: Project[] = [
  {
    title: "SillyLittleFiles",
    description:
      "A VPN program & documentation focused on secure remote access for small teams.",
    tech: ["ProtonVPN", "OpenVPN", "JavaScript"],
  },
  {
    title: "Enterprise Virtualization Project",
    description: "A class project involving enterprise hardware and virtualization.",
    tech: ["HPE", "Windows Server", "VMWare", "ILO"],
  },
  {
    title: "PinStick",
    description: "A simple multi-platform pinnable notepad app.",
    tech: ["MacOS", "Linux", "Windows", "Tauri"],
  },
  {
    title: "Plummer",
    description: "A KV Worker based short link transformer tool.",
    tech: ["KV Workers", "Elixir", "Network Transformations", "Wrangler"],
  },
];

export const projectsPlaceholder: Project[] = [
  {
    title: "Projects failed to load",
    description:
      "We couldn't reach data.kiya.cat to fetch the latest projects.",
    tech: ["Connection issue"],
  },
];
