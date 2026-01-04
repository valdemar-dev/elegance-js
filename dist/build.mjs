import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import child_process from "node:child_process";
import http from "http";
import { startServer } from "./server/server";
import { log, setQuiet } from "./log";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.resolve(__dirname, "..");
const builderPath = path.resolve(packageDir, "./dist/page_compiler.mjs");
const yellow = (text) => {
  return `\x1B[38;2;238;184;68m${text}`;
};
const bold = (text) => {
  return `\x1B[1m${text}`;
};
const white = (text) => {
  return `\x1B[38;2;255;247;229m${text}`;
};
const green = (text) => {
  return `\x1B[38;2;65;224;108m${text}`;
};
const finishLog = (...text) => {
  log.info(text.map((text2) => `${text2}\x1B[0m`).join(""));
};
let PAGE_MAP = /* @__PURE__ */ new Map();
let LAYOUT_MAP = /* @__PURE__ */ new Map();
let options = process.env.OPTIONS;
const getAllSubdirectories = (dir, baseDir = dir) => {
  let directories = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
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
let child = void 0;
let isBuilding = false;
const runBuild = (filepath, DIST_DIR) => {
  const optionsString = JSON.stringify(options);
  if (isBuilding) {
    return;
  }
  if (child !== void 0) {
    child.removeAllListeners();
    child.kill("SIGKILL");
  }
  child = child_process.spawn("node", ["--import", "ts-arc/register", filepath], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
    env: {
      ...process.env,
      DIST_DIR,
      OPTIONS: optionsString,
      PACKAGE_PATH: packageDir,
      DO_BUILD: "true"
    }
  });
  process.env.OPTIONS = optionsString;
  process.env.DIST_DIR = DIST_DIR;
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
    } else if (data === "set-pages-and-layouts") {
      const { pageMap, layoutMap } = JSON.parse(message.content);
      PAGE_MAP = new Map(pageMap);
      LAYOUT_MAP = new Map(layoutMap);
    }
  });
};
const build = (DIST_DIR) => {
  runBuild(builderPath, DIST_DIR);
};
let isTimedOut = false;
const currentWatchers = [];
let httpStream;
const registerListener = async () => {
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
const compile = async (props) => {
  options = props;
  setQuiet(options.quiet ?? false);
  const watch = options.hotReload !== void 0;
  const BUILD_FLAG = path.join(options.outputDirectory, "ELEGANCE_BUILD_FLAG");
  if (!fs.existsSync(options.outputDirectory)) {
    fs.mkdirSync(options.outputDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(BUILD_FLAG),
      "This file just marks this directory as one containing an Elegance Build.",
      "utf-8"
    );
  } else {
    if (!fs.existsSync(BUILD_FLAG)) {
      throw `The output directory already exists, but is not an Elegance Build directory.`;
    }
  }
  const DIST_DIR = path.join(props.outputDirectory, "dist");
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  if (options.server != void 0 && options.server.runServer == true) {
    startServer({
      root: options.server.root ?? DIST_DIR,
      environment: options.environment,
      port: options.server.port ?? 3e3,
      host: options.server.host ?? "localhost",
      DIST_DIR,
      pagesDirectory: options.pagesDirectory
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
      const watcher = fs.watch(
        directory,
        {},
        watcherFn
      );
      currentWatchers.push(watcher);
    }
  }
  build(DIST_DIR);
};
export {
  LAYOUT_MAP,
  PAGE_MAP,
  compile
};
