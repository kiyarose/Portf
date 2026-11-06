import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.DATA_SYNC_BASE_URL ?? "https://data.kiya.cat/data";
const OUTPUT_DIR = process.env.DATA_SYNC_OUTPUT_DIR ?? "public/data";
const RESOURCES = [
  "Certifications",
  "Education",
  "Experience",
  "Projects",
  "Skills",
  "Socials",
];

async function fetchAndNormalize(resource) {
  const response = await fetch(`${BASE_URL}/${resource}.json`, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource}.json: ${response.status}`);
  }

  const raw = await response.text();
  const parsed = parseJsonPayload(raw);
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

function parseJsonPayload(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    const extracted = extractJsonFromRtf(raw);
    if (!extracted) {
      throw error;
    }
    return JSON.parse(extracted);
  }
}

function extractJsonFromRtf(raw) {
  if (!raw.trimStart().startsWith("{\\rtf")) {
    return null;
  }

  const marker = "\\f0\\fs24 \\cf0 ";
  const markerIndex = raw.indexOf(marker);
  const body = markerIndex >= 0 ? raw.slice(markerIndex + marker.length) : raw;
  let result = "";
  const cp1252Map = {
    0x80: "€",
    0x82: "‚",
    0x83: "ƒ",
    0x84: "„",
    0x85: "…",
    0x86: "†",
    0x87: "‡",
    0x88: "ˆ",
    0x89: "‰",
    0x8a: "Š",
    0x8b: "‹",
    0x8c: "Œ",
    0x8e: "Ž",
    0x91: "‘",
    0x92: "’",
    0x93: "“",
    0x94: "”",
    0x95: "•",
    0x96: "–",
    0x97: "—",
    0x98: "˜",
    0x99: "™",
    0x9a: "š",
    0x9b: "›",
    0x9c: "œ",
    0x9e: "ž",
    0x9f: "Ÿ",
  };

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (char === "\\") {
      const next = body[index + 1];

      if (next === "{" || next === "}" || next === "\\") {
        result += next;
        index += 1;
        continue;
      }

      if (next === "'") {
        const hex = body.slice(index + 2, index + 4);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          const code = Number.parseInt(hex, 16);
          result += cp1252Map[code] ?? String.fromCharCode(code);
          index += 3;
          continue;
        }
      }

      if (/^[a-zA-Z]$/.test(next ?? "")) {
        let cursor = index + 1;
        while (
          cursor < body.length &&
          /[a-zA-Z0-9-]/.test(body[cursor] ?? "")
        ) {
          cursor += 1;
        }
        if (body[cursor] === " ") {
          cursor += 1;
        }
        index = cursor - 1;
        continue;
      }
    }

    if (char === "{" || char === "}") {
      continue;
    }

    result += char;
  }

  const start = result.indexOf("{");
  const end = result.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return result.slice(start, end + 1);
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let changedCount = 0;

  for (const resource of RESOURCES) {
    const normalized = await fetchAndNormalize(resource);
    const targetFile = path.join(OUTPUT_DIR, `${resource}.json.bak`);
    const previous = existsSync(targetFile)
      ? readFileSync(targetFile, "utf8")
      : null;

    if (previous === normalized) {
      console.log(`Unchanged: ${targetFile}`);
      continue;
    }

    writeFileSync(targetFile, normalized, "utf8");
    changedCount += 1;
    console.log(`Updated: ${targetFile}`);
  }

  console.log(`Sync complete. Changed files: ${changedCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
