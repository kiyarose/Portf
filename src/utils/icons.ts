import { addIcon } from "@iconify/react";

let iconsRegistered = false;

const materialIconNames = [
  "material-symbols:apps-rounded",
  "material-symbols:auto-awesome-rounded",
  "material-symbols:contact-mail-rounded",
  "material-symbols:home-rounded",
  "material-symbols:person-rounded",
  "material-symbols:rocket-launch-rounded",
  "material-symbols:school-rounded",
  "material-symbols:work",
  "material-symbols:workspace-premium-rounded",
  "material-symbols:close-rounded",
  "material-symbols:menu-rounded",
  "material-symbols:arrow-upward-rounded",
  "material-symbols:dark-mode-rounded",
  "material-symbols:light-mode-rounded",
  "material-symbols:content-copy-rounded",
  "material-symbols:error-rounded",
  "material-symbols:biotech",
  "material-symbols:campaign",
  "material-symbols:computer",
  "material-symbols:domain",
  "material-symbols:groups",
  "material-symbols:inventory",
  "material-symbols:medical-information",
  "material-symbols:medical-services",
  "material-symbols:monitor-heart",
  "material-symbols:point-of-sale",
  "material-symbols:psychology",
  "material-symbols:support",
];

const mdiIconNames = [
  "mdi:account-group",
  "mdi:account-tie",
  "mdi:account-voice",
  "mdi:archive-arrow-down",
  "mdi:clipboard-check",
  "mdi:clipboard-text",
  "mdi:fire",
  "mdi:github",
  "mdi:hand-back-right",
  "mdi:handshake",
  "mdi:heart",
  "mdi:instagram",
  "mdi:lan",
  "mdi:linkedin",
  "mdi:microsoft-windows",
  "mdi:moon-waning-crescent",
  "mdi:package-variant-closed",
  "mdi:server",
  "mdi:star-four-points",
  "mdi:store",
  "mdi:swap-horizontal",
  "mdi:tray-arrow-up",
  "mdi:truck-delivery-outline",
  "mdi:warehouse",
];

const simpleIconNames = [
  "simple-icons:amazon",
  "simple-icons:bluesky",
  "simple-icons:cisco",
  "simple-icons:google",
  "simple-icons:hewlettpackardenterprise",
  "simple-icons:javascript",
  "simple-icons:linux",
  "simple-icons:microsoftexcel",
  "simple-icons:openvpn",
  "simple-icons:protonvpn",
  "simple-icons:vmware",
  "simple-icons:walmart",
];

const materialIcon = {
  body: '<path fill="currentColor" d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Zm0 16a7 7 0 1 1 0-14a7 7 0 0 1 0 14Z"/>',
  width: 24,
  height: 24,
};

const mdiIcon = {
  body: '<path fill="currentColor" d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h12V6H6Z"/>',
  width: 24,
  height: 24,
};

const simpleIcon = {
  body: '<path fill="currentColor" d="M12 2L3 22h18L12 2Zm0 4.8L17.1 20H6.9L12 6.8Z"/>',
  width: 24,
  height: 24,
};

export function initializeIcons() {
  if (iconsRegistered) return;
  iconsRegistered = true;

  materialIconNames.forEach((name) => addIcon(name, materialIcon));
  mdiIconNames.forEach((name) => addIcon(name, mdiIcon));
  simpleIconNames.forEach((name) => addIcon(name, simpleIcon));
}
// Skill icon mapping
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
  HPE: "simple-icons:hewlettpackardenterprise",
  VMWare: "simple-icons:vmware",
  ILO: "mdi:server",
  Hope: "mdi:star-four-points",
  Dreams: "mdi:moon-waning-crescent",
  Passion: "mdi:fire",
  Love: "mdi:heart",
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
  HPE: "simple-icons:hewlettpackardenterprise",
  VMWare: "simple-icons:vmware",
  ILO: "mdi:server",
};
