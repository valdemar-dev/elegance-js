// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

// src/build.ts
import fs2 from "fs";
import path from "path";
import { fileURLToPath } from "url";
import child_process from "node:child_process";
import http from "http";

// src/log.ts
var quiet = false;
function setQuiet(value) {
  quiet = value;
}
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  return now.toLocaleString(void 0, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
function color(text, code) {
  return `\x1B[${code}m${text}\x1B[0m`;
}
function logInfo(...args) {
  if (quiet) return;
  console.info(`${getTimestamp()} ${color("[INFO]:", 34)}`, ...args);
}
function logWarn(...args) {
  if (quiet) return;
  console.warn(`${getTimestamp()} ${color("[WARN]:", 33)}`, ...args);
}
function logError(...args) {
  if (quiet) return;
  console.error(`${getTimestamp()} ${color("[ERROR]:", 31)}`, ...args);
}
var log = {
  info: logInfo,
  warn: logWarn,
  error: logError
};

// src/server/server.ts
import { createServer as createHttpServer } from "http";
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
function startServer({ root, port = 3e3, host = "localhost", environment: environment2 = "production" }) {
  if (!root) throw new Error("Root directory must be specified.");
  const requestHandler = async (req, res) => {
    try {
      if (!req.url) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad Request");
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        if (environment2 === "development") {
          log.info(req.method, "::", req.url, "-", res.statusCode);
        }
        return;
      }
      const url = new URL(req.url, `https://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        await handleApiRequest(root, url.pathname, req, res);
      } else {
        await handleStaticRequest(root, url.pathname, req, res);
      }
      if (environment2 === "development") {
        log.info(req.method, "::", req.url, "-", res.statusCode);
      }
    } catch (err) {
      log.error(err);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
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
      log.info(`Server running at https://${host}:${p}/`);
    });
    return server;
  }
  return attemptListen(port);
}
async function handleStaticRequest(root, pathname, req, res) {
  let filePath = normalize(join(root, decodeURIComponent(pathname)));
  root = normalize(root);
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  let stats;
  try {
    stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
  }
  let hasFile = false;
  try {
    await fs.access(filePath);
    hasFile = true;
  } catch {
  }
  const pageDir = dirname(filePath);
  const relDir = pageDir.slice(root.length).replace(/^[\/\\]+/, "");
  const parts = relDir.split(/[\\/]/).filter(Boolean);
  const middlewareDirs = [];
  let current = root;
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  const middlewares = [];
  for (const dir of middlewareDirs) {
    const mwPath = join(dir, "middleware.mjs");
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
  const finalHandler = async (req2, res2) => {
    if (!hasFile) {
      await respondWithErrorPage(root, pathname, 404, res2);
      return;
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(filePath);
    res2.writeHead(200, { "Content-Type": contentType });
    res2.end(data);
  };
  const composed = composeMiddlewares(middlewares, finalHandler);
  await composed(req, res);
}
async function handleApiRequest(root, pathname, req, res) {
  const apiSubPath = pathname.slice("/api/".length);
  const parts = apiSubPath.split("/").filter(Boolean);
  const routeDir = join(root, pathname);
  const routePath = join(routeDir, "route.mjs");
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
      return respondWithJsonError(res, 500, "Internal Server Error");
    }
  }
  const middlewareDirs = [];
  let current = join(root, "api");
  middlewareDirs.push(current);
  for (const part of parts) {
    current = join(current, part);
    middlewareDirs.push(current);
  }
  const middlewares = [];
  for (const dir of middlewareDirs) {
    const mwPath = join(dir, "middleware.mjs");
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
  const finalHandler = async (req2, res2) => {
    if (!hasRoute) {
      return respondWithJsonError(res2, 404, "Not Found");
    }
    if (typeof fn !== "function") {
      return respondWithJsonError(res2, 405, "Method Not Allowed");
    }
    await fn(req2, res2);
  };
  const composed = composeMiddlewares(middlewares, finalHandler);
  await composed(req, res);
}
function composeMiddlewares(mws, final) {
  return async function(req, res) {
    let index = 0;
    async function dispatch(err) {
      if (err) {
        return respondWithJsonError(res, 500, err.message || "Internal Server Error");
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
        await thisMw(req, res, onceNext(next));
      } catch (error) {
        await dispatch(error);
      }
    }
    await dispatch();
  };
}
function respondWithJsonError(res, code, message) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: message }));
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

// src/build.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var packageDir = path.resolve(__dirname, "..");
var builderPath = path.resolve(packageDir, "./dist/page_compiler.mjs");
var yellow = (text) => {
  return `\x1B[38;2;238;184;68m${text}`;
};
var bold = (text) => {
  return `\x1B[1m${text}`;
};
var white = (text) => {
  return `\x1B[38;2;255;247;229m${text}`;
};
var green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
};
var finishLog = (...text) => {
  log.info(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
var options = process.env.OPTIONS;
var getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs2.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);
      directories.push(relativePath);
      directories = directories.concat(getAllSubdirectories(fullPath, baseDir));
    }
  }
  return directories;
};
var child = void 0;
var isBuilding = false;
var runBuild = (filepath, DIST_DIR) => {
  const optionsString = JSON.stringify(options);
  if (isBuilding) {
    return;
  }
  if (child !== void 0) {
    child.removeAllListeners();
    child.kill("SIGKILL");
  }
  child = child_process.spawn("node", [filepath], {
    stdio: ["pipe", "pipe", "pipe", "ipc"],
    env: { ...process.env, DIST_DIR, OPTIONS: optionsString, PACKAGE_PATH: packageDir }
  });
  child.on("error", () => {
    log.error("Failed to start child process.");
  });
  child.on("exit", () => {
    isBuilding = false;
    log.info("Builder process complete");
  });
  child.on("message", (message) => {
    const { data } = message;
    if (data === "hard-reload") {
      httpStream?.write(`data: hard-reload

`);
    } else if (data === "soft-reload") {
      httpStream?.write(`data: reload

`);
    } else if (data === "compile-finish") {
      isBuilding = false;
      if (options.postCompile) {
        finishLog(
          white("Calling post-compile hook..")
        );
        options.postCompile();
      }
    }
  });
};
var build = (DIST_DIR) => {
  runBuild(builderPath, DIST_DIR);
};
var isTimedOut = false;
var currentWatchers = [];
var httpStream;
var registerListener = async () => {
  const server = http.createServer((req, res) => {
    if (req.url === "/events") {
      finishLog(white("Client listening for changes.."));
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*"
      });
      httpStream = res;
      httpStream.write(`data: ping

`);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  server.listen(options.hotReload.port, () => {
    finishLog(bold(green("Hot-Reload server online!")));
  });
};
var compile = async (props) => {
  options = props;
  setQuiet(options.quiet ?? false);
  const watch = options.hotReload !== void 0;
  const BUILD_FLAG = path.join(options.outputDirectory, "ELEGANCE_BUILD_FLAG");
  if (!fs2.existsSync(options.outputDirectory)) {
    fs2.mkdirSync(options.outputDirectory, { recursive: true });
    fs2.writeFileSync(
      path.join(BUILD_FLAG),
      "This file just marks this directory as one containing an Elegance Build.",
      "utf-8"
    );
  } else {
    if (!fs2.existsSync(BUILD_FLAG)) {
      throw `The output directory already exists, but is not an Elegance Build directory.`;
    }
  }
  const DIST_DIR = path.join(props.outputDirectory, "dist");
  if (!fs2.existsSync(DIST_DIR)) {
    fs2.mkdirSync(DIST_DIR, { recursive: true });
  }
  if (props.server != void 0 && props.server.runServer == true) {
    startServer({
      root: props.server.root ?? DIST_DIR,
      environment: props.environment,
      port: props.server.port ?? 3e3,
      host: props.server.host ?? "localhost"
    });
  }
  if (watch) {
    await registerListener();
    for (const watcher of currentWatchers) {
      watcher.close();
    }
    let extra = [];
    if (options.hotReload?.extraWatchDirectories) {
      const dirs = options.hotReload?.extraWatchDirectories ?? [];
      if (dirs.length !== 0) {
        for (const dir of dirs) {
          const subdirs = getAllSubdirectories(dir).map((f) => path.join(dir, f));
          extra.push(...subdirs);
        }
      }
    }
    const pagesSubDirs = getAllSubdirectories(options.pagesDirectory).map((f) => path.join(options.pagesDirectory, f));
    const subdirectories = [...pagesSubDirs, options.pagesDirectory, ...extra];
    finishLog(yellow("Hot-Reload Watching Subdirectories: "), ...subdirectories.join(", "));
    const watcherFn = async () => {
      if (isTimedOut) return;
      isTimedOut = true;
      process.stdout.write("\x1Bc");
      setTimeout(async () => {
        build(DIST_DIR);
        isTimedOut = false;
      }, 100);
    };
    for (const directory of subdirectories) {
      const watcher = fs2.watch(
        directory,
        {},
        watcherFn
      );
      currentWatchers.push(watcher);
    }
  }
  build(DIST_DIR);
};

// src/compile_docs.ts
import { exec, execSync } from "child_process";
import path2 from "path";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var PAGES_DIR = path2.join(__dirname2, "../src/docs");
var PUBLIC_DIR = path2.join(__dirname2, "../src/docs/public");
var OUTPUT_DIR = path2.join(__dirname2, "../docs");
var environmentArg = process.argv.find((arg) => arg.startsWith("--environment"));
if (!environmentArg) environmentArg = "--environment='production'";
var environment = environmentArg.split("=")[1];
console.log(`Environment: ${environment}`);
compile({
  pagesDirectory: PAGES_DIR,
  outputDirectory: OUTPUT_DIR,
  environment,
  publicDirectory: {
    path: PUBLIC_DIR
  },
  hotReload: environment === "development" ? {
    port: 3001,
    hostname: "localhost"
  } : void 0,
  server: {
    runServer: environment === "development"
  },
  quiet: true
}).then(() => {
  if (environment === "production") {
    execSync(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/dist/index.css --minify`);
  } else {
    exec(`npx @tailwindcss/cli -i ${PAGES_DIR}/index.css -o ${OUTPUT_DIR}/dist/index.css --watch=always`);
  }
});
