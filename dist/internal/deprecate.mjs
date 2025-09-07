// src/internal/deprecate.ts
var ShowDeprecationWarning = (msg) => {
  console.warn("\x1B[31m", msg);
  console.trace("Stack Trace:");
};
export {
  ShowDeprecationWarning
};
