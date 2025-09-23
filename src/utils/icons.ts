// Icons are lazy-loaded from Iconify CDN by default; keep hook for future use
// Skill icon mapping
export function initializeIcons() {
  // Iconify loads icons on demand in the browser; nothing to preload yet.
  if (typeof window === "undefined") return;
}
export const skillIcons: Record<string, string> = {
  "Information Technology Skills": "material-symbols:computer",
  "Customer Service": "material-symbols:support",
  "Gaining Med Admin skills": "material-symbols:admin-meds",
  "Technical Leadership": "material-symbols:psychology",
  "Team Leadership": "material-symbols:group",
  Administration: "material-symbols:business-center",
  Research: "material-symbols:biotech",
  Advocacy: "material-symbols:campaign",
  Sales: "material-symbols:sell",
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
  "Medical Coding": "material-symbols:medical-information-rounded",
  "Health Informatics": "material-symbols:monitoring-rounded",
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
};
