// src/server/server.ts
import { createServer } from "http";
import { promises as fs } from "fs";
import { join, normalize, extname, dirname } from "path";
import { pathToFileURL } from "url";
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};
function startServer({ root, port = 3e3, host = "localhost", environment = "production" }) {
  if (!root) throw new Error("Root directory must be specified.");
  const server = createServer(async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad Request");
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(root, url.pathname, req, res);
      } else {
        await handleStaticRequest(root, url.pathname, res);
      }
      if (environment == "development") {
        console.log(req.method, "::", req.url, "-", res.statusCode);
      }
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
    }
  });
  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
  return server;
}
async function handleStaticRequest(root, pathname, res) {
  let filePath = normalize(join(root, decodeURIComponent(pathname)));
  root = normalize(root);
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch (e) {
  }
  try {
    const data = await fs.readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (err) {
    await respondWithErrorPage(root, pathname, 404, res);
  }
}
async function handleApiRequest(root, pathname, req, res) {
  const routePath = join(root, pathname, "route.js");
  try {
    await fs.access(routePath);
  } catch {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  try {
    const moduleUrl = pathToFileURL(routePath).href;
    const routeModule = await import(moduleUrl);
    if (typeof routeModule.route !== "function") {
      throw new Error('API route module must export a "route" function.');
    }
    await routeModule.route(req, res);
  } catch (err) {
    await respondWithErrorPage(root, pathname, 404, res);
  }
}
async function respondWithErrorPage(root, pathname, code, res) {
  let currentPath = normalize(join(root, decodeURIComponent(pathname)));
  let tried = /* @__PURE__ */ new Set();
  let errorFilePath = null;
  while (currentPath.startsWith(root)) {
    const candidate = join(currentPath, `${code}.html`);
    if (!tried.has(candidate)) {
      try {
        await fs.access(candidate);
        errorFilePath = candidate;
        break;
      } catch {
      }
      tried.add(candidate);
    }
    const parent = dirname(currentPath);
    if (parent === currentPath) break;
    currentPath = parent;
  }
  if (!errorFilePath) {
    const fallback = join(root, `${code}.html`);
    try {
      await fs.access(fallback);
      errorFilePath = fallback;
    } catch {
    }
  }
  if (errorFilePath) {
    try {
      const html = await fs.readFile(errorFilePath);
      res.writeHead(code, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    } catch {
    }
  }
  res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(`${code} Error`);
}
export {
  startServer
};
