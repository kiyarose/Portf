import { addIcon } from "@iconify/react";

// Embedded SVG icon data - no external requests needed
const iconData = {
  // Material Symbols - Navigation and Core UI
  "material-symbols:apps-rounded": {
    body: '<path fill="currentColor" d="M7 17q-.825 0-1.413-.588T5 15q0-.825.588-1.413T7 13q.825 0 1.413.588T9 15q0 .825-.588 1.413T7 17Zm5 0q-.825 0-1.413-.588T10 15q0-.825.588-1.413T12 13q.825 0 1.413.588T14 15q0 .825-.588 1.413T12 17Zm5 0q-.825 0-1.413-.588T15 15q0-.825.588-1.413T17 13q.825 0 1.413.588T19 15q0 .825-.588 1.413T17 17ZM7 12q-.825 0-1.413-.588T5 10q0-.825.588-1.413T7 8q.825 0 1.413.588T9 10q0 .825-.588 1.413T7 12Zm5 0q-.825 0-1.413-.588T10 10q0-.825.588-1.413T12 8q.825 0 1.413.588T14 10q0 .825-.588 1.413T12 12Zm5 0q-.825 0-1.413-.588T15 10q0-.825.588-1.413T17 8q.825 0 1.413.588T19 10q0 .825-.588 1.413T17 12ZM7 7q-.825 0-1.413-.588T5 5q0-.825.588-1.413T7 3q.825 0 1.413.588T9 5q0 .825-.588 1.413T7 7Zm5 0q-.825 0-1.413-.588T10 5q0-.825.588-1.413T12 3q.825 0 1.413.588T14 5q0 .825-.588 1.413T12 7Zm5 0q-.825 0-1.413-.588T15 5q0-.825.588-1.413T17 3q.825 0 1.413.588T19 5q0 .825-.588 1.413T17 7Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:home-rounded": {
    body: '<path fill="currentColor" d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10v9Zm-2 2V10q0-.375.188-.713T4.6 8.925l6-4.5q.35-.262.763-.35T12 4.1q.4.025.813.113t.762.35l6 4.5q.225.175.413.513T20.5 10v11q0 .825-.588 1.413T19 23h-4q-.425 0-.713-.288T14 22v-6h-4v6q0 .425-.288.713T9 23H5q-.825 0-1.413-.588T3 21Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:person-rounded": {
    body: '<path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm-8 6v-.8q0-.85.438-1.563T5.6 14.55q1.55-.775 3.15-1.163T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2v.8q0 .825-.588 1.413T18 20H6q-.825 0-1.413-.588T4 18Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:work": {
    body: '<path fill="currentColor" d="M6 22q-.825 0-1.413-.588T4 20V8q0-.825.588-1.413T6 6h2V4q0-.825.588-1.413T10 2h4q.825 0 1.413.588T16 4v2h2q.825 0 1.413.588T20 8v12q0 .825-.588 1.413T18 22H6Zm4-16h4V4h-4v2Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:school-rounded": {
    body: '<path fill="currentColor" d="M12 3L1 9l11 6l9-4.91V17h2V9L12 3Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:workspace-premium-rounded": {
    body: '<path fill="currentColor" d="m9.68 13.69l2.32-1.5l2.32 1.5l-.88-2.63L15.88 9h-2.84L12 6.19L10.96 9H8.12l2.44 2.06l-.88 2.63ZM6 23l2.5-7.25q.4.075.813.163T10 16.05v4.775L12 19.9l2 .925V16.05q.275-.05.688-.138T15.5 15.75L18 23l-6-2.75L6 23Zm6-7q-2.075 0-3.538-1.463T7 11q0-2.075 1.463-3.538T12 6q2.075 0 3.538 1.463T17 11q0 2.075-1.463 3.538T12 16Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:rocket-launch-rounded": {
    body: '<path fill="currentColor" d="m9.2 13.9l1.4-1.4q-.425-.4-.638-.938T9.75 10.5q0-.575.225-1.087T10.6 8.5l4.9-4.9q1.175-1.175 2.75-1.4T21 2.9q.7 0 1.175.475T22.65 4.55q.225 1.725-.012 3.3T21.5 10.6l-4.9 4.9q-.4.4-.912.625T14.6 16.35q-.575 0-1.113-.213T12.55 15.5l-1.4 1.4q-.2.2-.2.5t.2.5l1.4 1.4q.4.4.4 1t-.4 1l-1.15 1.15q-.4.4-1 .4t-1-.4L4 17.25q-.4-.4-.4-1t.4-1l1.15-1.15q.4-.4 1-.4t1 .4l1.4 1.4q.2.2.5.2t.5-.2l1.4-1.4q.2-.2.2-.5t-.2-.5l-1.4-1.4q-.4-.4-.4-1t.4-1Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:auto-awesome-rounded": {
    body: '<path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.613-.3t-.562-.375L4.7 19.375q-.375.125-.75-.025t-.55-.525L2.075 16.35q-.2-.35-.075-.737T2.45 15l2.4-2.05q-.05-.325-.05-.65t.05-.65L2.45 9.6q-.275-.225-.4-.612T2.125 8.25L3.4 5.775q.175-.375.55-.525t.75-.025L7.675 6.5q.275-.2.575-.375t.6-.3l.4-3.2q.075-.375.35-.65T10.25 2h2.5q.4 0 .675.275t.35.65l.4 3.2q.325.125.613.3t.562.375l2.975-1.25q.375-.125.75.025t.55.525L20.925 7.65q.2.35.075.738T20.55 8.9l-2.4 2.05q.05.325.05.65t-.05.65l2.4 2.05q.275.225.4.613t-.075.737L19.6 17.225q-.175.375-.55.525t-.75.025L15.325 16.5q-.275.2-.562.375t-.613.3l-.4 3.2q-.075.375-.35.65T12.75 21h-2.5q-.4 0-.675-.275t-.35-.65ZM11.5 14q1.05 0 1.775-.725T14 11.5q0-1.05-.725-1.775T11.5 9q-1.05 0-1.775.725T9 11.5q0 1.05.725 1.775T11.5 14Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:contact-mail-rounded": {
    body: '<path fill="currentColor" d="M2 20q-.825 0-1.413-.588T0 18V6q0-.825.588-1.413T2 4h20q.825 0 1.413.588T24 6v12q0 .825-.588 1.413T22 20H2Zm0-2h20V6H2v12Zm1-1h18V7H3v10Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:dark-mode-rounded": {
    body: '<path fill="currentColor" d="M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21Z"/>',
    width: 24,
    height: 24
  },
  "material-symbols:light-mode-rounded": {
    body: '<path fill="currentColor" d="M12 17q-2.075 0-3.538-1.463T7 12q0-2.075 1.463-3.538T12 7q2.075 0 3.538 1.463T17 12q0 2.075-1.463 3.538T12 17ZM2 13q-.425 0-.713-.288T1 12q0-.425.288-.713T2 11h2q.425 0 .713.288T5 12q0 .425-.288.713T4 13H2Zm18 0q-.425 0-.713-.288T19 12q0-.425.288-.713T20 11h2q.425 0 .713.288T23 12q0 .425-.288.713T22 13h-2Zm-8-8q-.425 0-.713-.288T11 4V2q0-.425.288-.713T12 1q.425 0 .713.288T13 2v2q0 .425-.288.713T12 5Zm0 18q-.425 0-.713-.288T11 22v-2q0-.425.288-.713T12 19q.425 0 .713.288T13 20v2q0 .425-.288.713T12 23Z"/>',
    width: 24,
    height: 24
  },

  // Social Media Icons - MDI
  "mdi:github": {
    body: '<path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>',
    width: 24,
    height: 24
  },
  "mdi:instagram": {
    body: '<path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"/>',
    width: 24,
    height: 24
  },
  "mdi:linkedin": {
    body: '<path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"/>',
    width: 24,
    height: 24
  },

  // Simple Icons - Bluesky
  "simple-icons:bluesky": {
    body: '<path fill="currentColor" d="M6.537 4.834c1.555-1.302 3.733-2.062 5.463-2.062s3.908.76 5.463 2.062c1.558 1.305 2.537 3.093 2.537 5.166v12c0 .552-.448 1-1 1H5c-.552 0-1-.448-1-1V10c0-2.073.979-3.861 2.537-5.166zM12 14.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
    width: 24,
    height: 24
  }
};

let iconsRegistered = false;

export function initializeIcons() {
  if (iconsRegistered) return;
  iconsRegistered = true;

  // Register all embedded icons
  Object.entries(iconData).forEach(([name, data]) => {
    addIcon(name, data);
  });

  console.log("✓ Essential icons registered successfully");
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
