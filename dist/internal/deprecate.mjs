// src/internal/deprecate.ts
var ShowDeprecationWarning = (msg) => {
  console.warn("\x1B[31m", msg, "\x1B[0m");
  console.trace("Stack Trace:");
};
export {
  ShowDeprecationWarning
};
