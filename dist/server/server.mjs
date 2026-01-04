import { createServer as createHttpServer } from "http";
import { promises as fs } from "fs";
import { join, normalize, extname, dirname } from "path";
import { pathToFileURL } from "url";
import { log } from "../log";
import { gzip, deflate } from "zlib";
import { promisify } from "util";
import { doesPageExist, getPage } from "../compilation/dynamic_compiler";
const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);
const MIME_TYPES = {
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
function startServer({
  root,
  pagesDirectory,
  port = 3e3,
  host = "localhost",
  environment = "production",
  DIST_DIR
}) {
  if (!root) throw new Error("Root directory must be specified.");
  if (!pagesDirectory) throw new Error("Pages directory must be specified.");
  root = normalize(root).replace(/[\\/]+$/, "");
  pagesDirectory = normalize(pagesDirectory).replace(/[\\/]+$/, "");
  const requestHandler = async (req, res) => {
    try {
      if (!req.url) {
        await sendResponse(req, res, 400, {
          "Content-Type": "text/plain; charset=utf-8"
        }, "Bad Request");
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        if (environment === "development") {
          log.info(req.method, "::", req.url, "-", res.statusCode);
        }
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(pagesDirectory, url.pathname, req, res);
      } else if (doesPageExist(url.pathname)) {
        await handlePageRequest(root, pagesDirectory, url.pathname, req, res, DIST_DIR, getPage(url.pathname));
      } else {
        await handleStaticRequest(root, pagesDirectory, url.pathname, req, res, DIST_DIR);
      }
      if (environment === "development") {
        log.info(req.method, "::", req.url, "-", res.statusCode);
      }
    } catch (err) {
      log.error(err);
      await sendResponse(req, res, 500, {
        "Content-Type": "text/plain; charset=utf-8"
      }, "Internal Server Error");
    }
  };
  function attemptListen(p) {
    const server = createHttpServer(requestHandler);
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        attemptListen(p + 1);
      } else {
        console.error(err);
      }
    });
    server.listen(p, host, () => {
      log.info(`Server running at http://${host}:${p}/`);
    });
    return server;
  }
  return attemptListen(port);
}
async function getTargetInfo(root, pathname) {
  const originalPathname = pathname;
  const filePath = normalize(join(root, decodeURIComponent(pathname))).replace(/[\\/]+$/, "");
  if (!filePath.startsWith(root)) {
    throw new Error("Forbidden");
  }
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
  }
  let targetDir;
  if (stats) {
    targetDir = stats.isDirectory() ? filePath : dirname(filePath);
  } else {
    targetDir = originalPathname.endsWith("/") ? filePath : dirname(filePath);
  }
  return {
    filePath,
    targetDir,
    stats
  };
}
function getMiddlewareDirs(base, parts) {
  const middlewareDirs = [];
  let current = base;
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  return middlewareDirs;
}
async function collectMiddlewares(dirs) {
  const middlewares = [];
  for (const dir of dirs) {
    const mwPath = join(dir, "middleware.ts");
    let mwModule;
    try {
      await fs.access(mwPath);
      const url = pathToFileURL(mwPath).href;
      mwModule = await import(url);
    } catch {
      continue;
    }
    const mwKeys = Object.keys(mwModule).sort();
    for (const key of mwKeys) {
      const f = mwModule[key];
      if (typeof f === "function" && !middlewares.some((existing) => existing === f)) {
        middlewares.push(f);
      }
    }
  }
  return middlewares;
}
async function handlePageRequest(root, pagesDirectory, pathname, req, res, DIST_DIR, pageInfo) {
  try {
    const {
      filePath,
      targetDir,
      stats
    } = await getTargetInfo(root, pathname);
    const relDir = targetDir.slice(root.length).replace(/^[\/\\]+/, "");
    const parts = relDir.split(/[\\/]/).filter(Boolean);
    const middlewareDirs = getMiddlewareDirs(pagesDirectory, parts);
    const middlewares = await collectMiddlewares(middlewareDirs);
    const data = {};
    const isDynamic = pageInfo.isDynamic;
    const handlerPath = isDynamic ? pageInfo.filePath : join(filePath, "index.html");
    let hasHandler = false;
    try {
      await fs.access(handlerPath);
      hasHandler = true;
    } catch {
    }
    const finalHandler = async (req2, res2) => {
      if (!hasHandler) {
        await respondWithErrorPage(root, pathname, 404, req2, res2);
        return;
      }
      if (isDynamic) {
        try {
          const {
            buildDynamicPage
          } = await import("../compilation/dynamic_compiler");
          const result = await buildDynamicPage(
            DIST_DIR,
            pathname,
            pageInfo,
            req2,
            res2,
            data
          );
          if (result === false) {
            return;
          }
          const {
            resultHTML
          } = result;
          if (resultHTML === false) {
            return;
          }
          await sendResponse(req2, res2, 200, {
            "Content-Type": MIME_TYPES[".html"]
          }, resultHTML);
        } catch (err) {
          log.error("Error building dynamic page -", err);
        }
      } else {
        const ext = extname(handlerPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const fileData = await fs.readFile(handlerPath);
        await sendResponse(req2, res2, 200, {
          "Content-Type": contentType
        }, fileData);
      }
    };
    const composed = composeMiddlewares(middlewares, finalHandler, {
      isApi: false,
      root,
      pathname,
      data
    });
    await composed(req, res);
  } catch (err) {
    if (err.message === "Forbidden") {
      await sendResponse(req, res, 403, {
        "Content-Type": "text/plain; charset=utf-8"
      }, "Forbidden");
    } else {
      throw err;
    }
  }
}
async function handleStaticRequest(root, pagesDirectory, pathname, req, res, DIST_DIR) {
  try {
    const {
      filePath,
      targetDir,
      stats
    } = await getTargetInfo(root, pathname);
    const relDir = targetDir.slice(root.length).replace(/^[\/\\]+/, "");
    const parts = relDir.split(/[\\/]/).filter(Boolean);
    const middlewareDirs = getMiddlewareDirs(pagesDirectory, parts);
    const middlewares = await collectMiddlewares(middlewareDirs);
    let handlerPath = filePath;
    if (stats && stats.isDirectory()) {
      handlerPath = join(filePath, "index.html");
    }
    let hasHandler = false;
    try {
      await fs.access(handlerPath);
      hasHandler = true;
    } catch {
    }
    const finalHandler = async (req2, res2) => {
      if (!hasHandler) {
        await respondWithErrorPage(root, pathname, 404, req2, res2);
        return;
      }
      const ext = extname(handlerPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const fileData = await fs.readFile(handlerPath);
      await sendResponse(req2, res2, 200, {
        "Content-Type": contentType
      }, fileData);
    };
    const composed = composeMiddlewares(middlewares, finalHandler, {
      isApi: false,
      root,
      pathname
    });
    await composed(req, res);
  } catch (err) {
    if (err.message === "Forbidden") {
      await sendResponse(req, res, 403, {
        "Content-Type": "text/plain; charset=utf-8"
      }, "Forbidden");
    } else {
      throw err;
    }
  }
}
async function handleApiRequest(pagesDirectory, pathname, req, res) {
  const apiSubPath = pathname.slice("/api/".length);
  const parts = apiSubPath.split("/").filter(Boolean);
  const middlewareDirs = getMiddlewareDirs(join(pagesDirectory, "api"), parts);
  const middlewares = await collectMiddlewares(middlewareDirs);
  const routeDir = middlewareDirs[middlewareDirs.length - 1];
  const routePath = join(routeDir, "route.ts");
  let hasRoute = false;
  try {
    await fs.access(routePath);
    hasRoute = true;
  } catch {
  }
  let fn = null;
  let module = null;
  if (hasRoute) {
    try {
      const moduleUrl = pathToFileURL(routePath).href;
      module = await import(moduleUrl);
      fn = module[req.method];
    } catch (err) {
      console.error(err);
      return respondWithJsonError(req, res, 500, "Internal Server Error");
    }
  }
  const finalHandler = async (req2, res2) => {
    if (!hasRoute) {
      return respondWithJsonError(req2, res2, 404, "Not Found");
    }
    if (typeof fn !== "function") {
      return respondWithJsonError(req2, res2, 405, "Method Not Allowed");
    }
    await fn(req2, res2);
  };
  const composed = composeMiddlewares(middlewares, finalHandler, {
    isApi: true
  });
  await composed(req, res);
}
function composeMiddlewares(mws, final, options) {
  return async function(req, res) {
    let index = 0;
    async function dispatch(err) {
      if (err) {
        if (options.isApi) {
          return respondWithJsonError(req, res, 500, err.message || "Internal Server Error");
        } else {
          return await respondWithErrorPage(options.root, options.pathname, 500, req, res);
        }
      }
      if (index >= mws.length) {
        return await final(req, res);
      }
      const thisMw = mws[index++];
      const next = (e) => dispatch(e);
      const onceNext = (nextFn) => {
        let called = false;
        return async (e) => {
          if (called) {
            log.warn("next() was called in a middleware more than once.");
            return;
          }
          called = true;
          await nextFn(e);
        };
      };
      try {
        await thisMw(req, res, onceNext(next), options.data || {});
      } catch (error) {
        await dispatch(error);
      }
    }
    await dispatch();
  };
}
async function respondWithJsonError(req, res, code, message) {
  const body = JSON.stringify({
    error: message
  });
  await sendResponse(req, res, code, {
    "Content-Type": "application/json; charset=utf-8"
  }, body);
}
async function respondWithErrorPage(root, pathname, code, req, res) {
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
      const html = await fs.readFile(errorFilePath, "utf8");
      await sendResponse(req, res, code, {
        "Content-Type": "text/html; charset=utf-8"
      }, html);
      return;
    } catch {
    }
  }
  await sendResponse(req, res, code, {
    "Content-Type": "text/plain; charset=utf-8"
  }, `${code} Error`);
}
function isCompressible(contentType) {
  if (!contentType) return false;
  return /text\/|javascript|json|xml|svg/.test(contentType);
}
async function sendResponse(req, res, status, headers, body) {
  let bufferBody = typeof body === "string" ? Buffer.from(body) : body;
  const accept = req.headers["accept-encoding"] || "";
  let encoding = null;
  if (accept.match(/\bgzip\b/)) {
    encoding = "gzip";
  } else if (accept.match(/\bdeflate\b/)) {
    encoding = "deflate";
  }
  if (!encoding || !isCompressible(headers["Content-Type"] || "")) {
    res.writeHead(status, headers);
    res.end(bufferBody);
    return;
  }
  const compressor = encoding === "gzip" ? gzipAsync : deflateAsync;
  try {
    const compressed = await compressor(bufferBody);
    headers["Content-Encoding"] = encoding;
    headers["Vary"] = "Accept-Encoding";
    res.writeHead(status, headers);
    res.end(compressed);
  } catch (err) {
    log.error("Compression error:", err);
    res.writeHead(status, headers);
    res.end(bufferBody);
  }
}
export {
  startServer
};
