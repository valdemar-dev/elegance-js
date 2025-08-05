// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  console.log("THIS IS ME: ", void 0);
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
