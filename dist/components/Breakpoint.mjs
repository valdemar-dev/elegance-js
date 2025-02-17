// src/components/Breakpoint.ts
var Breakpoint = (options, ...children) => {
  if (!options.name) throw `Breakpoints must set a name attribute.`;
  const name = options.name;
  delete options.name;
  return div(
    {
      bp: {
        type: 4 /* BREAKPOINT */,
        value: name
      },
      ...options
    },
    ...children
  );
};
export {
  Breakpoint
};
