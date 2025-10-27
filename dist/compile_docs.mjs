// src/compile_docs.ts
import { fileURLToPath as fileURLToPath2 } from "url";

// src/build.ts
import fs from "fs";
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
  console.info(`Elegance.JS: ${getTimestamp()} ${color("[INFO]:", 34)}`, ...args);
}
function logWarn(...args) {
  if (quiet) return;
  console.warn(`Elegance.JS: ${getTimestamp()} ${color("[WARN]:", 33)}`, ...args);
}
function logError(...args) {
  console.error(`Elegance.JS: ${getTimestamp()} ${color("[ERROR]:", 31)}`, ...args);
}
var log = {
  info: logInfo,
  warn: logWarn,
  error: logError
};

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
    stdio: ["inherit", "inherit", "inherit", "ipc"],
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
