// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  process.emitWarning(
    "Function Breakpoint() is deprecated. Prefer layout.ts files instead.",
    { type: "DeprecationWarning" }
  );
  if (options.id === void 0) throw `Breakpoints must set a name attribute.`;
  const id = options.id;
  delete options.id;
  return div(
    {
      bp: id,
      ...options
    },
    ...children
  );
};
export {
  Breakpoint
};
