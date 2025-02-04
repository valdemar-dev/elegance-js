// src/docs/getting-started/info.ts
var metadata = () => {
  return head(
    {},
    link({
      rel: "stylesheet",
      href: "/index.css"
    }),
    title("Hi There!")
  );
};
export {
  metadata
};
