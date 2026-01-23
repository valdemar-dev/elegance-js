import util from "node:util";
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["NONE"] = 0] = "NONE";
  LogLevel2[LogLevel2["ERROR"] = 1] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["INFO"] = 3] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 4] = "DEBUG";
  return LogLevel2;
})(LogLevel || {});
let logLevel = 3 /* INFO */;
function setLogLevel(level) {
  logLevel = level;
}
function formatToLog(level, ...args) {
  if (level === 0 /* NONE */) {
    throw new Error("Can't log with LogLevel none.");
  }
  let tag;
  let tagColor;
  let msgColor;
  switch (level) {
    case 1 /* ERROR */:
      tag = "[ERROR]";
      tagColor = "\x1B[41;30m";
      msgColor = "\x1B[31m";
      break;
    case 2 /* WARN */:
      tag = "[WARN]";
      tagColor = "\x1B[43;30m";
      msgColor = "\x1B[33m";
      break;
    case 3 /* INFO */:
      tag = "[INFO]";
      tagColor = "\x1B[44;37m";
      msgColor = "\x1B[36m";
      break;
    case 4 /* DEBUG */:
      tag = "[DEBUG]";
      tagColor = "\x1B[45;37m";
      msgColor = "\x1B[90m";
      break;
  }
  const ts = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-us");
  const formattedArgs = [
    `${ts} Elegance-JS `,
    `${tagColor}${tag}\x1B[0m `,
    msgColor,
    ...args,
    "\x1B[0m"
  ];
  return formattedArgs.map((arg) => {
    if (typeof arg === "string") return arg;
    return util.inspect(arg, { colors: false, depth: null });
  }).join("");
}
function formattedLog(level, ...args) {
  if (level > logLevel) {
    return;
  }
  const str = formatToLog(level, ...args);
  console.log(str);
}
export {
  LogLevel,
  formatToLog,
  formattedLog,
  logLevel,
  setLogLevel
};
