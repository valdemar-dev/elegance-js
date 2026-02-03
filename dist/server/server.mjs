import { join, normalize, relative, resolve } from "path";
import { compilePage, compilerOptions, compilerStore } from "../compilation/compiler";
import { createServer } from "http";
import { existsSync, readdirSync, statSync, createReadStream } from "fs";
import * as zlib from "zlib";
import { promisify } from "util";
import { URLSearchParams } from "url";
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
function safePercentDecode(input) {
  return input.replace(
    /%[0-9A-Fa-f]{2}/g,
    (m) => String.fromCharCode(parseInt(m.slice(1), 16))
  );
}
function sanitizePathname(pathname = "") {
  if (!pathname) return "/";
  pathname = safePercentDecode(pathname);
  pathname = "/" + pathname;
  pathname = pathname.replace(/\/+/g, "/");
  const segments = pathname.split("/");
  const resolved = [];
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }
  const encoded = resolved.map((s) => encodeURIComponent(s));
  return "/" + encoded.join("/");
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
  const compiledPage = await compilePage(serverOptions.allLayouts, statusCodePage, { req, res });
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
async function handlePageRequest(req, res, pathname, pageInformation, matchHit) {
  if (pageInformation.exports.isDynamic) {
    if (serverOptions.allowDynamic === false) {
      return respondWithStatusCode(req, res, pathname, 404, "Page not found.");
    }
    const informationClone = {
      ...pageInformation
    };
    informationClone.pathname = pathname;
    const result = await compilePage(serverOptions.allLayouts, informationClone, { req, res }, matchHit.params);
    if (res.writableEnded || res.headersSent) return;
    res.statusCode = 200;
    await sendResponse(req, res, result.pageHTML, "text/html");
    return;
  }
  const { pageHTML } = serverOptions.builtStaticPages.get(pageInformation.pathname);
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
  ".txt": "text/plain",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg"
};
function isCompressible(mime) {
  return mime.startsWith("text/") || mime === "application/javascript" || mime === "application/json" || mime === "image/svg+xml";
}
async function handleFileRequest(req, res, pathname) {
  const safePath = await getSafePath(pathname);
  if (!safePath) {
    return respondWithStatusCode(req, res, pathname, 404, "File not found.");
  }
  const stats = statSync(safePath);
  if (stats.isDirectory()) {
    return respondWithStatusCode(req, res, pathname, 404, "File not found.");
  }
  const fileSize = stats.size;
  const ext = safePath.slice(safePath.lastIndexOf(".")).toLowerCase();
  const mime = mimeByExt[ext] ?? "application/octet-stream";
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const rangeHeader = req.headers.range;
  if (!rangeHeader) {
    const useGzip = acceptEncoding.includes("gzip") && isCompressible(mime);
    const head = {
      "Content-Type": mime,
      "Accept-Ranges": "bytes"
    };
    if (!useGzip) {
      head["Content-Length"] = fileSize;
    }
    if (useGzip) {
      head["Content-Encoding"] = "gzip";
      head["Vary"] = "Accept-Encoding";
    }
    res.writeHead(200, head);
    const stream2 = createReadStream(safePath);
    if (useGzip) {
      const gzip = zlib.createGzip();
      stream2.pipe(gzip).pipe(res);
    } else {
      stream2.pipe(res);
    }
    return;
  }
  const ranges = rangeHeader.replace(/bytes=/, "").split("-");
  let start = parseInt(ranges[0], 10);
  let end = ranges[1] ? parseInt(ranges[1], 10) : fileSize - 1;
  if (isNaN(start)) start = 0;
  if (isNaN(end) || end >= fileSize) end = fileSize - 1;
  if (start >= fileSize || start > end) {
    res.writeHead(416, {
      "Content-Range": `bytes */${fileSize}`
    });
    res.end();
    return;
  }
  const contentLength = end - start + 1;
  const headers = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Content-Length": contentLength
  };
  res.writeHead(206, headers);
  const stream = createReadStream(safePath, { start, end });
  stream.pipe(res);
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
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Allow": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": req.headers["access-control-request-headers"] || "*",
      "Access-Control-Max-Age": "86400"
    });
    res.end();
    return;
  }
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
  if (res.writableEnded) return;
  if (pathname.startsWith("/api/")) {
    return handleAPIRequest(req, res, pathname);
  }
  const matchingPage = matchPathnameToPathParts(pathname, [...serverOptions.allPages.values()].map((v) => getPathPattern(v)));
  if (!matchingPage) {
    return handleFileRequest(req, res, pathname);
  }
  handlePageRequest(req, res, pathname, serverOptions.allPages.get(matchingPage.matchedPathname), matchingPage);
}
function getPathPattern(value) {
  return {
    pathname: value.pathname,
    pathnameParts: value.pathnameParts
  };
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildRegexStrFromParts(pathnameParts) {
  let patternRegex = "^/";
  let hasPart = false;
  let previousCanSkip = false;
  for (let part of pathnameParts) {
    if (part === "") {
      continue;
    }
    const optional = part.startsWith(":");
    const currentPart = optional ? part.slice(1) : part;
    const isCatchAll = currentPart.startsWith("*") && currentPart.endsWith("*");
    const isDynamic = currentPart.startsWith("[") && currentPart.endsWith("]");
    let matcher;
    if (isCatchAll) {
      matcher = "[^/]+(?:/[^/]+)*";
    } else if (isDynamic) {
      matcher = "[^/]+";
    } else {
      matcher = escapeRegExp(currentPart);
    }
    if (isCatchAll || isDynamic) {
      const paramName = currentPart.slice(1, -1);
      matcher = `(?<${paramName}>${matcher})`;
    }
    let sep;
    if (hasPart) {
      sep = previousCanSkip ? "/?" : "/";
    } else {
      sep = "";
    }
    let addition = sep + matcher;
    if (optional) {
      if (hasPart || sep !== "") {
        addition = "(?:" + sep + matcher + ")?";
      } else {
        addition = "(?:" + matcher + ")?";
      }
      previousCanSkip = true;
    } else {
      previousCanSkip = false;
    }
    patternRegex += addition;
    hasPart = true;
  }
  if (patternRegex === "^/") {
    patternRegex = "^/?";
  }
  patternRegex += "$";
  return patternRegex;
}
function matchPathnameToPathParts(pathname, allPatterns) {
  const last = pathname.split("/").pop();
  if (last.includes(".")) {
    return null;
  }
  const candidates = [];
  for (const pattern of allPatterns) {
    const patternParts = pattern.pathnameParts;
    const regexStr = buildRegexStrFromParts(patternParts);
    const regex = new RegExp(regexStr);
    const match = pathname.match(regex);
    if (match) {
      const getBasePart = (p) => p.startsWith(":") ? p.slice(1) : p;
      const isDynamicPart = (p) => p.startsWith(":") || p.startsWith("[") || p.startsWith("*");
      const fixedCount = patternParts.filter((p) => p !== "" && !isDynamicPart(p)).length;
      const dynamicSingleCount = patternParts.filter((p) => {
        const pp = getBasePart(p);
        return pp.startsWith("[") && pp.endsWith("]");
      }).length;
      const catchallCount = patternParts.filter((p) => {
        const pp = getBasePart(p);
        return pp.startsWith("*") && pp.endsWith("*");
      }).length;
      const optionalCount = patternParts.filter((p) => p.startsWith(":")).length;
      const totalDynamic = dynamicSingleCount + catchallCount;
      candidates.push({ pattern, fixedCount, dynamicSingleCount, catchallCount, optionalCount, totalDynamic, match });
    }
  }
  if (candidates.length === 0) {
    return null;
  }
  candidates.sort((a, b) => {
    if (a.fixedCount !== b.fixedCount) {
      return b.fixedCount - a.fixedCount;
    }
    if (a.totalDynamic !== b.totalDynamic) {
      return a.totalDynamic - b.totalDynamic;
    }
    if (a.catchallCount !== b.catchallCount) {
      return a.catchallCount - b.catchallCount;
    }
    if (a.optionalCount !== b.optionalCount) {
      return a.optionalCount - b.optionalCount;
    }
    return 0;
  });
  const best = candidates[0];
  return { matchedPathname: best.pattern.pathname, params: best.match.groups || {} };
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
function getQuery() {
  const store = compilerStore.getStore();
  if (!store) {
    throw new Error("getQuery() cannot be called outside of a page or layout.");
  }
  if (!store.req) {
    throw new Error("getQuery() cannot be used inside of a static page, since it depends on the *request query*.");
  }
  if (!store.req.url) {
    throw new Error("Invalid req.url");
  }
  return new URLSearchParams(new URL(`http://${process.env.HOST ?? "localhost"}${store.req.url}`).searchParams);
}
function getRequest() {
  const store = compilerStore.getStore();
  if (!store) {
    throw new Error("getQuery() cannot be called outside of a page or layout.");
  }
  if (!store.req || !store.res) {
    throw new Error("getQuery() cannot be used inside of a static page, since it depends on the *request query*.");
  }
  return { req: store.req, res: store.res };
}
function getCookieStore() {
  const { req, res } = getRequest();
  let cookieMap = null;
  const getCookies = () => {
    if (cookieMap) return cookieMap;
    cookieMap = /* @__PURE__ */ new Map();
    if (req.headers.cookie) {
      req.headers.cookie.split(";").forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const [name, ...valueParts] = trimmed.split("=");
        if (name) {
          const value = valueParts.join("=").trim();
          cookieMap.set(name, decodeURIComponent(value));
        }
      });
    }
    return cookieMap;
  };
  return {
    /**
     * Get a cookie value by name
     */
    get(name) {
      return getCookies().get(name);
    },
    /**
     * Check if a cookie exists
     */
    has(name) {
      return getCookies().has(name);
    },
    /**
     * Get all cookies as a plain object
     */
    getAll() {
      return Object.fromEntries(getCookies());
    },
    /**
     * Set a cookie
     * 
     * @param name Cookie name
     * @param value Cookie value
     * @param options Optional cookie attributes
     */
    set(name, value, options = {}) {
      let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      if (options.maxAge !== void 0) {
        cookieStr += `; Max-Age=${Math.floor(options.maxAge)}`;
      }
      if (options.expires) {
        cookieStr += `; Expires=${options.expires.toUTCString()}`;
      }
      if (options.path) {
        cookieStr += `; Path=${options.path}`;
      }
      if (options.domain) {
        cookieStr += `; Domain=${options.domain}`;
      }
      if (options.secure) {
        cookieStr += `; Secure`;
      }
      if (options.httpOnly) {
        cookieStr += `; HttpOnly`;
      }
      if (options.sameSite) {
        cookieStr += `; SameSite=${options.sameSite}`;
      }
      const existing = res.getHeader("Set-Cookie");
      if (existing) {
        if (Array.isArray(existing)) {
          res.setHeader("Set-Cookie", [...existing, cookieStr]);
        } else {
          res.setHeader("Set-Cookie", [existing, cookieStr]);
        }
      } else {
        res.setHeader("Set-Cookie", cookieStr);
      }
    },
    /**
     * Delete a cookie (sets it to expire immediately)
     */
    delete(name, path = "/", domain) {
      this.set(name, "", {
        maxAge: 0,
        expires: /* @__PURE__ */ new Date(0),
        path,
        domain
      });
    }
  };
}
function redirect(location, statusCode = 302) {
  const { res } = getRequest();
  res.statusCode = statusCode;
  res.setHeader("Location", location);
  res.end();
}
const respondWith = {
  async notFound() {
    const { req, res } = getRequest();
    const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
    const pathname = sanitizePathname(url.pathname);
    await respondWithStatusCode(req, res, pathname, 404, "Not found.");
  },
  async notAuthorized() {
    const { req, res } = getRequest();
    const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
    const pathname = sanitizePathname(url.pathname);
    await respondWithStatusCode(req, res, pathname, 401, "Not authorized.");
  },
  async forbidden() {
    const { req, res } = getRequest();
    const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
    const pathname = sanitizePathname(url.pathname);
    await respondWithStatusCode(req, res, pathname, 403, "Forbidden.");
  },
  async internalError() {
    const { req, res } = getRequest();
    const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
    const pathname = sanitizePathname(url.pathname);
    await respondWithStatusCode(req, res, pathname, 500, "Internal server error.");
  }
};
export {
  getCookieStore,
  getQuery,
  getRequest,
  redirect,
  respondWith,
  serveProject
};
