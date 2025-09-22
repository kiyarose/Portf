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
