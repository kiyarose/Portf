import { addCollection } from "@iconify/react";

// Import icon sets
import materialSymbols from "@iconify/json/json/material-symbols.json";
import mdi from "@iconify/json/json/mdi.json";
import simpleIcons from "@iconify/json/json/simple-icons.json";

export function initializeIcons() {
  // Add icon collections
  addCollection(materialSymbols);
  addCollection(mdi);
  addCollection(simpleIcons);
}

// Skill icon mapping
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
};
