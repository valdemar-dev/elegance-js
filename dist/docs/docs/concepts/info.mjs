// src/docs/docs/concepts/info.ts
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
