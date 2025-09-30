import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "tools");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(distDir, "tools");

const copiedSummary = { pages: 0, assets: 0 };

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyHtmlFile(srcPath, parentSegments, filename) {
  const isIndex = filename.toLowerCase() === "index.html";
  const targetSegments = isIndex
    ? parentSegments
    : [...parentSegments, filename.slice(0, -5)];
  const destinationDir = path.join(outputDir, ...targetSegments);
  await ensureDir(destinationDir);
  const destinationPath = path.join(destinationDir, "index.html");
  await fs.copyFile(srcPath, destinationPath);
  copiedSummary.pages += 1;
}

async function copyAsset(srcPath, parentSegments, filename) {
  const destinationDir = path.join(outputDir, ...parentSegments);
  await ensureDir(destinationDir);
  const destinationPath = path.join(destinationDir, filename);
  await fs.copyFile(srcPath, destinationPath);
  copiedSummary.assets += 1;
}

async function processEntry(entryPath, relativeSegments) {
  const stats = await fs.stat(entryPath);

  if (stats.isDirectory()) {
    const children = await fs.readdir(entryPath);
    for (const child of children) {
      await processEntry(path.join(entryPath, child), [...relativeSegments, child]);
    }
    return;
  }

  if (!stats.isFile()) {
    return;
  }

  const filename = relativeSegments[relativeSegments.length - 1];
  const parentSegments = relativeSegments.slice(0, -1);
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".mjs")) {
    return;
  }

  if (lowerName.endsWith(".html")) {
    await copyHtmlFile(entryPath, parentSegments, filename);
    return;
  }

  await copyAsset(entryPath, parentSegments, filename);
}

async function main() {
  try {
    await fs.access(sourceDir);
  } catch (error) {
    throw new Error(`tools directory not found at ${sourceDir}`);
  }

  await ensureDir(distDir);
  await fs.rm(outputDir, { recursive: true, force: true });
  await ensureDir(outputDir);

  const entries = await fs.readdir(sourceDir);
  for (const entry of entries) {
    await processEntry(path.join(sourceDir, entry), [entry]);
  }

  const summaryParts = [];
  if (copiedSummary.pages > 0) {
    summaryParts.push(`${copiedSummary.pages} HTML page${copiedSummary.pages === 1 ? "" : "s"}`);
  }
  if (copiedSummary.assets > 0) {
    summaryParts.push(`${copiedSummary.assets} asset${copiedSummary.assets === 1 ? "" : "s"}`);
  }
  const summary = summaryParts.length > 0 ? summaryParts.join(", ") : "no files";
  console.log(`Copied ${summary} into ${path.relative(rootDir, outputDir) || "."}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
