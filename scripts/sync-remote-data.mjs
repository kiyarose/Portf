import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const RESOURCES = [
  "Socials",
  "Experience",
  "Education",
  "Certifications",
  "Projects",
  "Skills",
];

const OUTPUT_DIR = resolve(process.cwd(), "public", "__remote-data");

function normalizeRemoteBase(rawUrl) {
  const normalized = (rawUrl ?? "").trim().replace(/\/$/, "");
  return normalized.length > 0 ? normalized : null;
}

async function main() {
  const remoteBaseUrl = normalizeRemoteBase(process.env.VITE_REMOTE_DATA_URL);

  if (!remoteBaseUrl) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    console.log(
      "[sync-remote-data] VITE_REMOTE_DATA_URL not set; removed cached remote snapshots and using local fallback data.",
    );
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(
    `[sync-remote-data] Syncing resources from ${remoteBaseUrl} to ${OUTPUT_DIR}`,
  );

  for (const resource of RESOURCES) {
    const sourceUrl = `${remoteBaseUrl}/${resource}.json`;
    const response = await fetch(sourceUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `[sync-remote-data] Failed to fetch ${resource}.json from ${sourceUrl} (status ${response.status})`,
      );
    }

    const payload = await response.text();
    await writeFile(resolve(OUTPUT_DIR, `${resource}.json`), payload, "utf8");
    console.log(`[sync-remote-data] Synced ${resource}.json`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
