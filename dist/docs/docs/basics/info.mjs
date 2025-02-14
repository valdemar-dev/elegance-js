// src/docs/docs/basics/info.ts
var metadata = () => head(
  {},
  link({
    rel: "stylesheet",
    href: "/index.css"
  }),
  title("Hi There!")
);
export {
  metadata
};
