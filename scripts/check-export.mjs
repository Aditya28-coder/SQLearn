import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join, dirname, extname, relative } from "node:path";
const root = resolve("out");
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(join(dir, entry.name))
          : [join(dir, entry.name)],
      ),
    )
  ).flat();
}
const html = (await files(root)).filter((file) => file.endsWith(".html"));
const pages = new Map(
  await Promise.all(
    html.map(async (file) => [file, await readFile(file, "utf8")]),
  ),
);
const missing = [];
let checked = 0;
for (const [file, source] of pages) {
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll("&amp;", "&");
    if (/^(?:[a-z]+:|\/\/)/i.test(raw)) continue;
    const [beforeHash, anchor] = raw.split("#"),
      path = decodeURIComponent(beforeHash.split("?")[0]);
    let target = path
      ? resolve(
          path.startsWith("/") ? root : dirname(file),
          `.${path.startsWith("/") ? path : `/${path}`}`,
        )
      : file;
    if (!target.startsWith(root)) continue;
    if (!extname(target)) target = join(target, "index.html");
    try {
      if (!(await stat(target)).isFile()) throw new Error("not a file");
    } catch {
      missing.push(`${relative(root, file)} → ${raw}`);
      continue;
    }
    checked++;
    if (anchor && target.endsWith(".html")) {
      const body = pages.get(target) ?? (await readFile(target, "utf8"));
      const decoded = decodeURIComponent(anchor);
      if (!body.includes(`id="${decoded}"`))
        missing.push(
          `${relative(root, file)} → missing #${decoded} in ${relative(root, target)}`,
        );
    }
  }
}
if (missing.length) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Static export verified: ${html.length} HTML files, ${checked} local links/anchors/assets, no missing targets.`,
  );
