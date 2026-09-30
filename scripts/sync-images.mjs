// Copies artwork images from content/works/<slug>/images/ to public/media/works/<slug>/
// so they can be served and optimised by next/image. public/media/ is gitignored.
import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const worksDir = path.join(root, "content", "works");
const outDir = path.join(root, "public", "media", "works");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

let count = 0;
for (const slug of await readdir(worksDir)) {
  const imagesDir = path.join(worksDir, slug, "images");
  try {
    if (!(await stat(imagesDir)).isDirectory()) continue;
  } catch {
    continue;
  }
  await cp(imagesDir, path.join(outDir, slug), { recursive: true });
  count += (await readdir(imagesDir)).length;
}

console.log(`sync-images: copied ${count} image(s) to public/media/works`);
