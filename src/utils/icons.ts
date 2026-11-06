import { addIcon } from "@iconify/react/offline";
import { iconBundle } from "../data/icon-bundle.generated";

let iconsRegistered = false;

/** Register bundled Iconify data for offline SSR + client rendering. */
export function initializeIcons() {
  if (iconsRegistered) return;
  iconsRegistered = true;

  for (const [name, data] of Object.entries(iconBundle)) {
    addIcon(name, data);
  }
}

initializeIcons();

// Skill icon mapping (labels used in SkillsSection pills)
export const skillIcons: Record<string, string> = {
  "Information Technology Skills": "material-symbols:computer",
  "Customer Service": "material-symbols:support",
  "Gaining Med Admin skills": "material-symbols:medical-services",
  "Technical Leadership": "material-symbols:psychology",
  "Team Leadership": "material-symbols:groups",
  Administration: "material-symbols:domain",
  Research: "material-symbols:biotech",
  Advocacy: "material-symbols:campaign",
  Sales: "material-symbols:point-of-sale",
  Logistics: "material-symbols:inventory",
  Leadership: "mdi:account-tie",
  Retail: "mdi:store",
  "Order Picking": "mdi:clipboard-check",
  "Product Substitutions": "mdi:swap-horizontal",
  "Order Staging": "mdi:warehouse",
  "Order Dispensing": "mdi:tray-arrow-up",
  Picking: "mdi:hand-back-right",
  Packing: "mdi:package-variant-closed",
  Stowing: "mdi:archive-arrow-down",
  Unloading: "mdi:truck-delivery-outline",
  "Voter Registration": "mdi:clipboard-text",
  Canvassing: "mdi:account-voice",
  "Community Engagement": "mdi:account-group",
  Networking: "mdi:lan",
  Windows: "mdi:microsoft-windows",
  "Windows Server": "mdi:microsoft-windows",
  Cisco: "simple-icons:cisco",
  Linux: "simple-icons:linux",
  "Medical Coding": "material-symbols:medical-information",
  "Health Informatics": "material-symbols:monitor-heart",
  Excel: "simple-icons:microsoftexcel",
  ProtonVPN: "simple-icons:protonvpn",
  OpenVPN: "simple-icons:openvpn",
  JavaScript: "simple-icons:javascript",
  HPE: "mdi:server",
  VMWare: "simple-icons:vmware",
  ILO: "mdi:server",
  Hope: "mdi:star-four-points",
  Dreams: "mdi:moon-waning-crescent",
  Passion: "mdi:fire",
  Love: "mdi:heart",
  "Data Labeling": "material-symbols:dataset-rounded",
  EVS: "material-symbols:cleaning-services-rounded",
  "Non-Profit": "material-symbols:volunteer-activism-rounded",
  "Project Leadership": "material-symbols:assignment-ind-rounded",
  Accounting: "material-symbols:account-balance-rounded",
  Bookkeeping: "material-symbols:receipt-long-rounded",
};

export const companyIcons: Record<string, string> = {
  "YRAB/CAYAH Research Board": "mdi:account-group",
  Walmart: "simple-icons:walmart",
  Amazon: "simple-icons:amazon",
  "Shawmut Services LLC (Contract)": "mdi:handshake",
  "Google (Contract)": "simple-icons:google",
};

export const projectIcons: Record<string, string> = {
  ProtonVPN: "simple-icons:protonvpn",
  OpenVPN: "simple-icons:openvpn",
  JavaScript: "simple-icons:javascript",
  HPE: "mdi:server",
  VMWare: "simple-icons:vmware",
  ILO: "mdi:server",
};
