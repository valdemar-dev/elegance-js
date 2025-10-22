// pages/components/Menu.ts
function Menu(opts) {
  return svg(
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stoke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linjoin": "round",
      ...opts
    },
    path({ d: "M4 5h16" }),
    path({ d: "M4 12h16" }),
    path({ d: "M4 19h16" })
  );
}
export {
  Menu as default
};
