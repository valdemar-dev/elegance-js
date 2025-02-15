// src/components/Breakpoint.ts
var Breakpoint = ({ name }, ...children) => div(
  {
    bp: {
      type: 4 /* BREAKPOINT */,
      value: name
    }
  },
  ...children
);
export {
  Breakpoint
};
