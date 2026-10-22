import { createRequire } from "node:module";
import { cp, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("@electric-sql/pglite"));
await mkdir("public/pglite", { recursive: true });
await cp(source, "public/pglite", { recursive: true });
console.log("PGlite assets ready for static hosting.");
