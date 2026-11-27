#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  loadUpstreamSyncManifest,
  matchesKeepOurs,
  repoRoot,
} from "./upstream-sync-lib.mjs";

function git (...args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
}

function unmergedPaths () {
  const out = git("diff", "--name-only", "--diff-filter=U");
  return out ? out.split("\n").filter(Boolean) : [];
}

function verifyMustContain (verifyAfterMerge) {
  if (!verifyAfterMerge?.mustContain) return;
  for (const [relPath, needles] of Object.entries(verifyAfterMerge.mustContain)) {
    const abs = path.join(repoRoot, relPath);
    if (!existsSync(abs)) {
      console.warn(`verify: missing file ${relPath}`);
      continue;
    }
    const content = readFileSync(abs, "utf8");
    for (const needle of needles) {
      if (!content.includes(needle)) {
        throw new Error(
          `${relPath} must contain "${needle}" (kiyarose bespoke check)`,
        );
      }
    }
    console.log(`verify: ${relPath} contains required markers`);
  }
}

function main () {
  const manifest = loadUpstreamSyncManifest();
  const keepOurs = manifest.keepOurs ?? [];
  const conflicted = unmergedPaths();

  if (conflicted.length === 0) {
    console.log("No unmerged paths.");
    verifyMustContain(manifest.verifyAfterMerge);
    return;
  }

  let resolved = 0;
  for (const filePath of conflicted) {
    if (matchesKeepOurs(filePath, keepOurs)) {
      git("checkout", "--ours", "--", filePath);
      git("add", "--", filePath);
      console.log(`keep ours: ${filePath}`);
      resolved += 1;
    } else {
      console.log(`manual: ${filePath}`);
    }
  }

  const remaining = unmergedPaths();
  console.log(
    `\nResolved ${resolved} path(s) with keepOurs; ${remaining.length} still unmerged.`,
  );

  if (remaining.length === 0) {
    verifyMustContain(manifest.verifyAfterMerge);
  } else {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message ?? error);
  process.exit(1);
}