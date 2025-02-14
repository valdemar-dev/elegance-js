// src/components/Breakpoint.ts
var Breakpoint = (...children) => div(
  {
    bp: {
      type: 4 /* BREAKPOINT */,
      value: "true"
    }
  },
  ...children
);
export {
  Breakpoint
};
