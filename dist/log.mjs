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
export {
  log,
  setQuiet
};
