import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405);
      response.end();
      return;
    }
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let filename = resolve(root, `.${pathname}`);
    if (!filename.startsWith(root + sep) && filename !== root) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    if ((await stat(filename)).isDirectory())
      filename = resolve(filename, "index.html");
    const content = await readFile(filename);
    response.writeHead(200, {
      "Content-Type": types[extname(filename)] || "application/octet-stream",
      "Content-Length": content.length,
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    try {
      response.end(await readFile(resolve(root, "404.html")));
    } catch {
      response.end("Not found. Run npm run build first.");
    }
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`SQLearn static preview: http://localhost:${port}`),
);
