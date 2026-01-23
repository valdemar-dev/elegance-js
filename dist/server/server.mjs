import { join, normalize, relative, resolve } from "path";
import { compilePage, compilerOptions } from "../compilation/compiler";
import { createServer } from "http";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import * as zlib from "zlib";
import { promisify } from "util";
const gzipAsync = promisify(zlib.gzip);
function removePrefix(str, prefix) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}
let serverOptions;
const allAPIRoutes = /* @__PURE__ */ new Map();
async function gatherAPIRoutes() {
  await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
    if (file.name !== "route.ts") return;
    const pathname = sanitizePathname(relative(compilerOptions.pagesDirectory, file.parentPath));
    const fullPath = join(file.parentPath, file.name);
    const { POST, GET, PUT, DELETE, OPTIONS } = await import("file://" + fullPath);
    const methods = { POST, GET, PUT, DELETE, OPTIONS };
    for (const [name, method] of Object.entries(methods)) {
      if (method && typeof method !== "function") {
        throw new Error(`In file: "${fullPath}":
The export ${method} is not of type "function". Got: ${typeof method}`);
      }
    }
    const apiRouteInformation = {
      exports: {
        methods
      },
      modulePath: fullPath,
      pathname
    };
    allAPIRoutes.set(pathname, apiRouteInformation);
  });
}
async function handleAPIRequest(req, res, pathname) {
  const route = allAPIRoutes.get(pathname);
  if (!route) {
    res.statusCode = 404;
    await sendResponse(req, res, "Route does not exist.");
    return;
  }
  if (!req.method) {
    res.statusCode = 400;
    await sendResponse(req, res, "Bad request");
    return;
  }
  const method = route.exports.methods[req.method];
  if (!method) {
    res.statusCode = 405;
    await sendResponse(req, res, "Method not allowed");
    return;
  }
  method(req, res);
}
async function walkDirectory(fullPath, callback) {
  const stack = [];
  stack.push(...readdirSync(fullPath, { withFileTypes: true }));
  while (true) {
    const entry = stack.pop();
    if (!entry) break;
    if (entry.isDirectory()) {
      const fullPath2 = join(entry.parentPath, entry.name);
      stack.push(...readdirSync(fullPath2, { withFileTypes: true }));
      continue;
    }
    if (!entry.isFile()) continue;
    await callback(entry);
  }
}
function sanitizePathname(pathname = "") {
  if (!pathname) return "/";
  pathname = "/" + pathname;
  pathname = pathname.replace(/\/+/g, "/");
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}
function getStatusCodePage(statusCode, pathname) {
  const pages = serverOptions.allStatusCodePages;
  let currentPath = pathname;
  if (!currentPath.startsWith("/")) {
    currentPath = "/" + currentPath;
  }
  while (true) {
    let candidate;
    if (currentPath === "/") {
      candidate = `/${statusCode}`;
    } else {
      candidate = `${currentPath.replace(/\/$/, "")}/${statusCode}`;
    }
    const pageInfo = pages.get(candidate);
    if (pageInfo) {
      pageInfo.pathname = pathname;
      return pageInfo;
    }
    if (currentPath === "/") {
      break;
    }
    const lastSlash = currentPath.lastIndexOf("/");
    if (lastSlash <= 0) {
      currentPath = "/";
    } else {
      currentPath = currentPath.slice(0, lastSlash);
    }
  }
}
async function respondWithStatusCodePage(req, res, pathname, statusCode, message) {
  const statusCodePage = getStatusCodePage(statusCode, pathname);
  if (!statusCodePage) {
    res.statusCode = statusCode;
    await sendResponse(req, res, message);
    return;
  }
  const compiledPage = await compilePage(serverOptions.allLayouts, statusCodePage);
  res.statusCode = 200;
  await sendResponse(req, res, compiledPage.pageHTML, "text/html");
}
async function respondWithStatusCode(req, res, pathname, statusCode, message) {
  if (serverOptions.allowStatusCodePages === true) {
    return respondWithStatusCodePage(req, res, pathname, statusCode, message);
  }
  res.statusCode = statusCode;
  await sendResponse(req, res, message);
}
async function getSafePath(userInputPath) {
  const rootDirectory = resolve(join(compilerOptions.outputDirectory, "DIST"));
  const decodedPath = decodeURIComponent(userInputPath);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const finalPath = join(rootDirectory, normalizedPath);
  const resolvedFinalPath = resolve(finalPath);
  if (!resolvedFinalPath.startsWith(rootDirectory) || existsSync(resolvedFinalPath) === false) {
    return null;
  }
  return resolvedFinalPath;
}
async function handlePageRequest(req, res, pathname) {
  const pageInformation = serverOptions.allPages.get(pathname);
  if (pageInformation.exports.isDynamic) {
    if (serverOptions.allowDynamic === false) {
      return respondWithStatusCode(req, res, pathname, 404, "Page not found.");
    }
    const result = await compilePage(serverOptions.allLayouts, pageInformation);
    res.statusCode = 200;
    await sendResponse(req, res, result.pageHTML, "text/html");
    return;
  }
  const { pageHTML } = serverOptions.builtStaticPages.get(pathname);
  res.statusCode = 200;
  await sendResponse(req, res, pageHTML, "text/html");
}
const mimeByExt = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain"
};
async function handleFileRequest(req, res, pathname) {
  const safePath = await getSafePath(pathname);
  if (!safePath) {
    return respondWithStatusCodePage(req, res, pathname, 404, "File not found.");
  }
  if (statSync(safePath).isDirectory()) {
    res.statusCode = 400;
    await sendResponse(req, res, "Target file is a directory.");
    return;
  }
  const ext = safePath.slice(safePath.lastIndexOf(".")).toLowerCase();
  const mime = mimeByExt[ext] ?? "application/octet-stream";
  res.statusCode = 200;
  await sendResponse(req, res, readFileSync(safePath), mime);
}
function getPathSubparts(path) {
  const rawParts = path.split("/").filter(Boolean);
  const parts = [...rawParts];
  if (parts.length > 0 && parts[parts.length - 1].includes(".")) {
    parts.pop();
  }
  const result = ["/"];
  let current = "";
  for (const part of parts) {
    current += "/" + part;
    result.push(current);
  }
  return result;
}
const allMiddleware = /* @__PURE__ */ new Map();
async function gatherMiddleware() {
  await walkDirectory(compilerOptions.pagesDirectory, async (file) => {
    if (file.name !== "middleware.ts") return;
    const pathname = sanitizePathname(relative(compilerOptions.pagesDirectory, file.parentPath));
    const fullPath = join(file.parentPath, file.name);
    const { middleware } = await import("file://" + fullPath);
    if (!middleware || typeof middleware !== "function") {
      throw new Error(`In file: "${fullPath}":
The export middleware is not of type "function". Got: ${typeof middleware}`);
    }
    const middlewareInformation = {
      exports: {
        middleware
      },
      modulePath: fullPath,
      pathname
    };
    allMiddleware.set(pathname, middlewareInformation);
  });
}
async function runMiddleware(req, res, pathname) {
  const parts = getPathSubparts(pathname);
  const middlewares = [];
  for (const part of parts) {
    if (allMiddleware.has(part) === false) {
      continue;
    }
    middlewares.push(allMiddleware.get(part));
  }
  if (middlewares.length < 1) return;
  const next = (idx) => {
    if (idx >= middlewares.length) {
      return;
    }
    const middleware = middlewares[idx];
    const localNext = () => {
      next(idx + 1);
    };
    middleware.exports.middleware(req, res, localNext);
  };
  next(0);
}
async function sendResponse(req, res, data, contentType = "text/plain") {
  let buffer = typeof data === "string" ? Buffer.from(data) : data;
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (acceptEncoding.match(/\bgzip\b/)) {
    try {
      buffer = await gzipAsync(buffer);
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
    } catch (err) {
      console.error("Gzip compression error:", err);
    }
  }
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
}
async function requestHandler(req, res) {
  if (!req.url) {
    res.statusCode = 400;
    await sendResponse(req, res, "Bad request.");
    return;
  }
  const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
  if (serverOptions.base && url.pathname.startsWith(serverOptions.base) === false) {
    res.statusCode = 501;
    await sendResponse(req, res, "Path does not start with basename.");
    return;
  }
  const pathname = sanitizePathname(serverOptions.base ? removePrefix(serverOptions.base, url.pathname) : url.pathname);
  runMiddleware(req, res, pathname);
  if (!res.writable) return;
  if (pathname.startsWith("/api/")) {
    return handleAPIRequest(req, res, pathname);
  }
  if (serverOptions.allPages.has(pathname)) {
    return handlePageRequest(req, res, pathname);
  }
  return handleFileRequest(req, res, pathname);
}
async function serveProject(startupServerOptions) {
  serverOptions = startupServerOptions;
  if (serverOptions.base && serverOptions.base.startsWith("/") === false) {
    throw new Error("Failed to serve the Elegance project, the `base` option in the startUpServerOptions must start with a / in order to be a valid pathname. Currently, it is:" + serverOptions.base);
  }
  await gatherMiddleware();
  await gatherAPIRoutes();
  let port = serverOptions.port ?? 3e3;
  const server = createServer(requestHandler);
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      setTimeout(() => {
        port += 1;
        server.listen(port);
      }, 500);
    }
  });
  server.listen({ port: serverOptions.port, hostname: serverOptions.hostname }, () => {
    if (compilerOptions.doHotReload) {
      process.send?.("hot-reload-finish");
    }
  });
  return {
    port
  };
}
export {
  serveProject
};
