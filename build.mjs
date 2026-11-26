import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(projectRoot, "dist");
const publicDirectories = [
  "api",
  "audio",
  "css",
  "dict",
  "diccionarios",
  "fonts",
  "image",
  "js",
  "KANA",
  "manga",
];
const publicExtensions = new Set([".css", ".html", ".ico", ".js"]);
const ignoredAssetNames = new Set([".ds_store", "desktop.ini", "thumbs.db"]);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const entry of await readdir(projectRoot, { withFileTypes: true })) {
  if (entry.isFile() && publicExtensions.has(path.extname(entry.name).toLowerCase())) {
    await cp(path.join(projectRoot, entry.name), path.join(outputDirectory, entry.name));
  }
}

for (const directory of publicDirectories) {
  await cp(path.join(projectRoot, directory), path.join(outputDirectory, directory), {
    recursive: true,
    filter: (source) => !ignoredAssetNames.has(path.basename(source).toLowerCase()),
  });
}