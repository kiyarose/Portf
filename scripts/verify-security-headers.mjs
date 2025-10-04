/**
 * Security Headers Synchronization Verification Script
 *
 * This script verifies that security headers are synchronized across:
 * - public/_headers (Cloudflare Pages)
 * - firebase.json (Firebase Hosting)
 * - vite.config.ts (imports from security-headers.config.ts)
 *
 * Run with: node scripts/verify-security-headers.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("🔐 Security Headers Parity Verification");
console.log("═".repeat(80));
console.log();

// Check if vite.config.ts imports from master config
console.log("🔍 Checking vite.config.ts...");
const viteConfigPath = resolve(rootDir, "vite.config.ts");
const viteConfigContent = readFileSync(viteConfigPath, "utf-8");

const importsSecurityHeaders =
  viteConfigContent.includes("import { SECURITY_HEADERS }") &&
  viteConfigContent.includes('from "./security-headers.config"');
const usesSecurityHeaders = viteConfigContent.includes(
  "Object.entries(SECURITY_HEADERS)",
);

if (importsSecurityHeaders && usesSecurityHeaders) {
  console.log("  ✅ Imports and uses SECURITY_HEADERS from master config");
} else {
  console.error(
    "  ❌ Does not properly import/use SECURITY_HEADERS from master config",
  );
  console.log(
    '     Expected: import { SECURITY_HEADERS } from "./security-headers.config"',
  );
  console.log("     Expected: Object.entries(SECURITY_HEADERS)");
  throw new Error(
    "vite.config.ts does not properly import/use SECURITY_HEADERS",
  );
}
console.log();

// Check that security-headers.config.ts exists
console.log("🔍 Checking security-headers.config.ts...");
const configPath = resolve(rootDir, "security-headers.config.ts");
try {
  const configContent = readFileSync(configPath, "utf-8");
  if (configContent.includes("export const SECURITY_HEADERS")) {
    console.log("  ✅ Master security headers config exists");
  } else {
    console.error("  ❌ Master config does not export SECURITY_HEADERS");
    throw new Error(
      "security-headers.config.ts does not export SECURITY_HEADERS",
    );
  }
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("  ❌ security-headers.config.ts not found");
    throw new Error("security-headers.config.ts not found");
  }
  throw error;
}
console.log();

// Verify public/_headers and firebase.json have the required headers
console.log("🔍 Checking public/_headers...");
const headersFilePath = resolve(rootDir, "public/_headers");
const headersFileContent = readFileSync(headersFilePath, "utf-8");

const requiredHeaders = [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Content-Security-Policy",
  "Cross-Origin-Embedder-Policy",
];

let headersValid = true;
for (const header of requiredHeaders) {
  if (!headersFileContent.includes(header)) {
    console.error(`  ❌ Missing header: ${header}`);
    headersValid = false;
  }
}
if (headersValid) {
  console.log("  ✅ All required security headers present");
}
console.log();

console.log("🔍 Checking firebase.json...");
const firebaseJsonPath = resolve(rootDir, "firebase.json");
const firebaseJsonContent = readFileSync(firebaseJsonPath, "utf-8");

let firebaseValid = true;
for (const header of requiredHeaders) {
  if (!firebaseJsonContent.includes(header)) {
    console.error(`  ❌ Missing header: ${header}`);
    firebaseValid = false;
  }
}
if (firebaseValid) {
  console.log("  ✅ All required security headers present");
}
console.log();

// Final result
console.log("═".repeat(80));
if (
  importsSecurityHeaders &&
  usesSecurityHeaders &&
  headersValid &&
  firebaseValid
) {
  console.log("✅ SUCCESS: Security headers configuration is valid!");
  console.log();
  console.log("📝 Note: vite.config.ts imports from the master config file.");
  console.log("   To update headers, modify security-headers.config.ts");
  console.log("   and ensure public/_headers and firebase.json stay in sync.");
  console.log("═".repeat(80));
  // Script completed successfully
} else {
  console.log("❌ FAILURE: Security headers configuration has issues!");
  console.log("═".repeat(80));
  console.log();
  console.log("Please ensure:");
  console.log(
    "  1. security-headers.config.ts exists and exports SECURITY_HEADERS",
  );
  console.log("  2. vite.config.ts imports and uses SECURITY_HEADERS");
  console.log("  3. public/_headers contains all required headers");
  console.log("  4. firebase.json contains all required headers");
  throw new Error("Security headers configuration validation failed");
}
