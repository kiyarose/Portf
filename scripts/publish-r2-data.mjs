import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DATA_FILES = [
  { source: "src/data/certifications.ts", output: "Certifications.json" },
  { source: "src/data/education.ts", output: "Education.json" },
  { source: "src/data/experience.ts", output: "Experience.json" },
  { source: "src/data/projects.ts", output: "Projects.json" },
  { source: "src/data/skills.ts", output: "Skills.json" },
  { source: "src/data/socials.ts", output: "Socials.json" },
];

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function ensureWranglerOAuthSession() {
  const result = spawnSync("npx", ["wrangler", "whoami"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(
      "Wrangler is not logged in. Run `npx wrangler login` to authenticate with Cloudflare OAuth, then retry `npm run data:publish`.",
    );
  }
}

function main() {
  const bucket =
    getArgValue("--bucket") ??
    process.env.R2_BUCKET ??
    process.env.BUCKET ??
    "pourdata";
  const keepTemp = hasFlag("--keep-temp");
  const dryRun = hasFlag("--dry-run");

  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "kiya-data-publish-"));
  const convertedPaths = [];

  try {
    for (const file of DATA_FILES) {
      const targetPath = path.join(tempRoot, file.output);
      convertedPaths.push(targetPath);

      run("node", [
        "src/tools/data-converter.mjs",
        "to-json",
        "--overwrite",
        file.source,
        "--out",
        targetPath,
      ]);
    }

    if (dryRun) {
      console.log("Dry run complete. Converted files:");
      for (const converted of convertedPaths) {
        console.log(`- ${converted}`);
      }
      return;
    }

    ensureWranglerOAuthSession();

    for (const file of DATA_FILES) {
      const targetPath = path.join(tempRoot, file.output);
      const objectPath = `${bucket}/data/${file.output}`;
      run("npx", [
        "wrangler",
        "r2",
        "object",
        "put",
        objectPath,
        "--file",
        targetPath,
        "--remote",
      ]);
    }

    console.log("Publish complete.");
  } finally {
    if (!keepTemp) {
      rmSync(tempRoot, { recursive: true, force: true });
    } else {
      console.log(`Kept temporary output at ${tempRoot}`);
    }
  }
}

main();
