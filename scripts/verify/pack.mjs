import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tempRoot = path.join(rootDir, ".tmp", "verify-pack");
const consumerDir = path.join(tempRoot, "consumer");
const packageVersion = JSON.parse(
  await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
).version;

async function main() {
  await fs.rm(tempRoot, { force: true, recursive: true });
  await fs.mkdir(consumerDir, { recursive: true });

  const tarball = packPackage();
  const entries = listTarEntries(tarball);

  assertPackedFiles(entries);
  await runConsumerSmokeTest(tarball);

  console.log("Pack verification succeeded.");
}

function packPackage() {
  execFileSync("bun", ["pm", "pack", "--destination", tempRoot], {
      cwd: rootDir,
      stdio: "inherit",
  });
  const created = execFileSync("ls", [tempRoot], { encoding: "utf8" })
  .split("\n")
  .find((name) => name.endsWith(".tgz"));
  if (!created) throw new Error("pack produced no tarball");
  return path.join(tempRoot, created);
}

function listTarEntries(tarball) {
  return execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
  .split("\n")
  .map((line) => line.replace(/^package\//u, "").trim())
  .filter(Boolean);
}

function assertPackedFiles(entries) {
  const required = [
    "package.json",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "dist/index.js",
    "dist/index.d.ts",
  ];
  for (const file of required) {
    if (!entries.includes(file)) throw new Error(`packed tarball is missing ${file}`);
  }
  const leaked = entries.filter((entry) => entry.startsWith("src/") || entry.startsWith("scripts/"));
  if (leaked.length) throw new Error(`packed tarball leaks source files: ${leaked.join(", ")}`);
}

async function runConsumerSmokeTest(tarball) {
  await fs.writeFile(
    path.join(consumerDir, "package.json"),
    `${JSON.stringify({ name: "seo-consumer", private: true, type: "module", version: "0.0.0" }, null, 2)}\n`,
  );

  execFileSync("bun", ["add", tarball], { cwd: consumerDir, stdio: "inherit" });

  await fs.writeFile(
    path.join(consumerDir, "smoke.mjs"),
    [
      'import { buildRouteSeo, buildSitemap, defineConfig } from "@trebired/seo";',
      "const config = defineConfig({",
      `  forVersion: "${packageVersion}",`,
      '  site: { defaultLocale: "en", name: "Consumer", url: "https://consumer.test" },',
      "});",
      'const seo = buildRouteSeo(config, { path: "/", title: "Home" });',
      'if (seo.canonical !== "https://consumer.test/") throw new Error("bad canonical");',
      'if (!buildSitemap(config, [{ path: "/" }]).includes("<urlset")) throw new Error("bad sitemap");',
      'console.log("consumer smoke test succeeded.");',
    ].join("\n"),
  );

  execFileSync("bun", ["smoke.mjs"], { cwd: consumerDir, stdio: "inherit" });
}

await main();
